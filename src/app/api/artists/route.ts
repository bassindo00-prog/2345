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
        `INSERT INTO "Artist" ("id", "userId", "name", "genre", "spotifyId", "appleId", "bio", "photoUrl", "createdAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
        newId, userId, trimmedName, finalGenre, finalSpotify, finalApple, finalBio, finalPhoto
      );
    } catch {
      try {
        await prisma.$executeRawUnsafe(
          `INSERT INTO "Artist" ("id", "userId", "stageName", "genre", "spotifyId", "appleId", "bio", "avatarUrl", "createdAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
          newId, userId, trimmedName, finalGenre, finalSpotify, finalApple, finalBio, finalPhoto
        );
      } catch (ePrisma) {
        await prisma.artist.create({
          data: {
            userId,
            stageName: trimmedName,
            genre: finalGenre,
            spotifyId: finalSpotify,
            appleId: finalApple,
            bio: finalBio,
            avatarUrl: finalPhoto,
          },
        });
      }
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

    // 1. Update nama artis dan data profil di tabel Artist via SQL aman
    try {
      await prisma.$executeRawUnsafe(
        `UPDATE "Artist" SET "name" = $1, "genre" = $2, "spotifyId" = $3, "appleId" = $4, "bio" = $5, "photoUrl" = $6 WHERE "id" = $7 AND "userId" = $8`,
        trimmedName, finalGenre, finalSpotify, finalApple, finalBio, finalPhoto, id, userId
      );
    } catch {
      try {
        await prisma.$executeRawUnsafe(
          `UPDATE "Artist" SET "stageName" = $1, "genre" = $2, "spotifyId" = $3, "appleId" = $4, "bio" = $5, "avatarUrl" = $6 WHERE "id" = $7 AND "userId" = $8`,
          trimmedName, finalGenre, finalSpotify, finalApple, finalBio, finalPhoto, id, userId
        );
      } catch (ePrisma) {
        await prisma.artist.update({
          where: { id },
          data: {
            stageName: trimmedName,
            genre: finalGenre,
            spotifyId: finalSpotify,
            appleId: finalApple,
            bio: finalBio,
            avatarUrl: finalPhoto,
          },
        }).catch(() => {});
      }
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
