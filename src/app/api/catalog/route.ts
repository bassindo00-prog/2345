import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET all catalog items with optional search & publisher filter
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.toLowerCase() || searchParams.get("search")?.toLowerCase();
    const publisher = searchParams.get("publisher");
    const limitParam = searchParams.get("limit");
    const pageParam = searchParams.get("page");

    let whereClause: any = {};
    const conditions: any[] = [];

    if (q) {
      conditions.push(
        { songId: { contains: q, mode: "insensitive" } },
        { title: { contains: q, mode: "insensitive" } },
        { artist: { contains: q, mode: "insensitive" } },
        { publisher: { contains: q, mode: "insensitive" } },
        { status: { contains: q, mode: "insensitive" } }
      );
      whereClause.OR = conditions;
    }

    if (publisher && publisher !== "ALL" && publisher !== "Semua Publisher") {
      whereClause.publisher = { contains: publisher, mode: "insensitive" };
    }

    const limit = limitParam ? Math.min(parseInt(limitParam), 3000) : 1000;
    const page = pageParam ? Math.max(parseInt(pageParam), 1) : 1;
    const skip = (page - 1) * limit;

    const shouldFetchPublishers = !publisher || publisher === "ALL" || searchParams.get("withPublishers") === "true";

    const [items, total, publishersRaw] = await Promise.all([
      prisma.catalog.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: skip,
      }),
      prisma.catalog.count({ where: whereClause }),
      shouldFetchPublishers
        ? (prisma.$queryRawUnsafe(`
            SELECT "publisher", count(*)::int as count 
            FROM "Catalog" 
            WHERE "publisher" IS NOT NULL AND "publisher" != ''
            GROUP BY "publisher" 
            ORDER BY count DESC;
          `) as Promise<Array<{ publisher: string; count: number }>>)
        : Promise.resolve([]),
    ]);

    return NextResponse.json({
      success: true,
      items,
      catalogs: items,
      total,
      publishers: publishersRaw || [],
      page,
      limit,
    });
  } catch (error: any) {
    console.error("GET /api/catalog error:", error);
    return NextResponse.json({ success: false, items: [], catalogs: [], publishers: [], error: error.message }, { status: 500 });
  }
}

// POST new catalog item or bulk upload
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Support Bulk Array of items (e.g. from CSV/Excel paste)
    if (Array.isArray(body.items) && body.items.length > 0) {
      let createdCount = 0;
      for (const item of body.items) {
        if (!item.songId || !item.title) continue;
        await prisma.catalog.upsert({
          where: { songId: String(item.songId).trim() },
          update: {
            title: String(item.title).trim(),
            artist: String(item.artist || "BREAKOUT Artist").trim(),
            publisher: String(item.publisher || "BREAKOUT Publishing").trim(),
            status: String(item.status || "Aktif").trim(),
            youtubeLink: item.youtubeLink || item.youtubeUrl || null,
            driveLink: item.driveLink || item.driveUrl || null,
          },
          create: {
            songId: String(item.songId).trim(),
            title: String(item.title).trim(),
            artist: String(item.artist || "BREAKOUT Artist").trim(),
            publisher: String(item.publisher || "BREAKOUT Publishing").trim(),
            status: String(item.status || "Aktif").trim(),
            youtubeLink: item.youtubeLink || item.youtubeUrl || null,
            driveLink: item.driveLink || item.driveUrl || null,
          },
        });
        createdCount++;
      }
      return NextResponse.json({ ok: true, success: true, count: createdCount });
    }

    // Single item creation
    const { songId, title, artist, publisher, status, youtubeLink, youtubeUrl, driveLink, driveUrl } = body;

    if (!songId || !title) {
      return NextResponse.json(
        { error: "Song ID dan Judul Lagu wajib diisi" },
        { status: 400 }
      );
    }

    const catalog = await prisma.catalog.upsert({
      where: { songId: String(songId).trim() },
      update: {
        title: String(title).trim(),
        artist: String(artist || "BREAKOUT Artist").trim(),
        publisher: String(publisher || "BREAKOUT Publishing").trim(),
        status: String(status || "Aktif").trim(),
        youtubeLink: youtubeLink || youtubeUrl || null,
        driveLink: driveLink || driveUrl || null,
      },
      create: {
        songId: String(songId).trim(),
        title: String(title).trim(),
        artist: String(artist || "BREAKOUT Artist").trim(),
        publisher: String(publisher || "BREAKOUT Publishing").trim(),
        status: String(status || "Aktif").trim(),
        youtubeLink: youtubeLink || youtubeUrl || null,
        driveLink: driveLink || driveUrl || null,
      },
    });

    return NextResponse.json({ ok: true, success: true, catalog });
  } catch (error: any) {
    console.error("POST /api/catalog error:", error);
    return NextResponse.json({ error: error.message || "Failed to save catalog" }, { status: 500 });
  }
}

// PATCH update catalog item
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, songId, title, artist, publisher, status, youtubeLink, youtubeUrl, driveLink, driveUrl } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const updated = await prisma.catalog.update({
      where: { id },
      data: {
        songId: songId ? String(songId).trim() : undefined,
        title: title ? String(title).trim() : undefined,
        artist: artist ? String(artist).trim() : undefined,
        publisher: publisher ? String(publisher).trim() : undefined,
        status: status ? String(status).trim() : undefined,
        youtubeLink: (youtubeLink || youtubeUrl) !== undefined ? (youtubeLink || youtubeUrl) : undefined,
        driveLink: (driveLink || driveUrl) !== undefined ? (driveLink || driveUrl) : undefined,
      },
    });

    // Otomatis sinkronisasi ke tabel CatalogSong jika judul sama
    try {
      if (updated.title) {
        await prisma.catalogSong.updateMany({
          where: { title: { equals: updated.title, mode: "insensitive" } },
          data: {
            artist: updated.artist,
            publisher: updated.publisher,
            driveLink: updated.driveLink || undefined,
            isActive: updated.status === "Aktif",
          },
        });
      }
    } catch (eSync) {
      console.warn("Sync to CatalogSong skipped:", eSync);
    }

    return NextResponse.json({ ok: true, success: true, catalog: updated });
  } catch (error: any) {
    console.error("PATCH /api/catalog error:", error);
    return NextResponse.json({ error: error.message || "Failed to update catalog" }, { status: 500 });
  }
}

// DELETE catalog item
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    await prisma.catalog.delete({ where: { id } });
    return NextResponse.json({ ok: true, success: true });
  } catch (error: any) {
    console.error("DELETE /api/catalog error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete catalog" }, { status: 500 });
  }
}
