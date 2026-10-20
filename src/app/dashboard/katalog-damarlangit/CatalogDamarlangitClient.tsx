"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Search, 
  PlayCircle, 
  Music, 
  Mic2, 
  ExternalLink, 
  Copy, 
  Check, 
  X, 
  FileAudio,
  Radio,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  User,
  ShieldCheck
} from "lucide-react";

export interface DamarlangitSong {
  kd_katalog: number;
  judul_lagu: string;
  performer: string;
  composer: string;
  song_control: string;
  link: string | null;
  member_name?: string;
}

export interface CatalogMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// Helper to extract YouTube video ID
function getYouTubeInfo(url: string | null | undefined): { videoId: string | null; thumbnailUrl: string | null } {
  if (!url) return { videoId: null, thumbnailUrl: null };
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/i;
  const match = url.match(regExp);
  if (match && match[1]) {
    return {
      videoId: match[1],
      thumbnailUrl: `https://i.ytimg.com/vi/${match[1]}/hqdefault.jpg`,
    };
  }
  return { videoId: null, thumbnailUrl: null };
}

export function CatalogDamarlangitClient() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [songs, setSongs] = useState<DamarlangitSong[]>([]);
  const [meta, setMeta] = useState<CatalogMeta>({ current_page: 1, last_page: 1, per_page: 24, total: 0 });
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [activeVideo, setActiveVideo] = useState<{ title: string; videoId: string; url: string } | null>(null);
  const [jumpPage, setJumpPage] = useState("");
  const itemsPerPage = 24;

  const topRef = useRef<HTMLDivElement>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset to page 1 on search change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  // Fetch catalog from API
  useEffect(() => {
    let isCancelled = false;

    const fetchData = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          page: currentPage.toString(),
          per_page: itemsPerPage.toString(),
          search: debouncedSearch.trim(),
        });

        const res = await fetch(`/api/damarlangit?${query.toString()}`);
        if (!res.ok) throw new Error("Gagal mengambil data katalog");
        
        const json = await res.json();
        if (!isCancelled && json.data) {
          setSongs(json.data);
          if (json.meta) {
            setMeta(json.meta);
          }
        }
      } catch (error) {
        console.error("Error fetching Damarlangit catalog:", error);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [currentPage, debouncedSearch]);

  const handleCopy = (song: DamarlangitSong) => {
    if (!song.link) return;
    navigator.clipboard.writeText(song.link);
    setCopiedId(song.kd_katalog);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleJumpPage = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(jumpPage, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= meta.last_page) {
      setCurrentPage(pageNum);
      setJumpPage("");
      topRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div ref={topRef} className="w-full pb-16 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 md:p-10 bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 text-white shadow-xl border border-white/10">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-20 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-purple-200">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Official Publisher Partner</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white flex items-center gap-3">
              Katalog Damarlangit
            </h1>
            <p className="text-purple-200 text-sm sm:text-base leading-relaxed">
              Jelajahi dan dengarkan seluruh daftar karya lagu resmi dari publisher{" "}
              <strong className="text-white">Damarlangit</strong> beserta link dan video YouTube resminya.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <a
              href="https://damarlangit.co.id/katalog"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-bold backdrop-blur-md transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Situs Resmi Damarlangit</span>
              <ExternalLink className="w-4 h-4 text-purple-300" />
            </a>
          </div>
        </div>

        {/* Counter Info */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center gap-6 text-xs sm:text-sm font-medium text-purple-200/90">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Tersinkronisasi Langsung</span>
          </div>
          <div className="flex items-center gap-2">
            <FileAudio className="w-4 h-4 text-purple-300" />
            <span>
              Total: <strong className="text-white font-bold">{meta.total.toLocaleString("id-ID")}</strong> Lagu
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-300" />
            <span>Publisher Rights Managed</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari judul lagu, penyanyi, pencipta, atau kode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-10 py-3 bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700/60 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white dark:focus:bg-zinc-800 transition"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium flex items-center justify-between sm:justify-end gap-3">
          <span>
            Halaman <strong className="text-gray-900 dark:text-white">{meta.current_page}</strong> dari{" "}
            <strong className="text-gray-900 dark:text-white">{meta.last_page}</strong>
          </span>
          <span className="text-gray-300 dark:text-zinc-700">|</span>
          <span>{meta.total.toLocaleString("id-ID")} Lagu</span>
        </div>
      </div>

      {/* Song Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-4 space-y-4 animate-pulse"
            >
              <div className="aspect-video w-full bg-gray-200 dark:bg-zinc-800 rounded-xl" />
              <div className="h-5 bg-gray-200 dark:bg-zinc-800 rounded-md w-3/4" />
              <div className="space-y-2">
                <div className="h-3 bg-gray-100 dark:bg-zinc-800 rounded w-1/2" />
                <div className="h-3 bg-gray-100 dark:bg-zinc-800 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : songs.length === 0 ? (
        <div className="py-24 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 p-8 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4">
            <FileAudio className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Tidak ada lagu ditemukan</h3>
          <p className="text-gray-500 text-sm max-w-sm mb-6">
            Tidak ada hasil untuk pencarian &quot;{debouncedSearch}&quot;. Coba gunakan kata kunci judul atau nama lain.
          </p>
          <button
            onClick={() => setSearch("")}
            className="px-5 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition"
          >
            Reset Pencarian
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {songs.map((song) => {
            const { videoId, thumbnailUrl } = getYouTubeInfo(song.link);
            const hasVideo = !!videoId;

            return (
              <div
                key={song.kd_katalog}
                className="group bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:border-purple-200 dark:hover:border-purple-800/50 transition-all duration-300 flex flex-col overflow-hidden"
              >
                {/* Media Thumbnail Container */}
                <div className="relative aspect-video w-full bg-slate-900 overflow-hidden flex items-center justify-center">
                  {thumbnailUrl ? (
                    <img
                      src={thumbnailUrl}
                      alt={song.judul_lagu}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-900/60 to-slate-900 text-purple-300">
                      <Music className="w-10 h-10 mb-1 opacity-70" />
                      <span className="text-[10px] uppercase font-bold tracking-widest text-purple-400/80">
                        Official Catalog
                      </span>
                    </div>
                  )}

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
                    {song.song_control && (
                      <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-emerald-400 font-bold text-[10px] border border-emerald-400/30">
                        Control {song.song_control}
                      </span>
                    )}
                  </div>

                  {/* Play Action Overlay */}
                  {hasVideo && (
                    <button
                      onClick={() =>
                        setActiveVideo({
                          title: song.judul_lagu,
                          videoId: videoId!,
                          url: song.link || "",
                        })
                      }
                      className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]"
                      title="Putar Video YouTube"
                    >
                      <div className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition">
                        <PlayCircle className="w-7 h-7" />
                      </div>
                    </button>
                  )}
                </div>

                {/* Content Details */}
                <div className="p-4 sm:p-5 flex flex-col flex-1">
                  <div className="mb-3">
                    <h3
                      className="font-bold text-gray-900 dark:text-white text-base leading-snug line-clamp-2 group-hover:text-purple-600 transition-colors"
                      title={song.judul_lagu}
                    >
                      {song.judul_lagu}
                    </h3>
                  </div>

                  <div className="space-y-2 mt-auto text-xs text-gray-600 dark:text-gray-300">
                    <div className="flex items-start gap-2">
                      <Mic2 className="w-3.5 h-3.5 text-purple-500 mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Penyanyi</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-200 truncate" title={song.performer}>
                          {song.performer || "-"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 pt-2 border-t border-gray-50 dark:border-zinc-800/60">
                      <Music className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Pencipta</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-200 truncate" title={song.composer}>
                          {song.composer || "-"}
                        </p>
                      </div>
                    </div>

                    {song.member_name && (
                      <div className="flex items-start gap-2 pt-2 border-t border-gray-50 dark:border-zinc-800/60">
                        <User className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Member / Publisher</p>
                          <p className="font-medium text-gray-700 dark:text-gray-300 truncate" title={song.member_name}>
                            {song.member_name}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center gap-2">
                    {song.link ? (
                      <>
                        <a
                          href={song.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-950/70 text-red-600 dark:text-red-400 text-xs font-bold transition"
                          title="Buka di YouTube"
                        >
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                          </svg>
                          <span>YouTube</span>
                        </a>

                        <button
                          onClick={() => handleCopy(song)}
                          className="p-2 rounded-xl border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition"
                          title="Salin Link YouTube"
                        >
                          {copiedId === song.kd_katalog ? (
                            <Check className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </>
                    ) : (
                      <span className="w-full text-center py-2 text-xs text-gray-400 font-medium italic">
                        Link Belum Tersedia
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {meta.last_page > 1 && (
        <div className="mt-12 pt-8 border-t border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1 || loading}
              onClick={() => goToPage(1)}
              className="px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-zinc-800 transition shadow-sm"
            >
              Pertama
            </button>
            <button
              disabled={currentPage === 1 || loading}
              onClick={() => goToPage(Math.max(1, currentPage - 1))}
              className="flex items-center gap-1 px-4 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-zinc-800 transition shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">
              Halaman <span className="text-purple-600 font-bold">{currentPage}</span> dari {meta.last_page}
            </span>

            {/* Jump to page form */}
            <form onSubmit={handleJumpPage} className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={meta.last_page}
                placeholder="Hal..."
                value={jumpPage}
                onChange={(e) => setJumpPage(e.target.value)}
                className="w-16 px-2.5 py-1.5 text-xs text-center bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition"
              >
                Go
              </button>
            </form>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === meta.last_page || loading}
              onClick={() => goToPage(Math.min(meta.last_page, currentPage + 1))}
              className="flex items-center gap-1 px-4 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-zinc-800 transition shadow-sm"
            >
              <span>Berikutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              disabled={currentPage === meta.last_page || loading}
              onClick={() => goToPage(meta.last_page)}
              className="px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-zinc-800 transition shadow-sm"
            >
              Terakhir
            </button>
          </div>
        </div>
      )}

      {/* Embedded YouTube Player Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div
            className="fixed inset-0"
            onClick={() => setActiveVideo(null)}
          />
          <div className="relative z-10 w-full max-w-3xl bg-zinc-900 rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-white/10 bg-zinc-950/60">
              <div className="flex items-center gap-3 min-w-0 pr-4">
                <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
                  <PlayCircle className="w-5 h-5" />
                </div>
                <h4 className="text-white font-bold text-sm sm:text-base truncate" title={activeVideo.title}>
                  {activeVideo.title}
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={activeVideo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium inline-flex items-center gap-1.5 transition"
                >
                  <span>Buka di YouTube</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => setActiveVideo(null)}
                  className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Embedded Iframe */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeVideo.videoId}?autoplay=1&rel=0`}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
