import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import { Construction, Calendar, Clock, AlertCircle } from "lucide-react";
import { isMaintenanceActive } from "@/lib/maintenance";
import { MaintenanceClock } from "./MaintenanceClock";
import { Maintenance3DGears } from "./Maintenance3DGears";
import { MaintenanceAutoRedirect } from "./MaintenanceAutoRedirect";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

function getIndonesianType(type: string) {
  switch (type) {
    case "system":
      return "Maintenance Sistem";
    case "operasional":
      return "Libur Operasional";
    case "nasional":
      return "Libur Nasional";
    case "server":
      return "Upgrade Server";
    case "kustom":
      return "Pesan Kustom";
    default:
      return "Pemeliharaan Sistem";
  }
}

function getYouTubeId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : "";
}

export default async function MaintenancePage() {
  const isActive = await isMaintenanceActive();
  if (!isActive) {
    redirect("/dashboard");
  }

  const activeSetting = await prisma.settings.findUnique({ where: { key: "maintenance_active" } });
  const titleSetting = await prisma.settings.findUnique({ where: { key: "maintenance_title" } });
  const messageSetting = await prisma.settings.findUnique({ where: { key: "maintenance_message" } });
  const startSetting = await prisma.settings.findUnique({ where: { key: "maintenance_start" } });
  const endSetting = await prisma.settings.findUnique({ where: { key: "maintenance_end" } });
  const typeSetting = await prisma.settings.findUnique({ where: { key: "maintenance_type" } });
  const brandSetting = await prisma.settings.findUnique({ where: { key: "brand_logo" } });
  
  const mLogoSetting = await prisma.settings.findUnique({ where: { key: "maintenance_logo_url" } });
  const bgTypeSetting = await prisma.settings.findUnique({ where: { key: "maintenance_bg_type" } });
  const bgVideoSetting = await prisma.settings.findUnique({ where: { key: "maintenance_bg_video" } });

  const title = titleSetting?.value || "Mohon Maaf";
  const message = messageSetting?.value || "Maaf, hari ini operasional BREAKOUT.ID sedang libur. Silakan kembali lagi sesuai jadwal yang telah ditentukan.";
  const startVal = startSetting?.value;
  const endVal = endSetting?.value;
  const maintenanceType = typeSetting?.value || "system";
  const brandLogo = brandSetting?.value || "/logo.png";
  
  const maintenanceLogo = mLogoSetting?.value || brandLogo;
  const bgType = bgTypeSetting?.value || "gradient";
  const bgVideo = bgVideoSetting?.value || "";

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }) + " WIB";
  };

  return (
    <main className="min-h-screen bg-[#09090B] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <MaintenanceAutoRedirect />
      {/* Background Types */}
      {bgType === "gradient" && (
        <>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#f000ff]/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[6000ms]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#8a2be2]/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[8000ms]"></div>
        </>
      )}

      {/* Ambient 3D Rotating Background Gears */}
      <div className="absolute -top-24 -right-24 w-96 h-96 opacity-10 pointer-events-none animate-spin" style={{ animationDuration: "60s" }}>
        <svg viewBox="0 0 100 100" className="w-full h-full text-[#c8f560] fill-current">
          <path d="M 47,4 L 53,4 L 54,12 L 61,14 L 67,8 L 72,12 L 69,19 L 75,23 L 82,19 L 85,25 L 79,30 L 83,37 L 91,36 L 92,42 L 85,46 L 86,53 L 94,55 L 93,61 L 85,63 L 83,70 L 89,76 L 86,81 L 79,78 L 74,83 L 78,91 L 72,94 L 67,88 L 60,91 L 62,99 L 56,100 L 53,92 L 46,92 L 43,100 L 37,99 L 39,91 L 32,88 L 27,94 L 21,91 L 25,83 L 20,78 L 13,81 L 10,76 L 16,70 L 14,63 L 6,61 L 5,55 L 13,53 L 14,46 L 7,42 L 8,36 L 16,37 L 20,30 L 14,25 L 17,19 L 24,23 L 30,19 L 27,12 L 32,8 L 38,14 L 45,12 Z" />
          <circle cx="50" cy="50" r="25" fill="#09090B" />
        </svg>
      </div>

      <div className="absolute -bottom-28 -left-28 w-80 h-80 opacity-10 pointer-events-none animate-spin" style={{ animationDuration: "45s", animationDirection: "reverse" }}>
        <svg viewBox="0 0 100 100" className="w-full h-full text-[#a855f7] fill-current">
          <path d="M 47,4 L 53,4 L 54,12 L 61,14 L 67,8 L 72,12 L 69,19 L 75,23 L 82,19 L 85,25 L 79,30 L 83,37 L 91,36 L 92,42 L 85,46 L 86,53 L 94,55 L 93,61 L 85,63 L 83,70 L 89,76 L 86,81 L 79,78 L 74,83 L 78,91 L 72,94 L 67,88 L 60,91 L 62,99 L 56,100 L 53,92 L 46,92 L 43,100 L 37,99 L 39,91 L 32,88 L 27,94 L 21,91 L 25,83 L 20,78 L 13,81 L 10,76 L 16,70 L 14,63 L 6,61 L 5,55 L 13,53 L 14,46 L 7,42 L 8,36 L 16,37 L 20,30 L 14,25 L 17,19 L 24,23 L 30,19 L 27,12 L 32,8 L 38,14 L 45,12 Z" />
          <circle cx="50" cy="50" r="22" fill="#09090B" />
        </svg>
      </div>

      {bgType === "solid" && (
        <div className="absolute inset-0 bg-black pointer-events-none z-0"></div>
      )}

      {bgType === "video" && bgVideo && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] z-10"></div>
          {bgVideo.includes("youtube.com") || bgVideo.includes("youtu.be") ? (
            <iframe
              src={`https://www.youtube.com/embed/${getYouTubeId(bgVideo)}?autoplay=1&mute=1&loop=1&playlist=${getYouTubeId(bgVideo)}&controls=0&showinfo=0&rel=0&iv_load_policy=3&playsinline=1`}
              className="absolute w-[300%] h-[300%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-cover aspect-video pointer-events-none border-none opacity-85"
              allow="autoplay; encrypted-media"
            ></iframe>
          ) : (
            <video
              src={bgVideo}
              autoPlay
              muted
              loop
              playsInline
              className="absolute w-full h-full top-0 left-0 object-cover opacity-90"
            ></video>
          )}
        </div>
      )}

      <div className="w-full max-w-2xl bg-black/40 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.3)] text-center relative z-10 flex flex-col items-center">
        {/* Slanted Breakout "B" Brand Logo Emblem */}
        <div className="flex flex-col items-center justify-center mb-3 group">
          <div className="relative flex items-center justify-center p-3.5 rounded-3xl bg-gradient-to-b from-white/10 to-white/5 border border-white/15 shadow-[0_0_30px_rgba(200,245,96,0.25)] hover:shadow-[0_0_40px_rgba(200,245,96,0.45)] transition-all">
            <div
              className="relative w-14 h-18 sm:w-16 sm:h-20 flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
              style={{ transform: "rotate(-10deg) skewX(-10deg)" }}
            >
              <img
                src="/breakout-b-logo.png"
                alt="BREAKOUT B Logo"
                className="w-full h-full object-contain filter drop-shadow-[0_0_14px_rgba(200,245,96,0.8)]"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2.5">
            <span className="text-sm font-black tracking-[0.25em] text-white uppercase">
              BREAKOUT
            </span>
            <span className="text-[10px] font-extrabold tracking-widest px-2 py-0.5 rounded-full bg-[#c8f560] text-[#1c1326] uppercase">
              RECORDS
            </span>
          </div>
        </div>

        {/* 3D Interlocking Mechanical Gears & Crossed Wrenches Centerpiece */}
        <Maintenance3DGears />

        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent mb-2">
          {title}
        </h1>
        <p className="text-[#00F0FF] font-bold tracking-wider text-sm uppercase mb-6 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse"></span>
          {getIndonesianType(maintenanceType)}
        </p>

        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8"></div>

        {/* Message Container */}
        <div className="bg-black/30 border border-white/5 rounded-2xl p-6 md:p-8 w-full max-w-lg mb-8 shadow-inner">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-3">Pesan dari Admin</h2>
          <p className="text-white/90 font-medium text-base md:text-lg leading-relaxed italic">
            "{message}"
          </p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg mb-8 text-left">
          <div className="bg-black/20 border border-white/5 rounded-xl p-4 flex items-center gap-3">
            <Clock className="w-5 h-5 text-[#f000ff] shrink-0" />
            <div>
              <div className="text-xs text-white/40 font-medium uppercase tracking-wider">Waktu Sekarang</div>
              <MaintenanceClock />
            </div>
          </div>

          {startVal && (
            <div className="bg-black/20 border border-white/5 rounded-xl p-4 flex items-center gap-3">
              <Calendar className="w-5 h-5 text-[#8a2be2] shrink-0" />
              <div>
                <div className="text-xs text-white/40 font-medium uppercase tracking-wider">Mulai Sejak</div>
                <div className="text-sm font-bold text-white/90 mt-0.5">{formatDate(startVal)}</div>
              </div>
            </div>
          )}

          {endVal && (
            <div className="col-span-full bg-black/30 border border-[#00F0FF]/10 rounded-xl p-4 flex items-center gap-3 shadow-[0_0_15px_rgba(0,240,255,0.02)]">
              <AlertCircle className="w-5 h-5 text-[#00F0FF] shrink-0 animate-bounce" />
              <div>
                <div className="text-xs text-white/40 font-medium uppercase tracking-wider">Estimasi Selesai</div>
                <div className="text-sm font-bold text-[#00F0FF] mt-0.5">{formatDate(endVal)}</div>
              </div>
            </div>
          )}
        </div>

        <div className="text-xs text-white/30 font-medium tracking-wide">
          © {new Date().getFullYear()} BREAKOUT.ID. All rights reserved.
        </div>
      </div>
    </main>
  );
}
