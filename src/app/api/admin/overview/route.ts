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

    // Query users via raw SQL agar kolom royaltyBalance, totalStreams, dll. selalu terambil utuh
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

      const userWithdraws = (rawWithdrawals || []).filter((w: any) => w.userId === u.id);

      const totalWithdrawnFromRequests = (userWithdraws || [])
        .filter((w: any) => w.status === "APPROVED" || w.status === "PAID")
        .reduce((sum: number, w: any) => sum + (w.amount || 0), 0);

      const pendingWithdrawFromRequests = (userWithdraws || [])
        .filter((w: any) => w.status === "PENDING")
        .reduce((sum: number, w: any) => sum + (w.amount || 0), 0);

      const royaltyBalance =
        typeof u.royaltyBalance === "number"
          ? u.royaltyBalance
          : Number(u.royaltyBalance || 0);

      const totalStreams =
        typeof u.totalStreams === "number"
          ? u.totalStreams
          : Number(u.totalStreams || 0);

      const royaltyPending =
        typeof u.royaltyPending === "number"
          ? u.royaltyPending
          : pendingWithdrawFromRequests;

      const totalWithdrawn =
        typeof u.totalWithdrawn === "number" && u.totalWithdrawn > 0
          ? u.totalWithdrawn
          : totalWithdrawnFromRequests;

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
        royaltyPending,
        totalWithdrawn,
        pendingWithdraw: pendingWithdrawFromRequests,
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
          withdrawals: userWithdraws.length,
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

      return {
        id: r.id,
        title: r.title,
        artist: r.artist || "Unknown",
        type: r.type,
        genre: r.genre || "Pop",
        status: r.status,
        upc: r.upc,
        rejectionReason: r.rejectionReason || "",
        coverUrl: resolveMediaUrl(r.coverUrl),
        releaseDate: releaseDateStr,
        createdAt: r.createdAt,
        userId: r.userId,
        spotifyUrl: r.spotifyUrl || "",
        appleMusicUrl: r.appleMusicUrl || "",
        youtubeMusicUrl: r.youtubeMusicUrl || "",
        tracks: (r.tracks || []).map((t: any) => ({
          id: t.id,
          title: t.title,
          isrc: t.isrc,
          audioUrl: resolveMediaUrl(t.audioUrl),
        })),
        user: {
          id: r.userId,
          name: r.artist || "Musisi",
          email: "",
          avatar: "/logo.png",
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
      { version: "2026-11-07-21-40", users, releases, withdrawals, catalogs },
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
      // Direct raw update to ensure all numerical columns are saved to PostgreSQL
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
