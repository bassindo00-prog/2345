import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, BUCKET_ASSETS } from "@/lib/r2";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await auth();
    // @ts-ignore
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ ok: false, error: "No file provided" }, { status: 400 });
    }

    const ext = file.name.split(".").pop() || "jpg";
    const key = `cms/${uuidv4()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const command = new PutObjectCommand({
      Bucket: BUCKET_ASSETS,
      Key: key,
      Body: buffer,
      ContentType: file.type || "image/jpeg",
    });

    await r2Client.send(command);

    const url = `/api/media/${key}`;
    return NextResponse.json({ ok: true, success: true, url });
  } catch (error: any) {
    console.error("CMS Upload route error:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to upload CMS image" },
      { status: 500 }
    );
  }
}
