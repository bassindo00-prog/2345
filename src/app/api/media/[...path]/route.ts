import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, BUCKET_RELEASES, BUCKET_ASSETS, BUCKET_PROFILES } from "@/lib/r2";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await context.params;
    if (!path || path.length === 0) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const key = path.join("/");
    const rangeHeader = request.headers.get("range");

    // Determine target bucket
    let bucketsToTry = [BUCKET_RELEASES, BUCKET_ASSETS, BUCKET_PROFILES];
    if (key.startsWith("cms/") || key.startsWith("assets/")) {
      bucketsToTry = [BUCKET_ASSETS, BUCKET_RELEASES, BUCKET_PROFILES];
    } else if (key.startsWith("profiles/")) {
      bucketsToTry = [BUCKET_PROFILES, BUCKET_RELEASES, BUCKET_ASSETS];
    }

    let responseData: any = null;

    for (const bucket of bucketsToTry) {
      try {
        const cmd = new GetObjectCommand({
          Bucket: bucket,
          Key: key,
          Range: rangeHeader || undefined,
        });
        const res = await r2Client.send(cmd);
        if (res && res.Body) {
          responseData = res;
          break;
        }
      } catch (err: any) {
        continue;
      }
    }

    if (!responseData || !responseData.Body) {
      if (key.startsWith("covers/")) {
        return NextResponse.redirect(new URL("/logo.png", request.url));
      }
      return new NextResponse("File Not Found", { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const isDownload = searchParams.get("download") === "1";
    const customFilename = searchParams.get("filename");

    const contentType = responseData.ContentType || "application/octet-stream";
    const contentLength = responseData.ContentLength;
    const contentRange = responseData.ContentRange;
    const acceptRanges = "bytes";

    const stream = responseData.Body.transformToWebStream();

    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Accept-Ranges": acceptRanges,
      "Cache-Control": "public, max-age=86400, s-maxage=604800",
    };

    if (isDownload) {
      const fn = customFilename || path[path.length - 1] || "file";
      headers["Content-Disposition"] = `attachment; filename="${encodeURIComponent(fn)}"`;
    }

    if (contentLength !== undefined) {
      headers["Content-Length"] = contentLength.toString();
    }

    if (rangeHeader && contentRange) {
      headers["Content-Range"] = contentRange;
      return new NextResponse(stream, {
        status: 206,
        headers,
      });
    }

    return new NextResponse(stream, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error("Media stream error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}