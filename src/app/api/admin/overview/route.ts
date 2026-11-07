import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveMediaUrl } from "@/lib/r2";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    // 1. Query dbArtists
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

    // 2. Query rawUsers
    let rawUsers: any[] = [];
    try {
      rawUsers = (await prisma.$queryRawUnsafe(
        `SELECT * FROM "User" ORDER BY "createdAt" DESC`
      )) as any[];
    } catch {
      rawUsers = (await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
      })) as any[];
    }

    // 3. Query withdrawals and catalogs
    const [rawWithdrawals, rawCatalogSongs] = await Promise.all([
      prisma.withdrawRequest.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
        },
      }).catch(() => []),
      prisma.catalog.findMany({
        orderBy: { createdAt: "desc" },
        take: 3000,
      }).catch(() => []),
    ]);

    // 4. Query releases (support both raw SQL and Prisma findMany with artist include)
    let rawReleases: any[] = [];
    try {
      rawReleases = (await prisma.$queryRawUnsafe(
        `SELECT * FROM "Release" ORDER BY "createdAt" DESC`
      )) as any[];
    } catch (eRawRel) {
      try {
        rawReleases = (await prisma.release.findMany({
          orderBy: { createdAt: "desc" },
          include: {
            artist: true,
          },
        })) as any[];
      } catch (eRel) {
        try {
          rawReleases = await prisma.release.findMany({
            orderBy: { createdAt: "desc" },
          });
        } catch (eRel2) {
          console.error("Failed to query Release:", eRel2);
        }
      }
    }

    // Map releases with full fallback to artistId -> Artist -> userId
    const releases = rawReleases.map((r: any) => {
      const artId = r.artistId || r.artistid || (r.artist && typeof r.artist === "object" ? r.artist.id : "");
      const artistRecord =
        (dbArtists || []).find((a: any) => a.id === artId) ||
        (r.artist && typeof r.artist === "object" ? r.artist : null);

      const relUserId =
        r.userId ||
        r.userid ||
        r.user_id ||
        artistRecord?.userId ||
        artistRecord?.userid ||
        artistRecord?.user_id ||
        "";

      const relArtist =
        (typeof r.artist === "string" && r.artist.trim() && r.artist !== "Unknown" ? r.artist : null) ||
        r.primaryArtist ||
        r.primaryartist ||
        artistRecord?.stageName ||
        artistRecord?.stagename ||
        artistRecord?.name ||
        "Musisi";

      let releaseDateStr = "-";
      const rDate = r.releaseDate || r.releasedate;
      if (rDate) {
        if (typeof rDate === "string") {
          releaseDateStr = rDate;
        } else if (rDate instanceof Date && !isNaN(rDate.getTime())) {
          releaseDateStr = rDate.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });
        }
      }

      const cover = r.coverUrl || r.coverurl || r.coverArtworkUrl || r.coverartworkurl || "";

      return {
        id: r.id,
        title: r.title || "Untitled",
        artist: relArtist,
        type: r.type || "SINGLE",
        genre: r.genre || "Pop",
        status: r.status || "PENDING",
        upc: r.upc || "",
        rejectionReason: r.rejectionReason || r.rejectionreason || "",
        coverUrl: resolveMediaUrl(cover),
        releaseDate: releaseDateStr,
        createdAt: r.createdAt,
        userId: relUserId,
        artistId: artId,
        spotifyUrl: r.spotifyUrl || r.spotifyurl || "",
        appleMusicUrl: r.appleMusicUrl || r.applemusicurl || "",
        youtubeMusicUrl: r.youtubeMusicUrl || r.youtubemusicurl || "",
        tracks: (r.tracks || []).map((t: any) => ({
          id: t.id,
          title: t.title,
          isrc: t.isrc,
          audioUrl: resolveMediaUrl(t.audioUrl || t.audiourl),
        })),
        user: {
          id: relUserId,
          name: relArtist,
          email: "",
          avatar: "/logo.png",
        },
      };
    });

    // Map users to the structure expected by the frontend
    const users = rawUsers.map((u: any) => {
      const uId = u.id || u.ID || "";
      const userArtists = (dbArtists || []).filter(
        (a: any) => (a.userId || a.userid || a.user_id) === uId
      );
      const userArtistIds = new Set(userArtists.map((a: any) => a.id));

      const primaryArtist = userArtists[0] || null;
      const artistSpotify =
        userArtists.find((a: any) => a.spotifyId && a.spotifyId.trim())?.spotifyId ||
        primaryArtist?.spotifyId ||
        "";
      const artistApple =
        userArtists.find((a: any) => a.appleId && a.appleId.trim())?.appleId ||
        primaryArtist?.appleId ||
        "";

      const userWithdraws = (rawWithdrawals || []).filter(
        (w: any) => (w.userId || w.userid) === uId
      );

      const totalWithdrawnFromRequests = (userWithdraws || [])
        .filter((w: any) => w.status === "APPROVED" || w.status === "PAID")
        .reduce((sum: number, w: any) => sum + (Number(w.amount) || 0), 0);

      const pendingWithdrawFromRequests = (userWithdraws || [])
        .filter((w: any) => w.status === "PENDING")
        .reduce((sum: number, w: any) => sum + (Number(w.amount) || 0), 0);

      const rawBal = u.royaltyBalance ?? u.royaltybalance ?? 0;
      const rawStreams = u.totalStreams ?? u.totalstreams ?? 0;
      const rawPend = u.royaltyPending ?? u.royaltypending;
      const rawWithdrawn = u.totalWithdrawn ?? u.totalwithdrawn;

      const royaltyBalance = Number(rawBal || 0);
      const totalStreams = Number(rawStreams || 0);
      const royaltyPending = rawPend !== undefined && rawPend !== null ? Number(rawPend) : pendingWithdrawFromRequests;
      const totalWithdrawn = rawWithdrawn !== undefined && Number(rawWithdrawn) > 0 ? Number(rawWithdrawn) : totalWithdrawnFromRequests;

      const displayName = primaryArtist?.stageName || primaryArtist?.name || u.name || "User Musisi";

      // Match releases either by direct userId OR by artistId matching one of the user's artists
      const userReleases = releases.filter(
        (r: any) => r.userId === uId || (r.artistId && userArtistIds.has(r.artistId))
      );

      return {
        id: uId,
        name: displayName,
        email: u.email || "",
        role: u.role || "USER",
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
        royaltyPending,
        totalWithdrawn,
        pendingWithdraw: pendingWithdrawFromRequests,
        royaltyMonth: u.royaltyMonth || u.royaltymonth || "November",
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
          releases: userReleases.length,
          withdrawals: userWithdraws.length,
          artists: userArtists.length,
        },
      };
    });

    // Map withdrawals
    const withdrawals = (rawWithdrawals || []).map((w: any) => {
      let statusUi: "Pending" | "Disetujui" | "Ditolak" = "Pending";
      if (w.status === "APPROVED" || w.status === "PAID") statusUi = "Disetujui";
      else if (w.status === "REJECTED") statusUi = "Ditolak";

      const dateStr =
        w.createdAt instanceof Date
          ? `${String(w.createdAt.getDate()).padStart(2, "0")}-${String(
              w.createdAt.getMonth() + 1
            ).padStart(2, "0")}-${w.createdAt.getFullYear()}`
          : "-";

      return {
        id: w.id,
        date: dateStr,
        amount: Number(w.amount || 0),
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
      {
        version: "2026-11-07-21-55-universal",
        debugRawReleaseKeys: rawReleases[0] ? Object.keys(rawReleases[0]) : [],
        debugSampleRelease: rawReleases[0] ? {
          id: rawReleases[0].id,
          title: rawReleases[0].title,
          artistId: rawReleases[0].artistId,
          primaryArtist: rawReleases[0].primaryArtist,
          userId: rawReleases[0].userId,
        } : null,
        users,
        releases,
        withdrawals,
        catalogs,
      },
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
    const { userId, role, royaltyBalance, royaltyPending, totalStreams, royaltyMonth } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    if (role) {
      await prisma.$executeRawUnsafe(
        `UPDATE "User" SET "role" = $1 WHERE "id" = $2`,
        role,
        userId
      );
    }

    if (
      royaltyBalance !== undefined ||
      royaltyPending !== undefined ||
      totalStreams !== undefined ||
      royaltyMonth !== undefined
    ) {
      await prisma.$executeRawUnsafe(
        `UPDATE "User" SET 
          "royaltyBalance" = CASE WHEN $1::float IS NOT NULL THEN $1::float ELSE "royaltyBalance" END,
          "royaltyPending" = CASE WHEN $2::float IS NOT NULL THEN $2::float ELSE "royaltyPending" END,
          "totalStreams" = CASE WHEN $3::int IS NOT NULL THEN $3::int ELSE "totalStreams" END,
          "royaltyMonth" = CASE WHEN $4::text IS NOT NULL THEN $4::text ELSE "royaltyMonth" END,
          "updatedAt" = NOW()
         WHERE "id" = $5`,
        royaltyBalance !== undefined ? Number(royaltyBalance) : null,
        royaltyPending !== undefined ? Number(royaltyPending) : null,
        totalStreams !== undefined ? Math.round(Number(totalStreams)) : null,
        royaltyMonth !== undefined ? String(royaltyMonth) : null,
        userId
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Admin PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update user", message: error?.message || String(error) },
      { status: 500 }
    );
  }
}
