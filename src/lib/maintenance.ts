import { prisma } from "@/lib/prisma";

export async function isMaintenanceActive(): Promise<boolean> {
  try {
    const activeSetting = await prisma.settings.findUnique({
      where: { key: "maintenance_active" },
    });

    // Saklar master: Jika admin mematikan maintenance (bukan "true"), maka LANGSUNG NONAKTIF (false)
    if (!activeSetting || activeSetting.value !== "true") {
      return false;
    }

    // Jika switch aktif ("true"), periksa apakah ada batas waktu selesai yang sudah terlewat
    const endSetting = await prisma.settings.findUnique({
      where: { key: "maintenance_end" },
    });

    if (endSetting?.value) {
      const endTime = new Date(endSetting.value);
      const now = new Date();
      if (!isNaN(endTime.getTime()) && now >= endTime) {
        return false;
      }
    }

    return true;
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
