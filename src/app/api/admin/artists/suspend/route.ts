import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    const email = session?.user?.email;
    if (role !== "ADMIN" && email !== "admin@breakoutmusic.online" && email !== "avelinfx@gmail.com") {
      return NextResponse.json({ error: "Unauthorized: Hanya admin yang dapat mengubah status akun" }, { status: 401 });
    }

    const body = await req.json();
    const { userId, suspend, reason } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId wajib disertakan" }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, status: true, role: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    if (targetUser.role === "ADMIN") {
      return NextResponse.json({ error: "Akun Admin tidak dapat disuspend" }, { status: 400 });
    }

    const nextStatus = suspend ? "SUSPENDED" : "APPROVED";

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        status: nextStatus,
        ...(suspend && reason ? { rejectionReason: reason } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
      },
    });

    try {
      revalidatePath("/admin");
      revalidatePath("/admin/artists");
      revalidatePath("/admin/all-artists");
      revalidatePath("/dashboard");
    } catch (_) {}

    return NextResponse.json({
      success: true,
      status: nextStatus,
      user: updatedUser,
      message: suspend
        ? `Akun musisi ${targetUser.name || targetUser.email} BERHASIL DI-SUSPEND. Akses dashboard artis telah dinonaktifkan.`
        : `Akun musisi ${targetUser.name || targetUser.email} BERHASIL DIAKTIFKAN KEMBALI.`,
    });
  } catch (error: any) {
    console.error("POST /api/admin/artists/suspend error:", error);
    return NextResponse.json({ error: error.message || "Gagal mengubah status akun artis" }, { status: 500 });
  }
}

