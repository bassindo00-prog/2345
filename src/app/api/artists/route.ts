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
        `SELECT * FROM "Artist" WHERE "userId" = $1 ORDER BY "createdAt" DESC`,
        userId
      )) as any[];
    } catch {
      artists = (await prisma.artist.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }).catch(() => [])) as any[];
    }

    return NextResponse.json({
      ok: true,
      artists: (artists || []).map((a: any) => ({
        id: a.id,
        name: a.stageName || a.name || "",
        stageName: a.stageName || a.name || "",
        genre: a.genre || "Pop",
        spotifyId: a.spotifyId || "",
        appleId: a.appleId || "",
        bio: a.bio || "",
        avatarUrl: resolveMediaUrl(a.avatarUrl || a.photoUrl),
        photoUrl: resolveMediaUrl(a.avatarUrl || a.photoUrl),
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
    const { name, genre, spotifyId, appleId, bio, photoUrl } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Nama artis wajib diisi!" }, { status: 400 });
    }

    const trimmedName = name.trim();
    const newId = `art_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const finalGenre = genre || "Pop";
    const finalSpotify = spotifyId ? spotifyId.trim() : "";
    const finalApple = appleId ? appleId.trim() : "";
    const finalBio = bio ? bio.trim() : null;
    const finalPhoto = photoUrl ? photoUrl.trim() : null;

    try {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "Artist" ("id", "userId", "stageName", "createdAt") VALUES ($1, $2, $3, NOW())`,
        newId, userId, trimmedName
      );
    } catch {
      try {
        await prisma.$executeRawUnsafe(
          `INSERT INTO "Artist" ("id", "userId", "name", "createdAt") VALUES ($1, $2, $3, NOW())`,
          newId, userId, trimmedName
        );
      } catch {
        await prisma.artist.create({
          data: {
            id: newId,
            userId,
            stageName: trimmedName,
          },
        });
      }
    }

    if (finalBio) {
      await prisma.$executeRawUnsafe(`UPDATE "Artist" SET "bio" = $1 WHERE "id" = $2`, finalBio, newId).catch(() => {});
    }
    if (finalPhoto) {
      await prisma.$executeRawUnsafe(`UPDATE "Artist" SET "photoUrl" = $1 WHERE "id" = $2`, finalPhoto, newId).catch(() => {});
      await prisma.$executeRawUnsafe(`UPDATE "Artist" SET "avatarUrl" = $1 WHERE "id" = $2`, finalPhoto, newId).catch(() => {});
    }
    if (finalSpotify) {
      await prisma.$executeRawUnsafe(`UPDATE "Artist" SET "spotifyId" = $1 WHERE "id" = $2`, finalSpotify, newId).catch(() => {});
    }
    if (finalApple) {
      await prisma.$executeRawUnsafe(`UPDATE "Artist" SET "appleId" = $1 WHERE "id" = $2`, finalApple, newId).catch(() => {});
    }
    if (finalGenre) {
      await prisma.$executeRawUnsafe(`UPDATE "Artist" SET "genre" = $1 WHERE "id" = $2`, finalGenre, newId).catch(() => {});
    }

    // Singkronkan user.name jika masih belum ada atau default
    try {
      const userRec = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true },
      });
      if (!userRec?.name || userRec.name === "User" || userRec.name === "Artis") {
        await prisma.user.update({
          where: { id: userId },
          data: { name: trimmedName },
        });
      }
      if (finalPhoto) {
        await prisma.$executeRawUnsafe(
          `UPDATE "User" SET "image" = $1, "avatar" = $1 WHERE "id" = $2`,
          finalPhoto,
          userId
        ).catch(() => {});
      }
    } catch (eUser) {
      console.warn("Failed to sync user name on create artist:", eUser);
    }

    return NextResponse.json({
      ok: true,
      artist: {
        id: newId,
        name: trimmedName,
        stageName: trimmedName,
        genre: finalGenre,
        spotifyId: finalSpotify,
        appleId: finalApple,
        bio: finalBio,
        avatarUrl: resolveMediaUrl(finalPhoto),
        photoUrl: resolveMediaUrl(finalPhoto),
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
    const { id, name, genre, spotifyId, appleId, bio, photoUrl } = body;

    if (!id) {
      return NextResponse.json({ error: "ID profil artis wajib disertakan!" }, { status: 400 });
    }

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Nama artis wajib diisi!" }, { status: 400 });
    }

    const trimmedName = name.trim();
    const finalGenre = genre || "Pop";
    const finalSpotify = spotifyId ? spotifyId.trim() : "";
    const finalApple = appleId ? appleId.trim() : "";
    const finalBio = bio ? bio.trim() : null;
    const finalPhoto = photoUrl ? photoUrl.trim() : null;

    // 1. Update nama artis di tabel Artist via SQL aman
    try {
      await prisma.$executeRawUnsafe(
        `UPDATE "Artist" SET "stageName" = $1 WHERE "id" = $2 AND "userId" = $3`,
        trimmedName, id, userId
      );
    } catch {
      try {
        await prisma.$executeRawUnsafe(
          `UPDATE "Artist" SET "name" = $1 WHERE "id" = $2 AND "userId" = $3`,
          trimmedName, id, userId
        );
      } catch (eArt) {
        try {
          await prisma.artist.update({
            where: { id },
            data: { stageName: trimmedName },
          });
        } catch (eArt2) {
          console.warn("Artist name update fallback:", eArt2);
        }
      }
    }

    if (finalBio !== undefined) {
      await prisma.$executeRawUnsafe(`UPDATE "Artist" SET "bio" = $1 WHERE "id" = $2`, finalBio, id).catch(() => {});
    }
    if (finalPhoto !== undefined) {
      await prisma.$executeRawUnsafe(`UPDATE "Artist" SET "photoUrl" = $1 WHERE "id" = $2`, finalPhoto, id).catch(() => {});
      await prisma.$executeRawUnsafe(`UPDATE "Artist" SET "avatarUrl" = $1 WHERE "id" = $2`, finalPhoto, id).catch(() => {});
    }
    if (finalSpotify !== undefined) {
      await prisma.$executeRawUnsafe(`UPDATE "Artist" SET "spotifyId" = $1 WHERE "id" = $2`, finalSpotify, id).catch(() => {});
    }
    if (finalApple !== undefined) {
      await prisma.$executeRawUnsafe(`UPDATE "Artist" SET "appleId" = $1 WHERE "id" = $2`, finalApple, id).catch(() => {});
    }
    if (finalGenre !== undefined) {
      await prisma.$executeRawUnsafe(`UPDATE "Artist" SET "genre" = $1 WHERE "id" = $2`, finalGenre, id).catch(() => {});
    }

    // 2. Singkronkan nama artis di tabel Release via SQL
    try {
      await prisma.$executeRawUnsafe(
        `UPDATE "Release" SET "artist" = $1 WHERE "userId" = $2`,
        trimmedName,
        userId
      );
    } catch (eRel) {
      console.warn("Failed to sync artist in releases:", eRel);
    }

    // 3. Singkronkan ke User.name dan User.image / avatar
    try {
      await prisma.$executeRawUnsafe(
        `UPDATE "User" SET "name" = $1 WHERE "id" = $2`,
        trimmedName,
        userId
      );
      if (finalPhoto) {
        await prisma.$executeRawUnsafe(
          `UPDATE "User" SET "image" = $1, "avatar" = $1 WHERE "id" = $2`,
          finalPhoto,
          userId
        );
      }
    } catch (eUser) {
      console.warn("Failed to sync user on artist edit:", eUser);
    }

    return NextResponse.json({
      ok: true,
      artist: {
        id,
        name: trimmedName,
        stageName: trimmedName,
        genre: finalGenre,
        spotifyId: finalSpotify,
        appleId: finalApple,
        bio: finalBio,
        avatarUrl: resolveMediaUrl(finalPhoto),
        photoUrl: resolveMediaUrl(finalPhoto),
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
    } catch {
      await prisma.artist.delete({
        where: { id },
      }).catch(() => {});
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE artist error:", error);
    return NextResponse.json({ error: "Gagal menghapus profil artis" }, { status: 500 });
  }
}
