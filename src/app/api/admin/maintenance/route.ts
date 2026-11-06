import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";
import { getMaintenanceData } from "@/lib/maintenance";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    // Allow admin access
    const role = (session?.user as any)?.role;
    const email = session?.user?.email;
    if (role !== "ADMIN" && email !== "admin@breakoutmusic.online" && email !== "avelinfx@gmail.com") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await getMaintenanceData();
    const brandSetting = await prisma.settings.findUnique({
      where: { key: "brand_logo" }
    });
    const brandLogo = brandSetting?.value || "/logo.png";

    return NextResponse.json({
      success: true,
      data,
      brandLogo
    });
  } catch (error: any) {
    console.error("GET /api/admin/maintenance error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch maintenance data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    const email = session?.user?.email;
    if (role !== "ADMIN" && email !== "admin@breakoutmusic.online" && email !== "avelinfx@gmail.com") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const active = body.active === true || body.active === "true" ? "true" : "false";
    const title = body.title !== undefined ? String(body.title) : "Mohon Maaf";
    const message = body.message !== undefined ? String(body.message) : "Maaf, hari ini operasional BREAKOUT.ID sedang libur. Silakan kembali lagi sesuai jadwal yang telah ditentukan.";
    const start = body.start !== undefined ? String(body.start) : "";
    const end = body.end !== undefined ? String(body.end) : "";
    const type = body.type !== undefined ? String(body.type) : "system";
    const bgType = body.bg_type !== undefined ? String(body.bg_type) : "gradient";
    const bgVideo = body.bg_video !== undefined ? String(body.bg_video) : "";

    const settingsData = [
      { key: "maintenance_active", value: active },
      { key: "maintenance_title", value: title },
      { key: "maintenance_message", value: message },
      { key: "maintenance_start", value: start },
      { key: "maintenance_end", value: end },
      { key: "maintenance_type", value: type },
      { key: "maintenance_bg_type", value: bgType },
      { key: "maintenance_bg_video", value: bgVideo }
    ];

    if (body.logo_url !== undefined) {
      settingsData.push({ key: "maintenance_logo_url", value: String(body.logo_url) });
    }

    for (const setting of settingsData) {
      await prisma.settings.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: {
          key: setting.key,
          value: setting.value,
          description: `Maintenance setting: ${setting.key}`
        }
      });
    }

    try {
      revalidatePath("/");
      revalidatePath("/dashboard");
      revalidatePath("/maintenance");
    } catch {}

    const updatedData = await getMaintenanceData();

    return NextResponse.json({
      success: true,
      message: active === "true" 
        ? "Mode Maintenance User BERHASIL DIAKTIFKAN. Musisi akan diarahkan ke halaman pemeliharaan." 
        : "Mode Maintenance User DINONAKTIFKAN. Musisi dapat mengakses dashboard kembali.",
      data: updatedData
    });
  } catch (error: any) {
    console.error("POST /api/admin/maintenance error:", error);
    return NextResponse.json({ error: error.message || "Failed to save maintenance settings" }, { status: 500 });
  }
}

