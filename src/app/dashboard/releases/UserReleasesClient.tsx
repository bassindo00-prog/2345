"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Play,
  Pause,
  Download,
  Music,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  X,
  Disc3,
  Loader2,
  ExternalLink,
  Eye,
} from "lucide-react";

export interface TrackItem {
  id: string;
  title: string;
  audioUrl: string;
  isrc?: string | null;
  composer?: string | null;
  producer?: string | null;
  lyrics?: string | null;
  featuredArtist?: string | null;
}

export interface ReleaseItem {
  id: string;
  title: string;
  genre: string;
  type: string;
  status: string;
  coverArtworkUrl: string;
  releaseDate: string | Date;
  upc?: string | null;
  tracks: TrackItem[];
  artist?: {
    name: string;
  } | null;
}

const FALLBACK_VINYL = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80" fill="none"><rect width="80" height="80" rx="8" fill="%230f172a"/><circle cx="40" cy="40" r="30" fill="%231e293b" stroke="%23334155" stroke-width="2"/><circle cx="40" cy="40" r="20" fill="%230f172a"/><circle cx="40" cy="40" r="10" fill="%23c8f560"/><circle cx="40" cy="40" r="3" fill="%23ffffff"/></svg>`;

function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("/api/media/")) return url;
  if (url.startsWith("/")) return url;
  if (
    url.includes("breakoutmusicrecord.com") ||
    url.includes("breakoutmusic.online") ||
    url.includes("r2.cloudflarestorage.com")
  ) {
    try {
      const u = new URL(url);
      return `/api/media${u.pathname}`;
    } catch {
      return `/api/media/${url.replace(/^https?:\/\/[^\/]+\//, "")}`;
    }
  }
  return url;
}

export default function UserReleasesClient({
  releases,
  artistName,
}: {
  releases: ReleaseItem[];
  artistName?: string;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Selected release for modal detail
  const [selectedRelease, setSelectedRelease] = useState<ReleaseItem | null>(null);

  // Audio player state
  const [currentTrack, setCurrentTrack] = useState<{
    track: TrackItem;
    release: ReleaseItem;
  } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Audio time & state listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsBuffering(false);
    };
    const handleEnded = () => setIsPlaying(false);
    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => setIsBuffering(false);
    const handleError = () => {
      setIsBuffering(false);
      setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("error", handleError);
    };
  }, []);

  const togglePlay = (track: TrackItem, release: ReleaseItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (currentTrack?.track.id === track.id) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play();
        setIsPlaying(true);
      }
    } else {
      setCurrentTrack({ track, release });
      setIsPlaying(true);
      setIsBuffering(true);
      if (audioRef.current) {
        audioRef.current.src = resolveMediaUrl(track.audioUrl);
        audioRef.current.play().catch(() => {
          setIsBuffering(false);
          setIsPlaying(false);
        });
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds === 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget;
    if (img.src !== FALLBACK_VINYL) {
      img.src = FALLBACK_VINYL;
    }
  };

  const handleDownload = (
    fileUrl: string,
    filename: string,
    type: "audio" | "cover",
    e?: React.MouseEvent
  ) => {
    if (e) e.stopPropagation();
    const downloadApiUrl = `/api/download?url=${encodeURIComponent(
      fileUrl
    )}&filename=${encodeURIComponent(filename)}`;
    window.open(downloadApiUrl, "_blank");
  };

  const filteredReleases = releases.filter((rel) => {
    const matchesSearch =
      rel.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rel.genre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rel.tracks?.some((t) => t.title.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || rel.status === statusFilter;
    const matchesType = typeFilter === "ALL" || rel.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const totalPages = Math.ceil(filteredReleases.length / itemsPerPage);
  const paginatedReleases = filteredReleases.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
      case "RELEASED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#c8f560] text-[#312042] shadow-sm">
            ✓ Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-500/25 border border-red-500/40 text-red-200">
            ✕ Rejected
          </span>
        );
      case "PROCESSING":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/25 border border-amber-500/40 text-amber-200">
            ⏳ Processing
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#fde08d] text-[#312042]">
            ⏳ Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-28 text-white">
      {/* Hidden Audio Element */}
      <audio ref={audioRef} preload="metadata" />

      {/* Filters Bar (Dark Luxury Glass) */}
      <div className="bg-[#241733]/90 border border-white/15 p-4 rounded-3xl shadow-xl backdrop-blur-md flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-white/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari judul lagu, album, atau genre..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#1a1024]/80 border border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-[#c8f560] transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <SlidersHorizontal className="w-4 h-4 text-white/50 hidden sm:block ml-1" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3.5 py-2.5 text-xs font-bold bg-[#1a1024] border border-white/20 rounded-2xl text-white focus:outline-none focus:border-[#c8f560] cursor-pointer"
          >
            <option value="ALL">Semua Status</option>
            <option value="PENDING">Review Moderasi</option>
            <option value="PROCESSING">Processing</option>
            <option value="APPROVED">Approved (ACC)</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3.5 py-2.5 text-xs font-bold bg-[#1a1024] border border-white/20 rounded-2xl text-white focus:outline-none focus:border-[#c8f560] cursor-pointer"
          >
            <option value="ALL">Semua Tipe</option>
            <option value="SINGLE">Single</option>
            <option value="EP">EP</option>
            <option value="ALBUM">Album</option>
          </select>
        </div>
      </div>

      {/* Releases List Container (Dark Purple Luxury) */}
      <div className="bg-gradient-to-br from-[#3b274e] via-[#2f1f40] to-[#1e132b] rounded-3xl border border-white/15 shadow-2xl overflow-hidden p-4 md:p-6">
        {paginatedReleases.length === 0 ? (
          <div className="p-14 text-center">
            <Disc3 className="w-12 h-12 text-white/30 mx-auto mb-3 animate-spin" />
            <h3 className="text-base font-bold text-white">Belum ada rilis musik</h3>
            <p className="text-xs text-white/60 mt-1 max-w-sm mx-auto">
              {searchTerm || statusFilter !== "ALL" || typeFilter !== "ALL"
                ? "Tidak ada rilis yang cocok dengan filter pencarian Anda."
                : "Mulai unggah rilis musik pertama Anda sekarang di menu Unggah Rilisan."}
            </p>
          </div>
        ) : (
          <>
            {/* MOBILE VIEW */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {paginatedReleases.map((rel) => {
                const firstTrack = rel.tracks[0];
                const isThisPlaying =
                  firstTrack && currentTrack?.track.id === firstTrack.id && isPlaying;

                return (
                  <div
                    key={rel.id}
                    onClick={() => setSelectedRelease(rel)}
                    className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-black/40 border border-white/20 shrink-0">
                        <img
                          src={resolveMediaUrl(rel.coverArtworkUrl)}
                          alt={rel.title}
                          onError={handleImageError}
                          className="w-full h-full object-cover"
                        />
                        {firstTrack && (
                          <button
                            onClick={(e) => togglePlay(firstTrack, rel, e)}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center text-white"
                          >
                            {isThisPlaying ? (
                              <Pause className="w-5 h-5 fill-current text-[#c8f560]" />
                            ) : (
                              <Play className="w-5 h-5 fill-current text-[#c8f560] ml-0.5" />
                            )}
                          </button>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-sm text-white truncate flex items-center gap-1.5">
                            <span>{rel.title}</span>
                            <Eye className="w-3.5 h-3.5 text-[#c8f560] shrink-0" />
                          </h4>
                          {getStatusBadge(rel.status)}
                        </div>

                        <p className="text-white/80 text-xs truncate mt-0.5">
                          {rel.artist?.name || artistName || "Breakout Artist"} •{" "}
                          <span className="text-white/60">{rel.genre}</span>
                        </p>

                        <div className="flex items-center gap-2 text-[10px] text-white/60 mt-1 font-mono">
                          <span>{rel.tracks?.length || 1} Track</span>
                          <span>•</span>
                          <span>
                            {new Date(rel.releaseDate).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-2 pt-2 border-t border-white/10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedRelease(rel)}
                        className="flex-1 py-2 px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#c8f560]" />
                        <span>Detail & Unduh</span>
                      </button>

                      {firstTrack && (
                        <button
                          type="button"
                          onClick={(e) => togglePlay(firstTrack, rel, e)}
                          className="py-2 px-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-[#c8f560] font-bold text-xs transition-colors"
                        >
                          {isThisPlaying ? "Pause" : "Play"}
                        </button>
                      )}

                      {rel.status === "RELEASED" && (
                        <a
                          href={`/listen/${rel.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="py-2 px-3 rounded-xl bg-[#c8f560] text-[#1a1024] font-bold text-xs flex items-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Smartlink</span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* DESKTOP VIEW */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/20 text-white/70 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Cover / Track</th>
                    <th className="py-3.5 px-4">Tipe & Genre</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-center">Tanggal Rilis</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-sm">
                  {paginatedReleases.map((rel) => {
                    const firstTrack = rel.tracks[0];
                    const isThisPlaying =
                      firstTrack && currentTrack?.track.id === firstTrack.id && isPlaying;

                    return (
                      <tr
                        key={rel.id}
                        onClick={() => setSelectedRelease(rel)}
                        className="hover:bg-white/10 transition-colors cursor-pointer group"
                      >
                        {/* Cover & Title */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3.5">
                            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-black/40 border border-white/20 shrink-0 shadow">
                              <img
                                src={resolveMediaUrl(rel.coverArtworkUrl)}
                                alt={rel.title}
                                onError={handleImageError}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              {firstTrack && (
                                <button
                                  onClick={(e) => togglePlay(firstTrack, rel, e)}
                                  className="absolute inset-0 bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-opacity opacity-0 group-hover:opacity-100"
                                  title={isThisPlaying ? "Pause" : "Putar Lagu"}
                                >
                                  {isThisPlaying ? (
                                    <Pause className="w-5 h-5 fill-current text-[#c8f560]" />
                                  ) : (
                                    <Play className="w-5 h-5 fill-current text-[#c8f560] ml-0.5" />
                                  )}
                                </button>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white group-hover:text-[#c8f560] transition-colors truncate max-w-[240px]">
                                  {rel.title}
                                </span>
                                {isThisPlaying && (
                                  <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c8f560] opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c8f560]"></span>
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-white/60 truncate mt-0.5">
                                {rel.artist?.name || artistName || "Breakout Artist"} •{" "}
                                {rel.tracks?.length || 1} Track
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Type & Genre */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {rel.type === "SINGLE" ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-white/10 text-white mr-2 border border-white/10">
                              SINGLE
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-400/30 mr-2">
                              {rel.type}
                            </span>
                          )}
                          <span className="text-xs text-white/70">{rel.genre}</span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-center">
                          {getStatusBadge(rel.status)}
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-center text-xs text-white/70">
                          {new Date(rel.releaseDate).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-right">
                          <div
                            className="flex items-center justify-end gap-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => setSelectedRelease(rel)}
                              className="px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white flex items-center gap-1 text-xs font-semibold transition-colors"
                              title="Lihat Detail Rilisan"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#c8f560]" />
                              <span>Detail</span>
                            </button>

                            {firstTrack && (
                              <button
                                onClick={(e) => togglePlay(firstTrack, rel, e)}
                                className={`p-2 rounded-xl transition-all cursor-pointer ${
                                  isThisPlaying
                                    ? "bg-[#c8f560] text-[#1a1024]"
                                    : "bg-white/15 text-white hover:bg-white/25"
                                }`}
                                title={isThisPlaying ? "Pause Audio" : "Putar Audio"}
                              >
                                {isThisPlaying ? (
                                  <Pause className="w-4 h-4 fill-current" />
                                ) : (
                                  <Play className="w-4 h-4 fill-current" />
                                )}
                              </button>
                            )}

                            {firstTrack && (
                              <button
                                onClick={(e) =>
                                  handleDownload(
                                    firstTrack.audioUrl,
                                    `${firstTrack.title}.mp3`,
                                    "audio",
                                    e
                                  )
                                }
                                className="p-2 rounded-xl bg-white/15 text-white hover:bg-[#c8f560] hover:text-[#1a1024] transition-all cursor-pointer"
                                title="Download Audio MP3/WAV"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            )}

                            {rel.status === "RELEASED" && (
                              <a
                                href={`/listen/${rel.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1.5 rounded-xl bg-[#c8f560] text-[#1a1024] font-bold transition-all flex items-center gap-1 text-xs shadow"
                                title="Buka Smartlink"
                              >
                                <ExternalLink className="w-3.5 h-3.5" /> Smartlink
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3.5 border-t border-white/15 mt-4 text-xs text-white/70">
                <span>
                  Menampilkan {(currentPage - 1) * itemsPerPage + 1} -{" "}
                  {Math.min(currentPage * itemsPerPage, filteredReleases.length)} dari{" "}
                  {filteredReleases.length} rilis
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-xl border border-white/15 bg-white/10 text-white disabled:opacity-30 hover:bg-white/20 transition cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-3 text-xs font-bold text-white">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="p-1.5 rounded-xl border border-white/15 bg-white/10 text-white disabled:opacity-30 hover:bg-white/20 transition cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Release Detail Modal */}
      {selectedRelease && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-gradient-to-br from-[#2f1f40] via-[#241733] to-[#1a1024] border border-white/20 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-black/40 border border-white/20 shadow-md shrink-0">
                  <img
                    src={resolveMediaUrl(selectedRelease.coverArtworkUrl)}
                    alt={selectedRelease.title}
                    onError={handleImageError}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedRelease.title}</h3>
                  <p className="text-sm text-white/70 mt-0.5">
                    {selectedRelease.artist?.name || artistName || "Breakout Artist"} •{" "}
                    {selectedRelease.genre}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    {getStatusBadge(selectedRelease.status)}
                    {selectedRelease.type === "SINGLE" ? (
                      <span className="text-xs font-semibold px-2.5 py-0.5 bg-white/10 text-white rounded-md border border-white/10">
                        SINGLE
                      </span>
                    ) : (
                      <span className="text-xs font-semibold px-2.5 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-400/30 rounded-md">
                        {selectedRelease.type}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedRelease(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions Download Cover */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div className="text-xs text-white/70">
                <span className="font-bold block text-white">Cover Artwork Master</span>
                Unduh file gambar artwork asli untuk materi promosi musisi.
              </div>
              <button
                onClick={(e) =>
                  handleDownload(
                    selectedRelease.coverArtworkUrl,
                    `${selectedRelease.title} - Cover.jpg`,
                    "cover",
                    e
                  )
                }
                className="px-3.5 py-2 bg-white/15 hover:bg-[#c8f560] hover:text-[#1a1024] text-white rounded-xl border border-white/15 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Unduh Cover
              </button>
            </div>

            {/* Tracklist in Modal */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Music className="w-4 h-4 text-[#c8f560]" />
                Daftar Lagu ({selectedRelease.tracks?.length || 0})
              </h4>
              <div className="space-y-2">
                {selectedRelease.tracks?.map((track, idx) => {
                  const isTrackActive = currentTrack?.track.id === track.id && isPlaying;
                  return (
                    <div
                      key={track.id}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                        isTrackActive
                          ? "bg-[#c8f560]/10 border-[#c8f560]/50"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={() => togglePlay(track, selectedRelease)}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                            isTrackActive
                              ? "bg-[#c8f560] text-[#1a1024] shadow-md shadow-[#c8f560]/30"
                              : "bg-white/15 text-white hover:bg-white/25"
                          }`}
                        >
                          {isTrackActive ? (
                            <Pause className="w-4 h-4 fill-current" />
                          ) : (
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          )}
                        </button>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">
                            {idx + 1}. {track.title}
                          </p>
                          <p className="text-xs text-white/60 truncate font-mono mt-0.5">
                            {track.featuredArtist ? `Feat: ${track.featuredArtist} • ` : ""}
                            {track.isrc ? `ISRC: ${track.isrc}` : "ISRC Auto-Generated"}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={(e) =>
                          handleDownload(track.audioUrl, `${track.title}.mp3`, "audio", e)
                        }
                        className="p-2.5 rounded-xl bg-white/10 hover:bg-[#c8f560] hover:text-[#1a1024] text-white transition-colors cursor-pointer"
                        title="Download Lagu Master"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Audio Player Bar */}
      {currentTrack && (
        <div className="fixed bottom-4 left-4 right-4 md:left-72 md:right-8 z-40 bg-[#1a1024]/95 backdrop-blur-xl border border-white/20 rounded-3xl p-3.5 shadow-2xl text-white animate-in slide-in-from-bottom duration-300">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Track Info */}
            <div className="flex items-center gap-3 w-full sm:w-auto min-w-0">
              <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-black/50 border border-white/20 shrink-0">
                <img
                  src={resolveMediaUrl(currentTrack.release.coverArtworkUrl)}
                  alt="Track Cover"
                  onError={handleImageError}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white truncate leading-tight">
                  {currentTrack.track.title}
                </p>
                <p className="text-xs text-white/60 truncate mt-0.5">
                  {currentTrack.release.artist?.name || artistName || "Breakout Artist"} •{" "}
                  {currentTrack.release.title}
                </p>
              </div>
            </div>

            {/* Controls & Timeline */}
            <div className="flex-1 max-w-xl w-full flex flex-col items-center gap-1.5">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => togglePlay(currentTrack.track, currentTrack.release)}
                  disabled={isBuffering}
                  className="w-10 h-10 rounded-full bg-[#c8f560] hover:bg-[#d8ff75] text-[#1a1024] flex items-center justify-center shadow-lg shadow-[#c8f560]/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  {isBuffering ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </button>
              </div>

              <div className="w-full flex items-center gap-2.5 text-xs text-white/60">
                <span className="w-10 text-right font-mono">{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="flex-1 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#c8f560]"
                />
                <span className="w-10 font-mono">{formatTime(duration)}</span>
              </div>
            </div>

            {/* Right Side Utility */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <button
                onClick={(e) =>
                  handleDownload(
                    currentTrack.track.audioUrl,
                    `${currentTrack.track.title}.mp3`,
                    "audio",
                    e
                  )
                }
                className="p-2 rounded-xl text-white/60 hover:text-[#c8f560] hover:bg-white/10 transition-colors"
                title="Download Audio"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  audioRef.current?.pause();
                  setIsPlaying(false);
                  setCurrentTrack(null);
                }}
                className="p-2 rounded-xl text-white/40 hover:text-red-400 hover:bg-white/10 transition-colors"
                title="Tutup Player"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
