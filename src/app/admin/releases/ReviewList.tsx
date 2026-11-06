"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Music,
  ExternalLink,
  Search,
  Filter,
  Volume2,
  VolumeX,
  X,
  Loader2,
  Disc3,
  Check,
  Radio,
} from "lucide-react";
import { updateReleaseStatusAction, updateReleaseLinksAction } from "@/app/actions/admin";

export interface TrackItem {
  id: string;
  title: string;
  audioUrl: string;
  isrc?: string | null;
  upc?: string | null;
  composer?: string | null;
  producer?: string | null;
  lyrics?: string | null;
  tiktokClipStart?: string | null;
  featuredArtist?: string | null;
}

export interface ReviewItem {
  id: string;
  title: string;
  genre: string;
  type: string;
  status: string;
  coverArtworkUrl: string;
  releaseDate: string | Date;
  upc?: string | null;
  featuredArtist?: string | null;
  distributor?: string | null;
  spotifyUrl?: string | null;
  appleMusicUrl?: string | null;
  youtubeMusicUrl?: string | null;
  tiktokUrl?: string | null;
  tracks: TrackItem[];
  user: {
    id: string;
    name: string | null;
    email: string | null;
    artist?: {
      name: string;
    } | null;
  };
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

export default function ReviewList({ initialReleases }: { initialReleases: ReviewItem[] }) {
  const [releases, setReleases] = useState<ReviewItem[]>(initialReleases);
  const [selected, setSelected] = useState<ReviewItem | null>(null);
  const [filter, setFilter] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Link Modal State
  const [linkModal, setLinkModal] = useState<ReviewItem | null>(null);
  const [links, setLinks] = useState({ spotifyUrl: "", appleMusicUrl: "", youtubeMusicUrl: "" });
  const [savingLinks, setSavingLinks] = useState(false);

  // Auto-sync polling every 8 seconds & on window focus so new submissions appear immediately
  useEffect(() => {
    const fetchLatestReleases = async () => {
      try {
        const res = await fetch(`/api/releases?all=true&t=${Date.now()}`, {
          cache: "no-store",
          headers: { Pragma: "no-cache", "Cache-Control": "no-cache" },
        });
        const data = await res.json();
        if (data?.releases && Array.isArray(data.releases)) {
          const pending = data.releases.filter(
            (r: any) => r.status === "Pending" || r.status === "PENDING"
          );
          setReleases(
            pending.map((r: any) => ({
              id: r.id,
              title: r.title,
              genre: r.genre || "Pop",
              type: r.type || "SINGLE",
              status: "PENDING",
              coverArtworkUrl: r.coverUrl || "",
              releaseDate: r.releaseDate || new Date().toISOString(),
              featuredArtist: r.featuring || null,
              upc: r.upc || null,
              distributor: r.publisher || r.distributor || null,
              spotifyUrl: r.spotifyUrl || null,
              appleMusicUrl: r.appleMusicUrl || null,
              youtubeMusicUrl: r.youtubeMusicUrl || null,
              tiktokUrl: r.tiktokUrl || null,
              user: {
                id: r.userId || r.id,
                name: r.user?.name || r.artist || "Artist",
                email: r.user?.email || null,
                artist: { name: r.artist || "Artist" },
              },
              tracks: (r.tracks || []).map((t: any) => ({
                id: t.id,
                title: t.title,
                audioUrl: t.audioUrl || t.audioFile,
                composer: t.composer || null,
                producer: t.producer || null,
                lyrics: null,
                isrc: t.isrc || null,
                upc: t.upc || null,
                tiktokClipStart: t.tiktokClip || null,
                featuredArtist: t.featuring || null,
              })),
            }))
          );
        }
      } catch (err) {}
    };

    const poll = setInterval(fetchLatestReleases, 8000);
    const onFocus = () => fetchLatestReleases();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(poll);
      window.removeEventListener("focus", onFocus);
    };
  }, []);
  const [currentTrack, setCurrentTrack] = useState<{
    track: TrackItem;
    release: ReviewItem;
  } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  const togglePlay = (track: TrackItem, release: ReviewItem, e?: React.MouseEvent) => {
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

  const handleDownload = (fileUrl: string, filename: string, type: "audio" | "cover", e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const downloadApiUrl = `/api/download?url=${encodeURIComponent(fileUrl)}&filename=${encodeURIComponent(filename)}`;
    window.open(downloadApiUrl, "_blank");
  };

  const handleStatusChange = async (id: string, newStatus: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const releaseToUpdate = releases.find((r) => r.id === id);
      if (!releaseToUpdate) return;
      setUpdatingId(id);
      const res = await updateReleaseStatusAction(
        id,
        releaseToUpdate.user.id,
        newStatus as "APPROVED" | "REJECTED",
        releaseToUpdate.user.name || "Artist",
        releaseToUpdate.user.email || "",
        releaseToUpdate.title
      );
      if (res.success) {
        setReleases((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
        );
        if (selected && selected.id === id) {
          setSelected({ ...selected, status: newStatus });
        }
      } else {
        alert("Gagal mengupdate status: " + (res as any).error);
      }
    } catch (err: any) {
      alert("Terjadi kesalahan: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOpenLinkModal = (release: ReviewItem) => {
    setLinks({
      spotifyUrl: release.spotifyUrl || "",
      appleMusicUrl: release.appleMusicUrl || "",
      youtubeMusicUrl: release.youtubeMusicUrl || "",
    });
    setLinkModal(release);
  };

  const handleSaveLinks = async () => {
    if (!linkModal) return;
    setSavingLinks(true);
    try {
      const res = await updateReleaseLinksAction(
        linkModal.id,
        linkModal.user.id,
        linkModal.user.name || "Artist",
        linkModal.user.email || "",
        linkModal.title,
        links
      );
      if (res.success) {
        setReleases(
          releases.map((r) =>
            r.id === linkModal.id ? { ...r, ...links, status: "RELEASED" } : r
          )
        );
        setLinkModal(null);
        if (selected?.id === linkModal.id) {
          setSelected({ ...selected, ...links, status: "RELEASED" });
        }
      } else {
        alert("Gagal mengupdate link: " + (res as any).error);
      }
    } catch (err: any) {
      alert("Terjadi kesalahan: " + err.message);
    } finally {
      setSavingLinks(false);
    }
  };

  const filtered = releases.filter((r) => {
    const matchesFilter = filter === "ALL" || r.status === filter;
    const matchesSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.user?.artist?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.genre.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-28 text-white">
      {/* Hidden Audio Element */}
      <audio ref={audioRef} preload="metadata" />

      {/* Search & Filter Header (Dark Luxury Glass) */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#241733]/90 border border-white/15 p-4 rounded-3xl shadow-xl backdrop-blur-md">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type="text"
            placeholder="Cari lagu, artis, atau genre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#1a1024]/80 border border-white/20 rounded-2xl text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#c8f560] transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-white/50 hidden md:block mr-1" />
          {["ALL", "PENDING", "PROCESSING", "APPROVED", "REJECTED"].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                filter === st
                  ? "bg-[#c8f560] text-[#1a1024] shadow-md shadow-[#c8f560]/20"
                  : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
              }`}
            >
              {st === "ALL"
                ? "Semua"
                : st === "PENDING"
                ? "Antrean (Pending)"
                : st === "APPROVED"
                ? "Disetujui (ACC)"
                : st === "REJECTED"
                ? "Ditolak"
                : st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table / Card Container */}
      <div className="bg-gradient-to-br from-[#3b274e] via-[#2f1f40] to-[#1e132b] rounded-3xl border border-white/15 shadow-2xl overflow-hidden p-4 md:p-6">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Disc3 className="w-12 h-12 text-white/30 mx-auto mb-3 animate-spin" />
            <h3 className="text-base font-bold text-white">Tidak ada submisi lagu</h3>
            <p className="text-xs text-white/60 mt-1">
              Belum ada antrean lagu yang cocok dengan filter yang dipilih.
            </p>
          </div>
        ) : (
          <>
            {/* MOBILE VIEW (< md) */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {filtered.map((rel) => {
                const firstTrack = rel.tracks[0];
                const isThisPlaying =
                  firstTrack && currentTrack?.track.id === firstTrack.id && isPlaying;
                const isThisUpdating = updatingId === rel.id;

                return (
                  <div
                    key={rel.id}
                    onClick={() => setSelected(rel)}
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
                            className="absolute inset-0 bg-black/40 hover:bg-black/60 flex items-center justify-center text-white"
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
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                              rel.status === "APPROVED" || rel.status === "RELEASED"
                                ? "bg-[#c8f560] text-[#312042]"
                                : rel.status === "REJECTED"
                                ? "bg-red-500/25 border border-red-500/40 text-red-200"
                                : rel.status === "PROCESSING"
                                ? "bg-amber-500/25 border border-amber-500/40 text-amber-200"
                                : "bg-[#fde08d] text-[#312042]"
                            }`}
                          >
                            {rel.status === "APPROVED" || rel.status === "RELEASED"
                              ? "✓ ACC"
                              : rel.status === "REJECTED"
                              ? "✕ Ditolak"
                              : "⏳ Review"}
                          </span>
                        </div>

                        <p className="text-white/80 text-xs truncate mt-0.5">
                          {rel.user?.artist?.name || rel.user?.name || "Artist"} •{" "}
                          <span className="text-white/60">{rel.genre}</span>
                        </p>

                        <div className="flex items-center gap-2 text-[10px] text-white/60 mt-1 font-mono">
                          <span>{rel.tracks.length} Track</span>
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

                    {/* Quick Action Buttons */}
                    <div
                      className="flex items-center gap-2 pt-2 border-t border-white/10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => setSelected(rel)}
                        className="flex-1 py-2 px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#c8f560]" />
                        <span>Detail & Unduh</span>
                      </button>

                      {rel.status !== "APPROVED" && (
                        <button
                          type="button"
                          disabled={isThisUpdating}
                          onClick={(e) => handleStatusChange(rel.id, "APPROVED", e)}
                          className="py-2 px-4 rounded-xl bg-[#c8f560] text-[#1a1024] font-bold text-xs hover:bg-[#d8ff75] transition-colors shadow disabled:opacity-50"
                        >
                          {isThisUpdating ? "..." : "ACC"}
                        </button>
                      )}

                      {rel.status !== "REJECTED" && (
                        <button
                          type="button"
                          disabled={isThisUpdating}
                          onClick={(e) => handleStatusChange(rel.id, "REJECTED", e)}
                          className="py-2 px-3 rounded-xl bg-red-500/25 hover:bg-red-500/40 border border-red-500/40 text-red-200 font-semibold text-xs transition-colors disabled:opacity-50"
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* DESKTOP VIEW (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/20 text-white/70 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Artwork & Judul Lagu</th>
                    <th className="py-3.5 px-4">Artis / Uploader</th>
                    <th className="py-3.5 px-4">Tipe & Genre</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-center">Tanggal Rilis</th>
                    <th className="py-3.5 px-4 text-right">Aksi Moderasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-sm">
                  {filtered.map((rel) => {
                    const firstTrack = rel.tracks[0];
                    const isThisPlaying =
                      firstTrack && currentTrack?.track.id === firstTrack.id && isPlaying;
                    const isThisUpdating = updatingId === rel.id;

                    return (
                      <tr
                        key={rel.id}
                        onClick={() => setSelected(rel)}
                        className="hover:bg-white/10 transition-colors cursor-pointer group"
                      >
                        {/* Artwork & Judul */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
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
                                  title={isThisPlaying ? "Pause" : "Play Master"}
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
                              <span className="font-bold text-white group-hover:text-[#c8f560] transition-colors truncate block max-w-[220px]">
                                {rel.title}
                              </span>
                              <span className="text-xs text-white/60">
                                {rel.tracks.length} Track
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Artis / Uploader */}
                        <td className="py-3.5 px-4">
                          <div className="text-white font-medium truncate max-w-[170px]">
                            {rel.user?.artist?.name || rel.user?.name || "No Artist"}
                          </div>
                          <div className="text-xs text-white/50 truncate max-w-[170px]">
                            {rel.user?.email}
                          </div>
                        </td>

                        {/* Tipe & Genre */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {rel.type === "SINGLE" ? (
                            <span className="px-2 py-0.5 rounded-md bg-white/10 text-white text-xs font-semibold mr-1.5 border border-white/10">
                              SINGLE
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-xs font-semibold mr-1.5 border border-purple-400/30">
                              {rel.type}
                            </span>
                          )}
                          <span className="text-xs text-white/70">{rel.genre}</span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold inline-block shadow-sm ${
                              rel.status === "APPROVED" || rel.status === "RELEASED"
                                ? "bg-[#c8f560] text-[#312042]"
                                : rel.status === "REJECTED"
                                ? "bg-red-500/25 border border-red-500/40 text-red-200"
                                : rel.status === "PROCESSING"
                                ? "bg-amber-500/25 border border-amber-500/40 text-amber-200"
                                : "bg-[#fde08d] text-[#312042]"
                            }`}
                          >
                            {rel.status === "APPROVED" || rel.status === "RELEASED"
                              ? "✓ ACC"
                              : rel.status === "REJECTED"
                              ? "✕ Ditolak"
                              : rel.status === "PROCESSING"
                              ? "⏳ Proses"
                              : "⏳ Review"}
                          </span>
                        </td>

                        {/* Tanggal Rilis */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-center text-xs text-white/70">
                          {new Date(rel.releaseDate).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>

                        {/* Aksi Moderasi */}
                        <td
                          className="py-3.5 px-4 whitespace-nowrap text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Detail & Unduh */}
                            <button
                              type="button"
                              onClick={() => setSelected(rel)}
                              className="px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white flex items-center gap-1 text-xs font-semibold transition-colors"
                              title="Lihat Detail Lagu & Unduh Master"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#c8f560]" />
                              <span>Detail</span>
                            </button>

                            {/* Prominent Quick ACC */}
                            {rel.status !== "APPROVED" && (
                              <button
                                type="button"
                                disabled={isThisUpdating}
                                onClick={(e) => handleStatusChange(rel.id, "APPROVED", e)}
                                className="px-3 py-1.5 rounded-xl bg-[#c8f560] hover:bg-[#d8ff75] text-[#1a1024] font-black text-xs shadow-md transition-colors cursor-pointer disabled:opacity-50"
                                title="Setujui dan ACC Lagu Ini"
                              >
                                {isThisUpdating ? "..." : "ACC"}
                              </button>
                            )}

                            {/* Quick Reject */}
                            {rel.status !== "REJECTED" && (
                              <button
                                type="button"
                                disabled={isThisUpdating}
                                onClick={(e) => handleStatusChange(rel.id, "REJECTED", e)}
                                className="px-2.5 py-1.5 rounded-xl bg-red-500/25 hover:bg-red-500/40 border border-red-500/40 text-red-200 font-bold text-xs shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                                title="Tolak Lagu Ini"
                              >
                                Reject
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Floating Bottom Audio Player */}
      {currentTrack && (
        <div className="fixed bottom-4 left-4 right-4 md:left-72 md:right-8 z-40 bg-[#1a1024]/95 backdrop-blur-xl border border-white/20 rounded-3xl p-3.5 shadow-2xl text-white animate-in slide-in-from-bottom duration-300">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
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
                  {currentTrack.release.user?.artist?.name ||
                    currentTrack.release.user?.name ||
                    "Artist"}{" "}
                  — {currentTrack.release.title}
                </p>
              </div>
            </div>

            <div className="flex-1 max-w-xl w-full flex flex-col items-center gap-1.5">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => togglePlay(currentTrack.track, currentTrack.release)}
                  disabled={isBuffering}
                  className="w-10 h-10 rounded-full bg-[#c8f560] hover:bg-[#d8ff75] text-[#1a1024] flex items-center justify-center shadow-lg shadow-[#c8f560]/30 transition-all hover:scale-105 active:scale-95"
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
                title="Unduh Master Audio"
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

      {/* Modal Detail & Review Moderasi (Dark Luxury Glass) */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-gradient-to-br from-[#2f1f40] via-[#241733] to-[#1a1024] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20 p-6 space-y-6 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-black/50 border border-white/20 shadow-md shrink-0">
                  <img
                    src={resolveMediaUrl(selected.coverArtworkUrl)}
                    alt={selected.title}
                    onError={handleImageError}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selected.title}</h3>
                  <p className="text-sm text-white/70 mt-0.5">
                    {selected.user?.artist?.name || selected.user?.name} • {selected.genre}
                  </p>
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    {selected.type === "SINGLE" ? (
                      <span className="px-2.5 py-0.5 bg-white/10 text-white text-xs font-semibold rounded-md border border-white/10">
                        SINGLE
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 bg-purple-500/20 text-purple-300 text-xs font-semibold rounded-md border border-purple-400/30">
                        {selected.type}
                      </span>
                    )}
                    {selected.upc && (
                      <span className="px-2.5 py-0.5 bg-white/10 text-[#c8f560] text-xs font-mono font-semibold rounded-md border border-white/10">
                        UPC: {selected.upc}
                      </span>
                    )}
                    {selected.featuredArtist && (
                      <span className="px-2.5 py-0.5 bg-white/10 text-white/90 text-xs font-semibold rounded-md border border-white/10">
                        Feat: {selected.featuredArtist}
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(
                          selected.coverArtworkUrl,
                          `${selected.title} - Cover.jpg`,
                          "cover",
                          e
                        );
                      }}
                      className="px-2.5 py-0.5 bg-white/10 hover:bg-[#c8f560] hover:text-[#1a1024] text-white text-xs font-semibold rounded-md border border-white/15 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3" /> Unduh Cover
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Track list */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Music className="w-4 h-4 text-[#c8f560]" />
                Daftar Lagu ({selected.tracks.length})
              </h4>
              <div className="space-y-2">
                {selected.tracks.map((track, idx) => {
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
                          onClick={() => togglePlay(track, selected)}
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
                          <div className="text-xs text-white/60 mt-1 space-y-0.5 font-mono">
                            <span className="inline-block text-[10px] text-[#c8f560] bg-white/10 px-1.5 py-0.5 rounded mr-2 mb-1 border border-white/10">
                              {track.isrc ? `ISRC: ${track.isrc}` : "ISRC Auto-Generated"}
                            </span>
                            {track.upc && (
                              <span className="inline-block text-[10px] text-white/80 bg-white/10 px-1.5 py-0.5 rounded mr-2 mb-1 border border-white/10">
                                UPC: {track.upc}
                              </span>
                            )}
                            {track.featuredArtist && (
                              <span className="block text-[11px] font-sans">
                                Feat: <strong className="text-white">{track.featuredArtist}</strong>
                              </span>
                            )}
                            {track.composer && (
                              <span className="block text-[11px] font-sans">
                                Composer: <strong className="text-white">{track.composer}</strong>
                              </span>
                            )}
                            {track.producer && (
                              <span className="block text-[11px] font-sans">
                                Producer: <strong className="text-white">{track.producer}</strong>
                              </span>
                            )}
                            {(release.distributor || (track as any).publisher) && (
                              <span className="block text-[11px] font-sans">
                                Publisher: <strong className="text-white">{release.distributor || (track as any).publisher}</strong>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) =>
                          handleDownload(track.audioUrl, `${track.title}.mp3`, "audio", e)
                        }
                        className="p-2.5 rounded-xl bg-white/10 hover:bg-[#c8f560] hover:text-[#1a1024] text-white transition-colors cursor-pointer"
                        title="Unduh Master Audio"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Moderation Actions Footer */}
            <div className="pt-4 border-t border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="text-xs text-white/60">
                Persetujuan rilisan ini:
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  disabled={updatingId === selected.id}
                  onClick={(e) => handleStatusChange(selected.id, "APPROVED", e)}
                  className="px-4 py-2 bg-[#c8f560] hover:bg-[#d8ff75] text-[#1a1024] text-xs font-black rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  {updatingId === selected.id ? "Memproses..." : "ACC Rilisan"}
                </button>
                <button
                  disabled={updatingId === selected.id}
                  onClick={(e) => handleStatusChange(selected.id, "PROCESSING", e)}
                  className="px-3.5 py-2 bg-amber-500/25 hover:bg-amber-500/40 border border-amber-500/40 text-amber-200 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  Set Processing
                </button>
                <button
                  disabled={updatingId === selected.id}
                  onClick={(e) => handleStatusChange(selected.id, "REJECTED", e)}
                  className="px-3.5 py-2 bg-red-500/25 hover:bg-red-500/40 border border-red-500/40 text-red-200 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  Reject Rilisan
                </button>
                {(selected.status === "APPROVED" || selected.status === "RELEASED") && (
                  <button
                    onClick={() => handleOpenLinkModal(selected)}
                    className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Input Link DSP
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Link Modal (DSP) */}
      {linkModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-gradient-to-br from-[#2f1f40] via-[#241733] to-[#1a1024] rounded-3xl p-6 w-full max-w-md shadow-2xl border border-white/20 relative text-white">
            <button
              onClick={() => setLinkModal(null)}
              className="absolute top-4 right-4 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-1">Input Link Rilisan (DSP)</h3>
            <p className="text-xs text-white/60 mb-6">
              Masukkan link platform streaming (Spotify, Apple Music, YouTube) untuk sinkronisasi Smartlink dan notifikasi email artis.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Spotify URL
                </label>
                <input
                  type="url"
                  value={links.spotifyUrl}
                  onChange={(e) => setLinks({ ...links, spotifyUrl: e.target.value })}
                  placeholder="https://open.spotify.com/album/..."
                  className="w-full px-3.5 py-2.5 bg-[#1a1024]/80 border border-white/20 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#c8f560]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Apple Music URL
                </label>
                <input
                  type="url"
                  value={links.appleMusicUrl}
                  onChange={(e) => setLinks({ ...links, appleMusicUrl: e.target.value })}
                  placeholder="https://music.apple.com/..."
                  className="w-full px-3.5 py-2.5 bg-[#1a1024]/80 border border-white/20 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#c8f560]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  YouTube Music URL
                </label>
                <input
                  type="url"
                  value={links.youtubeMusicUrl}
                  onChange={(e) => setLinks({ ...links, youtubeMusicUrl: e.target.value })}
                  placeholder="https://music.youtube.com/..."
                  className="w-full px-3.5 py-2.5 bg-[#1a1024]/80 border border-white/20 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#c8f560]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  onClick={() => setLinkModal(null)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveLinks}
                  disabled={savingLinks}
                  className="px-4 py-2 bg-[#c8f560] hover:bg-[#d8ff75] text-[#1a1024] text-xs font-black rounded-xl disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  {savingLinks && <Loader2 className="w-4 h-4 animate-spin" />}
                  {savingLinks ? "Menyimpan..." : "Simpan & Kirim Notif"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
