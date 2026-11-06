import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { resolveMediaUrl } from "@/lib/r2";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

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

    const u = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        artists: {
          include: {
            royalties: true,
            royaltyPerSongs: true,
            releases: {
              include: { tracks: true },
              orderBy: { createdAt: "desc" },
            },
          },
        },
        withdrawRequests: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!u) {
      return NextResponse.json({ user: null, authenticated: false });
    }

    let totalRev = 0;
    let totalStreams = 0;
    const allReleases: any[] = [];

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

      art.releases.forEach((r) => {
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

        allReleases.push({
          id: r.id,
          title: r.title,
          artist: art.stageName || r.primaryArtist,
          genre: r.genre || "Pop",
          releaseDate: releaseDateStr,
          duration: "3:42",
          streams: "14.2K",
          streamsNum: 14200,
          platform: "Spotify, Apple Music",
          platforms: "Spotify, Apple Music",
          status: statusUi,
          coverUrl: resolveMediaUrl(r.coverArtworkUrl) || "/logo.png",
          audioFile: firstTrack ? resolveMediaUrl(firstTrack.audioUrl) : "",
          upc: r.upc || firstTrack?.upc || "899214578101",
          isrc: firstTrack?.isrc || "D-HRM-24-00109",
        });
      });
    });

    const totalWithdrawn = u.withdrawRequests
      .filter((w) => w.status === "APPROVED" || w.status === "PAID")
      .reduce((sum, w) => sum + (w.amount || 0), 0);

    const pendingWithdraw = u.withdrawRequests
      .filter((w) => w.status === "PENDING")
      .reduce((sum, w) => sum + (w.amount || 0), 0);

    const royaltyBalance = Math.max(0, totalRev - totalWithdrawn - pendingWithdraw);

    const withdrawals = u.withdrawRequests.map((w) => {
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

    const primaryArtist = u.artists[0];

    const mappedUser = {
      id: u.id,
      name: u.name || primaryArtist?.stageName || "User Musisi",
      email: u.email,
      role: u.role,
      avatar: resolveMediaUrl(u.image) || "/logo.png",
      totalStreams: totalStreams || 15400,
      royaltyBalance,
      royaltyPending: pendingWithdraw,
      totalWithdrawn,
      pendingWithdraw,
      royaltyMonth: "November",
      releases: allReleases,
      withdrawals,
      artists: u.artists.map((a) => ({
        id: a.id,
        name: a.stageName,
        stageName: a.stageName,
        bio: a.bio,
        avatarUrl: resolveMediaUrl(a.avatarUrl),
      })),
    };

    return NextResponse.json({ user: mappedUser, authenticated: true });
  } catch (error) {
    console.error("Auth me error:", error);
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
      await prisma.artist.updateMany({
        where: { userId },
        data: { avatarUrl: updateData.image },
      }).catch(() => {});
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
