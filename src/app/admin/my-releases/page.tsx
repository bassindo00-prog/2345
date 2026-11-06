import { prisma } from "@/lib/prisma";
import MyReleasesList from "./MyReleasesList";

export const dynamic = "force-dynamic";

export default async function AdminMyReleasesPage() {
  const approvedReleases = await prisma.release.findMany({
    where: { status: "APPROVED", isImported: false },
    include: { 
      artist: { include: { user: true } }, 
      tracks: true 
    },
    orderBy: { updatedAt: "desc" }
  });

  const serializedReleases = approvedReleases.map((release) => {
    const releaseDateStr = release.releaseDate instanceof Date && !isNaN(release.releaseDate.getTime())
      ? release.releaseDate.toISOString()
      : new Date().toISOString();

    return {
      id: release.id,
      title: release.title,
      genre: release.genre || "Pop",
      language: release.language || "Indonesia",
      primaryArtist: release.primaryArtist || release.artist?.stageName || release.artist?.user?.name || "Artist",
      featuredArtist: release.featuredArtist || null,
      releaseDate: releaseDateStr,
      coverArtworkUrl: release.coverArtworkUrl || "",
      status: release.status || "APPROVED",
      spotifyUrl: release.spotifyUrl || "",
      appleMusicUrl: release.appleMusicUrl || "",
      youtubeMusicUrl: release.youtubeMusicUrl || "",
      artistUserId: release.artist?.userId || "",
      artistName: release.artist?.user?.name || release.artist?.stageName || "Artist",
      artistEmail: release.artist?.user?.email || "",
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
      }))
    };
  });

  return (
    <div className="animate-fade-in max-w-7xl mx-auto pb-10 px-4 md:px-0 text-white">
      <div className="mb-6 p-6 md:p-8 rounded-3xl shadow-xl border border-white/15 bg-gradient-to-br from-[#3b274e] via-[#2f1f40] to-[#1e132b] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">My Releases (Katalog Rilis Aktif ACC)</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#c8f560] text-[#1a1024] text-[10px] font-black uppercase">Live</span>
          </div>
          <p className="text-white/70 text-xs sm:text-sm mt-1">Kelola seluruh rilisan musik resmi yang telah disetujui (ACC) & aktif didistribusikan ke platform.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-black/30 border border-white/15 text-[#c8f560] rounded-2xl text-xs font-bold shadow-sm">
            Total: <span className="font-extrabold text-sm text-white">{approvedReleases.length}</span> Rilisan Aktif
          </div>
        </div>
      </div>

      <MyReleasesList releases={serializedReleases} />
    </div>
  );
}