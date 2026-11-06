import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, BUCKET_ASSETS, BUCKET_PROFILES, BUCKET_RELEASES } from "@/lib/r2";
import { getR2PublicUrl } from "@/lib/r2-helpers";

// File type validation
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/pjpeg',
  'image/png',
  'image/x-png',
  'image/webp',
  'image/heic',
  'image/heif',
  'image/gif',
  'application/octet-stream',
  ''
];
const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif', '.gif'];

const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/wav',
  'audio/mp3',
  'audio/wave',
  'audio/x-wav',
  'audio/vnd.wave',
  'audio/flac',
  'audio/x-flac',
  'audio/mp4',
  'audio/m4a',
  'audio/x-m4a',
  'audio/aac',
  'audio/x-aac',
  'audio/ogg',
  'audio/vorbis',
  'audio/x-ms-wma',
  'audio/aiff',
  'audio/x-aiff',
  'application/octet-stream',
  ''
];
const ALLOWED_AUDIO_EXTENSIONS = ['.mp3', '.wav', '.flac', '.m4a', '.aac', '.ogg', '.wma', '.aiff', '.alac'];

const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/octet-stream'];
const ALLOWED_DOCUMENT_EXTENSIONS = ['.pdf'];

// File size limits (in bytes)
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_AUDIO_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_DOCUMENT_SIZE = 5 * 1024 * 1024; // 5MB

// Comprehensive logging function
function logUploadEvent(stage: string, data: any) {
  const timestamp = new Date().toISOString();
  console.log(`\n[${timestamp}] 📤 UPLOAD API - ${stage}`);
  console.log(JSON.stringify(data, null, 2));
}

export async function POST(req: NextRequest) {
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  
  try {
    logUploadEvent(`[${requestId}] REQUEST STARTED`, {
      method: req.method,
      url: req.url,
      contentType: req.headers.get('content-type'),
      contentLength: req.headers.get('content-length'),
      timestamp: new Date().toISOString()
    });

    // Authentication check
    const session = await auth();
    logUploadEvent(`[${requestId}] AUTHENTICATION`, {
      hasSession: !!session,
      userId: session?.user?.id || 'NONE',
      userEmail: session?.user?.email || 'NONE'
    });

    if (!session?.user?.id) {
      logUploadEvent(`[${requestId}] ERROR: UNAUTHORIZED`, {
        status: 401,
        reason: 'No session or user ID'
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse multipart form data
    let formData;
    try {
      formData = await req.formData();
      logUploadEvent(`[${requestId}] FORM DATA PARSED`, {
        entries: Array.from(formData.entries()).map(([key, value]) => ({
          key,
          type: value instanceof File ? 'File' : typeof value,
          name: value instanceof File ? value.name : undefined,
          size: value instanceof File ? value.size : undefined,
          mimeType: value instanceof File ? value.type : undefined
        }))
      });
    } catch (parseError: any) {
      logUploadEvent(`[${requestId}] ERROR: FORM DATA PARSE FAILED`, {
        status: 400,
        error: parseError.message,
        stack: parseError.stack
      });
      return NextResponse.json({ 
        error: "Failed to parse form data",
        details: parseError.message 
      }, { status: 400 });
    }

    const file = formData.get("file") as File;
    let uploadType = (formData.get("type") || formData.get("uploadType") || formData.get("fileType")) as string;
    const artistId = formData.get("artistId") as string;
    
    // Auto-detect uploadType if missing
    if (!uploadType && file) {
      const ext = (file.name || '').toLowerCase();
      const mime = (file.type || '').toLowerCase();
      if (mime.startsWith("audio/") || ext.match(/\.(mp3|wav|flac|m4a|aac|ogg|wma|aiff|alac)$/i)) {
        uploadType = "audio";
      } else if (mime.startsWith("image/") || ext.match(/\.(jpg|jpeg|png|webp|heic|heif|gif)$/i)) {
        uploadType = "cover";
      } else {
        uploadType = "audio";
      }
    }
    
    // Ensure default uploadType if still unset
    if (!uploadType) {
      uploadType = "audio";
    }
    
    logUploadEvent(`[${requestId}] FORM FIELDS EXTRACTED`, {
      hasFile: !!file,
      fileName: file?.name || 'NONE',
      fileSize: file?.size || 0,
      fileMimeType: file?.type || 'NONE',
      uploadType: uploadType || 'NONE',
      artistId: artistId || 'NONE'
    });

    if (!file) {
      logUploadEvent(`[${requestId}] ERROR: NO FILE`, {
        status: 400,
        reason: 'No file in form data'
      });
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type and size based on upload type
    let bucket: string;
    let folder: string;
    let maxSize: number;
    let allowedTypes: string[];

    switch (uploadType) {
      case 'cover':
        bucket = BUCKET_RELEASES;
        folder = 'covers';
        maxSize = MAX_IMAGE_SIZE;
        allowedTypes = ALLOWED_IMAGE_TYPES;
        break;
      case 'audio':
        bucket = BUCKET_RELEASES;
        folder = 'audio';
        maxSize = MAX_AUDIO_SIZE;
        allowedTypes = ALLOWED_AUDIO_TYPES;
        break;
      case 'profile':
        bucket = BUCKET_PROFILES;
        folder = 'avatars';
        maxSize = MAX_IMAGE_SIZE;
        allowedTypes = ALLOWED_IMAGE_TYPES;
        break;
      case 'asset':
      case 'cms':
      case 'brand':
        bucket = BUCKET_ASSETS;
        folder = uploadType === 'brand' ? 'brand' : 'cms';
        maxSize = MAX_IMAGE_SIZE;
        allowedTypes = ALLOWED_IMAGE_TYPES;
        break;
      case 'message':
        bucket = BUCKET_ASSETS;
        folder = 'messages';
        maxSize = MAX_DOCUMENT_SIZE;
        allowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];
        break;
      case 'contract':
        bucket = BUCKET_ASSETS;
        folder = uploadType === 'signature' ? 'signatures' : 'contracts';
        maxSize = MAX_IMAGE_SIZE;
        allowedTypes = ALLOWED_IMAGE_TYPES;
        break;
      default:
        bucket = BUCKET_RELEASES;
        folder = 'audio';
        maxSize = MAX_AUDIO_SIZE;
        allowedTypes = ALLOWED_AUDIO_TYPES;
        uploadType = 'audio';
    }

    logUploadEvent(`[${requestId}] VALIDATION RULES SET`, {
      uploadType,
      bucket,
      folder,
      maxSize,
      allowedTypes
    });

    // Validate file type
    const lowerType = (file.type || '').toLowerCase();
    const fileName = file.name || '';
    const fileExt = (fileName.includes('.') ? '.' + fileName.split('.').pop() : '').toLowerCase();

    let isValid = false;
    if (uploadType === 'audio') {
      isValid = 
        !lowerType ||
        lowerType === 'application/octet-stream' ||
        lowerType.startsWith('audio/') || 
        ALLOWED_AUDIO_TYPES.includes(lowerType) || 
        ALLOWED_AUDIO_EXTENSIONS.includes(fileExt);
    } else if (['cover', 'profile', 'asset', 'cms', 'brand'].includes(uploadType)) {
      isValid = 
        !lowerType ||
        lowerType === 'application/octet-stream' ||
        lowerType.startsWith('image/') || 
        ALLOWED_IMAGE_TYPES.includes(lowerType) || 
        ALLOWED_IMAGE_EXTENSIONS.includes(fileExt);
    } else if (['message', 'contract'].includes(uploadType)) {
      isValid = 
        !lowerType ||
        lowerType === 'application/octet-stream' ||
        lowerType.startsWith('image/') || 
        lowerType === 'application/pdf' || 
        ALLOWED_IMAGE_TYPES.includes(lowerType) || 
        ALLOWED_DOCUMENT_TYPES.includes(lowerType) || 
        ALLOWED_IMAGE_EXTENSIONS.includes(fileExt) || 
        ALLOWED_DOCUMENT_EXTENSIONS.includes(fileExt);
    } else {
      isValid = true;
    }

    if (!isValid) {
      logUploadEvent(`[${requestId}] ERROR: INVALID FILE TYPE`, {
        status: 400,
        receivedType: file.type,
        fileName: file.name,
        fileExt,
        allowedTypes
      });
      return NextResponse.json({ 
        error: `Format file "${file.name}" tidak valid. Format audio yang didukung: MP3, WAV, FLAC, M4A, AAC.`
      }, { status: 400 });
    }

    // Validate file size
    if (file.size > maxSize) {
      logUploadEvent(`[${requestId}] ERROR: FILE TOO LARGE`, {
        status: 400,
        receivedSize: file.size,
        maxSize,
        maxSizeMB: Math.round(maxSize / 1024 / 1024)
      });
      return NextResponse.json({ 
        error: `File terlalu besar (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maksimal: ${Math.round(maxSize / 1024 / 1024)}MB`
      }, { status: 400 });
    }

    logUploadEvent(`[${requestId}] FILE VALIDATION PASSED`, {
      fileType: file.type,
      fileSize: file.size,
      fileName: file.name
    });

    // Generate unique filename
    const timestamp = Date.now();
    const ext = file.name.split('.').pop() || (uploadType === 'audio' ? 'mp3' : 'jpg');
    const userId = session.user.id;
    const identifier = artistId || userId;
    const filename = `${identifier}-${timestamp}.${ext}`;
    const key = `${folder}/${filename}`;

    logUploadEvent(`[${requestId}] FILENAME GENERATED`, {
      timestamp,
      ext,
      userId,
      identifier,
      filename,
      key
    });

    // Determine final content type for R2 storage
    let finalContentType = file.type;
    if (!finalContentType || finalContentType === 'application/octet-stream') {
      if (['.mp3'].includes(fileExt)) finalContentType = 'audio/mpeg';
      else if (['.wav'].includes(fileExt)) finalContentType = 'audio/wav';
      else if (['.flac'].includes(fileExt)) finalContentType = 'audio/flac';
      else if (['.m4a', '.aac'].includes(fileExt)) finalContentType = 'audio/mp4';
      else if (['.ogg'].includes(fileExt)) finalContentType = 'audio/ogg';
      else if (['.jpg', '.jpeg'].includes(fileExt)) finalContentType = 'image/jpeg';
      else if (['.png'].includes(fileExt)) finalContentType = 'image/png';
      else if (['.webp'].includes(fileExt)) finalContentType = 'image/webp';
      else if (['.pdf'].includes(fileExt)) finalContentType = 'application/pdf';
      else finalContentType = uploadType === 'audio' ? 'audio/mpeg' : 'image/jpeg';
    }

    // Convert file to buffer
    let buffer;
    try {
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      logUploadEvent(`[${requestId}] FILE CONVERTED TO BUFFER`, {
        bufferSize: buffer.length,
        byteLength: arrayBuffer.byteLength
      });
    } catch (bufferError: any) {
      logUploadEvent(`[${requestId}] ERROR: BUFFER CONVERSION FAILED`, {
        status: 500,
        error: bufferError.message,
        stack: bufferError.stack
      });
      return NextResponse.json({ 
        error: "Failed to convert file to buffer",
        details: bufferError.message 
      }, { status: 500 });
    }

    // Upload to R2 using AWS SDK
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: finalContentType,
      Metadata: {
        'uploaded-by': userId,
        'upload-type': uploadType,
        'original-name': file.name,
      }
    });

    logUploadEvent(`[${requestId}] R2 COMMAND PREPARED`, {
      bucket,
      key,
      contentType: file.type,
      bodySize: buffer.length,
      metadata: {
        'uploaded-by': userId,
        'upload-type': uploadType,
        'original-name': file.name,
      }
    });

    let uploadResponse;
    try {
      logUploadEvent(`[${requestId}] R2 UPLOAD STARTING`, {
        timestamp: new Date().toISOString()
      });

      uploadResponse = await r2Client.send(command);

      logUploadEvent(`[${requestId}] R2 UPLOAD SUCCESS`, {
        bucket,
        key,
        etag: uploadResponse.$metadata?.httpHeaders?.etag,
        statusCode: uploadResponse.$metadata?.httpStatusCode,
        requestId: uploadResponse.$metadata?.requestId
      });
    } catch (r2Error: any) {
      logUploadEvent(`[${requestId}] ERROR: R2 UPLOAD FAILED`, {
        status: 500,
        errorName: r2Error.name,
        errorCode: r2Error.Code || r2Error.code,
        errorMessage: r2Error.message,
        errorDetails: r2Error.constructor.name,
        stack: r2Error.stack,
        metadata: r2Error.$metadata,
        requestId: r2Error.$metadata?.requestId,
        statusCode: r2Error.$metadata?.httpStatusCode
      });
      return NextResponse.json({ 
        error: "Failed to upload to R2 storage",
        errorType: r2Error.name,
        errorCode: r2Error.Code || r2Error.code,
        details: r2Error.message,
        requestId: `${requestId}:${r2Error.$metadata?.requestId || 'unknown'}`
      }, { status: 500 });
    }

    // Generate public URL using custom domain
    let publicUrl;
    try {
      publicUrl = await getR2PublicUrl(bucket, key);
      logUploadEvent(`[${requestId}] PUBLIC URL GENERATED`, {
        bucket,
        key,
        publicUrl
      });
    } catch (urlError: any) {
      logUploadEvent(`[${requestId}] ERROR: URL GENERATION FAILED`, {
        status: 500,
        error: urlError.message,
        stack: urlError.stack
      });
      return NextResponse.json({ 
        error: "Failed to generate public URL",
        details: urlError.message 
      }, { status: 500 });
    }

    // Return success response
    const responseData = {
      ok: true,
      success: true,
      url: publicUrl,
      key: key,
      bucket: bucket,
      size: file.size,
      type: file.type,
      filename: filename
    };

    logUploadEvent(`[${requestId}] RESPONSE PREPARED`, responseData);

    const response = NextResponse.json(responseData);
    logUploadEvent(`[${requestId}] RESPONSE SENT`, {
      status: 200,
      contentType: response.headers.get('content-type'),
      bodyLength: JSON.stringify(responseData).length
    });

    return response;

  } catch (error: any) {
    const errorId = `err-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    logUploadEvent(`[${errorId}] UNCAUGHT EXCEPTION`, {
      status: 500,
      errorName: error.name,
      errorMessage: error.message,
      errorCode: error.code || error.Code,
      stack: error.stack,
      constructor: error.constructor.name,
      keys: Object.keys(error).slice(0, 20)
    });
    
    return NextResponse.json({ 
      error: "Internal server error",
      errorType: error.name,
      details: error.message,
      errorId
    }, { status: 500 });
  }
}
