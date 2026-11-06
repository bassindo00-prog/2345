"use client";

import React, { useState } from "react";
import {
  X,
  Eye,
  Edit2,
  Play,
  Pause,
  CheckCircle2,
  ShieldAlert,
  Tag,
  Compass,
  Radio,
  User,
  Clock,
  Download,
  Trash2,
  Search,
  Filter,
  CheckSquare,
  Square,
  Disc,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import {
  adminTakedownReleaseAction,
  adminEditReleaseAction,
} from "@/app/actions/adminReleaseManagement";
import { bulkDeleteReleasesAction, updateReleaseLinksAction } from "@/app/actions/admin";

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

interface Track {
  id: string;
  title: string;
  audioUrl: string;
  composer: string | null;
  producer: string | null;
  lyrics: string | null;
  isrc: string | null;
  upc: string | null;
  tiktokClipStart: string | null;
}

interface Release {
  id: string;
  title: string;
  genre: string;
  language: string;
  primaryArtist: string;
  featuredArtist: string | null;
  releaseDate: string;
  coverArtworkUrl: string;
  status: string;
  spotifyUrl?: string;
  appleMusicUrl?: string;
  youtubeMusicUrl?: string;
  artistUserId: string;
  artistName: string;
  artistEmail: string;
  tracks: Track[];
}

export function MyReleasesList({ releases }: { releases: Release[] }) {
  const [list, setList] = useState<Release[]>(releases);
  const [selected, setSelected] = useState<Release | null>(null);

  // Selection & Search & Filter States
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArtist, setSelectedArtist] = useState("ALL");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination State (20 items per page)
  const [page, setPage] = useState(1);
  const LIMIT = 20;

  // Audio Player State
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Management states
  const [isEditing, setIsEditing] = useState(false);
  const [loadingTakedown, setLoadingTakedown] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);

  // Edit fields state
  const [editTitle, setEditTitle] = useState("");
  const [editGenre, setEditGenre] = useState("");
  const [editUpc, setEditUpc] = useState("");
  const [editIsrc, setEditIsrc] = useState("");

  // Link Modal State
  const [linkModal, setLinkModal] = useState<Release | null>(null);
  const [links, setLinks] = useState({ spotifyUrl: "", appleMusicUrl: "", youtubeMusicUrl: "" });
  const [savingLinks, setSavingLinks] = useState(false);

  const uniqueArtists = Array.from(new Set(list.map((r) => r.primaryArtist))).sort();

  // Filtered List
  const filteredList = list.filter((rel) => {
    const matchesSearch =
      rel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rel.primaryArtist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rel.featuredArtist &&
        rel.featuredArtist.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (rel.tracks?.[0]?.isrc &&
        rel.tracks[0].isrc.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (rel.tracks?.[0]?.upc &&
        rel.tracks[0].upc.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesArtist = selectedArtist === "ALL" || rel.primaryArtist === selectedArtist;
    return matchesSearch && matchesArtist;
  });

  // Pagination calculation
  const total = filteredList.length;
  const totalPages = Math.ceil(total / LIMIT) || 1;
  const safePage = Math.min(page, totalPages);
  const startItem = total > 0 ? (safePage - 1) * LIMIT + 1 : 0;
  const endItem = Math.min(safePage * LIMIT, total);
  const paginatedList = filteredList.slice((safePage - 1) * LIMIT, safePage * LIMIT);

  const isAllSelected =
    paginatedList.length > 0 && paginatedList.every((r) => selectedIds.includes(r.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      const pageIds = new Set(paginatedList.map((r) => r.id));
      setSelectedIds((prev) => prev.filter((id) => !pageIds.has(id)));
    } else {
      const pageIds = paginatedList.map((r) => r.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const toggleSelectOne = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const startEditing = (rel: Release) => {
    setEditTitle(rel.title);
    setEditGenre(rel.genre);
    setEditUpc(rel.tracks?.[0]?.upc || "");
    setEditIsrc(rel.tracks?.[0]?.isrc || "");
    setIsEditing(true);
  };

  const handleOpenLinkModal = (release: Release) => {
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
        linkModal.artistUserId,
        linkModal.artistName || "Artist",
        linkModal.artistEmail || "",
        linkModal.title,
        links
      );
      if (res.success) {
        setList((prev) =>
          prev.map((r) => (r.id === linkModal.id ? { ...r, ...links } : r))
        );
        setLinkModal(null);
        if (selected?.id === linkModal.id) {
          setSelected({ ...selected, ...links });
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

  const playAudio = (track: Track, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (playingTrackId === track.id) {
      audioElement?.pause();
      setPlayingTrackId(null);
    } else {
      audioElement?.pause();
      const audio = new Audio(resolveMediaUrl(track.audioUrl));
      setAudioElement(audio);
      setPlayingTrackId(track.id);
      audio.play().catch(() => setPlayingTrackId(null));
      audio.onended = () => {
        setPlayingTrackId(null);
      };
    }
  };

  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (
    url: string,
    filename: string,
    id: string,
    e?: React.MouseEvent
  ) => {
    e?.stopPropagation();
    setDownloadingId(id);
    try {
      const proxyUrl = `/api/download?url=${encodeURIComponent(
        url
      )}&filename=${encodeURIComponent(filename)}`;
      const res = await fetch(proxyUrl);
      if (res.ok) {
        const blob = await res.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
        return;
      }
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Failed to download file:", err);
      window.open(url, "_blank");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleTakedown = async (rel: Release) => {
    if (
      confirm(
        `Apakah Anda yakin ingin men-takedown rilisan "${rel.title}"? Status rilisan akan dirubah menjadi REJECTED dan dihilangkan dari My Releases.`
      )
    ) {
      setLoadingTakedown(true);
      const res = await adminTakedownReleaseAction(rel.id);
      setLoadingTakedown(false);
      if (res.error) {
        alert(res.error);
      } else {
        setList((prev) => prev.filter((item) => item.id !== rel.id));
        setSelected(null);
        audioElement?.pause();
        setPlayingTrackId(null);
      }
    }
  };

  const handleSingleDelete = async (rel: Release, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (
      confirm(
        `PERINGATAN: Apakah Anda yakin ingin menghapus permanen rilisan "${rel.title}" beserta semua lagunya? Data akan hilang dari database dan user.`
      )
    ) {
      setIsDeleting(true);
      const res = await bulkDeleteReleasesAction([rel.id]);
      setIsDeleting(false);
      if (res.error) {
        alert(res.error);
      } else {
        setList((prev) => prev.filter((item) => item.id !== rel.id));
        if (selected?.id === rel.id) setSelected(null);
        audioElement?.pause();
        setPlayingTrackId(null);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsDeleting(true);
    const res = await bulkDeleteReleasesAction(selectedIds);
    setIsDeleting(false);
    if (res.error) {
      alert(res.error);
    } else {
      setList((prev) => prev.filter((r) => !selectedIds.includes(r.id)));
      setSelectedIds([]);
      setShowDeleteConfirm(false);
      if (selected && selectedIds.includes(selected.id)) {
        setSelected(null);
      }
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;

    setLoadingEdit(true);
    const res = await adminEditReleaseAction(selected.id, {
      title: editTitle,
      genre: editGenre,
      upc: editUpc,
      isrc: editIsrc,
    });
    setLoadingEdit(false);

    if (res.error) {
      alert(res.error);
    } else {
      setList((prev) =>
        prev.map((item) => {
          if (item.id === selected.id) {
            const updatedTracks = item.tracks.map((t) => ({
              ...t,
              title: editTitle,
              upc: editUpc,
              isrc: editIsrc,
            }));
            return {
              ...item,
              title: editTitle,
              genre: editGenre,
              tracks: updatedTracks,
            };
          }
          return item;
        })
      );
      setIsEditing(false);
      setSelected(null);
    }
  };

  return (
    <div className="space-y-6 text-white pb-20">
      {/* Search & Filter Toolbar (Dark Luxury Glass) */}
      <div className="bg-[#241733]/90 border border-white/15 backdrop-blur-md p-4 md:p-6 rounded-3xl shadow-xl flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Bar */}
        <div className="relative w-full md:flex-1">
          <Search className="w-4 h-4 text-white/50 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari berdasarkan judul lagu, artis, ISRC, UPC..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="pl-11 pr-10 py-3 w-full bg-[#1a1024]/80 border border-white/20 text-white placeholder-white/40 rounded-2xl outline-none focus:border-[#c8f560] transition-all font-medium text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setPage(1);
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Artist Dropdown */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="w-4 h-4 text-white/50 hidden sm:inline" />
          <select
            value={selectedArtist}
            onChange={(e) => {
              setSelectedArtist(e.target.value);
              setPage(1);
            }}
            className="text-xs font-bold bg-[#1a1024] border border-white/20 text-white py-3 px-4 rounded-2xl outline-none focus:border-[#c8f560] cursor-pointer shadow-sm w-full md:w-auto"
          >
            <option value="ALL">Semua Artis ({uniqueArtists.length})</option>
            {uniqueArtists.map((artist) => (
              <option key={artist} value={artist}>
                {artist}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Info Status Bar */}
      <div className="flex justify-between items-center text-xs text-white/60 font-medium px-2">
        <div>
          {total > 0 ? (
            <span>
              Menampilkan <strong className="text-white">{startItem}-{endItem}</strong> dari{" "}
              <strong className="text-[#c8f560]">{total.toLocaleString("id-ID")}</strong> lagu aktif
            </span>
          ) : (
            "Tidak ada data rilisan"
          )}
        </div>
        {selectedIds.length > 0 && (
          <div className="text-[#1a1024] font-bold bg-[#c8f560] px-3.5 py-1 rounded-full shadow-sm">
            {selectedIds.length} rilisan dipilih
          </div>
        )}
      </div>

      {/* Table Container (Dark Purple Luxury) */}
      <div className="bg-gradient-to-br from-[#3b274e] via-[#2f1f40] to-[#1e132b] rounded-3xl border border-white/15 shadow-2xl overflow-hidden p-3 md:p-6">
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-left border-collapse min-w-[960px]">
            <thead>
              <tr className="bg-white/5 text-white/70 text-[11px] uppercase tracking-wider border-b border-white/15">
                <th className="p-3.5 font-bold pl-4 md:pl-6 w-12 text-center">
                  <div
                    onClick={toggleSelectAll}
                    className="cursor-pointer inline-flex items-center justify-center p-1 text-white/60 hover:text-[#c8f560]"
                    title={
                      isAllSelected
                        ? "Batal Pilih Halaman Ini"
                        : "Pilih Semua di Halaman Ini"
                    }
                  >
                    {isAllSelected ? (
                      <CheckSquare className="w-4 h-4 text-[#c8f560]" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th className="p-3.5 font-bold w-16 text-center">COVER</th>
                <th className="p-3.5 font-bold">JUDUL RILISAN & TRACK</th>
                <th className="p-3.5 font-bold">ARTIS UTAMA</th>
                <th className="p-3.5 font-bold">GENRE / BAHASA</th>
                <th className="p-3.5 font-bold text-center">TANGGAL RILIS</th>
                <th className="p-3.5 font-bold text-center">STATUS</th>
                <th className="p-3.5 font-bold text-center pr-4 md:pr-6">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-sm">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-16 text-center text-white/60">
                    <div className="flex flex-col items-center justify-center">
                      <Disc className="w-12 h-12 text-white/30 mb-3 animate-spin" />
                      <p className="font-bold text-white text-base">
                        Tidak ada rilisan ditemukan
                      </p>
                      <p className="text-xs text-white/60 mt-1">
                        Coba ubah kata kunci pencarian atau filter artis.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedList.map((rel) => {
                  const isChecked = selectedIds.includes(rel.id);
                  const firstTrack = rel.tracks?.[0];
                  const isPlaying = firstTrack && playingTrackId === firstTrack.id;

                  return (
                    <tr
                      key={rel.id}
                      onClick={() => {
                        setSelected(rel);
                        setIsEditing(false);
                      }}
                      className={`hover:bg-white/10 transition cursor-pointer group ${
                        isChecked ? "bg-[#c8f560]/10 border-l-2 border-[#c8f560]" : ""
                      }`}
                    >
                      {/* Checkbox Column */}
                      <td
                        className="p-3.5 pl-4 md:pl-6 text-center"
                        onClick={(e) => toggleSelectOne(rel.id, e)}
                      >
                        <div className="cursor-pointer inline-flex items-center justify-center p-1">
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-[#c8f560]" />
                          ) : (
                            <Square className="w-4 h-4 text-white/40 group-hover:text-white" />
                          )}
                        </div>
                      </td>

                      {/* Cover Thumbnail */}
                      <td
                        className="p-3.5 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-black/40 border border-white/20 mx-auto group/thumb shadow-sm">
                          <img
                            src={resolveMediaUrl(rel.coverArtworkUrl)}
                            onError={(e) => {
                              e.currentTarget.src = FALLBACK_VINYL;
                            }}
                            alt={rel.title}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                          {firstTrack && (
                            <button
                              onClick={(e) => playAudio(firstTrack, e)}
                              className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover/thumb:opacity-100 transition"
                              title={isPlaying ? "Pause" : "Play Audio"}
                            >
                              {isPlaying ? (
                                <Pause className="w-4 h-4 fill-current text-[#c8f560]" />
                              ) : (
                                <Play className="w-4 h-4 fill-current text-[#c8f560] ml-0.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Title & Track Details */}
                      <td className="p-3.5">
                        <div className="flex flex-col">
                          <span className="font-bold text-white text-sm group-hover:text-[#c8f560] transition truncate max-w-xs">
                            {rel.title}
                          </span>
                          <div className="flex items-center gap-2 text-[10px] text-white/60 mt-0.5 font-mono">
                            {firstTrack?.isrc && (
                              <span className="bg-white/10 px-1.5 py-0.5 rounded text-[#c8f560] border border-white/10">
                                {firstTrack.isrc}
                              </span>
                            )}
                            {firstTrack?.upc && (
                              <span className="bg-white/10 px-1.5 py-0.5 rounded text-white/80 border border-white/10">
                                UPC: {firstTrack.upc}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Primary Artist & Feat */}
                      <td className="p-3.5">
                        <div className="flex flex-col">
                          <span className="font-semibold text-white text-sm">
                            {rel.primaryArtist}
                          </span>
                          {rel.featuredArtist && (
                            <span className="text-xs text-white/50">
                              feat. {rel.featuredArtist}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Genre & Language */}
                      <td className="p-3.5 text-xs font-medium text-white/70">
                        <span className="inline-flex items-center gap-1 bg-white/10 text-white px-2.5 py-1 rounded-lg border border-white/10">
                          <Compass className="w-3 h-3 text-[#c8f560]" />
                          {rel.genre}
                        </span>
                      </td>

                      {/* Release Date */}
                      <td className="p-3.5 text-xs font-medium text-white/70 text-center whitespace-nowrap">
                        {(() => {
                          const d = new Date(rel.releaseDate);
                          return isNaN(d.getTime())
                            ? "-"
                            : d.toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              });
                        })()}
                      </td>

                      {/* Status Badge */}
                      <td className="p-3.5 text-center">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 bg-[#c8f560] text-[#312042] rounded-full shadow-sm whitespace-nowrap">
                          <CheckCircle2 className="w-3 h-3" /> APPROVED
                        </span>
                      </td>

                      {/* Actions */}
                      <td
                        className="p-3.5 pr-4 md:pr-6 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Play Button */}
                          {firstTrack && (
                            <button
                              onClick={(e) => playAudio(firstTrack, e)}
                              className={`w-8 h-8 rounded-xl flex items-center justify-center transition shadow-sm cursor-pointer ${
                                isPlaying
                                  ? "bg-[#c8f560] text-[#1a1024]"
                                  : "bg-white/15 text-white hover:bg-white/25"
                              }`}
                              title={isPlaying ? "Pause" : "Play"}
                            >
                              {isPlaying ? (
                                <Pause className="w-3.5 h-3.5" />
                              ) : (
                                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                              )}
                            </button>
                          )}

                          {/* Download Audio */}
                          {firstTrack && (
                            <button
                              onClick={(e) =>
                                handleDownload(
                                  firstTrack.audioUrl,
                                  `${rel.title} - ${firstTrack.title}.mp3`,
                                  firstTrack.id,
                                  e
                                )
                              }
                              disabled={downloadingId === firstTrack.id}
                              className="w-8 h-8 rounded-xl bg-white/15 text-white hover:bg-[#c8f560] hover:text-[#1a1024] flex items-center justify-center transition shadow-sm disabled:opacity-50 cursor-pointer"
                              title="Download Master Audio"
                            >
                              {downloadingId === firstTrack.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Download className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}

                          {/* View / Edit Button */}
                          <button
                            onClick={() => {
                              setSelected(rel);
                              setIsEditing(false);
                            }}
                            className="w-8 h-8 rounded-xl bg-white/15 text-white hover:bg-white/25 flex items-center justify-center transition shadow-sm cursor-pointer"
                            title="Detail & Edit Metadata"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#c8f560]" />
                          </button>

                          {/* Delete Single */}
                          <button
                            onClick={(e) => handleSingleDelete(rel, e)}
                            disabled={isDeleting}
                            className="w-8 h-8 rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/40 flex items-center justify-center transition shadow-sm cursor-pointer"
                            title="Hapus Rilisan Ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-white/15 text-xs text-white/70">
            <span>
              Halaman <strong className="text-white">{safePage}</strong> dari{" "}
              <strong className="text-white">{totalPages}</strong> ({total} total lagu)
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="p-2 rounded-xl bg-white/10 border border-white/15 text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pNum = i + 1;
                if (totalPages > 5) {
                  if (safePage > 3) {
                    pNum = safePage - 2 + i;
                    if (pNum > totalPages) pNum = totalPages - (4 - i);
                  }
                }
                return (
                  <button
                    key={pNum}
                    onClick={() => setPage(pNum)}
                    className={`w-8 h-8 rounded-xl font-bold transition ${
                      safePage === pNum
                        ? "bg-[#c8f560] text-[#1a1024] shadow-md shadow-[#c8f560]/20"
                        : "bg-white/10 border border-white/15 text-white hover:bg-white/20"
                    }`}
                  >
                    {pNum}
                  </button>
                );
              })}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="p-2 rounded-xl bg-white/10 border border-white/15 text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1a1024]/95 backdrop-blur-xl text-white px-6 py-4 rounded-3xl shadow-2xl border border-white/20 flex items-center gap-6 animate-in fade-in slide-in-from-bottom-5">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-[#c8f560] animate-pulse" />
            <span className="text-sm font-bold">{selectedIds.length} rilisan terpilih</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIds([])}
              className="px-4 py-2 text-xs font-bold text-white/60 hover:text-white transition"
            >
              Batal
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-red-600/30 flex items-center gap-1.5 transition active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
              Hapus Terpilih ({selectedIds.length})
            </button>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-[#2f1f40] via-[#241733] to-[#1a1024] border border-white/20 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-4 text-white">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-300 flex items-center justify-center mx-auto mb-2">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-1">Konfirmasi Hapus Rilisan</h3>
              <p className="text-sm text-white/70">
                Anda akan menghapus{" "}
                <span className="font-bold text-red-400">
                  {selectedIds.length} lagu/rilisan
                </span>{" "}
                secara permanen dari database & panel artis. Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="max-h-48 overflow-y-auto bg-black/40 rounded-2xl p-3 space-y-1.5 border border-white/10">
              {list
                .filter((r) => selectedIds.includes(r.id))
                .map((r) => (
                  <div
                    key={r.id}
                    className="text-xs font-semibold text-white/80 flex items-center justify-between"
                  >
                    <span className="truncate max-w-[200px]">{r.title}</span>
                    <span className="text-white/50 text-[10px]">{r.primaryArtist}</span>
                  </div>
                ))}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 py-3 text-xs font-bold text-white/70 hover:bg-white/10 rounded-2xl transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-red-600/30 flex items-center justify-center gap-1.5 transition"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {isDeleting ? "Menghapus..." : "Ya, Hapus Sekarang"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail & Edit Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[99998] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => {
            setSelected(null);
            setIsEditing(false);
            audioElement?.pause();
            setPlayingTrackId(null);
          }}
        >
          <div
            className="bg-gradient-to-br from-[#2f1f40] via-[#241733] to-[#1a1024] border border-white/20 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative p-6 pb-4 bg-white/5 border-b border-white/15 rounded-t-3xl">
              <button
                onClick={() => {
                  setSelected(null);
                  setIsEditing(false);
                  audioElement?.pause();
                  setPlayingTrackId(null);
                }}
                className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex gap-5 items-center">
                <div className="relative w-20 h-20 rounded-2xl bg-black/40 overflow-hidden shadow-lg border border-white/20 group/cover shrink-0">
                  <img
                    src={resolveMediaUrl(selected.coverArtworkUrl)}
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_VINYL;
                    }}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={(e) =>
                        handleDownload(
                          selected.coverArtworkUrl,
                          `${selected.title} - Cover.jpg`,
                          "cover",
                          e
                        )
                      }
                      disabled={downloadingId === "cover"}
                      className="p-2 bg-white/20 hover:bg-[#c8f560] hover:text-[#1a1024] rounded-full transition text-white disabled:opacity-50"
                      title="Download Cover"
                    >
                      {downloadingId === "cover" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-extrabold tracking-widest bg-[#c8f560] text-[#1a1024] px-2.5 py-0.5 rounded-full uppercase">
                    Released Catalog
                  </span>
                  <h2 className="text-xl font-bold mt-1.5 truncate text-white">
                    {selected.title}
                  </h2>
                  <p className="text-white/70 text-sm truncate">
                    by {selected.primaryArtist}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {isEditing ? (
                /* EDIT FORM */
                <form
                  onSubmit={handleEditSubmit}
                  className="space-y-4 bg-white/5 p-5 rounded-2xl border border-white/15"
                >
                  <h4 className="font-bold text-white text-sm flex items-center gap-1.5 mb-2">
                    <Edit2 className="w-4 h-4 text-[#c8f560]" /> Edit Detail Rilisan
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-white/70 uppercase">
                        Song Title
                      </label>
                      <input
                        required
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full text-sm p-3 border border-white/20 rounded-xl bg-[#1a1024]/80 text-white outline-none focus:border-[#c8f560] transition"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-white/70 uppercase">
                        Genre
                      </label>
                      <input
                        required
                        type="text"
                        value={editGenre}
                        onChange={(e) => setEditGenre(e.target.value)}
                        className="w-full text-sm p-3 border border-white/20 rounded-xl bg-[#1a1024]/80 text-white outline-none focus:border-[#c8f560] transition"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-white/70 uppercase">
                        UPC Code
                      </label>
                      <input
                        type="text"
                        value={editUpc}
                        onChange={(e) => setEditUpc(e.target.value)}
                        placeholder="Automatic if empty"
                        className="w-full text-sm p-3 border border-white/20 rounded-xl bg-[#1a1024]/80 text-white outline-none focus:border-[#c8f560] transition font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-white/70 uppercase">
                        ISRC Code
                      </label>
                      <input
                        type="text"
                        value={editIsrc}
                        onChange={(e) => setEditIsrc(e.target.value)}
                        placeholder="Automatic if empty"
                        className="w-full text-sm p-3 border border-white/20 rounded-xl bg-[#1a1024]/80 text-white outline-none focus:border-[#c8f560] transition font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-xs font-bold text-white/60 hover:text-white transition"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={loadingEdit}
                      className="px-5 py-2.5 text-xs font-black text-[#1a1024] bg-[#c8f560] hover:bg-[#d8ff75] rounded-xl shadow-lg transition flex items-center gap-1.5"
                    >
                      {loadingEdit && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Simpan Perubahan
                    </button>
                  </div>
                </form>
              ) : (
                /* Specs Grid */
                <div className="grid grid-cols-2 gap-3.5">
                  <SpecItem
                    label="Genre"
                    value={selected.genre}
                    icon={<Compass className="w-4 h-4 text-[#c8f560]" />}
                  />
                  <SpecItem
                    label="Bahasa"
                    value={selected.language}
                    icon={<Radio className="w-4 h-4 text-[#c8f560]" />}
                  />
                  <SpecItem
                    label="TikTok Clip Start"
                    value={
                      selected.tracks?.[0]?.tiktokClipStart
                        ? `Detik ${selected.tracks?.[0]?.tiktokClipStart}`
                        : "-"
                    }
                    icon={<Clock className="w-4 h-4 text-[#c8f560]" />}
                  />
                  <SpecItem
                    label="Artis Terdaftar"
                    value={selected.artistName}
                    icon={<User className="w-4 h-4 text-[#c8f560]" />}
                  />
                  <SpecItem
                    label="ISRC"
                    value={selected.tracks?.[0]?.isrc || "-"}
                    icon={<Tag className="w-4 h-4 text-[#c8f560]" />}
                  />
                  <SpecItem
                    label="UPC"
                    value={selected.tracks?.[0]?.upc || "-"}
                    icon={<Tag className="w-4 h-4 text-[#c8f560]" />}
                  />
                  <SpecItem
                    label="Composer"
                    value={selected.tracks?.[0]?.composer || "-"}
                    icon={<User className="w-4 h-4 text-[#c8f560]" />}
                  />
                  <SpecItem
                    label="Producer"
                    value={selected.tracks?.[0]?.producer || "-"}
                    icon={<User className="w-4 h-4 text-[#c8f560]" />}
                  />
                </div>
              )}

              {/* Audio Play preview inside modal */}
              {!isEditing &&
                selected.tracks &&
                selected.tracks.length > 0 &&
                selected.tracks[0] && (
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => playAudio(selected.tracks[0]!, e)}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                          playingTrackId === selected.tracks[0].id
                            ? "bg-[#c8f560] text-[#1a1024] shadow-lg shadow-[#c8f560]/30"
                            : "bg-white/15 text-white hover:bg-white/25"
                        }`}
                      >
                        {playingTrackId === selected.tracks[0].id ? (
                          <span className="w-3.5 h-3.5 border-2 border-[#1a1024] border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        )}
                      </button>
                      <div>
                        <p className="font-bold text-white text-sm">
                          {selected.tracks[0].title}
                        </p>
                        <p className="text-xs text-white/60">Audio Preview</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) =>
                        handleDownload(
                          selected.tracks[0].audioUrl,
                          `${selected.title} - ${selected.tracks[0].title}.mp3`,
                          selected.tracks[0].id,
                          e
                        )
                      }
                      disabled={downloadingId === selected.tracks[0].id}
                      className="h-10 px-4 rounded-xl bg-white/15 hover:bg-[#c8f560] hover:text-[#1a1024] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition disabled:opacity-50 cursor-pointer"
                    >
                      {downloadingId === selected.tracks[0].id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                      {downloadingId === selected.tracks[0].id ? "Downloading..." : "Download"}
                    </button>
                  </div>
                )}

              {/* Management Control Buttons */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-white/15">
                {!isEditing && (
                  <button
                    onClick={() => startEditing(selected)}
                    className="flex-1 min-w-[130px] h-12 bg-white/10 hover:bg-white/20 text-white transition font-bold rounded-2xl flex items-center justify-center gap-2 text-xs cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4 text-[#c8f560]" />
                    Edit Metadata
                  </button>
                )}

                <button
                  onClick={() => handleOpenLinkModal(selected)}
                  className="flex-1 min-w-[130px] h-12 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 transition font-bold rounded-2xl flex items-center justify-center gap-2 text-xs cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4 text-[#c8f560]" />
                  Input Link DSP
                </button>

                <button
                  onClick={() => handleTakedown(selected)}
                  disabled={loadingTakedown}
                  className="flex-1 min-w-[130px] h-12 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 transition font-bold rounded-2xl flex items-center justify-center gap-2 text-xs cursor-pointer"
                >
                  {loadingTakedown ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ShieldAlert className="w-4 h-4" />
                  )}
                  Takedown
                </button>

                <button
                  onClick={(e) => handleSingleDelete(selected, e)}
                  disabled={isDeleting}
                  className="flex-1 min-w-[130px] h-12 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-200 transition font-bold rounded-2xl flex items-center justify-center gap-2 text-xs cursor-pointer"
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Hapus Permanen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Link Modal */}
      {linkModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-gradient-to-br from-[#2f1f40] via-[#241733] to-[#1a1024] border border-white/20 rounded-3xl p-6 w-full max-w-md shadow-2xl relative text-white">
            <button
              onClick={() => setLinkModal(null)}
              className="absolute top-4 right-4 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-1">Input Link Rilisan (DSP)</h3>
            <p className="text-xs text-white/60 mb-6">
              Masukkan link DSP untuk membuat Smartlink otomatis dan mengirim notifikasi email ke artis.
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
                  className="w-full px-3 py-2.5 bg-[#1a1024]/80 border border-white/20 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#c8f560]"
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
                  className="w-full px-3 py-2.5 bg-[#1a1024]/80 border border-white/20 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#c8f560]"
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
                  className="w-full px-3 py-2.5 bg-[#1a1024]/80 border border-white/20 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#c8f560]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  onClick={() => setLinkModal(null)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveLinks}
                  disabled={savingLinks}
                  className="px-4 py-2 bg-[#c8f560] hover:bg-[#d8ff75] text-[#1a1024] text-sm font-black rounded-xl disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  {savingLinks && <Loader2 className="w-4 h-4 animate-spin" />}
                  {savingLinks ? "Menyimpan..." : "Simpan & Kirim Email"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SpecItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10">
      <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-white truncate">{value}</p>
      </div>
    </div>
  );
}

export default MyReleasesList;
