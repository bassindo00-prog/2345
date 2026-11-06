import { prisma } from "@/lib/prisma";
import ReviewList from "./ReviewList";

export const dynamic = "force-dynamic";

export default async function AdminReleasesPage() {
  const pendingReleases = await prisma.release.findMany({
    where: { status: "PENDING", isImported: false },
    include: { 
      artist: { include: { user: true } }, 
      tracks: true 
    },
    orderBy: { createdAt: "asc" }
  });

  const serializedReleases = pendingReleases.map((release) => {
    const releaseDateStr = release.releaseDate instanceof Date && !isNaN(release.releaseDate.getTime())
      ? release.releaseDate.toISOString()
      : new Date().toISOString();

    return {
      id: release.id,
      title: release.title,
      genre: release.genre || "Pop",
      type: release.type || "SINGLE",
      status: release.status || "PENDING",
      coverArtworkUrl: release.coverArtworkUrl || "",
      releaseDate: releaseDateStr,
      featuredArtist: release.featuredArtist || null,
      upc: release.upc || null,
      distributor: release.distributor || null,
      spotifyUrl: release.spotifyUrl || null,
      appleMusicUrl: release.appleMusicUrl || null,
      youtubeMusicUrl: release.youtubeMusicUrl || null,
      tiktokUrl: release.tiktokUrl || null,
      user: {
        id: release.artist?.userId || release.id,
        name: release.artist?.user?.name || release.artist?.stageName || release.primaryArtist || "Artist",
        email: release.artist?.user?.email || null,
        artist: {
          name: release.artist?.stageName || release.primaryArtist || "Artist"
        }
      },
      tracks: (release.tracks || []).map((t) => ({
        id: t.id,
        title: t.title,
        audioUrl: t.audioUrl,
        composer: t.composer || null,
        producer: t.producer || null,
        lyrics: t.lyrics || null,
        isrc: t.isrc || null,
        upc: t.upc || null,
        tiktokClipStart: t.tiktokClipStart || null,
        featuredArtist: t.featuredArtist || null,
      }))
    };
  });

  return (
    <div className="animate-fade-in max-w-7xl mx-auto pb-10 px-4 md:px-0 text-white">
      <div className="mb-8 p-6 md:p-8 rounded-3xl shadow-xl border border-white/15 bg-gradient-to-br from-[#3b274e] via-[#2f1f40] to-[#1e132b]">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black text-white tracking-tight">Review Submisi Musik (ACC Lagu)</h1>
          <span className="px-2.5 py-0.5 rounded-full bg-[#c8f560] text-[#1a1024] text-[10px] font-black uppercase">
            Admin Review
          </span>
        </div>
        <p className="text-white/70 text-xs sm:text-sm mt-1">
          Tinjau master audio, artwork cover, dan data metadata rilisan musisi sebelum disetujui (ACC) ke platform digital.
        </p>
        <div className="mt-4 bg-[#fde08d]/15 text-[#fde08d] px-4 py-2 rounded-xl text-xs font-bold w-max border border-[#fde08d]/30">
          ⚡ {pendingReleases.length} rilisan menunggu persetujuan (Pending ACC)
        </div>
      </div>

      {pendingReleases.length === 0 ? (
        <div className="rounded-3xl border border-white/15 p-16 text-center text-white/50 shadow-xl font-semibold bg-gradient-to-br from-[#3b274e] to-[#1e132b]">
          Tidak ada rilisan baru yang perlu ditinjau saat ini.
        </div>
      ) : (
        <ReviewList initialReleases={serializedReleases} />
      )}
    </div>
  );
}
