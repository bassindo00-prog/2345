import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { resolveMediaUrl } from "@/lib/r2";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const artists = await prisma.artist.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      ok: true,
      artists: artists.map((a) => ({
        id: a.id,
        name: a.stageName,
        stageName: a.stageName,
        bio: a.bio,
        avatarUrl: resolveMediaUrl(a.avatarUrl),
      })),
    });
  } catch (error) {
    console.error("GET artists error:", error);
    return NextResponse.json({ error: "Failed to fetch artists" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, bio, photoUrl } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Nama artis wajib diisi!" }, { status: 400 });
    }

    const newArtist = await prisma.artist.create({
      data: {
        userId,
        stageName: name.trim(),
        bio: bio || null,
        avatarUrl: photoUrl || null,
      },
    });

    return NextResponse.json({ ok: true, artist: newArtist });
  } catch (error) {
    console.error("POST artist error:", error);
    return NextResponse.json({ error: "Failed to create artist" }, { status: 500 });
  }
}

