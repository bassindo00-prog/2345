import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function isMaintenanceActive(): Promise<boolean> {
  try {
    const activeSetting = await prisma.settings.findUnique({
      where: { key: "maintenance_active" },
    });

    const isExplicitlyActive = activeSetting?.value === "true";

    const endSetting = await prisma.settings.findUnique({
      where: { key: "maintenance_end" },
    });

    const now = new Date();

    // Jika admin mengatur batas waktu selesai dan waktu tersebut sudah lewat, maintenance otomatis berakhir
    if (endSetting?.value) {
      const endTime = new Date(endSetting.value);
      if (!isNaN(endTime.getTime()) && now >= endTime) {
        return false;
      }
    }

    // Jika admin secara manual mengaktifkan maintenance (switch aktif), maka LANGSUNG AKTIF tanpa terhalang waktu mulai
    if (isExplicitlyActive) {
      return true;
    }

    // Jika tidak aktif manual, cek apakah ada jadwal mulai otomatis yang waktunya sudah tiba
    const startSetting = await prisma.settings.findUnique({
      where: { key: "maintenance_start" },
    });

    if (startSetting?.value) {
      const startTime = new Date(startSetting.value);
      if (!isNaN(startTime.getTime()) && now >= startTime) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error("Error checking maintenance status:", error);
    return false;
  }
}

export async function getMaintenanceData() {
  try {
    const keys = [
      "maintenance_active",
      "maintenance_title",
      "maintenance_message",
      "maintenance_start",
      "maintenance_end",
      "maintenance_type",
      "maintenance_bg_type",
      "maintenance_bg_video",
      "maintenance_logo_url"
    ];

    const settings = await prisma.settings.findMany({
      where: { key: { in: keys } }
    });

    const data: Record<string, string> = {
      maintenance_active: "false",
      maintenance_title: "Mohon Maaf",
      maintenance_message: "Dashboard sedang tidak dapat diakses.",
      maintenance_start: "",
      maintenance_end: "",
      maintenance_type: "system",
      maintenance_bg_type: "gradient",
      maintenance_bg_video: "",
      maintenance_logo_url: ""
    };

    settings.forEach((s) => {
      data[s.key] = s.value;
    });

    return data;
  } catch (error) {
    console.error("Error getting maintenance data:", error);
    return {
      maintenance_active: "false",
      maintenance_title: "Mohon Maaf",
      maintenance_message: "Dashboard sedang tidak dapat diakses.",
      maintenance_start: "",
      maintenance_end: "",
      maintenance_type: "system",
      maintenance_bg_type: "gradient",
      maintenance_bg_video: "",
      maintenance_logo_url: ""
    };
  }
}
