import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const raw = await prisma.publisherCatalogSong.findMany({
      orderBy: { createdAt: "desc" },
    });

    const catalogs = raw.map((c) => ({
      id: c.id,
      songId: c.isrc || `CAT-${c.id.slice(0, 6).toUpperCase()}`,
      title: c.title || "Untitled Track",
      artist: c.artist || "Unknown Artist",
      publisher: c.publisher || "BREAKOUT Publishing",
      status: "Aktif",
      youtubeUrl: "",
      driveUrl: "",
    }));

    return NextResponse.json({ catalogs });
  } catch (error) {
    return NextResponse.json({ catalogs: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const song = await prisma.publisherCatalogSong.create({
      data: {
        title: body.title,
        artist: body.artist,
        publisher: body.publisher || "BREAKOUT Publishing",
        isrc: body.songId,
      },
    });
    return NextResponse.json({ ok: true, song });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create catalog" }, { status: 500 });
  }
}

