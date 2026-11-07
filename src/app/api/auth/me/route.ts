import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { resolveMediaUrl } from "@/lib/r2";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function DELETE() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const res = NextResponse.json({ ok: true, message: "Logged out successfully" });

  const authCookiePrefixes = [
    "authjs",
    "next-auth",
    "session",
    "token",
    "__Secure-authjs",
    "__Host-authjs",
    "__Secure-next-auth"
  ];

  for (const c of allCookies) {
    const isAuth = authCookiePrefixes.some((p) =>
      c.name.toLowerCase().includes(p.toLowerCase())
    );
    if (isAuth) {
      res.cookies.set(c.name, "", {
        path: "/",
        maxAge: 0,
        expires: new Date(0),
      });
      res.cookies.delete(c.name);
    }
  }

  return res;
}

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ user: null, authenticated: false });
    }

    const [u, rawReleases, dbArtists]: [any, any[], any[]] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        include: {
          withdrawRequests: {
            orderBy: { createdAt: "desc" },
          },
        },
      }),
      prisma.$queryRawUnsafe(
        `SELECT * FROM "Release" WHERE "userId" = $1 ORDER BY "createdAt" DESC`,
        userId
      ).catch(() => []),
      prisma.$queryRawUnsafe(
        `SELECT * FROM "Artist" WHERE "userId" = $1 ORDER BY "createdAt" DESC`,
        userId
      ).catch(() => []),
    ]);

    if (!u) {
      return NextResponse.json({ user: null, authenticated: false });
    }

    const allReleases: any[] = [];
    const primaryArtist = (dbArtists && dbArtists[0]) || null;

    (rawReleases || []).forEach((r: any) => {
      let releaseDateStr = "-";
      if (r.releaseDate) {
        if (typeof r.releaseDate === "string") releaseDateStr = r.releaseDate;
        else if (r.releaseDate instanceof Date && !isNaN(r.releaseDate.getTime())) {
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

      allReleases.push({
        id: r.id,
        title: r.title,
        artist: r.artist || primaryArtist?.stageName || "Artist",
        genre: r.genre || "Pop",
        releaseDate: releaseDateStr,
        duration: r.duration || "3:42",
        streams: r.streams || "0",
        streamsNum: r.streamsNum || 0,
        platform: r.platform || r.platforms || "Spotify, Apple Music",
        platforms: r.platforms || r.platform || "Spotify, Apple Music",
        status: statusUi,
        coverUrl: resolveMediaUrl(r.coverUrl || r.coverArtworkUrl) || "/logo.png",
        audioFile: resolveMediaUrl(r.audioFile || r.audioUrl) || "",
        upc: r.upc || "899214578101",
        isrc: r.isrc || "D-HRM-24-00109",
      });
    });

    const totalWithdrawn =
      typeof u.totalWithdrawn === "number"
        ? u.totalWithdrawn
        : (u.withdrawRequests || [])
            .filter((w: any) => w.status === "APPROVED" || w.status === "PAID")
            .reduce((sum: number, w: any) => sum + (w.amount || 0), 0);

    const pendingWithdraw =
      typeof u.pendingWithdraw === "number"
        ? u.pendingWithdraw
        : (u.withdrawRequests || [])
            .filter((w: any) => w.status === "PENDING")
            .reduce((sum: number, w: any) => sum + (w.amount || 0), 0);

    const royaltyBalance = typeof u.royaltyBalance === "number" ? u.royaltyBalance : 0;
    const royaltyPending = typeof u.royaltyPending === "number" ? u.royaltyPending : pendingWithdraw;
    const totalStreams = typeof u.totalStreams === "number" ? u.totalStreams : 15400;

    const withdrawals = (u.withdrawRequests || []).map((w: any) => {
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
        accountHolder: w.accountName || u.name || "Musisi",
        status: statusUi,
      };
    });

    const mappedUser = {
      id: u.id,
      name: u.name || primaryArtist?.stageName || "User Musisi",
      email: u.email,
      role: u.role,
      avatar: resolveMediaUrl(u.image || u.avatar) || "/logo.png",
      totalStreams,
      royaltyBalance,
      royaltyPending,
      totalWithdrawn,
      pendingWithdraw,
      royaltyMonth: u.royaltyMonth || "November",
      releases: allReleases,
      withdrawals,
      artists: (dbArtists || []).map((a: any) => ({
        id: a.id,
        name: a.stageName || a.name || u.name,
        stageName: a.stageName || a.name || u.name,
        genre: a.genre || "Pop",
        spotifyId: a.spotifyId || "",
        appleId: a.appleId || "",
        bio: a.bio || "",
        avatarUrl: resolveMediaUrl(a.avatarUrl || a.photoUrl),
        photoUrl: resolveMediaUrl(a.avatarUrl || a.photoUrl),
      })),
    };

    return NextResponse.json(
      { user: mappedUser, authenticated: true },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error: any) {
    console.error("GET /api/auth/me error:", error);
    return NextResponse.json({ user: null, authenticated: false }, { status: 500 });
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
    const { name, email, avatar, password } = body;

    const updateData: any = {};
    if (typeof name === "string" && name.trim()) {
      updateData.name = name.trim();
    }
    if (typeof email === "string" && email.trim()) {
      updateData.email = email.trim().toLowerCase();
    }
    if (typeof avatar === "string") {
      updateData.image = avatar.trim();
    }
    if (typeof password === "string" && password.trim().length >= 6) {
      updateData.password = await bcrypt.hash(password.trim(), 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      },
    });

    if (updateData.image) {
      await prisma.$executeRawUnsafe(
        `UPDATE "User" SET "avatar" = $1 WHERE "id" = $2`,
        updateData.image,
        userId
      ).catch(() => {});

      await prisma.$executeRawUnsafe(
        `UPDATE "Artist" SET "photoUrl" = $1 WHERE "userId" = $2`,
        updateData.image,
        userId
      ).catch(() => {});
    }

    if (updateData.name) {
      await prisma.$executeRawUnsafe(
        `UPDATE "Artist" SET "name" = $1 WHERE "userId" = $2`,
        updateData.name,
        userId
      ).catch(() => {});

      await prisma.$executeRawUnsafe(
        `UPDATE "Release" SET "artist" = $1 WHERE "userId" = $2`,
        updateData.name,
        userId
      ).catch(() => {});
    }

    return NextResponse.json({
      ok: true,
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: resolveMediaUrl(updatedUser.image) || "/logo.png",
      },
    });
  } catch (error: any) {
    console.error("PATCH /api/auth/me error:", error);
    return NextResponse.json({ error: error.message || "Failed to update profile" }, { status: 500 });
  }
}
