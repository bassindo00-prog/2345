import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveMediaUrl } from "@/lib/r2";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function ensureRoyaltyColumns() {
  const statements = [
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "royaltyBalance" double precision DEFAULT 0`,
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "royaltyPending" double precision DEFAULT 0`,
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "totalStreams" integer DEFAULT 0`,
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "royaltyMonth" text DEFAULT 'November'`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "royaltyBalance" double precision DEFAULT 0`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "royaltyPending" double precision DEFAULT 0`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "totalStreams" integer DEFAULT 0`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "royaltyMonth" text DEFAULT 'November'`,
  ];
  for (const sql of statements) {
    try {
      await prisma.$executeRawUnsafe(sql);
    } catch {
      // ignore
    }
  }
}

export async function GET() {
  try {
    await ensureRoyaltyColumns();

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
    let rawUserError: string | null = null;
    try {
      rawUsers = (await prisma.$queryRawUnsafe(
        `SELECT * FROM "User" ORDER BY "createdAt" DESC`
      )) as any[];
    } catch (eU1: any) {
      rawUserError = "attempt1: " + (eU1?.message || String(eU1));
      try {
        rawUsers = (await prisma.$queryRawUnsafe(`SELECT * FROM "User"`)) as any[];
      } catch (eU2: any) {
        rawUserError += " | attempt2: " + (eU2?.message || String(eU2));
        try {
          rawUsers = (await prisma.$queryRawUnsafe(`SELECT * FROM "user"`)) as any[];
        } catch (eU3: any) {
          rawUserError += " | attempt3: " + (eU3?.message || String(eU3));
          rawUsers = (await prisma.user.findMany({
            orderBy: { createdAt: "desc" },
          })) as any[];
        }
      }
    }

    // 3. Query withdrawals and catalogs
    let rawWithdrawals: any[] = [];
    try {
      rawWithdrawals = (await prisma.$queryRawUnsafe(
        `SELECT w.*, u.name as "userName", u.email as "userEmail", u.image as "userImage"
         FROM "Withdrawal" w
         LEFT JOIN "User" u ON u.id = w."userId"
         ORDER BY w."createdAt" DESC`
      )) as any[];
    } catch {
      try {
        rawWithdrawals = (await prisma.withdrawRequest.findMany({
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { id: true, name: true, email: true, image: true } },
          },
        })) as any[];
      } catch {
        rawWithdrawals = [];
      }
    }

    const rawCatalogSongs = await prisma.catalog
      .findMany({
        orderBy: { createdAt: "desc" },
        take: 3000,
      })
      .catch(() => []);

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

    // 5. Query tracks and group by releaseId
    let rawTracks: any[] = [];
    try {
      rawTracks = (await prisma.$queryRawUnsafe(
        `SELECT * FROM "Track"`
      )) as any[];
    } catch (eTrk) {
      try {
        rawTracks = (await prisma.track.findMany()) as any[];
      } catch (eTrk2) {
        console.warn("Track query fallback in overview:", eTrk2);
      }
    }

    const tracksByRelease = new Map<string, any[]>();
    for (const t of rawTracks) {
      const rId = t.releaseId || t.releaseid || t.release_id || "";
      if (rId) {
        if (!tracksByRelease.has(rId)) {
          tracksByRelease.set(rId, []);
        }
        tracksByRelease.get(rId)!.push(t);
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

      let statusNorm = "PENDING";
      const rawStatusStr = (r.status || "").toUpperCase();
      if (rawStatusStr === "APPROVED" || rawStatusStr === "RELEASED" || rawStatusStr === "DISETUJUI") {
        statusNorm = "APPROVED";
      } else if (rawStatusStr === "REJECTED" || rawStatusStr === "DITOLAK") {
        statusNorm = "REJECTED";
      } else {
        statusNorm = "PENDING";
      }

      const relTracks = tracksByRelease.get(r.id) || r.tracks || [];
      const firstTrack = relTracks[0] || null;

      const rawAudio =
        firstTrack?.audioUrl ||
        firstTrack?.audiourl ||
        firstTrack?.audioFile ||
        firstTrack?.audiofile ||
        r.audioFile ||
        r.audiofile ||
        r.audioUrl ||
        r.audiourl ||
        "";
      const audioFile = resolveMediaUrl(rawAudio);

      const composer = firstTrack?.composer || r.composer || "-";
      const producer = firstTrack?.producer || r.producer || "-";
      const featuring =
        firstTrack?.featuredArtist ||
        firstTrack?.featuredartist ||
        r.featuring ||
        r.featuredArtist ||
        r.featuredartist ||
        "Tidak ada (Solo)";
      const tiktokClip =
        firstTrack?.tiktokClipStart ||
        firstTrack?.tiktokclipstart ||
        r.tiktokClip ||
        r.tiktokclip ||
        "-";
      const duration = r.duration || "3:42";
      const upc = r.upc || firstTrack?.upc || "899214578101";
      const isrc = firstTrack?.isrc || r.isrc || "ID-HRM-24-00101";

      return {
        id: r.id,
        title: r.title || "Untitled",
        artist: relArtist,
        type: r.type || "SINGLE",
        genre: r.genre || "Pop",
        status: statusNorm,
        upc,
        isrc,
        rejectionReason: r.rejectionReason || r.rejectionreason || "",
        coverUrl: resolveMediaUrl(cover) || "/logo.png",
        audioFile,
        audioUrl: audioFile,
        composer,
        producer,
        publisher: r.distributor || "BREAKOUT Records",
        distributor: r.distributor || "BREAKOUT Records",
        featuring,
        tiktokClip,
        duration,
        releaseDate: releaseDateStr,
        createdAt: r.createdAt,
        userId: relUserId,
        artistId: artId,
        spotifyUrl: r.spotifyUrl || r.spotifyurl || "",
        appleMusicUrl: r.appleMusicUrl || r.applemusicurl || "",
        youtubeMusicUrl: r.youtubeMusicUrl || r.youtubemusicurl || "",
        tracks: relTracks.map((t: any, idx: number) => ({
          id: t.id || `${r.id}-t${idx + 1}`,
          title: t.title || r.title,
          isrc: t.isrc || isrc,
          audioUrl: resolveMediaUrl(t.audioUrl || t.audiourl || rawAudio),
          audioFile: resolveMediaUrl(t.audioUrl || t.audiourl || rawAudio),
          composer: t.composer || composer,
          producer: t.producer || producer,
          featuring: t.featuredArtist || t.featuredartist || null,
        })),
        user: {
          id: relUserId,
          name: relArtist,
          email: "",
          avatar: "/logo.png",
        },
      };
    });

    // Pre-calculate user earnings from Royalty table if present
    const userEarningsMap = new Map<string, { royalty: number; streams: number }>();
    try {
      const royalties = (await prisma.$queryRawUnsafe(`
        SELECT "artistId", SUM("totalRevenue") as "sumRevenue",
               SUM(COALESCE("spotifyStreams", 0) + COALESCE("appleMusicStreams", 0) + COALESCE("youtubeStreams", 0) + COALESCE("tiktokStreams", 0) + COALESCE("amazonStreams", 0) + COALESCE("otherStreams", 0)) as "sumStreams"
        FROM "Royalty"
        GROUP BY "artistId"
      `)) as any[];

      const artistUserMap = new Map<string, string>();
      for (const a of dbArtists) {
        const aId = a.id || a.ID;
        const uId = a.userId || a.userid || a.user_id;
        if (aId && uId) artistUserMap.set(aId, uId);
      }

      for (const r of royalties) {
        const uId = artistUserMap.get(r.artistId);
        if (uId) {
          const cur = userEarningsMap.get(uId) || { royalty: 0, streams: 0 };
          cur.royalty += Number(r.sumRevenue || 0);
          cur.streams += Number(r.sumStreams || 0);
          userEarningsMap.set(uId, cur);
        }
      }
    } catch (eRoyCalc) {
      console.warn("Royalty table aggregation fallback:", eRoyCalc);
    }

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
        .filter((w: any) => {
          const s = String(w.status || "").toUpperCase();
          return s === "APPROVED" || s === "PAID" || s === "DISETUJUI";
        })
        .reduce((sum: number, w: any) => sum + (Number(w.amount) || 0), 0);

      const pendingWithdrawFromRequests = (userWithdraws || [])
        .filter((w: any) => {
          const s = String(w.status || "").toUpperCase();
          return s === "PENDING" || s === "MENUNGGU";
        })
        .reduce((sum: number, w: any) => sum + (Number(w.amount) || 0), 0);

      const earnings = userEarningsMap.get(uId) || { royalty: 0, streams: 0 };
      const rawBal = u.royaltyBalance ?? u.royaltybalance ?? u.royalty_balance ?? u.balance;
      const rawStreams = u.totalStreams ?? u.totalstreams ?? u.total_streams ?? u.streams;
      const rawPend = u.royaltyPending ?? u.royaltypending ?? u.royalty_pending ?? u.pendingWithdraw ?? u.pendingwithdraw;
      const rawWithdrawn = u.totalWithdrawn ?? u.totalwithdrawn ?? u.total_withdrawn;

      let royaltyBalance = 0;
      if (rawBal !== undefined && rawBal !== null && Number(rawBal) > 0) {
        royaltyBalance = Number(rawBal);
      } else if (earnings.royalty > 0) {
        royaltyBalance = Math.max(0, earnings.royalty - totalWithdrawnFromRequests);
      }

      let totalStreams = 0;
      if (rawStreams !== undefined && rawStreams !== null && Number(rawStreams) > 0) {
        totalStreams = Number(rawStreams);
      } else if (earnings.streams > 0) {
        totalStreams = earnings.streams;
      }

      const royaltyPending = rawPend !== undefined && rawPend !== null && Number(rawPend) > 0 ? Number(rawPend) : pendingWithdrawFromRequests;
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
      let statusUi: "Pending" | "Approved" | "Rejected" = "Pending";
      const rawStatus = (w.status || "").toUpperCase();
      if (rawStatus === "APPROVED" || rawStatus === "PAID" || rawStatus === "DISETUJUI") {
        statusUi = "Approved";
      } else if (rawStatus === "REJECTED" || rawStatus === "DITOLAK") {
        statusUi = "Rejected";
      }

      const dateStr =
        w.date && typeof w.date === "string"
          ? w.date
          : w.createdAt instanceof Date
          ? `${String(w.createdAt.getDate()).padStart(2, "0")}-${String(
              w.createdAt.getMonth() + 1
            ).padStart(2, "0")}-${w.createdAt.getFullYear()}`
          : "-";

      return {
        id: w.id,
        date: dateStr,
        amount: Number(w.amount || 0),
        method: w.method || w.bankName || "Bank BCA",
        accountNumber: w.accountNumber || "1234 5678 9012",
        accountHolder: w.accountHolder || w.accountName || w.user?.name || w.userName || "Musisi",
        status: statusUi,
        userId: w.userId,
        user: {
          id: w.user?.id || w.userId,
          name: w.user?.name || w.userName || "Musisi",
          email: w.user?.email || w.userEmail || "",
          avatar: resolveMediaUrl(w.user?.image || w.userImage) || "/logo.png",
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

    let debugDbTables: any[] = [];
    let debugDbRoyaltyCols: any[] = [];
    try {
      debugDbTables = (await prisma.$queryRawUnsafe(`
        SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'
      `)) as any[];
      debugDbRoyaltyCols = (await prisma.$queryRawUnsafe(`
        SELECT table_name, column_name FROM information_schema.columns 
        WHERE table_schema = 'public' AND (column_name ILIKE '%royalty%' OR column_name ILIKE '%balance%' OR column_name ILIKE '%stream%')
      `)) as any[];
    } catch (eDb) {
      console.warn("debug info failed:", eDb);
    }

    let debugUsersTableCols: any[] = [];
    let debugRoyaltyTableCols: any[] = [];
    let debugSampleRoyalty: any = null;
    let debugSampleUsersLower: any = null;
    try {
      debugUsersTableCols = (await prisma.$queryRawUnsafe(`
        SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'
      `)) as any[];
      debugRoyaltyTableCols = (await prisma.$queryRawUnsafe(`
        SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Royalty'
      `)) as any[];
      const rSample = (await prisma.$queryRawUnsafe(`SELECT * FROM "Royalty" LIMIT 1`)) as any[];
      debugSampleRoyalty = rSample[0] || null;
      const uSample = (await prisma.$queryRawUnsafe(`SELECT * FROM users LIMIT 1`)) as any[];
      debugSampleUsersLower = uSample[0] || null;
    } catch (eInspect) {
      console.warn("inspect tables failed:", eInspect);
    }

    return NextResponse.json(
      {
        version: "2026-11-08-01-03-tables",
        debugUsersTableCols: debugUsersTableCols.map((c: any) => c.column_name),
        debugRoyaltyTableCols: debugRoyaltyTableCols.map((c: any) => c.column_name),
        debugSampleRoyalty,
        debugSampleUsersLower,
        debugDbTables: debugDbTables.map((t: any) => t.table_name),
        debugDbRoyaltyCols,
        debugRawUserError: rawUserError,
        debugRawUserKeys: rawUsers[0] ? Object.keys(rawUsers[0]) : [],
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

    // Pastikan kolom-kolom saldo ada di tabel "User" & "users" dengan eksekusi satu per satu
    await ensureRoyaltyColumns();

    if (role) {
      try {
        await prisma.$executeRawUnsafe(
          `UPDATE "User" SET "role" = $1 WHERE "id" = $2`,
          role,
          userId
        );
      } catch {
        await prisma.$executeRawUnsafe(
          `UPDATE "users" SET "role" = $1 WHERE "id" = $2`,
          role,
          userId
        ).catch(() => {});
      }
    }

    if (
      royaltyBalance !== undefined ||
      royaltyPending !== undefined ||
      totalStreams !== undefined ||
      royaltyMonth !== undefined
    ) {
      let updateSuccess = false;
      try {
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
        updateSuccess = true;
      } catch (errUser) {
        console.warn("Update User failed, fallback to users table:", errUser);
        try {
          await prisma.$executeRawUnsafe(
            `UPDATE "users" SET 
              "royaltyBalance" = CASE WHEN $1::float IS NOT NULL THEN $1::float ELSE "royaltyBalance" END,
              "royaltyPending" = CASE WHEN $2::float IS NOT NULL THEN $2::float ELSE "royaltyPending" END,
              "totalStreams" = CASE WHEN $3::int IS NOT NULL THEN $3::int ELSE "totalStreams" END,
              "royaltyMonth" = CASE WHEN $4::text IS NOT NULL THEN $4::text ELSE "royaltyMonth" END,
              "updated_at" = NOW()
             WHERE "id" = $5`,
            royaltyBalance !== undefined ? Number(royaltyBalance) : null,
            royaltyPending !== undefined ? Number(royaltyPending) : null,
            totalStreams !== undefined ? Math.round(Number(totalStreams)) : null,
            royaltyMonth !== undefined ? String(royaltyMonth) : null,
            userId
          );
          updateSuccess = true;
        } catch (errUsersLower) {
          throw errUser;
        }
      }

      // Sinkronkan juga ke tabel "Royalty" jika tabel tersebut ada di database produksi
      try {
        const artists = (await prisma.$queryRawUnsafe(
          `SELECT id FROM "Artist" WHERE "userId" = $1 LIMIT 1`,
          userId
        )) as any[];
        const primaryArtistId = artists[0]?.id;

        if (primaryArtistId && royaltyBalance !== undefined) {
          const monthMap: Record<string, number> = {
            Januari: 1, Februari: 2, Maret: 3, April: 4, Mei: 5, Juni: 6,
            Juli: 7, Agustus: 8, September: 9, Oktober: 10, November: 11, Desember: 12,
            January: 1, February: 2, March: 3, May: 5, June: 6,
            July: 7, August: 8, October: 10, December: 12,
          };
          const curMonthStr = String(royaltyMonth || "November");
          const monthNum = monthMap[curMonthStr] || (!isNaN(Number(curMonthStr)) ? Number(curMonthStr) : 11);
          const curYear = new Date().getFullYear();

          const existing = (await prisma.$queryRawUnsafe(
            `SELECT id FROM "Royalty" WHERE "artistId" = $1 AND ("month"::text = $2 OR "month"::text = $3) LIMIT 1`,
            primaryArtistId,
            String(monthNum),
            curMonthStr
          )) as any[];

          if (existing && existing.length > 0) {
            await prisma.$executeRawUnsafe(
              `UPDATE "Royalty" SET 
                "totalRevenue" = $1,
                "spotifyStreams" = $2,
                "updatedAt" = NOW()
               WHERE "id" = $3`,
              Number(royaltyBalance),
              totalStreams !== undefined ? Math.round(Number(totalStreams)) : 0,
              existing[0].id
            );
          } else {
            const newId = `roy_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            await prisma.$executeRawUnsafe(
              `INSERT INTO "Royalty" ("id", "artistId", "songName", "month", "year", "totalRevenue", "spotifyStreams", "createdAt", "updatedAt")
               VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
              newId,
              primaryArtistId,
              "Royalti Digital Distribution",
              monthNum,
              curYear,
              Number(royaltyBalance),
              totalStreams !== undefined ? Math.round(Number(totalStreams)) : 0
            );
          }
        }
      } catch (eRoySync) {
        // Abaikan jika tabel Royalty tidak ada
      }
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
