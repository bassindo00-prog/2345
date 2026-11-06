import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveMediaUrl } from "@/lib/r2";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [rawUsers, rawReleases, rawWithdrawals, rawCatalogSongs] =
      await Promise.all([
        prisma.user.findMany({
          orderBy: { createdAt: "desc" },
          include: {
            artists: {
              include: {
                royalties: true,
                royaltyPerSongs: true,
                releases: true,
              },
            },
            withdrawRequests: true,
          },
        }),
        prisma.release.findMany({
          orderBy: { createdAt: "desc" },
          include: {
            artist: { include: { user: true } },
            tracks: true,
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

    // Map users to the structure expected by the frontend
    const users = rawUsers.map((u) => {
      // Aggregate revenue & streams across all user's artists
      let totalRev = 0;
      let totalStreams = 0;

      u.artists.forEach((art) => {
        art.royalties.forEach((roy) => {
          totalRev += roy.totalRevenue || 0;
          totalStreams +=
            (roy.spotifyStreams || 0) +
            (roy.appleMusicStreams || 0) +
            (roy.youtubeStreams || 0) +
            (roy.tiktokStreams || 0) +
            (roy.amazonStreams || 0) +
            (roy.otherStreams || 0);
        });
        art.royaltyPerSongs.forEach((rps) => {
          totalRev += rps.revenue || 0;
        });
      });

      // Calculate total approved withdrawals and pending withdrawals
      const totalWithdrawn = u.withdrawRequests
        .filter((w) => w.status === "APPROVED" || w.status === "PAID")
        .reduce((sum, w) => sum + (w.amount || 0), 0);

      const pendingWithdraw = u.withdrawRequests
        .filter((w) => w.status === "PENDING")
        .reduce((sum, w) => sum + (w.amount || 0), 0);

      const royaltyBalance = Math.max(0, totalRev - totalWithdrawn - pendingWithdraw);

      const primaryArtist = u.artists[0];

      return {
        id: u.id,
        name: u.name || primaryArtist?.stageName || "User Musisi",
        email: u.email,
        role: u.role,
        status: u.status || "APPROVED",
        rejectionReason: u.rejectionReason || "",
        whatsapp: u.whatsapp || "",
        youtubeUrl: u.youtubeUrl || "",
        nik: u.nik || "",
        ktpUrl: resolveMediaUrl(u.ktpUrl) || "",
        createdAt: u.createdAt,
        avatar: resolveMediaUrl(u.image) || "/logo.png",
        totalStreams: totalStreams || 15400,
        royaltyBalance,
        royaltyPending: pendingWithdraw,
        totalWithdrawn,
        pendingWithdraw,
        royaltyMonth: "November",
        artists: u.artists.map((a) => ({
          id: a.id,
          name: a.stageName,
          stageName: a.stageName,
          bio: a.bio,
          avatarUrl: resolveMediaUrl(a.avatarUrl),
          avatar: resolveMediaUrl(a.avatarUrl),
        })),
        _count: {
          releases: u.artists.reduce((acc, a) => acc + (a.releases?.length || 0), 0),
          withdrawals: u.withdrawRequests.length,
          artists: u.artists.length,
        },
      };
    });

    // Map releases
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
        type: r.type || "SINGLE",
        artist: r.artist?.stageName || r.primaryArtist || "Artist",
        genre: r.genre || "Pop",
        releaseDate: releaseDateStr,
        duration: "3:42",
        streams: "12.5K",
        streamsNum: 12500,
        platform: "Spotify, Apple Music",
        platforms: "Spotify, Apple Music",
        status: statusUi,
        composer: firstTrack?.composer || "-",
        producer: firstTrack?.producer || "-",
        publisher: r.distributor || "-",
        distributor: r.distributor || "-",
        featuring: firstTrack?.featuredArtist || r.featuredArtist || "Tidak ada (Solo)",
        tiktokClip: firstTrack?.tiktokClipStart || "-",
        coverUrl: resolveMediaUrl(r.coverArtworkUrl) || "/logo.png",
        audioFile: firstTrack ? resolveMediaUrl(firstTrack.audioUrl) : "",
        upc: r.upc || firstTrack?.upc || "899214578101",
        isrc: firstTrack?.isrc || "D-HRM-24-00109",
        tracks: (r.tracks || []).map((t, idx) => ({
          id: t.id,
          trackNumber: idx + 1,
          title: t.title,
          audioUrl: resolveMediaUrl(t.audioUrl),
          audioFile: resolveMediaUrl(t.audioUrl),
          composer: t.composer || "-",
          producer: t.producer || "-",
          featuring: t.featuredArtist || "-",
          tiktokClip: t.tiktokClipStart || "-",
          isrc: t.isrc || "-",
          upc: t.upc || r.upc || "-",
        })),
        userId: r.artist?.userId || r.artistId,
        user: {
          id: r.artist?.userId || r.artistId,
          name: r.artist?.user?.name || r.primaryArtist || "Artist",
          email: r.artist?.user?.email || "",
          avatar: resolveMediaUrl(r.artist?.user?.image) || "/logo.png",
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
          id: w.user.id,
          name: w.user.name || "Musisi",
          email: w.user.email,
          avatar: resolveMediaUrl(w.user.image) || "/logo.png",
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

    return NextResponse.json({ users, releases, withdrawals, catalogs });
  } catch (error) {
    console.error("Admin overview error:", error);
    return NextResponse.json(
      { error: "Failed to load admin data" },
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

