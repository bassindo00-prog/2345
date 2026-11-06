import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { updateArtistStatusAction, deleteUserAction } from "@/app/actions/admin";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    const email = session?.user?.email;
    if (role !== "ADMIN" && email !== "admin@breakoutmusic.online" && email !== "avelinfx@gmail.com") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      where: { role: "USER" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        rejectionReason: true,
        whatsapp: true,
        youtubeUrl: true,
        nik: true,
        ktpUrl: true,
        image: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    console.error("GET /api/admin/registrations error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    const email = session?.user?.email;
    if (role !== "ADMIN" && email !== "admin@breakoutmusic.online" && email !== "avelinfx@gmail.com") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { userId, status, reason = "" } = body;

    if (!userId || !status) {
      return NextResponse.json({ error: "userId and status are required" }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Call update action to handle email & notifications
    const res = await updateArtistStatusAction(
      userId,
      status as any,
      targetUser.name || "Artis",
      targetUser.email,
      reason
    );

    if (res.error) {
      // Fallback: direct update in prisma
      await prisma.user.update({
        where: { id: userId },
        data: {
          status,
          ...(status === "REJECTED" ? { rejectionReason: reason } : {}),
        },
      });
    }

    try {
      revalidatePath("/admin");
      revalidatePath("/admin/registrations");
      revalidatePath("/admin/artists");
      revalidatePath("/dashboard");
    } catch {}

    return NextResponse.json({
      success: true,
      message:
        status === "APPROVED"
          ? `Akun ${targetUser.name || targetUser.email} BERHASIL DISETUJUI (ACC)! Musisi kini dapat login dan mengakses dashboard.`
          : status === "REJECTED"
          ? `Pendaftaran ${targetUser.name || targetUser.email} DITOLAK.`
          : `Status akun diubah menjadi ${status}.`,
    });
  } catch (error: any) {
    console.error("PATCH /api/admin/registrations error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    const email = session?.user?.email;
    if (role !== "ADMIN" && email !== "admin@breakoutmusic.online" && email !== "avelinfx@gmail.com") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing user id" }, { status: 400 });
    }

    await deleteUserAction(id);

    try {
      revalidatePath("/admin");
      revalidatePath("/admin/registrations");
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Pendaftaran artis berhasil dihapus permanen.",
    });
  } catch (error: any) {
    console.error("DELETE /api/admin/registrations error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

