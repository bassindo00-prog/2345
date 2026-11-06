import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { resolveMediaUrl } from "@/lib/r2";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all") === "true";

    // @ts-ignore
    const isAdmin = session?.user?.role === "ADMIN";

    let rawReleases;
    if (all && isAdmin) {
      rawReleases = await prisma.release.findMany({
        include: {
          artist: { include: { user: true } },
          tracks: true,
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      const userId = session?.user?.id;
      if (!userId) {
        return NextResponse.json({ releases: [] });
      }
      rawReleases = await prisma.release.findMany({
        where: {
          artist: { userId },
        },
        include: {
          artist: { include: { user: true } },
          tracks: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }

    const releases = rawReleases.map((r) => {
      const firstTrack = r.tracks[0];
      const releaseDateStr =
        r.releaseDate instanceof Date && !isNaN(r.releaseDate.getTime())
          ? r.releaseDate.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "-";

      let statusUi = "Pending";
      if (r.status === "APPROVED" || r.status === "RELEASED") statusUi = "Approved";
      else if (r.status === "REJECTED") statusUi = "Rejected";

      return {
        id: r.id,
        title: r.title,
        artist: r.artist?.stageName || r.primaryArtist || "Artist",
        genre: r.genre || "Pop",
        releaseDate: releaseDateStr,
        duration: "3:42",
        streams: "15K",
        streamsNum: 15000,
        platform: "Spotify, Apple Music",
        platforms: "Spotify, Apple Music",
        status: statusUi,
        coverUrl: resolveMediaUrl(r.coverArtworkUrl) || "/logo.png",
        audioFile: firstTrack ? resolveMediaUrl(firstTrack.audioUrl) : "",
        upc: r.upc || firstTrack?.upc || "899214578101",
        isrc: firstTrack?.isrc || "D-HRM-24-00109",
        userId: r.artist?.userId || r.artistId,
        user: {
          id: r.artist?.userId || r.artistId,
          name: r.artist?.user?.name || r.primaryArtist || "Artist",
          email: r.artist?.user?.email || "",
        },
      };
    });

    return NextResponse.json({ releases });
  } catch (error) {
    console.error("GET releases error:", error);
    return NextResponse.json(
      { error: "Failed to fetch releases" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      artist,
      featuring,
      composer,
      producer,
      tiktokClip,
      genre,
      releaseDate,
      upc,
      isrc,
      coverUrl,
      audioFile,
      platforms,
    } = body;

    if (!title) {
      return NextResponse.json({ ok: false, error: "Judul lagu wajib diisi" }, { status: 400 });
    }

    // Find or create artist profile for current user
    let userArtist = await prisma.artist.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (!userArtist) {
      userArtist = await prisma.artist.create({
        data: {
          userId,
          name: artist || session.user.name || "Artist",
          stageName: artist || session.user.name || "Artist",
        },
      });
    }

    let parsedReleaseDate = new Date();
    if (releaseDate && typeof releaseDate === "string") {
      const parts = releaseDate.split("-");
      if (parts.length === 3 && parts[2].length === 4) {
        parsedReleaseDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      } else {
        parsedReleaseDate = new Date(releaseDate);
      }
    }
    if (isNaN(parsedReleaseDate.getTime())) {
      parsedReleaseDate = new Date();
    }

    const newRelease = await prisma.release.create({
      data: {
        artistId: userArtist.id,
        title,
        primaryArtist: artist || userArtist.stageName || "Artist",
        genre: genre || "Pop",
        language: "Indonesian",
        coverArtworkUrl: coverUrl || "/logo.png",
        releaseDate: parsedReleaseDate,
        status: "PENDING",
        upc: upc || null,
        tracks: {
          create: [
            {
              title,
              audioUrl: audioFile || "",
              featuredArtist: featuring || null,
              composer: composer || null,
              producer: producer || null,
              isrc: isrc || null,
              upc: upc || null,
              tiktokClipStart: tiktokClip || null,
            },
          ],
        },
      },
      include: { tracks: true, artist: true },
    });

    // Notify Telegram if configured
    try {
      const { sendTelegramReleaseNotification } = await import("@/lib/telegramBot");
      await sendTelegramReleaseNotification({
        title,
        artist: artist || userArtist.stageName,
        genre: genre || "Pop",
        audioUrl: audioFile,
        releaseDate: parsedReleaseDate.toISOString(),
        userName: session.user.name || session.user.email,
        platforms: platforms || "All DSP Platforms",
      });
    } catch (teleErr) {
      console.warn("Telegram notification warning:", teleErr);
    }

    return NextResponse.json({ ok: true, success: true, release: newRelease });
  } catch (error: any) {
    console.error("POST release error:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to create release" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing release ID" }, { status: 400 });
    }

    let targetStatus: any = "PENDING";
    if (status === "Approved") targetStatus = "APPROVED";
    else if (status === "Rejected") targetStatus = "REJECTED";

    const updated = await prisma.release.update({
      where: { id },
      data: { status: targetStatus },
    });

    return NextResponse.json({ ok: true, release: updated });
  } catch (error) {
    console.error("PATCH release error:", error);
    return NextResponse.json(
      { error: "Failed to update release" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const idsParam = searchParams.get("ids");

    if (idsParam) {
      const ids = idsParam.split(",").filter(Boolean);
      await prisma.release.deleteMany({
        where: { id: { in: ids } },
      });
      return NextResponse.json({ ok: true });
    }

    if (id) {
      await prisma.release.delete({
        where: { id },
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Missing ID" }, { status: 400 });
  } catch (error) {
    console.error("DELETE release error:", error);
    return NextResponse.json(
      { error: "Failed to delete release" },
      { status: 500 }
    );
  }
}

