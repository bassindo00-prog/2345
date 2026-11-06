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
