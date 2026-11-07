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

    const trimmedName = name.trim();

    const newArtist = await prisma.artist.create({
      data: {
        userId,
        stageName: trimmedName,
        bio: bio ? bio.trim() : null,
        avatarUrl: photoUrl ? photoUrl.trim() : null,
      },
    });

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
    } catch (eUser) {
      console.warn("Failed to sync user name on create artist:", eUser);
    }

    return NextResponse.json({
      ok: true,
      artist: {
        id: newArtist.id,
        name: newArtist.stageName,
        stageName: newArtist.stageName,
        bio: newArtist.bio,
        avatarUrl: resolveMediaUrl(newArtist.avatarUrl),
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
    const { id, name, bio, photoUrl } = body;

    if (!id) {
      return NextResponse.json({ error: "ID profil artis wajib disertakan!" }, { status: 400 });
    }

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Nama artis wajib diisi!" }, { status: 400 });
    }

    const trimmedName = name.trim();

    // Verifikasi kepemilikan profil artis
    const existing = await prisma.artist.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Profil artis tidak ditemukan atau bukan milik Anda" },
        { status: 404 }
      );
    }

    const oldName = existing.stageName;

    // 1. Update nama artis dan data profil di tabel Artist
    const updated = await prisma.artist.update({
      where: { id },
      data: {
        stageName: trimmedName,
        bio: bio !== undefined ? (bio ? bio.trim() : null) : existing.bio,
        avatarUrl: photoUrl !== undefined ? (photoUrl ? photoUrl.trim() : null) : existing.avatarUrl,
      },
    });

    // 2. Singkronkan nama artis di seluruh rilisan lagu (Release) yang terhubung
    try {
      await prisma.release.updateMany({
        where: { artistId: id },
        data: { primaryArtist: trimmedName },
      });
      // Sinkronkan juga rilisan berdasar userId & old primaryArtist
      await prisma.release.updateMany({
        where: { userId, primaryArtist: oldName },
        data: { primaryArtist: trimmedName },
      });
    } catch (eRel) {
      console.warn("Failed to sync primaryArtist in releases:", eRel);
    }

    // 3. Singkronkan ke User.name agar identitas di Admin & Dashboard langsung terupdate
    try {
      const userRec = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true },
      });
      if (
        userRec &&
        (!userRec.name ||
          userRec.name === oldName ||
          userRec.name === "User" ||
          userRec.name === "Artis")
      ) {
        await prisma.user.update({
          where: { id: userId },
          data: { name: trimmedName },
        });
      }
    } catch (eUser) {
      console.warn("Failed to sync user name on artist edit:", eUser);
    }

    return NextResponse.json({
      ok: true,
      artist: {
        id: updated.id,
        name: updated.stageName,
        stageName: updated.stageName,
        bio: updated.bio,
        avatarUrl: resolveMediaUrl(updated.avatarUrl),
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

    const existing = await prisma.artist.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Profil artis tidak ditemukan atau bukan milik Anda" },
        { status: 404 }
      );
    }

    await prisma.artist.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE artist error:", error);
    return NextResponse.json({ error: "Gagal menghapus profil artis" }, { status: 500 });
  }
}
