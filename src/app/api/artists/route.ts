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

    let artists: any[] = [];
    try {
      artists = (await prisma.$queryRawUnsafe(
        `SELECT "id", "name", "genre", "spotifyId", "appleId", "photoUrl", "bio", "createdAt" FROM "Artist" WHERE "userId" = $1 ORDER BY "createdAt" DESC`,
        userId
      )) as any[];
    } catch (eRaw) {
      console.warn("Raw artist query failed, falling back to prisma:", eRaw);
      const pArtists = await prisma.artist.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      artists = pArtists.map((a: any) => ({
        id: a.id,
        name: a.stageName || a.name,
        genre: a.genre || "Pop",
        spotifyId: a.spotifyId || "",
        appleId: a.appleId || "",
        photoUrl: a.avatarUrl || a.photoUrl,
        bio: a.bio,
      }));
    }

    return NextResponse.json({
      ok: true,
      artists: artists.map((a) => ({
        id: a.id,
        name: a.name || a.stageName,
        stageName: a.name || a.stageName,
        genre: a.genre || "Pop",
        spotifyId: a.spotifyId || "",
        appleId: a.appleId || "",
        bio: a.bio,
        photoUrl: resolveMediaUrl(a.photoUrl || a.avatarUrl),
        avatarUrl: resolveMediaUrl(a.photoUrl || a.avatarUrl),
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
    const { name, genre, spotifyId, appleId, photoUrl, bio } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Nama artis wajib diisi!" }, { status: 400 });
    }

    const trimmedName = name.trim();
    const newId = `art_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    try {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "Artist" ("id", "userId", "name", "genre", "spotifyId", "appleId", "photoUrl", "bio", "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
        newId,
        userId,
        trimmedName,
        genre || "Pop",
        spotifyId ? spotifyId.trim() : "",
        appleId ? appleId.trim() : "",
        photoUrl ? photoUrl.trim() : "",
        bio ? bio.trim() : ""
      );
    } catch (eRaw) {
      console.warn("Raw insert failed, trying Prisma:", eRaw);
      await prisma.artist.create({
        data: {
          userId,
          stageName: trimmedName,
          bio: bio ? bio.trim() : null,
          avatarUrl: photoUrl ? photoUrl.trim() : null,
        },
      });
    }

    // Singkronkan user.name jika masih belum ada atau default
    try {
      await prisma.$executeRawUnsafe(
        `UPDATE "User" SET "name" = $1 WHERE "id" = $2 AND ("name" IS NULL OR "name" = '' OR "name" = 'User' OR "name" = 'Artis')`,
        trimmedName,
        userId
      );
    } catch (eUser) {}

    return NextResponse.json({
      ok: true,
      artist: {
        id: newId,
        name: trimmedName,
        stageName: trimmedName,
        genre: genre || "Pop",
        spotifyId: spotifyId ? spotifyId.trim() : "",
        appleId: appleId ? appleId.trim() : "",
        bio: bio ? bio.trim() : "",
        photoUrl: resolveMediaUrl(photoUrl),
        avatarUrl: resolveMediaUrl(photoUrl),
      },
    });
  } catch (error) {
    console.error("POST artist error:", error);
    return NextResponse.json({ error: "Failed to create artist" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, genre, spotifyId, appleId, photoUrl, bio } = body;

    if (!id) {
      return NextResponse.json({ error: "ID profil artis wajib disertakan!" }, { status: 400 });
    }

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Nama artis wajib diisi!" }, { status: 400 });
    }

    const trimmedName = name.trim();

    // 1. Update Artist di PostgreSQL
    try {
      await prisma.$executeRawUnsafe(
        `UPDATE "Artist" SET "name" = $1, "genre" = $2, "spotifyId" = $3, "appleId" = $4, "photoUrl" = $5, "bio" = $6 WHERE "id" = $7 AND "userId" = $8`,
        trimmedName,
        genre || "Pop",
        spotifyId ? spotifyId.trim() : "",
        appleId ? appleId.trim() : "",
        photoUrl ? photoUrl.trim() : "",
        bio ? bio.trim() : "",
        id,
        userId
      );
    } catch (eRaw) {
      console.warn("Raw update failed, trying Prisma:", eRaw);
      await prisma.artist.update({
        where: { id },
        data: {
          stageName: trimmedName,
          bio: bio !== undefined ? (bio ? bio.trim() : null) : undefined,
          avatarUrl: photoUrl !== undefined ? (photoUrl ? photoUrl.trim() : null) : undefined,
        },
      });
    }

    // 2. Singkronkan nama artis di Release
    try {
      await prisma.$executeRawUnsafe(
        `UPDATE "Release" SET "artist" = $1 WHERE "userId" = $2`,
        trimmedName,
        userId
      );
    } catch (eRel) {}

    // 3. Singkronkan User.name
    try {
      await prisma.$executeRawUnsafe(
        `UPDATE "User" SET "name" = $1 WHERE "id" = $2`,
        trimmedName,
        userId
      );
    } catch (eUser) {}

    return NextResponse.json({
      ok: true,
      artist: {
        id,
        name: trimmedName,
        stageName: trimmedName,
        genre: genre || "Pop",
        spotifyId: spotifyId ? spotifyId.trim() : "",
        appleId: appleId ? appleId.trim() : "",
        bio: bio ? bio.trim() : "",
        photoUrl: resolveMediaUrl(photoUrl),
        avatarUrl: resolveMediaUrl(photoUrl),
      },
    });
  } catch (error) {
    console.error("PATCH artist error:", error);
    return NextResponse.json({ error: "Gagal memperbarui profil artis" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID profil artis wajib disertakan!" }, { status: 400 });
    }

    try {
      await prisma.$executeRawUnsafe(
        `DELETE FROM "Artist" WHERE "id" = $1 AND "userId" = $2`,
        id,
        userId
      );
    } catch (eRaw) {
      await prisma.artist.delete({ where: { id } });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE artist error:", error);
    return NextResponse.json({ error: "Gagal menghapus profil artis" }, { status: 500 });
  }
}
