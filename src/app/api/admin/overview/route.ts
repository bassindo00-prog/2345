import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveMediaUrl } from "@/lib/r2";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    // 1. Query users, withdrawals, catalogs, artists secara aman dan independen
    let dbArtists: any[] = [];
    try {
      dbArtists = (await prisma.$queryRawUnsafe(
        `SELECT * FROM "Artist" ORDER BY "createdAt" DESC`
      )) as any[];
    } catch (eArt) {
      try {
        dbArtists = (await prisma.artist.findMany()) as any[];
      } catch (eArt2) {
        console.warn("Artist query fallback in overview:", eArt2);
      }
    }

    const [rawUsers, rawWithdrawals, rawCatalogSongs] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          withdrawRequests: true,
        },
      }),
      prisma.withdrawRequest.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
        },
      }),
      prisma.catalog.findMany({
        orderBy: { createdAt: "desc" },
        take: 3000,
      }),
    ]);

    // 2. Query releases via raw SQL karena di PostgreSQL kolomnya adalah "artist" & "userId"
    let rawReleases: any[] = [];
    try {
      rawReleases = (await prisma.$queryRawUnsafe(
        `SELECT * FROM "Release" ORDER BY "createdAt" DESC`
      )) as any[];
    } catch (eRawRel) {
      try {
        rawReleases = await prisma.release.findMany({
          orderBy: { createdAt: "desc" },
        });
      } catch (eRel) {
        console.error("Failed to query Release:", eRel);
      }
    }

    // Map users to the structure expected by the frontend
    const users = rawUsers.map((u: any) => {
      const userArtists = (dbArtists || []).filter((a: any) => a.userId === u.id);
      const primaryArtist = userArtists[0] || null;
      const artistSpotify =
        userArtists.find((a: any) => a.spotifyId && a.spotifyId.trim())?.spotifyId ||
        primaryArtist?.spotifyId ||
        "";
      const artistApple =
        userArtists.find((a: any) => a.appleId && a.appleId.trim())?.appleId ||
        primaryArtist?.appleId ||
        "";

      const totalWithdrawn = (u.withdrawRequests || [])
        .filter((w: any) => w.status === "APPROVED" || w.status === "PAID")
        .reduce((sum: number, w: any) => sum + (w.amount || 0), 0);

      const pendingWithdraw = (u.withdrawRequests || [])
        .filter((w: any) => w.status === "PENDING")
        .reduce((sum: number, w: any) => sum + (w.amount || 0), 0);

      const royaltyBalance =
        typeof u.royaltyBalance === "number" ? u.royaltyBalance : 0;
      const totalStreams =
        typeof u.totalStreams === "number" ? u.totalStreams : 15400;

      const displayName = primaryArtist?.stageName || primaryArtist?.name || u.name || "User Musisi";

      return {
        id: u.id,
        name: displayName,
        email: u.email,
        role: u.role,
        status: u.status || "APPROVED",
        rejectionReason: u.rejectionReason || "",
        whatsapp: u.whatsapp || "",
        youtubeUrl: u.youtubeUrl || "",
        spotifyUrl: artistSpotify,
        spotifyId: artistSpotify,
        appleId: artistApple,
        appleMusicUrl: artistApple,
        nik: u.nik || "",
        ktpUrl: resolveMediaUrl(u.ktpUrl) || "",
        createdAt: u.createdAt,
        avatar: resolveMediaUrl(u.image || u.avatar || primaryArtist?.avatarUrl || primaryArtist?.photoUrl) || "/logo.png",
        totalStreams,
        royaltyBalance,
        royaltyPending: typeof u.royaltyPending === "number" ? u.royaltyPending : pendingWithdraw,
        totalWithdrawn: typeof u.totalWithdrawn === "number" ? u.totalWithdrawn : totalWithdrawn,
        pendingWithdraw,
        royaltyMonth: u.royaltyMonth || "November",
        artists: userArtists.map((a: any) => ({
          id: a.id,
          name: a.stageName || a.name || displayName,
          stageName: a.stageName || a.name || displayName,
          genre: a.genre || "Pop",
          spotifyId: a.spotifyId || "",
          appleId: a.appleId || "",
          bio: a.bio || "",
          photoUrl: resolveMediaUrl(a.avatarUrl || a.photoUrl),
          avatarUrl: resolveMediaUrl(a.avatarUrl || a.photoUrl),
        })),
        _count: {
          releases: rawReleases.filter((r) => r.userId === u.id).length,
          withdrawals: (u.withdrawRequests && u.withdrawRequests.length) || 0,
          artists: userArtists.length,
        },
      };
    });

    // Map releases
    const releases = rawReleases.map((r: any) => {
      const firstTrack = (r.tracks && r.tracks[0]) || null;
      let releaseDateStr = "-";
      if (r.releaseDate) {
        if (typeof r.releaseDate === "string") {
          releaseDateStr = r.releaseDate;
        } else if (r.releaseDate instanceof Date && !isNaN(r.releaseDate.getTime())) {
          releaseDateStr = r.releaseDate.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });
        }
      }

      let statusUi = "Pending";
      const st = String(r.status || "").toUpperCase();
      if (st === "APPROVED" || st === "RELEASED") statusUi = "Approved";
      else if (st === "REJECTED") statusUi = "Rejected";

      const matchedUser = rawUsers.find(
        (u) => u.id === (r.userId || r.artist?.userId || r.artistId)
      );

      return {
        id: r.id,
        title: r.title,
        type: r.type || "SINGLE",
        artist: r.artist?.stageName || r.artist || r.primaryArtist || "Artist",
        genre: r.genre || "Pop",
        releaseDate: releaseDateStr,
        duration: r.duration || "3:42",
        streams: r.streams || "0",
        streamsNum: r.streamsNum || 0,
        platform: r.platform || r.platforms || "Spotify, Apple Music",
        platforms: r.platforms || r.platform || "Spotify, Apple Music",
        status: statusUi,
        composer: firstTrack?.composer || r.composer || "-",
        producer: firstTrack?.producer || r.producer || "-",
        publisher: r.distributor || r.publisher || "-",
        distributor: r.distributor || r.publisher || "-",
        featuring: firstTrack?.featuredArtist || r.featuredArtist || r.featuring || "Tidak ada (Solo)",
        tiktokClip: firstTrack?.tiktokClipStart || r.tiktokClip || "-",
        coverUrl: resolveMediaUrl(r.coverUrl || r.coverArtworkUrl) || "/logo.png",
        audioFile: firstTrack
          ? resolveMediaUrl(firstTrack.audioUrl)
          : resolveMediaUrl(r.audioFile) || "",
        upc: r.upc || firstTrack?.upc || "899214578101",
        isrc: r.isrc || firstTrack?.isrc || "D-HRM-24-00109",
        spotifyUrl: r.spotifyUrl || "",
        userId: r.userId || r.artist?.userId || r.artistId,
        user: {
          id: matchedUser?.id || r.userId,
          name: matchedUser?.name || r.artist || "Artist",
          email: matchedUser?.email || "",
          avatar: resolveMediaUrl(matchedUser?.image || matchedUser?.avatar) || "/logo.png",
        },
      };
    });

    // Map withdrawals
    const withdrawals = rawWithdrawals.map((w) => {
      let statusUi = "Pending";
      if (w.status === "APPROVED" || w.status === "PAID") statusUi = "Approved";
      else if (w.status === "REJECTED") statusUi = "Rejected";

      const dateStr =
        w.createdAt instanceof Date
          ? `${String(w.createdAt.getDate()).padStart(2, "0")}-${String(
              w.createdAt.getMonth() + 1
            ).padStart(2, "0")}-${w.createdAt.getFullYear()}`
          : "-";

      return {
        id: w.id,
        date: dateStr,
        amount: w.amount,
        method: w.bankName || "Bank BCA",
        accountNumber: w.accountNumber || "1234 5678 9012",
        accountHolder: w.accountName || w.user?.name || "Musisi",
        status: statusUi,
        userId: w.userId,
        user: {
          id: w.user?.id || w.userId,
          name: w.user?.name || "Musisi",
          email: w.user?.email || "",
          avatar: resolveMediaUrl(w.user?.image) || "/logo.png",
        },
      };
    });

    // Map catalogs
    const catalogs = rawCatalogSongs.map((c: any) => ({
      id: c.id,
      songId: c.songId || `CAT-${c.id.slice(0, 6).toUpperCase()}`,
      title: c.title || "Untitled Track",
      artist: c.artist || "Unknown Artist",
      publisher: c.publisher || "BREAKOUT Publishing",
      status: c.status || "Aktif",
      youtubeLink: c.youtubeLink || "",
      driveLink: c.driveLink || "",
      youtubeUrl: c.youtubeLink || "",
      driveUrl: c.driveLink || "",
    }));

    return NextResponse.json(
      { version: "2026-11-07-21-20", users, releases, withdrawals, catalogs },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error: any) {
    console.error("Admin overview error:", error);
    return NextResponse.json(
      { 
        error: "Failed to load admin data",
        message: error?.message || String(error),
        code: error?.code,
        meta: error?.meta,
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { userId, role } = body;

    if (userId && role) {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { role },
      });
      return NextResponse.json({ user: updated });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin PATCH user error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

