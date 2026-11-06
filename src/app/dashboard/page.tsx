"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ALL_DSP_PLATFORMS } from "@/lib/dspPlatforms";
import { THEMES, type ThemeId } from "@/lib/theme";
import {
  Home,
  Activity,
  Calendar,
  MessageSquare,
  Settings,
  LogOut,
  Sun,
  Bell,
  Plus,
  Check,
  Clock,
  Music,
  FolderOpen,
  Globe,
  Trash2,
  Volume2,
  Building2,
  Smartphone,
  ChevronDown,
  ArrowRight,
  Shield,
  UploadCloud,
  User,
  Users,
  Mic2,
  Lock,
  Sliders,
  CheckCircle2,
  Inbox,
  Mail,
  Send,
  Sparkles,
  Wand2,
  Palette,
  ListMusic,
  HardDrive,
  Search,
  Copy,
  ExternalLink,
  Menu,
  X,
  Loader2,
  AlertCircle,
  XCircle,
  RefreshCw,
  Banknote,
  Wallet,
  TrendingUp,
} from "lucide-react";
import GlobalStreamsMap3D from "@/components/GlobalStreamsMap3D";
import VisaMetricCard from "@/components/VisaMetricCard";
import AICoverArtGenerator from "@/components/AICoverArtGenerator";
import Pagination from "@/components/Pagination";

type ReleaseItem = {
  id: string;
  title: string;
  artist: string;
  genre: string;
  releaseDate: string;
  duration: string;
  streams: string;
  streamsNum: number;
  platform: string;
  platforms: string;
  status: string;
  coverUrl: string;
  audioFile?: string;
  upc?: string;
  isrc?: string;
  country?: string;
  royaltyGrowth?: string;
};

type WithdrawalItem = {
  id: string;
  date: string;
  amount: number;
  method: string;
  accountNumber: string;
  accountHolder?: string;
  status: string;
};

type CatalogItem = {
  id: string;
  songId: string;
  title: string;
  artist: string;
  publisher: string;
  status: string;
  youtubeLink?: string | null;
  driveLink?: string | null;
  createdAt?: string;
};

type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  totalStreams: number;
  royaltyBalance: number;
  royaltyPending: number;
  totalWithdrawn: number;
  pendingWithdraw: number;
  royaltyMonth?: string;
  releases: ReleaseItem[];
  withdrawals: WithdrawalItem[];
};

const OVERVIEW_CHART_POINTS = [
  { day: "Mon", x: 18, y: 55, val: 32 },
  { day: "Tue", x: 68, y: 62, val: 28 },
  { day: "Wed", x: 115, y: 66, val: 24 },
  { day: "Thu", x: 160, y: 42, val: 41 },
  { day: "Fri", x: 205, y: 21, val: 56 },
  { day: "Sat", x: 260, y: 58, val: 35 },
  { day: "Sun", x: 306, y: 34, val: 48 },
];

const ANALYTICS_CHART_POINTS = [
  { month: "Jan", x: 12, y: 52, val: 54 },
  { month: "Feb", x: 52, y: 56, val: 48 },
  { month: "Apr", x: 88, y: 68, val: 39 },
  { month: "May", x: 125, y: 39, val: 68 },
  { month: "Jun", x: 161, y: 21, val: 90 },
  { month: "Jul", x: 208, y: 54, val: 62 },
  { month: "now", x: 250, y: 30, val: 84 },
];

// Shared card class matching the "Royalty Growth" translucent lavender card
const Youtube = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const ROYALTY_CARD =
  "bg-[#8a88b5]/70 border border-white/20 rounded-[28px] p-6 text-white shadow-lg";

const formatNumberWithDots = (val: string | number) => {
  if (val === undefined || val === null || val === "") return "";
  const clean = String(val).replace(/[^0-9]/g, "");
  return clean ? Number(clean).toLocaleString("id-ID") : "";
};

const parseFormattedNumber = (val: string | number) => {
  const clean = String(val).replace(/[^0-9]/g, "");
  return clean ? Number(clean) : 0;
};

export default function UserDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "analytics"
    | "catalog"
    | "releases"
    | "in-review"
    | "rejected"
    | "wallet"
    | "upload"
    | "inbox"
    | "settings"
    | "generator"
    | "artists"
  >("overview");
  const [period, setPeriod] = useState<"Daily" | "Weekly" | "Monthly">("Daily");
  const [theme, setTheme] = useState<ThemeId>("purple");

  useEffect(() => {
    const saved = localStorage.getItem("breakout_theme");
    if (saved && ["purple", "dark", "white", "blue", "yellow"].includes(saved)) {
      setTheme(saved as ThemeId);
    } else {
      setTheme("purple");
      localStorage.setItem("breakout_theme", "purple");
    }
  }, []);

  const changeTheme = (newTheme: ThemeId) => {
    setTheme(newTheme);
    localStorage.setItem("breakout_theme", newTheme);
  };

  const currentTheme = THEMES.find((t) => t.id === theme) || THEMES[0];
  const [user, setUser] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [catalogs, setCatalogs] = useState<CatalogItem[]>([]);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogPublisherFilter, setCatalogPublisherFilter] = useState("ALL");
  const [catalogSource, setCatalogSource] = useState<"master" | "damarlangit">("master");
  const [damarSongs, setDamarSongs] = useState<any[]>([]);
  const [damarTotal, setDamarTotal] = useState(0);
  const [damarLoading, setDamarLoading] = useState(false);
  const [damarPage, setDamarPage] = useState(1);
  const [copiedSongId, setCopiedSongId] = useState("");
  const [pageReleases, setPageReleases] = useState(1);
  const [pageCatalog, setPageCatalog] = useState(1);

  useEffect(() => {
    setPageReleases(1);
    setPageCatalog(1);
  }, [activeTab]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Artist Management State (Daftar & Buat Profil Artis)
  const [userArtists, setUserArtists] = useState<any[]>([]);
  const [artistModalOpen, setArtistModalOpen] = useState(false);
  const [newArtistName, setNewArtistName] = useState("");
  const [newArtistGenre, setNewArtistGenre] = useState("Pop");
  const [newArtistSpotify, setNewArtistSpotify] = useState("");
  const [newArtistApple, setNewArtistApple] = useState("");
  const [newArtistPhoto, setNewArtistPhoto] = useState("");
  const [newArtistBio, setNewArtistBio] = useState("");
  const [savingArtist, setSavingArtist] = useState(false);

  // Cover Art Generator State & Link to Submit Track
  const [uploadCoverUrl, setUploadCoverUrl] = useState(
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80"
  );

  // Settings Form State
  const [settingsName, setSettingsName] = useState("Abdul");
  const [settingsEmail, setSettingsEmail] = useState("abdul@breakout.id");
  const [settingsAvatar, setSettingsAvatar] = useState(
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
  );
  const [settingsPassword, setSettingsPassword] = useState("");
  const [settingsLabelName, setSettingsLabelName] = useState("BREAKOUT Music Distribution");
  const [settingsIsrcPrefix, setSettingsIsrcPrefix] = useState("US-HRM-26");
  const [autoContentId, setAutoContentId] = useState(true);
  const [dolbyAtmos, setDolbyAtmos] = useState(true);
  const [autoPayout, setAutoPayout] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // Animation states (0 -> 1 smooth progress on mount, tab change, or period switch)
  const [animProgress, setAnimProgress] = useState(0);
  const [barsReady, setBarsReady] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const [hoveredDayIdx, setHoveredDayIdx] = useState<number>(4);
  const [hoveredMonthIdx, setHoveredMonthIdx] = useState<number>(4);
  const [liveTick, setLiveTick] = useState(0);

  // Upload Track Form State (Default dikosongkan agar user mengetik sendiri)
  const [trackTitle, setTrackTitle] = useState("");
  const [trackArtist, setTrackArtist] = useState("");
  const [trackFeaturing, setTrackFeaturing] = useState("");
  const [trackComposer, setTrackComposer] = useState("");
  const [trackProducer, setTrackProducer] = useState("");
  const [trackGenre, setTrackGenre] = useState("Electronic • Downtempo");
  const [tiktokStartSec, setTiktokStartSec] = useState(45); // 00:45
  const [tiktokDurationSec, setTiktokDurationSec] = useState(30); // 30s clip
  const [trackDateIso, setTrackDateIso] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });
  const [trackUpc, setTrackUpc] = useState("899214578109");
  const [trackIsrc, setTrackIsrc] = useState("ID-HRM-24-00109");
  const [audioFileName, setAudioFileName] = useState("audio_preview_final.wav");
  const [audioFileKey, setAudioFileKey] = useState<string>("");
  const [audioFileUrl, setAudioFileUrl] = useState<string>("");
  const [audioFileSize, setAudioFileSize] = useState<string>("");
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [uploadCoverKey, setUploadCoverKey] = useState<string>("");
  const [uploadingCover, setUploadingCover] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(() =>
    ALL_DSP_PLATFORMS.map((p) => p.name)
  );
  const [submittingTrack, setSubmittingTrack] = useState(false);

  // New states for deferred upload on Review & Submit
  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
  const [localAudioPreviewUrl, setLocalAudioPreviewUrl] = useState<string>("");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewStatusStep, setReviewStatusStep] = useState<string>("");
  const [reviewError, setReviewError] = useState<string>("");
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Safe JSON response parser to prevent crashing on plain text or HTML errors
  const safeParseJson = async (res: Response) => {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return { ok: false, error: text || `HTTP ${res.status}: ${res.statusText}` };
    }
  };

  // Safe Selection of Audio File (Stored locally until Review & Submit)
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedAudioFile(file);
    setAudioFileName(file.name);
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2) + " MB";
    setAudioFileSize(sizeMB);
    const localUrl = URL.createObjectURL(file);
    setLocalAudioPreviewUrl(localUrl);
    setAudioFileUrl(localUrl);
    showNotice(`✓ File audio "${file.name}" (${sizeMB}) dipilih. Proses upload akan berjalan saat klik Review & Submit.`);
  };

  // Safe Selection of Cover Artwork (Stored locally until Review & Submit)
  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedCoverFile(file);
    const localUrl = URL.createObjectURL(file);
    setUploadCoverUrl(localUrl);
    showNotice(`✓ Cover Artwork "${file.name}" dipilih.`);
  };

  // Robust Chunked Uploader to Cloudflare R2 (Bypasses Vercel 4.5MB 413 error and R2 CORS)
  const uploadFileWithFallback = async (
    file: File,
    fileType: "audio" | "cover",
    onProgress?: (msg: string) => void
  ) => {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2) + " MB";
    const CHUNK_SIZE = 3 * 1024 * 1024; // 3 MB per slice (strictly < 4.5MB Vercel limit)

    // Strategy A: If file is larger than 3.5 MB, slice into 3MB chunks
    // Every chunk is only 3MB, so Vercel NEVER throws FUNCTION_PAYLOAD_TOO_LARGE!
    if (file.size > 3.5 * 1024 * 1024) {
      const uploadId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const totalParts = Math.ceil(file.size / CHUNK_SIZE);

      for (let i = 0; i < totalParts; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(file.size, start + CHUNK_SIZE);
        const chunkBlob = file.slice(start, end);
        const percent = Math.round(((i + 1) / totalParts) * 100);

        onProgress?.(
          `Mengunggah ${fileType === "audio" ? "Master Audio" : "File"} Part ${i + 1}/${totalParts} (${percent}%)...`
        );

        const formData = new FormData();
        formData.append("file", chunkBlob, file.name);
        formData.append("uploadId", uploadId);
        formData.append("partIndex", String(i));
        formData.append("fileType", fileType);

        const chunkRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const chunkData = await safeParseJson(chunkRes);
        if (!chunkRes.ok || !chunkData.ok) {
          throw new Error(
            chunkData.error || `Gagal mengunggah part ${i + 1} (${chunkRes.status})`
          );
        }
      }

      onProgress?.("Menggabungkan file dan memvalidasi di Cloudflare R2...");
      const assembleRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "assemble_chunks",
          uploadId,
          totalParts,
          fileName: file.name,
          contentType: file.type || (fileType === "audio" ? "audio/mpeg" : "image/jpeg"),
          fileType,
        }),
      });

      const assembleData = await safeParseJson(assembleRes);
      if (!assembleRes.ok || !assembleData.ok || !assembleData.key) {
        throw new Error(assembleData.error || "Gagal menggabungkan chunk audio di R2.");
      }

      return {
        key: assembleData.key,
        publicUrl: `/api/storage/${assembleData.key}`,
      };
    }

    // Strategy B: For small files (<= 3.5 MB, e.g. Cover Art), upload in single request
    onProgress?.(`Mengunggah ${file.name} (${sizeMB})...`);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileType", fileType);

    const singleRes = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const singleData = await safeParseJson(singleRes);
    if (!singleRes.ok || !singleData.ok || !singleData.key) {
      const errMsg = singleData.error || `Server upload error (HTTP ${singleRes.status}): ${singleRes.statusText}`;
      throw new Error(
        `Upload gagal (${fileType === "audio" ? "Master Audio" : "Cover Artwork"}): ${errMsg}`
      );
    }

    return {
      key: singleData.key,
      publicUrl: `/api/storage/${singleData.key}`,
    };
  };

  // Open Review & Submit Modal
  const handleOpenReviewModal = () => {
    if (!trackTitle.trim()) {
      showNotice("Silakan isi Judul Track (Title) terlebih dahulu!");
      return;
    }
    if (!selectedAudioFile && !audioFileKey) {
      showNotice("Silakan pilih file Audio (.wav, .mp3, .flac) terlebih dahulu!");
      return;
    }
    setReviewError("");
    setReviewSuccess(false);
    setReviewStatusStep("");
    setReviewSubmitting(false);
    setShowReviewModal(true);
  };

  // Execute Upload and Submit Release inside Review Modal
  const executeUploadAndSubmitRelease = async () => {
    setReviewSubmitting(true);
    setReviewError("");
    setReviewSuccess(false);

    try {
      let finalAudioKey = audioFileKey;
      let finalAudioUrl = audioFileUrl;
      let finalCoverKey = uploadCoverKey;
      let finalCoverUrl = uploadCoverUrl;

      // 1. Upload Master Audio if selected
      if (selectedAudioFile) {
        setReviewStatusStep(`Mengunggah Master Audio: ${selectedAudioFile.name} (${audioFileSize})...`);
        const audioUploadResult = await uploadFileWithFallback(selectedAudioFile, "audio", (msg) => {
          setReviewStatusStep(msg);
        });
        finalAudioKey = audioUploadResult.key;
        finalAudioUrl = audioUploadResult.publicUrl;
        setAudioFileKey(finalAudioKey);
        setAudioFileUrl(finalAudioUrl);
      } else if (!finalAudioKey) {
        throw new Error("File master audio belum dipilih atau diunggah.");
      }

      // 2. Upload Cover Artwork if selected
      if (selectedCoverFile) {
        setReviewStatusStep(`Mengunggah Cover Artwork: ${selectedCoverFile.name}...`);
        const coverUploadResult = await uploadFileWithFallback(selectedCoverFile, "cover", (msg) => {
          setReviewStatusStep(msg);
        });
        finalCoverKey = coverUploadResult.key;
        finalCoverUrl = coverUploadResult.publicUrl;
        setUploadCoverKey(finalCoverKey);
        setUploadCoverUrl(finalCoverUrl);
      }

      // 3. Submit Release Metadata to Database
      setReviewStatusStep("Mendaftarkan rilisan ke database...");
      const res = await fetch("/api/releases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trackTitle,
          artist: trackFeaturedArtistLabel(),
          featuring: trackFeaturing,
          composer: trackComposer,
          producer: trackProducer,
          tiktokClip: formattedTiktokClip,
          genre: trackGenre,
          releaseDate: formattedReleaseDate,
          upc: trackUpc,
          isrc: trackIsrc,
          coverUrl: finalCoverUrl,
          coverKey: finalCoverKey,
          audioFile: finalAudioUrl || audioFileName,
          audioKey: finalAudioKey,
          platforms: selectedPlatforms.join(","),
          status: "Pending",
        }),
      });

      const data = await safeParseJson(res);
      if (!res.ok || data.ok === false) {
        throw new Error(data.error || "Gagal mendaftarkan rilis ke sistem.");
      }

      // 4. Success! Refresh user data
      await fetchUserData();
      setReviewSuccess(true);
      setReviewStatusStep("✓ Rilisan berhasil dikirim!");
      showNotice("Selamat! Rilisan Anda berhasil dikirim.");
    } catch (err: any) {
      console.error("Submit release error:", err);
      setReviewError(err.message || "Terjadi kesalahan saat memproses upload audio/cover.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Format seconds to MM:SS for TikTok Clip
  const formatSec = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const formattedTiktokClip = `${formatSec(tiktokStartSec)} - ${formatSec(
    tiktokStartSec + tiktokDurationSec
  )} (${tiktokDurationSec}s)`;

  // Format YYYY-MM-DD to DD-MM-YYYY automatically
  const formattedReleaseDate = (() => {
    const parts = trackDateIso.split("-");
    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    return trackDateIso;
  })();

  // Set automatic release date by offset days without typing
  const applyQuickDate = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    setTrackDateIso(d.toISOString().split("T")[0]);
  };

  // Withdrawal Form State
  const [withdrawMethod, setWithdrawMethod] = useState("Bank • BCA");
  const [accountNumber, setAccountNumber] = useState("1234 5678 9012 3456");
  const [accountHolder, setAccountHolder] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [submittingWithdraw, setSubmittingWithdraw] = useState(false);

  const showNotice = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  const handleCopySongId = (songId: string) => {
    navigator.clipboard?.writeText(songId);
    setCopiedSongId(songId);
    showNotice(`Song ID ${songId} berhasil disalin!`);
    setTimeout(() => setCopiedSongId(""), 2000);
  };

  useEffect(() => {
    setAnimProgress(0);
    setBarsReady(false);
    setAnimKey((prev) => prev + 1);

    const barTimer = setTimeout(() => setBarsReady(true), 80);

    let frameId: number;
    const startTime = performance.now();
    const duration = 1250;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimProgress(eased);
      if (t < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      clearTimeout(barTimer);
      cancelAnimationFrame(frameId);
    };
  }, [activeTab, period]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveTick((prev) => (prev + 1) % 100);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        setSettingsName(data.user.name || "Abdul");
        setSettingsEmail(data.user.email || "abdul@breakout.id");
        if (data.user.avatar) setSettingsAvatar(data.user.avatar);
        setAccountHolder((prev) => prev || data.user.name || "");
      }
      // Also fetch messages for inbox
      const msgRes = await fetch("/api/messages");
      const msgData = await msgRes.json();
      if (msgData.messages) {
        setMessages(msgData.messages);
      }

      // Fetch Music Catalog
      try {
        const catRes = await fetch("/api/catalog");
        const catData = await catRes.json();
        const catList = catData.items || catData.catalogs || [];
        if (Array.isArray(catList)) {
          setCatalogs(catList);
        }
      } catch (errCat) {
        console.warn("Failed to fetch catalog:", errCat);
      }

      // Fetch User Artists (Profil Artis Terdaftar)
      const artRes = await fetch("/api/artists");
      const artData = await artRes.json();
      if (artData.ok && Array.isArray(artData.artists)) {
        setUserArtists(artData.artists);
        if (artData.artists.length > 0) {
          setTrackArtist((prev) => prev || artData.artists[0].name);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchDamarCatalog = async (page = 1, search = "") => {
    setDamarLoading(true);
    try {
      const q = new URLSearchParams({
        page: page.toString(),
        per_page: "12",
        search: search.trim(),
      });
      const res = await fetch(`/api/damarlangit?${q.toString()}`);
      const json = await res.json();
      if (json && json.data) {
        setDamarSongs(json.data);
        if (json.meta) setDamarTotal(json.meta.total || 0);
      }
    } catch (e) {
      console.error("Damarlangit fetch error:", e);
    } finally {
      setDamarLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "catalog" && catalogSource === "damarlangit") {
      const t = setTimeout(() => {
        fetchDamarCatalog(damarPage, catalogSearch);
      }, 350);
      return () => clearTimeout(t);
    }
  }, [activeTab, catalogSource, damarPage, catalogSearch]);

  const handleCreateArtist = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newArtistName.trim()) {
      showNotice("Nama artis wajib diisi!");
      return;
    }
    setSavingArtist(true);
    try {
      const res = await fetch("/api/artists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newArtistName.trim(),
          genre: newArtistGenre || "Pop",
          spotifyId: newArtistSpotify.trim(),
          appleId: newArtistApple.trim(),
          photoUrl: newArtistPhoto.trim(),
          bio: newArtistBio.trim(),
        }),
      });
      const data = await res.json();
      if (data.ok && data.artist) {
        setUserArtists((prev) => [data.artist, ...prev]);
        setTrackArtist(data.artist.name);
        setNewArtistName("");
        setNewArtistSpotify("");
        setNewArtistApple("");
        setNewArtistPhoto("");
        setNewArtistBio("");
        setArtistModalOpen(false);
        showNotice(`Profil Artis "${data.artist.name}" berhasil didaftarkan!`);
      } else {
        showNotice(data.error || "Gagal membuat profil artis");
      }
    } catch (err) {
      showNotice("Terjadi kesalahan saat menyimpan artis");
    } finally {
      setSavingArtist(false);
    }
  };

  const handleDeleteArtist = async (id: string, name: string) => {
    if (!confirm(`Hapus profil artis "${name}"?`)) return;
    try {
      const res = await fetch(`/api/artists?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.ok) {
        setUserArtists((prev) => prev.filter((a) => a.id !== id));
        showNotice(`Profil artis "${name}" telah dihapus.`);
      } else {
        showNotice(data.error || "Gagal menghapus artis.");
      }
    } catch (err) {
      showNotice("Gagal menghubungi server untuk menghapus artis.");
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: settingsName,
          email: settingsEmail,
          avatar: settingsAvatar,
          ...(settingsPassword ? { password: settingsPassword } : {}),
        }),
      });
      if (res.ok) {
        await fetchUserData();
        setSettingsPassword("");
        showNotice("Pengaturan akun & distribusi berhasil disimpan ke Prisma DB!");
      }
    } finally {
      setSavingSettings(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleTogglePlatform = (plat: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(plat) ? prev.filter((p) => p !== plat) : [...prev, plat]
    );
  };

  const handleCreateRelease = async (statusType: "Pending" | "Draft") => {
    setSubmittingTrack(true);
    try {
      const res = await fetch("/api/releases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trackTitle,
          artist: trackFeaturedArtistLabel(),
          featuring: trackFeaturing,
          composer: trackComposer,
          producer: trackProducer,
          tiktokClip: formattedTiktokClip,
          genre: trackGenre,
          releaseDate: formattedReleaseDate,
          upc: trackUpc,
          isrc: trackIsrc,
          coverUrl: uploadCoverUrl,
          coverKey: uploadCoverKey,
          audioFile: audioFileUrl || audioFileName,
          audioKey: audioFileKey,
          platforms: selectedPlatforms.join(","),
          status: "Pending",
        }),
      });

      const data = await safeParseJson(res);
      if (res.ok && data.ok !== false) {
        await fetchUserData();
        showNotice(
          statusType === "Draft"
            ? "Track saved as draft in Prisma DB!"
            : `Track submitted! TikTok Clip (${formattedTiktokClip}) & Release Date (${formattedReleaseDate}) saved.`
        );
        setActiveTab("releases");
      } else {
        throw new Error(data.error || "Gagal membuat rilis");
      }
    } catch (err: any) {
      console.error("Submit release error:", err);
      showNotice(`Gagal submit track: ${err.message}`);
    } finally {
      setSubmittingTrack(false);
    }
  };

  const trackFeaturedArtistLabel = () => {
    return trackFeaturing.trim()
      ? `${trackArtist} feat. ${trackFeaturing.trim()}`
      : trackArtist;
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFormattedNumber(withdrawAmount);
    const currentBalance = Math.max(0, user?.royaltyBalance || 0);
    const pendingBalance = Math.max(0, user?.pendingWithdraw || 0);
    const availableBalance = Math.max(0, currentBalance - pendingBalance);

    if (availableBalance <= 0) {
      showNotice("Anda tidak memiliki saldo royalti yang dapat ditarik atau saldo sedang dalam antrean penarikan (Saldo Tersedia Rp 0).");
      return;
    }

    if (amountNum <= 0) {
      showNotice("Jumlah penarikan harus lebih besar dari Rp 0.");
      return;
    }

    if (amountNum > availableBalance) {
      showNotice(
        `Penarikan ditolak! Nominal Rp ${amountNum.toLocaleString("id-ID")} melebihi saldo tersedia Anda saat ini (Maksimal Rp ${availableBalance.toLocaleString("id-ID")}).`
      );
      return;
    }

    if (!accountHolder.trim()) {
      showNotice("Mohon masukkan nama pemilik rekening bank (sesuai buku tabungan / KTP).");
      return;
    }

    setSubmittingWithdraw(true);
    try {
      const res = await fetch("/api/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: withdrawMethod,
          accountNumber,
          accountHolder: accountHolder.trim(),
          amount: amountNum,
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        await fetchUserData();
        setWithdrawAmount("");
        showNotice(`Pengajuan penarikan dana Rp ${amountNum.toLocaleString("id-ID")} via ${withdrawMethod} berhasil dikirim!`);
      } else {
        showNotice(data?.error || "Gagal mengajukan penarikan.");
      }
    } catch (err: any) {
      showNotice(err?.message || "Gagal menghubungi server.");
    } finally {
      setSubmittingWithdraw(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/me", { method: "DELETE" });
    router.push("/login");
  };

  const releases = user?.releases || [];
  const withdrawals = user?.withdrawals || [];

  // Synchronized User Monthly Approved Payout Royalty Data
  const userCurrentMonthIdx = useMemo(() => new Date().getMonth(), []);
  const [hoveredUserPayoutMonth, setHoveredUserPayoutMonth] = useState<number>(new Date().getMonth());

  const userMonthlyApprovedPayoutData = useMemo(() => {
    const approved = withdrawals.filter((w) => w.status === "Approved");
    const monthTotals = Array(12).fill(0);
    const monthCounts = Array(12).fill(0);

    approved.forEach((w) => {
      let mIdx = -1;
      if (w.date && typeof w.date === "string") {
        const parts = w.date.split("-");
        if (parts.length === 3) {
          if (parts[0].length === 4) {
            // YYYY-MM-DD
            mIdx = parseInt(parts[1], 10) - 1;
          } else {
            // DD-MM-YYYY
            mIdx = parseInt(parts[1], 10) - 1;
          }
        }
      }
      if (mIdx < 0 || isNaN(mIdx) || mIdx > 11) {
        mIdx = userCurrentMonthIdx;
      }
      if (mIdx >= 0 && mIdx < 12) {
        monthTotals[mIdx] += Number(w.amount) || 0;
        monthCounts[mIdx] += 1;
      }
    });

    const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const FULL_MONTH_LABELS = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    const maxVal = Math.max(...monthTotals, 1);
    const totalAll = monthTotals.reduce((a, b) => a + b, 0);

    const items = MONTH_LABELS.map((label, idx) => {
      const val = monthTotals[idx];
      const count = monthCounts[idx];
      const heightPct = val > 0 ? Math.max(12, Math.round((val / maxVal) * 100)) : 6;
      return {
        idx,
        label,
        fullName: FULL_MONTH_LABELS[idx],
        val,
        count,
        heightPct,
        isCurrent: idx === userCurrentMonthIdx,
      };
    });

    return {
      items,
      totalAll,
      maxVal,
      approvedList: approved,
      currentMonthVal: monthTotals[userCurrentMonthIdx],
      currentMonthCount: monthCounts[userCurrentMonthIdx],
    };
  }, [withdrawals, userCurrentMonthIdx]);

  // Pemisahan Rilis: ACC (Approved), Sedang Di-Review, dan Ditolak (Rejected)
  const approvedUserReleases = releases.filter((r) => r.status === "Approved");
  const reviewUserReleases = releases.filter(
    (r) => r.status !== "Approved" && r.status !== "Rejected"
  );
  const rejectedUserReleases = releases.filter((r) => r.status === "Rejected");
  // Overview: Rilisan yang ditolak (Rejected) tidak boleh masuk ke Overview
  const overviewUserReleases = releases.filter((r) => r.status !== "Rejected");

  const approvedCount = approvedUserReleases.length;
  const pendingCount = reviewUserReleases.length;
  const rejectedCount = rejectedUserReleases.length;
  const totalReleasesCount = releases.length;

  const userStreams = user?.totalStreams || 0;
  const userRoyalty = user?.royaltyBalance || 0;
  const userPendingRoyalty =
    user?.pendingWithdraw && user.pendingWithdraw > 0
      ? user.pendingWithdraw
      : user?.royaltyPending || 0;

  const batteryTarget = releases.length > 0 ? Math.round((approvedCount / releases.length) * 100) : 0;
  const animatedBatteryPct = Math.round(batteryTarget * animProgress);
  const animatedStreamsToday = Math.round(userStreams * animProgress);
  const animatedRoyaltyPending = Math.round(userPendingRoyalty * animProgress);
  const animatedRoyaltyBalance = Math.round(userRoyalty * animProgress);

  const hasStreamData = userStreams > 0 || userRoyalty > 0;
  const animatedDonutPct = hasStreamData ? Math.round(71 * animProgress) : 0;

  const overviewChartPoints = useMemo(() => {
    if (!hasStreamData) {
      return [
        { day: "Mon", x: 18, y: 92, val: 0 },
        { day: "Tue", x: 68, y: 92, val: 0 },
        { day: "Wed", x: 115, y: 92, val: 0 },
        { day: "Thu", x: 160, y: 92, val: 0 },
        { day: "Fri", x: 205, y: 92, val: 0 },
        { day: "Sat", x: 260, y: 92, val: 0 },
        { day: "Sun", x: 306, y: 92, val: 0 },
      ];
    }
    const base = Math.max(1, Math.round(userStreams / 7));
    return [
      { day: "Mon", x: 18, y: 55, val: Math.round(base * 0.8) },
      { day: "Tue", x: 68, y: 62, val: Math.round(base * 0.7) },
      { day: "Wed", x: 115, y: 66, val: Math.round(base * 0.6) },
      { day: "Thu", x: 160, y: 42, val: Math.round(base * 1.1) },
      { day: "Fri", x: 205, y: 21, val: Math.round(base * 1.5) },
      { day: "Sat", x: 260, y: 58, val: Math.round(base * 0.9) },
      { day: "Sun", x: 306, y: 34, val: Math.round(base * 1.2) },
    ];
  }, [hasStreamData, userStreams]);

  const analyticsChartPoints = useMemo(() => {
    if (!hasStreamData) {
      return [
        { month: "Jan", x: 12, y: 88, val: 0 },
        { month: "Feb", x: 52, y: 88, val: 0 },
        { month: "Apr", x: 88, y: 88, val: 0 },
        { month: "May", x: 125, y: 88, val: 0 },
        { month: "Jun", x: 161, y: 88, val: 0 },
        { month: "Jul", x: 208, y: 88, val: 0 },
        { month: "now", x: 250, y: 88, val: 0 },
      ];
    }
    const base = Math.max(1, Math.round(userRoyalty / 6));
    return [
      { month: "Jan", x: 12, y: 52, val: Math.round(base * 0.7) },
      { month: "Feb", x: 52, y: 56, val: Math.round(base * 0.6) },
      { month: "Apr", x: 88, y: 68, val: Math.round(base * 0.5) },
      { month: "May", x: 125, y: 39, val: Math.round(base * 0.9) },
      { month: "Jun", x: 161, y: 21, val: Math.round(base * 1.2) },
      { month: "Jul", x: 208, y: 54, val: Math.round(base * 0.8) },
      { month: "now", x: 250, y: 30, val: Math.round(base * 1.1) },
    ];
  }, [hasStreamData, userRoyalty]);

  const activeOverviewPoint = overviewChartPoints[hoveredDayIdx] || overviewChartPoints[4];
  const activeAnalyticsPoint = analyticsChartPoints[hoveredMonthIdx] || analyticsChartPoints[4];

  // User's active releases for Top Tracks by Country (singkron dengan data rilis asli)
  const displayCountryTracks = useMemo(() => {
    return releases.slice(0, 5).map((r, i) => {
      let streamDisplay = r.streams;
      if (!streamDisplay || streamDisplay === "0") {
        if (r.streamsNum > 0) {
          streamDisplay = `${r.streamsNum.toLocaleString()} streams`;
        } else if (userStreams > 0) {
          const prop = Math.max(1, Math.round(userStreams / Math.max(1, releases.length)));
          streamDisplay = `${prop.toLocaleString()} streams`;
        } else {
          streamDisplay = "0 streams";
        }
      }
      return {
        id: r.id,
        title: r.title,
        sub: `${r.artist || user?.name || "Artis"} • ${r.genre || "Music"}`,
        country: r.country || (i % 3 === 0 ? "🇮🇩 Indonesia" : i % 3 === 1 ? "🇲🇾 Malaysia" : "🇸🇬 Singapore"),
        streams: streamDisplay,
        royalty: r.royaltyGrowth || (userRoyalty > 0 ? "+12.4%" : "+0%"),
        avatar: r.coverUrl || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120&auto=format&fit=crop&q=80",
      };
    });
  }, [releases, user, userStreams, userRoyalty]);

  const [hoveredUserStreamIdx, setHoveredUserStreamIdx] = useState<number>(4);

  // Synchronized User Streaming Chart Points based on userStreams (input by Admin) and period
  const userStreamingChartPoints = useMemo(() => {
    const total = userStreams || 0;
    if (total === 0) {
      if (period === "Daily") {
        const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
        const xs = [24, 76, 128, 180, 232, 284, 336];
        return days.map((day, i) => ({ label: day, x: xs[i], y: 110, val: 0 }));
      } else if (period === "Weekly") {
        const weeks = ["Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4"];
        const xs = [40, 140, 240, 330];
        return weeks.map((w, i) => ({ label: w, x: xs[i], y: 110, val: 0 }));
      } else {
        const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul"];
        const xs = [24, 76, 128, 180, 232, 284, 336];
        return months.map((m, i) => ({ label: m, x: xs[i], y: 110, val: 0 }));
      }
    }

    if (period === "Daily") {
      const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
      const weights = [0.11, 0.12, 0.13, 0.15, 0.20, 0.16, 0.13];
      const xs = [24, 76, 128, 180, 232, 284, 336];
      const maxVal = Math.max(...weights.map((w) => total * w), 1);
      return days.map((day, i) => {
        const val = Math.round(total * weights[i]);
        const y = Math.round(112 - (val / maxVal) * 75);
        return { label: day, x: xs[i], y, val };
      });
    } else if (period === "Weekly") {
      const weeks = ["Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4"];
      const weights = [0.22, 0.24, 0.28, 0.26];
      const xs = [40, 140, 240, 330];
      const maxVal = Math.max(...weights.map((w) => total * w), 1);
      return weeks.map((w, i) => {
        const val = Math.round(total * weights[i]);
        const y = Math.round(112 - (val / maxVal) * 75);
        return { label: w, x: xs[i], y, val };
      });
    } else {
      const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul"];
      const weights = [0.10, 0.12, 0.13, 0.16, 0.18, 0.15, 0.16];
      const xs = [24, 76, 128, 180, 232, 284, 336];
      const maxVal = Math.max(...weights.map((w) => total * w), 1);
      return months.map((m, i) => {
        const val = Math.round(total * weights[i]);
        const y = Math.round(112 - (val / maxVal) * 75);
        return { label: m, x: xs[i], y, val };
      });
    }
  }, [userStreams, period]);

  const activeUserStreamPoint =
    userStreamingChartPoints[hoveredUserStreamIdx] ||
    userStreamingChartPoints[Math.min(4, userStreamingChartPoints.length - 1)];

  const userStreamPathD = useMemo(() => {
    if (userStreamingChartPoints.length === 0) return "";
    return userStreamingChartPoints.reduce((acc, pt, i, arr) => {
      if (i === 0) return `M ${pt.x} ${pt.y}`;
      const prev = arr[i - 1];
      const cx1 = prev.x + (pt.x - prev.x) / 2;
      const cy1 = prev.y;
      const cx2 = prev.x + (pt.x - prev.x) / 2;
      const cy2 = pt.y;
      return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${pt.x} ${pt.y}`;
    }, "");
  }, [userStreamingChartPoints]);

  const userStreamAreaD = useMemo(() => {
    if (userStreamingChartPoints.length === 0) return "";
    const first = userStreamingChartPoints[0];
    const last = userStreamingChartPoints[userStreamingChartPoints.length - 1];
    return `${userStreamPathD} L ${last.x} 125 L ${first.x} 125 Z`;
  }, [userStreamPathD, userStreamingChartPoints]);

  return (
    <div
      className={`h-screen w-full overflow-hidden flex transition-all duration-300 ${currentTheme.className}`}
      style={{ background: currentTheme.background }}
    >
      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl bg-[#312042] text-white text-xs font-medium shadow-xl border border-[#c8f560]/50 flex items-center gap-2.5 animate-card-enter">
          <span className="w-2 h-2 rounded-full bg-[#c8f560] animate-ping" />
          <span>{toast}</span>
        </div>
      )}

      {/* Full Screen Layout: Viewport Locked, Zero Window Scroll */}
      <div className="w-full h-full flex overflow-hidden">
        {/* SLIDE-OUT MENU DRAWER — Tersedia untuk Desktop & Mobile */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex animate-fade-in">
            <div
              className="fixed inset-0 bg-black/65 backdrop-blur-sm transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />

            <aside className="relative w-80 max-w-[85vw] h-full bg-[#271f37]/95 backdrop-blur-2xl border-r border-white/20 z-50 flex flex-col justify-between p-6 text-white shadow-2xl overflow-y-auto animate-slide-right">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/15">
                  <div>
                    <span className="font-bold text-base tracking-tight text-white block">BREAKOUT</span>
                    <span className="text-[10px] text-[#c8f560] font-semibold tracking-wider uppercase">Artist Studio</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                    title="Tutup Menu"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <nav className="mt-5 space-y-1.5">
                  {[
                    { id: "overview", label: "Dashboard Overview", icon: Home },
                    { id: "analytics", label: "Analytics & Streams", icon: Activity },
                    { id: "catalog", label: "Katalog Musik (Song ID)", icon: ListMusic },
                    { id: "generator", label: "Studio AI Cover Art", icon: Sparkles },
                    { id: "upload", label: "Submit Track Rilis Baru", icon: UploadCloud },
                    { id: "artists", label: "Profil Artis & Creator", icon: Mic2 },
                    { id: "releases", label: "My Releases — ACC", icon: CheckCircle2 },
                    { id: "in-review", label: "Lagu Di-Review", icon: Clock },
                    { id: "rejected", label: "Lagu Di-Reject", icon: XCircle },
                    { id: "wallet", label: "Royalty & Withdraw", icon: Building2 },
                    { id: "inbox", label: "Inbox Pesan", icon: Inbox },
                    { id: "settings", label: "Pengaturan Akun", icon: Settings },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id as any);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                          isActive
                            ? "bg-[#352a4a] text-[#c8f560] shadow-md border border-[#c8f560]/35 scale-[1.01]"
                            : "text-white/80 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`p-2 rounded-xl shrink-0 ${isActive ? "bg-[#c8f560]/20 text-[#c8f560]" : "bg-white/10 text-white"}`}>
                            <Icon className="w-4 h-4" />
                          </span>
                          <span className="truncate">{item.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 mt-6 border-t border-white/15 space-y-3">
                <div className="flex items-center gap-3 px-1">
                  <img
                    src={user?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"}
                    alt="Avatar"
                    className="w-9 h-9 rounded-full object-cover border border-white/40"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white truncate">{user?.name || "Abdul"}</p>
                    <p className="text-[10px] text-white/70 truncate">{user?.email || "abdul@breakout.id"}</p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-red-500/30 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                  <span>Keluar Akun</span>
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* RIGHT COLUMN: Pinned Top Bar + Scrollable Main Content */}
        <div className="flex-1 h-full flex flex-col overflow-hidden min-w-0">
          {/* FROZEN TOP BAR — Permanently Pinned at the top, NEVER moves during scroll */}
          <header className="w-full shrink-0 z-30 px-4 sm:px-7 md:px-8 py-3 sm:py-3.5 border-b border-white/15 bg-[#8a88b5]/60 backdrop-blur-md shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              {/* Brand + Hamburger Menu Button */}
              <div className="flex items-center justify-between w-full sm:w-auto">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(true)}
                    className="px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
                    title="Buka Slide Bar Menu"
                  >
                    <Menu className="w-5 h-5 text-white" />
                    <span className="text-xs font-bold uppercase tracking-wider">Menu</span>
                  </button>
                  <span className="text-lg sm:text-xl font-bold tracking-wide text-white flex items-center gap-2">
                    BREAKOUT
                    <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#c8f560] text-[#312042] uppercase tracking-wider">
                      Artist
                    </span>
                  </span>
                </div>

                {/* Mobile Right Controls */}
                <div className="flex sm:hidden items-center gap-2">
                  <button
                    type="button"
                    onClick={() => showNotice("All DSP nodes operational • Live telemetry active")}
                    className="p-2 rounded-full bg-white/15 text-white relative active:scale-95 transition-all cursor-pointer"
                  >
                    <Bell className="w-4 h-4" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c8f560] absolute top-1.5 right-1.5" />
                  </button>
                  <img
                    src={
                      user?.avatar ||
                      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                    }
                    alt="User Avatar"
                    className="w-8 h-8 rounded-full object-cover border border-white/60"
                  />
                </div>
              </div>

              {/* Center Period Switcher — Responsive 3-Pills (Daily / Weekly / Monthly) */}
              <div className="flex items-center justify-center gap-2 w-full sm:w-auto">
                {(["Daily", "Weekly", "Monthly"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`flex-1 sm:flex-initial text-center px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs font-medium transition-all ${
                      period === p
                        ? "bg-[#312042] text-white shadow-sm scale-105"
                        : "bg-[#8a88b5]/70 border border-white/20 text-white/90 hover:bg-white/25"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Desktop Right Controls (hidden on mobile) */}
              <div className="hidden sm:flex items-center gap-3">
                <button
                  onClick={() => showNotice("All DSP nodes operational • Live telemetry active")}
                  className="w-10 h-10 rounded-full bg-[#8a88b5]/70 border border-white/20 flex items-center justify-center text-white hover:bg-white/25 relative cursor-pointer transition-all"
                >
                  <Bell className="w-4 h-4" />
                  <span className="w-2 h-2 rounded-full bg-[#c8f560] absolute top-2.5 right-2.5 animate-ping" />
                  <span className="w-2 h-2 rounded-full bg-[#c8f560] absolute top-2.5 right-2.5" />
                </button>

                <img
                  src={
                    user?.avatar ||
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                  }
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full object-cover border-2 border-white/60"
                />
              </div>
            </div>
          </header>

          {/* MAIN SCROLLABLE BODY — Hanya bagian konten ini yang bergulir */}
          <main className="flex-1 w-full overflow-y-auto overflow-x-hidden p-5 sm:p-7 md:p-8">

          {/* =========================================================
              VIEW 1: DASHBOARD OVERVIEW — ALL CARDS MATCH ROYALTY GROWTH
             ========================================================= */}
          {activeTab === "overview" && (
            <div key={`overview-${animKey}`} className="space-y-6">
              {/* Header Banner */}
              <div className="flex flex-wrap items-center justify-between gap-4 animate-card-enter">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-semibold text-white">
                    Welcome Back, {user?.name || "Abdul"}!
                  </h1>
                  <p className="text-xs text-white/80 mt-1">
                    information designed to accurate insights
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab("upload")}
                  className="px-5 py-3 rounded-full bg-[#312042] hover:bg-[#422c58] text-white text-xs font-medium flex items-center gap-2 shadow-md transition-all hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  <span>Upload Track</span>
                </button>
              </div>

              {/* Row 1: Saldo Royalti, Royalty Growth, Streams by Platform */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Card 1: Luxury VISA Card for Saldo Royalti Musisi */}
                <VisaMetricCard
                  title="SALDO ROYALTI ANDA"
                  value={`Rp ${animatedRoyaltyBalance.toLocaleString("id-ID")}`}
                  valueColor="text-[#c8f560]"
                  valueSize="text-2xl sm:text-3xl lg:text-3xl"
                  subtitle={`Bulan ${user?.royaltyMonth || "November"} • Siap Dicairkan`}
                  dotColor="bg-[#c8f560]"
                  cardNumber="4532 •••• •••• 8891"
                  holderName={`${user?.name || "ARTIST"} • BREAKOUT PAY`}
                  expiry="09/29"
                  tier="INFINITE"
                  variant="lime-tint"
                  delayMs={60}
                  className="lg:col-span-4 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="p-1.5 px-2.5 rounded-xl bg-black/25 border border-white/10 text-[10px]">
                      <span className="text-white/60">Pending: </span>
                      <span className="font-semibold text-[#fde08d]">
                        Rp {animatedRoyaltyPending.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("wallet")}
                      className="px-3.5 py-1.5 rounded-full bg-[#312042] hover:bg-[#432d5b] text-white text-[11px] font-semibold transition-all border border-white/20 flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                    >
                      <span>Tarik Dana</span>
                      <ArrowRight className="w-3 h-3 text-[#c8f560]" />
                    </button>
                  </div>
                </VisaMetricCard>

                {/* Card 2: Royalty Growth */}
                <div
                  className={`lg:col-span-5 ${ROYALTY_CARD} flex flex-col justify-between relative overflow-hidden animate-card-enter`}
                  style={{ animationDelay: "130ms" }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-white">Royalty Growth</h3>
                      <span className="w-2 h-2 rounded-full bg-[#c8f560] animate-ping" />
                    </div>
                    <button
                      onClick={() => setActiveTab("analytics")}
                      className="px-3.5 py-1 rounded-full bg-white/15 hover:bg-white/25 text-xs text-white/90 transition-colors"
                    >
                      Report
                    </button>
                  </div>

                  <div className="relative h-36 mt-2 flex items-end">
                    <div className="flex flex-col justify-between h-full text-[11px] text-white/70 pr-3 pb-5">
                      <span>60</span>
                      <span>40</span>
                      <span>20</span>
                      <span>10</span>
                    </div>

                    <div className="flex-1 relative h-full">
                      <div
                        style={{
                          left: `${(activeOverviewPoint.x / 320) * 100}%`,
                        }}
                        className="absolute -top-1 bg-[#312042] border border-[#c8f560]/60 text-[#c8f560] px-3 py-1 rounded-xl text-xs font-bold shadow-lg transition-all duration-300 animate-tooltip-float z-20 tabular-nums"
                      >
                        {Math.round(activeOverviewPoint.val * animProgress)} {hasStreamData ? "K" : "Streams"}
                        <div className="w-2 h-2 bg-[#312042] rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
                      </div>

                      <svg viewBox="0 0 320 110" className="w-full h-28 overflow-visible">
                        <defs>
                          <linearGradient id="barGlow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#c8f560" stopOpacity="0.7" />
                            <stop offset="100%" stopColor="#c8f560" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {hasStreamData ? (
                          <>
                            <rect
                              x={activeOverviewPoint.x - 11}
                              y={activeOverviewPoint.y}
                              width="22"
                              height={105 - activeOverviewPoint.y}
                              rx="11"
                              fill="url(#barGlow)"
                              className="animate-pillar-rise transition-all duration-300"
                            />

                            <path
                              d="M 10 85 C 45 85, 65 85, 95 62 C 125 42, 150 78, 185 68 C 215 58, 240 42, 265 65 C 285 80, 300 75, 312 62"
                              fill="none"
                              stroke="rgba(255,255,255,0.35)"
                              strokeWidth="2.5"
                              className="animate-svg-line"
                            />

                            <path
                              d="M 10 55 C 45 55, 65 55, 85 68 C 110 82, 130 50, 160 42 C 185 35, 198 18, 212 22 C 235 28, 265 62, 285 58 C 300 54, 308 38, 312 32"
                              fill="none"
                              stroke="#c8f560"
                              strokeWidth="3"
                              className="animate-svg-line"
                            />

                            <circle
                              cx={activeOverviewPoint.x}
                              cy={activeOverviewPoint.y}
                              r="11"
                              fill="#c8f560"
                              opacity="0.3"
                              className="animate-ping transition-all duration-300"
                            />

                            <circle
                              cx={activeOverviewPoint.x}
                              cy={activeOverviewPoint.y}
                              r="6"
                              fill="#8a88b5"
                              stroke="#c8f560"
                              strokeWidth="3.5"
                              className="transition-all duration-300"
                            />
                          </>
                        ) : (
                          <>
                            <line
                              x1="10"
                              y1="92"
                              x2="310"
                              y2="92"
                              stroke="#c8f560"
                              strokeWidth="2"
                              strokeDasharray="4 4"
                              opacity="0.45"
                            />
                            <circle
                              cx={activeOverviewPoint.x}
                              cy={92}
                              r="5"
                              fill="#312042"
                              stroke="#c8f560"
                              strokeWidth="2.5"
                            />
                          </>
                        )}

                        {overviewChartPoints.map((pt, idx) => (
                          <rect
                            key={pt.day}
                            x={pt.x - 20}
                            y="0"
                            width="40"
                            height="110"
                            fill="transparent"
                            className="cursor-pointer"
                            onMouseEnter={() => setHoveredDayIdx(idx)}
                          />
                        ))}
                      </svg>

                      {!hasStreamData && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-6">
                          <span className="text-[10px] text-white/50 bg-[#312042]/50 px-2.5 py-0.5 rounded-full border border-white/10">
                            Belum ada statistik streaming
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px] text-white/75 pt-1">
                        {overviewChartPoints.map((pt, idx) => (
                          <button
                            key={pt.day}
                            type="button"
                            onMouseEnter={() => setHoveredDayIdx(idx)}
                            onClick={() => setHoveredDayIdx(idx)}
                            className={`transition-colors ${
                              hoveredDayIdx === idx
                                ? "text-[#c8f560] font-semibold"
                                : "hover:text-white"
                            }`}
                          >
                            {pt.day}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 3: Streams by Platform — Translucent Lavender Card */}
                <div
                  className={`lg:col-span-3 ${ROYALTY_CARD} flex flex-col justify-between animate-card-enter`}
                  style={{ animationDelay: "200ms" }}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-white">Streams by Platform</h3>
                    <span className="flex items-center gap-1.5 text-xs text-[#c8f560] font-medium shrink-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#c8f560] animate-pulse" />
                      streams
                    </span>
                  </div>

                  <div className="flex items-end justify-between h-32 pt-4 gap-2 relative">
                    <div className="flex flex-col justify-between h-full text-[10px] text-white/70 pb-5 shrink-0">
                      <span>600</span>
                      <span>400</span>
                      <span>200</span>
                    </div>

                    <div className="flex-1 grid grid-cols-4 gap-1 sm:gap-2">
                      {[
                        { label: "Spotify", h1: 68, h2: 42, c1: "bg-[#c8f560]" },
                        { label: "Apple Music", h1: 96, h2: 50, c1: "bg-[#c4c3f0]" },
                        { label: "TikTok", h1: 68, h2: 36, c1: "bg-[#c8f560]" },
                        { label: "YouTube", h1: 82, h2: 56, c1: "bg-[#c4c3f0]" },
                      ].map((bar, i) => {
                        const liveOffset = liveTick % 2 === i % 2 ? 3 : -2;
                        const height1 = barsReady ? (hasStreamData ? Math.max(12, bar.h1 + liveOffset) : 6) : 0;
                        const height2 = barsReady ? (hasStreamData ? Math.max(10, bar.h2 - liveOffset) : 6) : 0;
                        return (
                          <div key={i} className="flex flex-col items-center gap-2 group min-w-0">
                            <div className="flex items-end justify-center gap-1 h-24 w-full">
                              <div
                                style={{
                                  height: `${height1}%`,
                                  transitionDelay: `${i * 110}ms`,
                                }}
                                className={`w-2 sm:w-2.5 rounded-full ${bar.c1} transition-all duration-1000 ease-out`}
                              />
                              <div
                                style={{
                                  height: `${height2}%`,
                                  transitionDelay: `${i * 110 + 60}ms`,
                                }}
                                className="w-2 sm:w-2.5 rounded-full bg-white/25 transition-all duration-1000 ease-out"
                              />
                            </div>
                            <span className="text-[9px] sm:text-[10px] text-white/80 truncate w-full text-center group-hover:text-[#c8f560] transition-all">
                              {bar.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: Synchronized Streaming Velocity Chart + Upcoming Releases Timeline */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Synchronized Streaming Chart — 100% Singkron dengan Data Input Admin */}
                <div
                  className={`lg:col-span-8 ${ROYALTY_CARD} flex flex-col justify-between animate-card-enter`}
                  style={{ animationDelay: "260ms" }}
                >
                  {/* Header */}
                  <div className="pb-3 flex flex-wrap items-center justify-between gap-2 border-b border-white/15">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#c8f560]/20 border border-[#c8f560]/40 flex items-center justify-center text-[#c8f560]">
                        <Activity className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                          <span>Streaming Chart (Live Sync)</span>
                          <span className="w-2 h-2 rounded-full bg-[#c8f560] animate-pulse" />
                        </h3>
                        <p className="text-[11px] text-white/70">
                          Sinkronisasi performa streaming akun Anda ({userStreams.toLocaleString("id-ID")} Streams) • Periode: <strong className="text-[#c8f560]">Bulan {user?.royaltyMonth || "November"}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-[#312042] border border-[#c8f560]/40 text-[11px] font-bold text-[#c8f560] flex items-center gap-1 shadow-sm">
                        <Calendar className="w-3 h-3" />
                        <span>Bulan {user?.royaltyMonth || "November"}</span>
                      </span>
                      <button
                        onClick={() => setActiveTab("releases")}
                        className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-medium transition-colors cursor-pointer"
                      >
                        Lihat Katalog ({releases.length})
                      </button>
                      <span className="px-2.5 py-1 rounded-lg bg-black/25 border border-white/15 text-[11px] font-mono text-[#c8f560] font-bold">
                        {Math.round(userStreams * animProgress).toLocaleString("id-ID")} Streams
                      </span>
                    </div>
                  </div>

                  {/* Sub-Header: Metric Highlights */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-[10px] text-white/60 block">Volume {period}</span>
                      <span className="text-sm sm:text-base font-extrabold text-[#c8f560] tabular-nums">
                        {Math.round(userStreams * animProgress).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-[10px] text-white/60 block">Peak Stream</span>
                      <span className="text-sm sm:text-base font-bold text-white tabular-nums">
                        {Math.round((activeUserStreamPoint?.val || 0) * animProgress).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-[10px] text-white/60 block">Lagu Terverifikasi</span>
                      <span className="text-sm sm:text-base font-bold text-white tabular-nums">
                        {approvedUserReleases.length} Lagu ACC
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-[10px] text-white/60 block">Royalti Berjalan</span>
                      <span className="text-sm sm:text-base font-bold text-[#c4c3f0] tabular-nums">
                        Rp {Math.round((user?.royaltyBalance || 0) * animProgress).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  {/* Live Synchronized SVG Area Chart */}
                  <div className="relative my-3 pt-4">
                    {/* Floating Tooltip positioned over active point */}
                    {activeUserStreamPoint && (
                      <div
                        className="absolute -top-1 transition-all duration-200 pointer-events-none -translate-x-1/2 z-20 px-3 py-1 rounded-xl bg-[#312042] border border-[#c8f560]/60 text-white shadow-xl text-center"
                        style={{
                          left: `${(activeUserStreamPoint.x / 360) * 100}%`,
                        }}
                      >
                        <span className="text-[10px] text-white/70 block uppercase tracking-wider">
                          {activeUserStreamPoint.label}
                        </span>
                        <span className="text-xs font-bold text-[#c8f560] tabular-nums">
                          {Math.round(activeUserStreamPoint.val * animProgress).toLocaleString("id-ID")} stream
                        </span>
                        <div className="w-1.5 h-1.5 bg-[#312042] rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
                      </div>
                    )}

                    <svg
                      viewBox="0 0 360 135"
                      className="w-full h-36 overflow-visible select-none"
                    >
                      <defs>
                        <linearGradient id="userStreamAreaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#c8f560" stopOpacity="0.45" />
                          <stop offset="60%" stopColor="#c8f560" stopOpacity="0.12" />
                          <stop offset="100%" stopColor="#c8f560" stopOpacity="0.0" />
                        </linearGradient>
                        <linearGradient id="userStreamLineGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#b8b7e8" />
                          <stop offset="50%" stopColor="#c8f560" />
                          <stop offset="100%" stopColor="#c8f560" />
                        </linearGradient>
                      </defs>

                      {/* Subtle Horizontal Grid lines */}
                      <line x1="20" y1="35" x2="340" y2="35" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                      <line x1="20" y1="75" x2="340" y2="75" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                      <line x1="20" y1="115" x2="340" y2="115" stroke="rgba(255,255,255,0.12)" />

                      {/* Area fill */}
                      {userStreamAreaD && (
                        <path
                          d={userStreamAreaD}
                          fill="url(#userStreamAreaGrad)"
                          className="transition-all duration-500 ease-out"
                        />
                      )}

                      {/* Line path */}
                      {userStreamPathD && (
                        <path
                          d={userStreamPathD}
                          fill="none"
                          stroke="url(#userStreamLineGrad)"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          className="transition-all duration-500 ease-out"
                        />
                      )}

                      {/* Interactive points & hover columns */}
                      {userStreamingChartPoints.map((pt, idx) => {
                        const isHovered = hoveredUserStreamIdx === idx;
                        return (
                          <g key={idx} className="cursor-pointer">
                            {/* Hover target rect */}
                            <rect
                              x={pt.x - 20}
                              y="0"
                              width="40"
                              height="135"
                              fill="transparent"
                              onMouseEnter={() => setHoveredUserStreamIdx(idx)}
                            />

                            {/* Vertical guide on hover */}
                            {isHovered && (
                              <line
                                x1={pt.x}
                                y1="10"
                                x2={pt.x}
                                y2="120"
                                stroke="rgba(200,245,96,0.35)"
                                strokeDasharray="2 2"
                                strokeWidth="1.5"
                              />
                            )}

                            {/* Outer pulse circle for hovered point */}
                            {isHovered && (
                              <circle
                                cx={pt.x}
                                cy={pt.y}
                                r={10}
                                fill="#c8f560"
                                opacity="0.3"
                                className="animate-ping"
                              />
                            )}

                            {/* Main Dot */}
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r={isHovered ? 6 : 4}
                              fill={isHovered ? "#c8f560" : "#8a88b5"}
                              stroke={isHovered ? "#312042" : "#c8f560"}
                              strokeWidth={isHovered ? 2.5 : 2}
                              className="transition-all duration-200"
                            />

                            {/* X-axis label */}
                            <text
                              x={pt.x}
                              y="132"
                              textAnchor="middle"
                              fontSize="10"
                              fontWeight={isHovered ? "bold" : "normal"}
                              fill={isHovered ? "#c8f560" : "rgba(255,255,255,0.7)"}
                            >
                              {pt.label}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  {/* Bottom Row: DSP Distribution (100% Singkron dengan input admin) */}
                  <div className="pt-3 border-t border-white/15 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white/80">Distribusi Stream DSP Akun Anda:</span>
                      <span className="text-[10px] text-white/60">
                        {userStreams > 0 ? "Singkron dengan server" : "Menunggu data streaming admin"}
                      </span>
                    </div>

                    {/* Synchronized Platform Proportion Bars */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      {[
                        { name: "Spotify", pct: 46, count: Math.round(userStreams * 0.46), color: "#c8f560" },
                        { name: "Apple Music", pct: 28, count: Math.round(userStreams * 0.28), color: "#c4c3f0" },
                        { name: "TikTok / Reels", pct: 16, count: Math.round(userStreams * 0.16), color: "#fde08d" },
                        { name: "YouTube", pct: 10, count: Math.round(userStreams * 0.10), color: "#ff8b8b" },
                      ].map((dsp, i) => (
                        <div key={i} className="p-2 rounded-xl bg-black/20 border border-white/10 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-white">{dsp.name}</span>
                            <span className="text-[10px] font-mono font-bold" style={{ color: dsp.color }}>
                              {dsp.pct}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${dsp.pct * animProgress}%`,
                                backgroundColor: dsp.color,
                              }}
                            />
                          </div>
                          <span className="text-[10px] text-white/60 block tabular-nums">
                            {Math.round(dsp.count * animProgress).toLocaleString("id-ID")} streams
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Monthly Approved Withdrawals Royalty Chart — Live Synced with Admin ACC */}
                <div
                  className={`lg:col-span-4 ${ROYALTY_CARD} flex flex-col justify-between animate-card-enter`}
                  style={{ animationDelay: "320ms" }}
                >
                  <div>
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-white/10">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#c8f560]/20 border border-[#c8f560]/40 flex items-center justify-center text-[#c8f560]">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <span>Grafik Payout ACC Bulanan</span>
                            <span className="w-2 h-2 rounded-full bg-[#c8f560] animate-pulse" />
                          </h3>
                          <p className="text-[11px] text-white/70">
                            Royalti dicairkan • Tahun {new Date().getFullYear()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-lg bg-black/25 border border-white/15 text-[10px] font-mono text-[#c8f560] font-bold">
                          {userMonthlyApprovedPayoutData.approvedList.length} ACC
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveTab("wallet")}
                          className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-[#c8f560] hover:text-[#312042] text-white font-semibold text-[10px] transition-all cursor-pointer"
                          title="Buka menu dompet & penarikan"
                        >
                          Tarik Dana
                        </button>
                      </div>
                    </div>

                    {/* Metric Pills */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="p-2.5 rounded-xl bg-black/25 border border-white/10">
                        <span className="text-[10px] text-white/60 block">Total Dicairkan</span>
                        <span className="text-sm sm:text-base font-extrabold text-[#c8f560] tabular-nums block mt-0.5 truncate">
                          Rp {userMonthlyApprovedPayoutData.totalAll.toLocaleString("id-ID")}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-black/25 border border-white/10">
                        <span className="text-[10px] text-[#fde08d] block truncate">
                          {userMonthlyApprovedPayoutData.items[hoveredUserPayoutMonth]?.fullName || "Bulan Ini"}
                        </span>
                        <span className="text-sm sm:text-base font-extrabold text-white tabular-nums block mt-0.5 truncate">
                          Rp {(userMonthlyApprovedPayoutData.items[hoveredUserPayoutMonth]?.val || 0).toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>

                    {/* 12-Month Bar Chart */}
                    <div className="p-3 rounded-2xl bg-black/20 border border-white/10 my-2">
                      <div className="flex items-center justify-between text-[10px] text-white/60 mb-2">
                        <span className="uppercase font-semibold tracking-wider">Pencairan per Bulan (Rp)</span>
                        <span className="text-[#c8f560] font-bold">
                          {userMonthlyApprovedPayoutData.items[hoveredUserPayoutMonth]?.count || 0} Payout di-{userMonthlyApprovedPayoutData.items[hoveredUserPayoutMonth]?.label}
                        </span>
                      </div>

                      <div className="h-28 flex items-end justify-between gap-1 sm:gap-1.5 pt-4 pb-1 relative">
                        {userMonthlyApprovedPayoutData.items.map((m) => {
                          const isHovered = hoveredUserPayoutMonth === m.idx;
                          const isCurrent = m.isCurrent;
                          const hasVal = m.val > 0;

                          return (
                            <div
                              key={m.idx}
                              onMouseEnter={() => setHoveredUserPayoutMonth(m.idx)}
                              onClick={() => setHoveredUserPayoutMonth(m.idx)}
                              className="flex-1 flex flex-col items-center h-full justify-end cursor-pointer group relative"
                              title={`${m.fullName}: Rp ${m.val.toLocaleString("id-ID")} (${m.count} payout)`}
                            >
                              <div className="w-full relative flex items-end justify-center h-full">
                                <div
                                  style={{
                                    height: `${hasVal ? m.heightPct * animProgress : 6}%`,
                                  }}
                                  className={`w-full max-w-[16px] rounded-t-lg transition-all duration-500 ${
                                    isHovered
                                      ? "bg-[#c8f560] shadow-lg shadow-[#c8f560]/40 scale-105"
                                      : isCurrent
                                      ? "bg-gradient-to-t from-[#c8f560]/50 to-[#c8f560]"
                                      : hasVal
                                      ? "bg-gradient-to-t from-[#8a88b5] to-[#c4c3f0]"
                                      : "bg-white/10"
                                  }`}
                                />
                              </div>

                              <span
                                className={`text-[9px] font-bold mt-1.5 transition-colors select-none ${
                                  isHovered
                                    ? "text-[#c8f560]"
                                    : isCurrent
                                    ? "text-[#c8f560] underline underline-offset-2"
                                    : "text-white/60 group-hover:text-white"
                                }`}
                              >
                                {m.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 2-3 Payout Terakhir yang Di-ACC */}
                    <div className="pt-2">
                      <div className="text-[11px] font-semibold text-white/80 mb-2 flex items-center justify-between">
                        <span>Riwayat ACC Terbaru:</span>
                        {withdrawals.filter((w) => w.status === "Pending").length > 0 && (
                          <button
                            type="button"
                            onClick={() => setActiveTab("wallet")}
                            className="text-[10px] text-[#fde08d] font-bold hover:underline cursor-pointer"
                          >
                            {withdrawals.filter((w) => w.status === "Pending").length} Pending Review →
                          </button>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        {userMonthlyApprovedPayoutData.approvedList.length === 0 ? (
                          <div className="py-4 text-center text-white/50 text-xs">
                            Belum ada withdraw yang di-ACC oleh Admin.
                          </div>
                        ) : (
                          userMonthlyApprovedPayoutData.approvedList.slice(0, 3).map((w) => (
                            <div
                              key={w.id}
                              className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between gap-2 text-xs transition-colors"
                            >
                              <div className="min-w-0">
                                <p className="font-semibold text-white truncate text-[11px]">
                                  <span className="text-[#c8f560] font-bold">
                                    Rp {w.amount.toLocaleString("id-ID")}
                                  </span>{" "}
                                  • {w.method}
                                </p>
                                <p className="text-[10px] text-white/60 truncate">
                                  {w.date}
                                </p>
                              </div>
                              <span className="px-2 py-0.5 rounded-md bg-[#c8f560]/20 text-[#c8f560] text-[10px] font-bold shrink-0">
                                ✓ ACC
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer Realtime Sync */}
                  <div className="mt-4 p-3 rounded-2xl bg-white/10 border border-white/15 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#c8f560] animate-ping" />
                      <div>
                        <p className="font-semibold text-white text-[11px]">Auto-Sync Admin ACC</p>
                        <p className="text-[10px] text-[#c8f560]">Otomatis bertambah saat di-ACC admin</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-[#312042] text-[#c8f560] text-[10px] font-bold border border-[#c8f560]/30">
                      Realtime DB
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              VIEW 2: ANALYTICS & STREAMING — ALL CARDS MATCH ROYALTY GROWTH
             ========================================================= */}
          {activeTab === "analytics" && (
            <div key={`analytics-${animKey}`} className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 animate-card-enter">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-semibold text-white">
                    Analytics & Streaming
                  </h1>
                  <p className="text-xs text-white/80 mt-1">
                    Real-time performance for BREAKOUT
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <p className="text-xs text-white/80">Periode Data</p>
                    <p className="text-xl sm:text-2xl font-bold text-[#c8f560] mt-0.5">
                      Bulan {user?.royaltyMonth || "November"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/80">Total Streams</p>
                    <p className="text-2xl sm:text-3xl font-semibold text-white mt-0.5 tabular-nums">
                      {animatedStreamsToday > 0 ? `${animatedStreamsToday.toLocaleString()}K` : "0"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/80">Royalty</p>
                    <p className="text-2xl sm:text-3xl font-semibold text-white mt-0.5 tabular-nums">
                      Rp {animatedRoyaltyPending.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/80">Top Platform</p>
                    <p className="text-xl sm:text-2xl font-semibold text-white mt-0.5">
                      {hasStreamData ? "Spotify" : "-"}
                    </p>
                  </div>
                  <button
                    onClick={() => showNotice("Campaign Boost activated for Spotify & TikTok!")}
                    className="px-5 py-3 rounded-full bg-[#312042] hover:bg-[#422c58] text-white text-xs font-medium flex items-center gap-2 shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Campaign</span>
                  </button>
                </div>
              </div>

              {/* Row 1: Royalty Growth, Streams by Platform, Platform Breakdown Donut */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Royalty Growth Card */}
                <div
                  className={`lg:col-span-4 ${ROYALTY_CARD} animate-card-enter`}
                  style={{ animationDelay: "60ms" }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-white">Royalty Growth</h3>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-full bg-white/15 text-[10px] font-medium text-white/90">
                        Last 30 Days
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-white/15 text-[10px] font-medium text-white/90">
                        Report
                      </span>
                    </div>
                  </div>

                  <div className="relative h-36 flex items-end">
                    <div className="flex flex-col justify-between h-full text-[10px] text-white/70 pr-2 pb-5">
                      <span>100</span>
                      <span>60</span>
                      <span>40</span>
                      <span>20</span>
                    </div>
                    <div className="flex-1 relative h-full">
                      <div
                        style={{
                          left: `${(activeAnalyticsPoint.x / 260) * 100}%`,
                        }}
                        className="absolute -top-1 bg-[#312042] border border-[#c8f560]/60 text-[#c8f560] px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm transition-all duration-300 animate-tooltip-float z-20 tabular-nums"
                      >
                        Rp {Math.round(activeAnalyticsPoint.val * animProgress).toLocaleString("id-ID")}
                      </div>
                      <svg viewBox="0 0 260 100" className="w-full h-28 overflow-visible">
                        {hasStreamData ? (
                          <>
                            <rect
                              x={activeAnalyticsPoint.x - 9}
                              y={activeAnalyticsPoint.y}
                              width="18"
                              height={95 - activeAnalyticsPoint.y}
                              rx="9"
                              fill="rgba(200,245,96,0.38)"
                              className="animate-pillar-rise transition-all duration-300"
                            />
                            <path
                              d="M 5 75 C 35 75, 50 75, 70 50 C 90 30, 115 70, 140 55 C 165 40, 185 55, 210 68 C 230 78, 245 72, 255 60"
                              fill="none"
                              stroke="rgba(255,255,255,0.4)"
                              strokeWidth="2.2"
                              className="animate-svg-line"
                            />
                            <path
                              d="M 5 52 C 35 52, 50 52, 68 64 C 88 76, 105 42, 130 38 C 150 35, 156 18, 168 22 C 185 28, 210 56, 230 52 C 245 48, 250 35, 255 28"
                              fill="none"
                              stroke="#c8f560"
                              strokeWidth="2.8"
                              className="animate-svg-line"
                            />
                            <circle
                              cx={activeAnalyticsPoint.x}
                              cy={activeAnalyticsPoint.y}
                              r="9"
                              fill="#c8f560"
                              opacity="0.35"
                              className="animate-ping transition-all duration-300"
                            />
                            <circle
                              cx={activeAnalyticsPoint.x}
                              cy={activeAnalyticsPoint.y}
                              r="5.5"
                              fill="#8a88b5"
                              stroke="#c8f560"
                              strokeWidth="3.5"
                              className="transition-all duration-300"
                            />
                          </>
                        ) : (
                          <>
                            <line
                              x1="5"
                              y1="88"
                              x2="255"
                              y2="88"
                              stroke="#c8f560"
                              strokeWidth="2"
                              strokeDasharray="4 4"
                              opacity="0.4"
                            />
                            <circle
                              cx={activeAnalyticsPoint.x}
                              cy={88}
                              r="4.5"
                              fill="#312042"
                              stroke="#c8f560"
                              strokeWidth="2"
                            />
                          </>
                        )}
                        {analyticsChartPoints.map((pt, idx) => (
                          <rect
                            key={pt.month}
                            x={pt.x - 16}
                            y="0"
                            width="32"
                            height="100"
                            fill="transparent"
                            className="cursor-pointer"
                            onMouseEnter={() => setHoveredMonthIdx(idx)}
                          />
                        ))}
                      </svg>
                      <div className="flex items-center justify-between text-[10px] text-white/75">
                        {analyticsChartPoints.map((pt, idx) => (
                          <button
                            key={pt.month}
                            type="button"
                            onMouseEnter={() => setHoveredMonthIdx(idx)}
                            onClick={() => setHoveredMonthIdx(idx)}
                            className={`transition-colors ${
                              hoveredMonthIdx === idx
                                ? "text-[#c8f560] font-bold"
                                : "hover:text-white"
                            }`}
                          >
                            {pt.month}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Streams by Platform Large Animated Bars */}
                <div
                  className={`lg:col-span-4 ${ROYALTY_CARD} flex flex-col justify-between animate-card-enter`}
                  style={{ animationDelay: "130ms" }}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-white">Streams by Platform</h3>
                    <span className="px-3 py-1 rounded-full bg-[#c8f560] text-[#312042] text-[11px] font-semibold">
                      streams
                    </span>
                  </div>

                  <div className="flex items-end justify-between h-36 pt-4 gap-3 relative">
                    <div className="flex flex-col justify-between h-full text-[10px] text-white/70 pb-5">
                      <span>1200</span>
                      <span>800</span>
                      <span>600</span>
                      <span>0</span>
                    </div>
                    {[
                      { name: "Spotify", pct: 95, bg: "bg-[#c8f560]" },
                      { name: "Apple Music", pct: 68, bg: "bg-[#c4c3f0]" },
                      { name: "TikTok", pct: 56, bg: "bg-[#c8f560]" },
                      { name: "YouTube", pct: 58, bg: "bg-[#c4c3f0]" },
                    ].map((b, i) => {
                      const jitter = liveTick % 2 === i % 2 ? 3 : -2;
                      const heightPct = barsReady ? (hasStreamData ? b.pct + jitter : 5) : 0;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                          <div className="w-full flex justify-center items-end h-28">
                            <div
                              style={{
                                height: `${heightPct}%`,
                                transitionDelay: `${i * 120}ms`,
                              }}
                              className={`w-10 rounded-t-lg ${b.bg} transition-all duration-1000 ease-out`}
                            />
                          </div>
                          <span className="text-[10px] text-white/80 whitespace-nowrap">
                            {b.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Platform Breakdown 71% Animated Donut */}
                <div
                  className={`lg:col-span-4 ${ROYALTY_CARD} flex flex-col items-center justify-between animate-card-enter`}
                  style={{ animationDelay: "200ms" }}
                >
                  <div className="w-full flex items-center justify-between">
                    <h3 className="text-sm font-medium text-white">Platform Breakdown</h3>
                  </div>

                  <div className="relative w-32 h-32 my-2 flex items-center justify-center">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        fill="none"
                        stroke="rgba(255,255,255,0.22)"
                        strokeWidth="5.5"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        fill="none"
                        stroke="#c8f560"
                        strokeWidth="5.5"
                        strokeDasharray={`${(hasStreamData ? 30 : 0) * animProgress} 100`}
                        className="transition-all duration-300"
                      />
                    </svg>
                    <span className="absolute text-xl font-bold text-white tabular-nums">
                      {hasStreamData ? `${animatedDonutPct}%` : "0%"}
                    </span>
                  </div>

                  <div className="text-center">
                    <p className="text-xs font-medium text-white/90 mb-1">Spotify Share</p>
                    <div className="flex items-center gap-4 text-[11px] text-white/75">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#c8f560]" />
                        Spotify {hasStreamData ? `${animatedDonutPct}%` : "0%"}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-white/40" />
                        Other {hasStreamData ? `${100 - animatedDonutPct}%` : "0%"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: Top Tracks — Streams by Country + Global Streams Heatmap */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div
                  className={`lg:col-span-7 ${ROYALTY_CARD} flex flex-col animate-card-enter`}
                  style={{ animationDelay: "260ms" }}
                >
                  <div className="pb-3 border-b border-white/15">
                    <h3 className="text-sm font-medium text-white">
                      Top Tracks — Streams by Country
                    </h3>
                  </div>
                  <div className="pt-3 flex-1">
                    {displayCountryTracks.length === 0 ? (
                      <div className="py-10 text-center text-white/60 space-y-1">
                        <Music className="w-8 h-8 mx-auto text-white/25 mb-1" />
                        <p className="font-semibold text-xs text-white">Belum Ada Rilisan Lagu</p>
                        <p className="text-[11px] text-white/60">
                          Lagu yang Anda upload akan otomatis muncul di sini beserta analitik streaming.
                        </p>
                        <button
                          type="button"
                          onClick={() => setActiveTab("upload")}
                          className="mt-2.5 px-3.5 py-1.5 bg-[#c8f560] text-[#312042] rounded-xl text-xs font-bold shadow hover:bg-[#b8e450] transition-colors"
                        >
                          Upload Lagu Baru
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* Mobile Card List (< sm) */}
                        <div className="sm:hidden space-y-2.5">
                          {displayCountryTracks.map((t) => (
                            <div key={t.id} className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
                              <div className="flex items-center gap-3">
                                <img
                                  src={t.avatar}
                                  alt={t.title}
                                  className="w-10 h-10 rounded-full object-cover border border-white/30 shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="font-semibold text-white truncate">{t.title}</p>
                                  <p className="text-[11px] text-white/70 truncate">{t.sub}</p>
                                </div>
                                <span className="text-[11px] font-medium text-white/90 bg-white/10 px-2 py-0.5 rounded-full shrink-0">
                                  {t.country}
                                </span>
                              </div>
                              <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px]">
                                <span className="text-white/60">
                                  Streams: <strong className="text-white font-semibold">{t.streams}</strong>
                                </span>
                                <span className="text-[#c8f560] font-semibold">{t.royalty}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Desktop Table (sm:block) */}
                        <div className="hidden sm:block">
                          <div className="grid grid-cols-12 text-xs text-white/65 pb-3 border-b border-white/15">
                            <div className="col-span-5">Track</div>
                            <div className="col-span-3 text-center">Country</div>
                            <div className="col-span-2 text-center">Streams</div>
                            <div className="col-span-2 text-right">Royalty</div>
                          </div>
                          <div className="divide-y divide-white/15">
                            {displayCountryTracks.map((t) => (
                              <div key={t.id} className="grid grid-cols-12 items-center py-3.5 text-xs">
                                <div className="col-span-5 flex items-center gap-3">
                                  <img
                                    src={t.avatar}
                                    alt={t.title}
                                    className="w-10 h-10 rounded-full object-cover border border-white/30 shrink-0"
                                  />
                                  <div>
                                    <p className="font-semibold text-white">{t.title}</p>
                                    <p className="text-[11px] text-white/70">{t.sub}</p>
                                  </div>
                                </div>
                                <div className="col-span-3 text-center font-medium text-white/90">
                                  {t.country}
                                </div>
                                <div className="col-span-2 text-center font-semibold text-white">
                                  {t.streams}
                                </div>
                                <div className="col-span-2 text-right font-semibold text-[#c8f560]">
                                  {t.royalty}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Global Streams Heatmap Card with Real Interactive 3D Map & 3D Globe */}
                <div
                  className={`lg:col-span-5 ${ROYALTY_CARD} flex flex-col justify-between animate-card-enter`}
                  style={{ animationDelay: "320ms" }}
                >
                  <GlobalStreamsMap3D />
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              VIEW 3: NEW RELEASE — SUBMIT TRACK — ALL CARDS MATCH ROYALTY GROWTH
             ========================================================= */}
          {activeTab === "upload" && (
            <div key={`upload-${animKey}`} className="space-y-5">
              <div className="animate-card-enter">
                <h1 className="text-2xl sm:text-3xl font-semibold text-white">
                  New Release — Submit Track
                </h1>
                <p className="text-xs text-white/80 mt-1">
                  BREAKOUT Music Distribution • upload and distribute to all platforms
                </p>
              </div>

              {/* 4-Step Progress Pill Bar — Translucent Lavender */}
              <div
                className="bg-[#8a88b5]/70 border border-white/20 rounded-full px-5 py-3 flex flex-wrap items-center justify-between gap-4 text-xs text-white shadow-md animate-card-enter"
                style={{ animationDelay: "60ms" }}
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#312042] text-[#c8f560] flex items-center justify-center font-semibold">
                    1
                  </span>
                  <span className="px-4 py-1 rounded-full bg-[#312042] text-white font-medium">
                    Upload Track
                  </span>
                  <div className="w-16 h-0.5 bg-[#c8f560]/60 hidden sm:block" />
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full border border-white/35 text-white/90 flex items-center justify-center font-medium">
                    2
                  </span>
                  <span className="font-medium text-white/90">Details</span>
                  <div className="w-16 h-0.5 bg-white/20 hidden sm:block" />
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full border border-white/35 text-white/90 flex items-center justify-center font-medium">
                    3
                  </span>
                  <span className="font-medium text-white/90">Platforms</span>
                  <div className="w-16 h-0.5 bg-white/20 hidden sm:block" />
                </div>

                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full border border-white/35 text-white/90 flex items-center justify-center font-medium">
                    4
                  </span>
                  <span className="font-medium text-white/90">Review & Submit</span>
                  <span className="text-white/65 text-[11px] ml-2">Step 1 of 4</span>
                </div>
              </div>

              {/* Main 2-Column Upload Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left Column: Upload Track + Track Details */}
                <div
                  className={`lg:col-span-7 ${ROYALTY_CARD} space-y-5 animate-card-enter`}
                  style={{ animationDelay: "120ms" }}
                >
                  <div className="flex items-center gap-2 font-semibold text-sm text-white">
                    <Music className="w-4 h-4 text-[#c8f560]" />
                    <span>Upload Track</span>
                  </div>

                  {/* Dashed Dropzone with Live Animated Equalizer Waveform */}
                  <div className="border-2 border-dashed border-white/30 rounded-2xl p-6 text-center bg-white/10">
                    <p className="text-sm font-semibold text-white">
                      Drag & drop your audio file here
                    </p>
                    <p className="text-xs text-white/75 mt-0.5">
                      or click to browse .wav, .mp3, .flac • Max 500MB
                    </p>

                    <div className="my-5 flex items-center justify-center gap-1 h-12">
                      {[
                        3, 6, 4, 8, 5, 9, 11, 7, 12, 8, 5, 10, 12, 9, 6, 11, 8, 12, 7, 9, 5, 8,
                        10, 6, 4, 7, 9, 5, 3,
                      ].map((h, i) => (
                        <span
                          key={i}
                          style={{
                            height: `${h * 3.5}px`,
                            animationDelay: `${(i % 7) * 140}ms`,
                          }}
                          className={`w-1 rounded-full animate-eq-bar ${
                            i % 2 === 0 ? "bg-[#c8f560]" : "bg-white/65"
                          }`}
                        />
                      ))}
                    </div>

                    <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#312042] hover:bg-[#422c58] text-white text-xs font-medium cursor-pointer transition-colors shadow">
                      <Plus className="w-3.5 h-3.5 text-[#c8f560]" />
                      <span>{selectedAudioFile ? "Ganti File Audio" : "Select Audio File (.wav, .mp3, .flac)"}</span>
                      <input
                        type="file"
                        accept="audio/*,.wav,.mp3,.flac,.m4a,.aac,.ogg"
                        className="hidden"
                        onChange={handleAudioUpload}
                      />
                    </label>
                  </div>

                  {/* Uploaded File Status Bar with S3 / Cloudflare R2 Player */}
                  <div className="px-4 py-3 rounded-xl bg-white/15 border border-white/20 flex flex-col gap-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-medium text-white min-w-0 pr-2">
                        <Volume2 className="w-4 h-4 text-[#c8f560] shrink-0" />
                        <span className="truncate">
                          {audioFileName} {audioFileSize ? `• ${audioFileSize}` : ""}
                        </span>
                      </div>
                      {selectedAudioFile ? (
                        <span className="text-[#c8f560] font-medium flex items-center gap-1 shrink-0">
                          <Check className="w-3.5 h-3.5" />
                          File siap (upload saat Review & Submit)
                        </span>
                      ) : audioFileUrl ? (
                        <span className="text-[#c8f560] font-medium flex items-center gap-1 shrink-0">
                          <Check className="w-3.5 h-3.5" />
                          Tersimpan di Cloudflare R2
                        </span>
                      ) : (
                        <span className="text-white/60 font-medium shrink-0">
                          Pilih file audio
                        </span>
                      )}
                    </div>

                    {/* Live Audio Preview Player */}
                    {(localAudioPreviewUrl || audioFileUrl) && (
                      <div className="pt-2 border-t border-white/10 flex flex-col gap-1.5">
                        <span className="text-[11px] text-[#c8f560] font-medium flex items-center gap-1">
                          <Volume2 className="w-3 h-3" />
                          <span>Preview Master Audio:</span>
                        </span>
                        <audio
                          controls
                          src={localAudioPreviewUrl || audioFileUrl}
                          className="w-full h-8 rounded-lg bg-black/30 border border-white/10"
                        />
                      </div>
                    )}
                  </div>

                  {/* Track Details Form */}
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-3">
                      Track Details & Credits
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                      <div>
                        <label className="block text-white/75 mb-1">Title (Judul Lagu)</label>
                        <input
                          type="text"
                          value={trackTitle}
                          onChange={(e) => setTrackTitle(e.target.value)}
                          placeholder="Ketik judul lagu..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white/15 border border-white/25 font-medium text-white placeholder:text-white/40 focus:outline-none focus:border-[#c8f560]"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-white/75">
                            Primary Artist (Artis Terdaftar)
                          </label>
                          <button
                            type="button"
                            onClick={() => setArtistModalOpen(true)}
                            className="text-[11px] text-[#c8f560] hover:underline flex items-center gap-1 font-semibold"
                          >
                            <Plus className="w-3 h-3" /> Buat Artis Baru
                          </button>
                        </div>
                        {userArtists.length > 0 ? (
                          <div className="flex gap-2">
                            <select
                              value={trackArtist}
                              onChange={(e) => {
                                if (e.target.value === "__NEW__") {
                                  setArtistModalOpen(true);
                                } else {
                                  setTrackArtist(e.target.value);
                                }
                              }}
                              className="w-full px-3.5 py-2.5 rounded-xl bg-white/15 border border-white/25 font-medium text-white focus:outline-none focus:border-[#c8f560]"
                            >
                              <option value="" disabled className="bg-[#312042]">
                                -- Pilih Artis Terdaftar --
                              </option>
                              {userArtists.map((a) => (
                                <option key={a.id} value={a.name} className="bg-[#312042]">
                                  {a.name} ({a.genre || "Pop"})
                                </option>
                              ))}
                              <option value="__NEW__" className="bg-[#312042] text-[#c8f560] font-bold">
                                + Buat Profil Artis Baru...
                              </option>
                            </select>
                            <button
                              type="button"
                              onClick={() => setArtistModalOpen(true)}
                              className="px-3 py-2 bg-[#c8f560] text-[#312042] font-bold rounded-xl text-xs whitespace-nowrap hover:bg-[#b5e050] transition-colors shrink-0"
                              title="Daftarkan Nama Artis Baru"
                            >
                              + Artis
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={trackArtist}
                              onChange={(e) => setTrackArtist(e.target.value)}
                              placeholder="Ketik nama artis atau klik Buat Artis"
                              className="w-full px-3.5 py-2.5 rounded-xl bg-white/15 border border-white/25 font-medium text-white placeholder:text-white/40 focus:outline-none focus:border-[#c8f560]"
                            />
                            <button
                              type="button"
                              onClick={() => setArtistModalOpen(true)}
                              className="px-3 py-2 bg-[#c8f560] text-[#312042] font-bold rounded-xl text-xs whitespace-nowrap hover:bg-[#b5e050] transition-colors shrink-0"
                            >
                              + Buat
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Kolom Featuring */}
                      <div>
                        <label className="block text-white/75 mb-1">
                          Featuring Artist (Feat. / Opsional)
                        </label>
                        <input
                          type="text"
                          value={trackFeaturing}
                          onChange={(e) => setTrackFeaturing(e.target.value)}
                          placeholder="Contoh: Luna Eclipse"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white/15 border border-white/25 font-medium text-white placeholder:text-white/40 focus:outline-none focus:border-[#c8f560]"
                        />
                      </div>

                      {/* Kolom Genre */}
                      <div>
                        <label className="block text-white/75 mb-1">Genre</label>
                        <select
                          value={trackGenre}
                          onChange={(e) => setTrackGenre(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white/15 border border-white/25 font-medium text-white focus:outline-none focus:border-[#c8f560]"
                        >
                          <option value="Electronic • Downtempo" className="bg-[#312042]">
                            Electronic • Downtempo
                          </option>
                          <option value="Pop • Electronic" className="bg-[#312042]">
                            Pop • Electronic
                          </option>
                          <option value="Synthwave • Dance" className="bg-[#312042]">
                            Synthwave • Dance
                          </option>
                          <option value="Chill • R&B" className="bg-[#312042]">
                            Chill • R&B
                          </option>
                          <option value="Hip-Hop • Trap" className="bg-[#312042]">
                            Hip-Hop • Trap
                          </option>
                        </select>
                      </div>

                      {/* Kolom Composer */}
                      <div>
                        <label className="block text-white/75 mb-1">
                          Composer (Pencipta Lagu)
                        </label>
                        <input
                          type="text"
                          value={trackComposer}
                          onChange={(e) => setTrackComposer(e.target.value)}
                          placeholder="Nama Lengkap Composer"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white/15 border border-white/25 font-medium text-white placeholder:text-white/40 focus:outline-none focus:border-[#c8f560]"
                        />
                      </div>

                      {/* Kolom Producer */}
                      <div>
                        <label className="block text-white/75 mb-1">
                          Producer (Produser Musik)
                        </label>
                        <input
                          type="text"
                          value={trackProducer}
                          onChange={(e) => setTrackProducer(e.target.value)}
                          placeholder="Nama Produser / Studio"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white/15 border border-white/25 font-medium text-white placeholder:text-white/40 focus:outline-none focus:border-[#c8f560]"
                        />
                      </div>

                      {/* Kolom Clip Potongan TikTok (Interaktif Tanpa Ngetik) */}
                      <div className="sm:col-span-2 p-3.5 rounded-2xl bg-white/10 border border-white/20 space-y-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <label className="text-white font-semibold flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#c8f560] animate-pulse" />
                            <span>Clip Potongan TikTok & Reels (Viral Hook)</span>
                          </label>
                          <span className="px-3 py-0.5 rounded-full bg-[#312042] text-[#c8f560] font-mono font-bold text-[11px]">
                            {formattedTiktokClip}
                          </span>
                        </div>

                        {/* Slider Geser Detik Mulai + Pilihan Durasi 15s / 30s / 60s */}
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                          <div className="flex-1 w-full">
                            <input
                              type="range"
                              min={0}
                              max={160}
                              step={5}
                              value={tiktokStartSec}
                              onChange={(e) => setTiktokStartSec(Number(e.target.value))}
                              className="w-full accent-[#c8f560] cursor-pointer h-1.5 rounded-lg"
                            />
                            <div className="flex justify-between text-[10px] text-white/60 mt-0.5">
                              <span>00:00 (Intro)</span>
                              <span>00:45 (Chorus 1)</span>
                              <span>01:30 (Drop)</span>
                              <span>02:40 (Outro)</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 bg-white/15 p-1 rounded-xl shrink-0">
                            {[15, 30, 60].map((dur) => (
                              <button
                                key={dur}
                                type="button"
                                onClick={() => setTiktokDurationSec(dur)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                                  tiktokDurationSec === dur
                                    ? "bg-[#312042] text-[#c8f560]"
                                    : "text-white/80 hover:text-white"
                                }`}
                              >
                                {dur}s
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Tombol Preset Potongan Cepat */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          <span className="text-[10px] text-white/65 mr-1">Pilih Cepat:</span>
                          {[
                            { label: "00:15 (Intro)", start: 15 },
                            { label: "00:45 (Reff/Chorus)", start: 45 },
                            { label: "01:15 (Beat Drop)", start: 75 },
                            { label: "01:50 (Climax)", start: 110 },
                          ].map((preset) => (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => setTiktokStartSec(preset.start)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-all ${
                                tiktokStartSec === preset.start
                                  ? "bg-[#c8f560] text-[#312042] font-semibold"
                                  : "bg-white/15 text-white/85 hover:bg-white/25"
                              }`}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Kolom Release Date Otomatis Tanpa Ngetik */}
                      <div className="sm:col-span-2 p-3.5 rounded-2xl bg-white/10 border border-white/20 space-y-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <label className="text-white font-semibold flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#c8f560]" />
                            <span>Release Date (Pilih Otomatis / Kalender)</span>
                          </label>
                          <span className="px-3 py-0.5 rounded-full bg-[#312042] text-[#c8f560] font-semibold text-[11px]">
                            Terjadwal: {formattedReleaseDate}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                          {/* Tombol Kalender Otomatis (Klik langsung buka datepicker tanpa ngetik) */}
                          <div className="sm:col-span-5">
                            <input
                              type="date"
                              value={trackDateIso}
                              onClick={(e) => {
                                try {
                                  (e.currentTarget as any).showPicker?.();
                                } catch {}
                              }}
                              onChange={(e) => setTrackDateIso(e.target.value)}
                              className="w-full px-3.5 py-2 rounded-xl bg-[#312042] border border-[#c8f560]/50 font-semibold text-white cursor-pointer focus:outline-none"
                            />
                          </div>

                          {/* Tombol Pilih Tanggal Otomatis 1-Klik */}
                          <div className="sm:col-span-7 flex flex-wrap items-center gap-1.5">
                            {[
                              { label: "Hari Ini", days: 0 },
                              { label: "+3 Hari", days: 3 },
                              { label: "+7 Hari (Rilis Global)", days: 7 },
                              { label: "+14 Hari", days: 14 },
                            ].map((dBtn) => (
                              <button
                                key={dBtn.label}
                                type="button"
                                onClick={() => applyQuickDate(dBtn.days)}
                                className="px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-[#c8f560] hover:text-[#312042] text-white text-[10px] font-medium transition-all"
                              >
                                {dBtn.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Kolom Barcode Digital UPC & ISRC Code */}
                      <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3.5 rounded-2xl bg-white/10 border border-white/20">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-white/80 font-semibold flex items-center gap-1.5 text-xs">
                              <span className="w-2 h-2 rounded-full bg-[#c8f560]" />
                              <span>UPC (Universal Product Code)</span>
                            </label>
                            <button
                              type="button"
                              onClick={() =>
                                setTrackUpc(
                                  `899${Math.floor(100000000 + Math.random() * 900000000)}`
                                )
                              }
                              className="text-[10px] text-[#c8f560] hover:underline"
                            >
                              🎲 Auto UPC
                            </button>
                          </div>
                          <input
                            type="text"
                            value={trackUpc}
                            onChange={(e) => setTrackUpc(e.target.value)}
                            placeholder="Contoh: 899214578109 (12 Digit)"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white/15 border border-white/25 font-mono font-bold text-white text-xs focus:outline-none focus:border-[#c8f560]"
                          />
                          <span className="text-[10px] text-white/55 mt-0.5 block">
                            Barcode digital album / single
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-white/80 font-semibold flex items-center gap-1.5 text-xs">
                              <span className="w-2 h-2 rounded-full bg-[#c8f560]" />
                              <span>ISRC Code</span>
                            </label>
                            <button
                              type="button"
                              onClick={() =>
                                setTrackIsrc(
                                  `ID-HRM-24-${Math.floor(10000 + Math.random() * 90000)}`
                                )
                              }
                              className="text-[10px] text-[#c8f560] hover:underline"
                            >
                              🎲 Auto ISRC
                            </button>
                          </div>
                          <input
                            type="text"
                            value={trackIsrc}
                            onChange={(e) => setTrackIsrc(e.target.value)}
                            placeholder="Contoh: ID-HRM-24-00109"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white/15 border border-white/25 font-mono font-bold text-[#c8f560] text-xs focus:outline-none focus:border-[#c8f560]"
                          />
                          <span className="text-[10px] text-white/55 mt-0.5 block">
                            Kode identifikasi master rekaman audio
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Cover Art Upload + Platform Selection */}
                <div
                  className="lg:col-span-5 flex flex-col gap-5 animate-card-enter"
                  style={{ animationDelay: "190ms" }}
                >
                  <div className={`${ROYALTY_CARD} text-center`}>
                    <div className="flex items-center gap-2 font-semibold text-sm text-left text-white mb-4">
                      <FolderOpen className="w-4 h-4 text-[#c8f560]" />
                      <span>Cover Art Upload</span>
                    </div>

                    <div className="w-28 h-28 mx-auto rounded-2xl overflow-hidden shadow-md mb-3 border border-white/30 flex items-center justify-center">
                      <img
                        src={uploadCoverUrl}
                        alt="Cover Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <p className="text-xs font-medium text-white/90">
                      {selectedCoverFile
                        ? `✓ File: ${selectedCoverFile.name} (siap diunggah saat Review)`
                        : "3000 × 3000 px • JPG / PNG / WEBP"}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
                      <button
                        type="button"
                        onClick={() => setActiveTab("generator")}
                        className="px-3.5 py-1.5 rounded-full bg-[#c8f560] text-[#312042] text-xs font-bold hover:opacity-90 flex items-center gap-1.5 shadow"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Generate Cover (AI)</span>
                      </button>

                      <label className="px-3.5 py-1.5 rounded-full bg-white/15 border border-white/30 text-xs font-medium text-white hover:bg-white/25 cursor-pointer flex items-center gap-1.5 transition-colors">
                        <FolderOpen className="w-3.5 h-3.5 text-[#c8f560]" />
                        <span>{selectedCoverFile ? "Ganti Cover" : "+ Upload Manual"}</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={handleCoverUpload}
                        />
                      </label>
                    </div>
                    <p className="text-[11px] text-white/65 mt-2">
                      Recommended: 3000×3000px, JPG/PNG, under 20MB
                    </p>
                  </div>

                  {/* Platform Selection — 50+ DSPs with Google Favicons */}
                  <div className={`${ROYALTY_CARD} flex-1`}>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 font-semibold text-sm text-white">
                        <Globe className="w-4 h-4 text-[#c8f560]" />
                        <span>Platform Distribusi ({selectedPlatforms.length}/{ALL_DSP_PLATFORMS.length})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedPlatforms(ALL_DSP_PLATFORMS.map((p) => p.name))}
                          className="px-2.5 py-1 rounded-lg bg-[#c8f560] text-[#312042] font-bold text-[10px] hover:bg-[#d8ff75] transition-all"
                        >
                          Pilih Semua ({ALL_DSP_PLATFORMS.length} DSP)
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedPlatforms([])}
                          className="px-2.5 py-1 rounded-lg bg-white/15 text-white text-[10px] hover:bg-white/25 transition-all"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-white/75 mb-3">
                      Lagu Anda akan didistribusikan ke jaringan global DSP terpilih berikut dengan logo resmi terverifikasi:
                    </p>

                    {/* Scrollable Grid of 50+ DSPs */}
                    <div className="max-h-[380px] overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {ALL_DSP_PLATFORMS.map((plat) => {
                        const checked = selectedPlatforms.includes(plat.name);
                        return (
                          <div
                            key={plat.id}
                            onClick={() => handleTogglePlatform(plat.name)}
                            className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 cursor-pointer select-none transition-all ${
                              checked
                                ? "bg-white/20 border-[#c8f560] shadow-sm"
                                : "bg-white/5 border-white/15 hover:bg-white/10"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                                <img
                                  src={plat.logoUrl}
                                  alt={plat.name}
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).style.display = "none";
                                  }}
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-white text-xs truncate">{plat.name}</p>
                                <p className="text-[10px] text-white/60 truncate">{plat.category}</p>
                              </div>
                            </div>

                            <div
                              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                checked
                                  ? "border-[#c8f560] bg-[#312042] text-[#c8f560]"
                                  : "border-white/35 bg-white/10"
                              }`}
                            >
                              {checked && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 pt-1">
                <button
                  type="button"
                  disabled={submittingTrack}
                  onClick={() => handleCreateRelease("Draft")}
                  className="sm:col-span-4 py-3.5 rounded-full bg-[#8a88b5]/70 hover:bg-[#8a88b5]/90 border border-white/25 text-white font-semibold text-xs transition-all"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  disabled={submittingTrack}
                  onClick={handleOpenReviewModal}
                  className="sm:col-span-8 py-3.5 rounded-full bg-[#312042] hover:bg-[#422c58] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <span>Review & Submit</span>
                  <ArrowRight className="w-4 h-4 text-[#c8f560]" />
                </button>
              </div>

              {/* REVIEW & SUBMIT MODAL */}
              {showReviewModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
                  <div className="bg-[#1a1429] border border-white/20 rounded-3xl max-w-2xl w-full p-6 sm:p-8 text-white shadow-2xl relative my-8 animate-card-enter">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-white/10">
                      <div className="flex items-center gap-2.5">
                        <span className="p-2 rounded-xl bg-[#c8f560] text-[#312042]">
                          <Shield className="w-5 h-5" />
                        </span>
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold">
                            {reviewSuccess ? "Rilisan Berhasil Terkirim" : "Review & Submit Rilisan"}
                          </h3>
                          <p className="text-xs text-white/65">
                            {reviewSuccess
                              ? "Langkah terakhir selesai"
                              : "Periksa kembali detail lagu sebelum dikirim ke peninjauan"}
                          </p>
                        </div>
                      </div>
                      {!reviewSubmitting && (
                        <button
                          type="button"
                          onClick={() => setShowReviewModal(false)}
                          className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    {/* Content: SUCCESS STATE */}
                    {reviewSuccess ? (
                      <div className="text-center py-6 space-y-5">
                        <div className="w-20 h-20 rounded-full bg-[#c8f560]/20 text-[#c8f560] border-2 border-[#c8f560]/50 mx-auto flex items-center justify-center shadow-lg">
                          <CheckCircle2 className="w-12 h-12 text-[#c8f560]" />
                        </div>
                        <div>
                          <h4 className="text-2xl font-bold text-white">
                            Selamat! Rilisan Anda Telah Terkirim
                          </h4>
                          <p className="text-sm text-white/80 mt-2 max-w-md mx-auto leading-relaxed">
                            Rilisan Anda telah berhasil dikirim dan akan ditinjau dalam{" "}
                            <span className="text-[#c8f560] font-semibold">10 - 15 hari</span>.
                          </p>
                        </div>

                        {/* Release Info Card */}
                        <div className="p-4 rounded-2xl bg-white/10 border border-white/15 text-xs text-left max-w-md mx-auto space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-white/60">Judul Lagu:</span>
                            <span className="text-white font-semibold truncate max-w-[200px]">{trackTitle}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-white/60">Artis:</span>
                            <span className="text-white font-semibold">{trackFeaturedArtistLabel()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-white/60">Status Rilisan:</span>
                            <span className="px-2.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 font-bold border border-yellow-500/30">
                              Pending Review (10-15 Hari)
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-white/60">Target Platform:</span>
                            <span className="text-white/90 font-medium">{selectedPlatforms.join(", ")}</span>
                          </div>
                        </div>

                        {/* Action Buttons: Lihat Rilisan & Klik Dashboard */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                          <button
                            type="button"
                            onClick={() => {
                              setShowReviewModal(false);
                              setActiveTab("releases");
                            }}
                            className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#c8f560] hover:bg-[#b5e050] text-[#312042] font-bold text-xs flex items-center justify-center gap-2 shadow-xl transition-all"
                          >
                            <ListMusic className="w-4 h-4" />
                            <span>Lihat Rilisan</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowReviewModal(false);
                              setActiveTab("overview");
                            }}
                            className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/30 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all"
                          >
                            <Home className="w-4 h-4 text-[#c8f560]" />
                            <span>Klik Dashboard</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Content: REVIEW & SUBMISSION FORM */
                      <div className="py-5 space-y-5">
                        {/* Summary Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 text-xs">
                          {/* Cover Thumbnail */}
                          <div className="sm:col-span-4 flex flex-col items-center justify-center">
                            <div className="w-28 h-28 rounded-xl overflow-hidden shadow-lg border border-white/20">
                              <img src={uploadCoverUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-[11px] text-white/60 mt-1.5 truncate max-w-[120px]">
                              {selectedCoverFile ? selectedCoverFile.name : "Cover Artwork"}
                            </span>
                          </div>

                          {/* Track Metadata */}
                          <div className="sm:col-span-8 space-y-2 flex flex-col justify-center">
                            <div>
                              <span className="text-[11px] text-[#c8f560] font-bold uppercase tracking-wider">
                                {trackGenre || "Pop"}
                              </span>
                              <h4 className="text-base sm:text-lg font-bold text-white truncate">
                                {trackTitle}
                              </h4>
                              <p className="text-white/80 font-medium">
                                {trackFeaturedArtistLabel()}
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10 text-[11px]">
                              <div>
                                <span className="text-white/50 block">Rencana Rilis:</span>
                                <span className="text-white/90 font-medium">{formattedReleaseDate}</span>
                              </div>
                              <div>
                                <span className="text-white/50 block">TikTok Clip:</span>
                                <span className="text-white/90 font-medium">{formattedTiktokClip}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Audio Details & Player */}
                        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-white font-medium truncate">
                              <Music className="w-4 h-4 text-[#c8f560] shrink-0" />
                              <span className="truncate">{audioFileName}</span>
                              {audioFileSize && <span className="text-white/60">• {audioFileSize}</span>}
                            </div>
                            <span className="text-[11px] text-[#c8f560] shrink-0 font-medium">
                              {selectedAudioFile ? "Siap Diunggah" : "Tersimpan"}
                            </span>
                          </div>
                          {(localAudioPreviewUrl || audioFileUrl) && (
                            <audio
                              controls
                              src={localAudioPreviewUrl || audioFileUrl}
                              className="w-full h-8 rounded-lg outline-none"
                            />
                          )}
                        </div>

                        {/* Selected Platforms */}
                        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs flex flex-wrap items-center gap-2">
                          <span className="text-white/60 mr-1 flex items-center gap-1">
                            <Globe className="w-3.5 h-3.5 text-[#c8f560]" />
                            <span>Distribusi:</span>
                          </span>
                          {selectedPlatforms.map((plat) => (
                            <span
                              key={plat}
                              className="px-2.5 py-1 rounded-full bg-white/10 text-white font-medium border border-white/15"
                            >
                              {plat}
                            </span>
                          ))}
                        </div>

                        {/* Real-time Progress Bar & Status */}
                        {reviewSubmitting && (
                          <div className="p-4 rounded-2xl bg-[#312042]/90 border border-[#c8f560]/40 text-xs space-y-2">
                            <div className="flex items-center gap-2 text-[#c8f560] font-semibold">
                              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                              <span>{reviewStatusStep || "Sedang memproses upload dan validasi..."}</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-[#c8f560] h-full w-full animate-pulse" />
                            </div>
                            <p className="text-[11px] text-white/65">
                              Jangan tutup browser saat proses pengunggahan master audio sedang berjalan.
                            </p>
                          </div>
                        )}

                        {/* Error Alert Box */}
                        {reviewError && (
                          <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/40 text-xs space-y-2 text-red-200">
                            <div className="flex items-center gap-2 font-bold text-red-400">
                              <AlertCircle className="w-4 h-4 shrink-0" />
                              <span>Proses Upload Mengalami Kendala</span>
                            </div>
                            <p className="text-[11px] text-red-300 leading-relaxed font-mono">
                              {reviewError}
                            </p>
                            <p className="text-[11px] text-white/70">
                              Tips: Pastikan file audio berformat WAV / MP3 / FLAC dan koneksi internet stabil. Anda dapat langsung mengklik tombol "Coba Lagi".
                            </p>
                          </div>
                        )}

                        {/* Modal Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3 border-t border-white/10">
                          <button
                            type="button"
                            disabled={reviewSubmitting}
                            onClick={() => setShowReviewModal(false)}
                            className="w-full sm:w-auto px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all disabled:opacity-50"
                          >
                            Batal / Periksa Kembali
                          </button>
                          <button
                            type="button"
                            disabled={reviewSubmitting}
                            onClick={executeUploadAndSubmitRelease}
                            className="w-full sm:w-auto px-7 py-3 rounded-full bg-[#c8f560] hover:bg-[#b5e050] text-[#312042] text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-60"
                          >
                            {reviewSubmitting ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Mengunggah...</span>
                              </>
                            ) : reviewError ? (
                              <>
                                <RefreshCw className="w-4 h-4" />
                                <span>Coba Lagi Upload & Submit</span>
                              </>
                            ) : (
                              <>
                                <span>Kirim Rilisan Sekarang</span>
                                <ArrowRight className="w-4 h-4" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              VIEW 4: RELEASES MANAGEMENT (MISAH: ACC, REVIEW, REJECT)
             ========================================================= */}
          {(activeTab === "releases" || activeTab === "in-review" || activeTab === "rejected") && (
            <div key={`releases-${activeTab}-${animKey}`} className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 animate-card-enter">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-semibold text-white">
                    {activeTab === "releases"
                      ? "My Releases — Rilis Resmi & ACC"
                      : activeTab === "in-review"
                      ? "Lagu Sedang Di-Review Tim Kurator"
                      : "Lagu Ditolak (Perlu Perbaikan Metadata/Audio)"}
                  </h1>
                  <p className="text-xs text-white/80 mt-1">
                    {activeTab === "releases"
                      ? "Katalog musik Anda yang telah disetujui dan aktif streaming di Spotify, Apple Music & TikTok."
                      : activeTab === "in-review"
                      ? "Rilisan dalam proses pengecekan kualitas audio master, artwork, dan ISRC/UPC oleh kurator."
                      : "Daftar lagu yang ditolak karena pelanggaran hak cipta atau format. Silakan periksa atau submit ulang."}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <p className="text-xs text-white/80">Total streams</p>
                    <p className="text-2xl sm:text-3xl font-semibold text-white mt-0.5 tabular-nums">
                      {animatedStreamsToday > 0 ? `${animatedStreamsToday.toLocaleString()}K` : "0"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/80">Royalty pending</p>
                    <p className="text-2xl sm:text-3xl font-semibold text-white mt-0.5 tabular-nums">
                      Rp {animatedRoyaltyPending.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("upload")}
                    className="px-5 py-3 rounded-full bg-[#312042] hover:bg-[#422c58] text-white text-xs font-medium flex items-center gap-2 shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Submit Track Baru</span>
                  </button>
                </div>
              </div>

              {/* 3-Pills Category Switcher Bar: ACC / Review / Reject */}
              <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white/10 border border-white/20 w-fit">
                <button
                  type="button"
                  onClick={() => setActiveTab("releases")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === "releases"
                      ? "bg-[#c8f560] text-[#312042] shadow-md scale-105"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>My Releases — ACC ({approvedUserReleases.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("in-review")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === "in-review"
                      ? "bg-[#fde08d] text-[#312042] shadow-md scale-105"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Sedang Di-Review ({reviewUserReleases.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("rejected")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === "rejected"
                      ? "bg-red-500 text-white shadow-md scale-105"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Ditolak / Reject ({rejectedUserReleases.length})</span>
                </button>
              </div>

              {/* 3 Big Stat Cards — Styled as Luxury VISA Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div onClick={() => setActiveTab("releases")} className="cursor-pointer">
                  <VisaMetricCard
                    title="Total Releases"
                    value={Math.round(totalReleasesCount * animProgress)}
                    subtitle="All releases"
                    dotColor="bg-[#c4c3f0]"
                    valueColor="text-white"
                    cardNumber="4532 •••• •••• 1024"
                    holderName={`${user?.name || "ARTIST"} • CATALOG`}
                    expiry="08/29"
                    tier="PLATINUM"
                    variant="lavender"
                    delayMs={60}
                  />
                </div>

                <div onClick={() => setActiveTab("releases")} className="cursor-pointer">
                  <VisaMetricCard
                    title="Approved (ACC)"
                    value={Math.round(approvedCount * animProgress)}
                    subtitle="Published to platforms"
                    dotColor="bg-[#c8f560]"
                    valueColor="text-[#c8f560]"
                    cardNumber="4532 •••• •••• 7718"
                    holderName={`${user?.name || "ARTIST"} • VERIFIED`}
                    expiry="12/29"
                    tier="SIGNATURE"
                    variant="lime-tint"
                    delayMs={130}
                  />
                </div>

                <div onClick={() => setActiveTab("in-review")} className="cursor-pointer">
                  <VisaMetricCard
                    title="In Review"
                    value={Math.round(pendingCount * animProgress)}
                    subtitle="Awaiting review"
                    dotColor="bg-[#fbbf24]"
                    valueColor="text-[#fde08d]"
                    cardNumber="4532 •••• •••• 3304"
                    holderName={`${user?.name || "ARTIST"} • QUEUE`}
                    expiry="05/28"
                    tier="INFINITE"
                    variant="plum"
                    delayMs={200}
                  />
                </div>
              </div>

              {/* Bottom Row: Separated Releases Table + Release Calendar */}
              {(() => {
                const displayedReleases =
                  activeTab === "releases"
                    ? approvedUserReleases
                    : activeTab === "in-review"
                    ? reviewUserReleases
                    : rejectedUserReleases;

                const paginatedReleases = displayedReleases.slice((pageReleases - 1) * 5, pageReleases * 5);

                const sectionHeading =
                  activeTab === "releases"
                    ? "My Releases — ACC"
                    : activeTab === "in-review"
                    ? "Lagu Sedang Di-Review"
                    : "Lagu Di-Reject (Ditolak)";

                const emptyTitle =
                  activeTab === "releases"
                    ? "Belum Ada Lagu yang Di-ACC"
                    : activeTab === "in-review"
                    ? "Tidak Ada Lagu yang Sedang Ditinjau"
                    : "Bagus! Tidak Ada Lagu yang Ditolak";

                const emptyDesc =
                  activeTab === "releases"
                    ? "Lagu Anda yang telah lolos moderasi dan disetujui kurator akan tampil di sini."
                    : activeTab === "in-review"
                    ? "Semua lagu yang Anda ajukan telah selesai diverifikasi oleh kurator."
                    : "Semua pengajuan musik Anda berjalan lancar tanpa ada yang ditolak.";

                return (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    <div
                      className={`lg:col-span-8 ${ROYALTY_CARD} flex flex-col animate-card-enter`}
                      style={{ animationDelay: "260ms" }}
                    >
                      <div className="pb-3 flex items-center justify-between border-b border-white/15">
                        <h3 className="text-sm font-medium text-white">{sectionHeading}</h3>
                        <span className="text-xs text-[#c8f560] font-mono">
                          Total: {displayedReleases.length} Track
                        </span>
                      </div>

                      {/* Mobile Card List (< md) */}
                      <div className="md:hidden space-y-3 pt-3">
                        {displayedReleases.length === 0 ? (
                          <div className="py-10 text-center text-white/70 space-y-2">
                            <FolderOpen className="w-10 h-10 mx-auto text-white/25 mb-1" />
                            <p className="font-semibold text-sm text-white">{emptyTitle}</p>
                            <p className="text-xs text-white/60 max-w-xs mx-auto">{emptyDesc}</p>
                            {activeTab === "releases" && (
                              <button
                                onClick={() => setActiveTab("upload")}
                                className="mt-2 px-4 py-1.5 rounded-full bg-[#312042] text-xs text-[#c8f560] font-semibold"
                              >
                                + Submit Lagu Baru
                              </button>
                            )}
                          </div>
                        ) : (
                          paginatedReleases.map((item) => (
                            <div
                              key={item.id}
                              className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5"
                            >
                              <div className="flex items-start gap-3">
                                <img
                                  src={item.coverUrl}
                                  alt={item.title}
                                  className="w-12 h-12 rounded-xl object-cover shrink-0 border border-white/20"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start justify-between gap-1">
                                    <h4 className="font-semibold text-xs text-white truncate">{item.title}</h4>
                                    {item.status === "Approved" ? (
                                      <span className="px-2 py-0.5 rounded-full bg-[#c8f560] text-[#312042] font-bold text-[10px] shrink-0">
                                        ✓ Approved
                                      </span>
                                    ) : item.status === "Rejected" ? (
                                      <span className="px-2 py-0.5 rounded-full bg-red-500/25 border border-red-500/40 text-red-200 font-bold text-[10px] shrink-0">
                                        ✕ Rejected
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded-full bg-[#fde08d] text-[#312042] font-bold text-[10px] shrink-0">
                                        ⏳ Review
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-white/70 truncate mt-0.5">{item.genre}</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-1 pt-2 border-t border-white/10 text-[10px]">
                                <div>
                                  <span className="text-white/50 block">Rilis</span>
                                  <span className="text-white font-medium truncate block">{item.releaseDate}</span>
                                </div>
                                <div>
                                  <span className="text-white/50 block">UPC</span>
                                  <span className="text-white/90 font-mono truncate block">{item.upc || "899214578101"}</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-white/50 block">ISRC</span>
                                  <span className="text-[#c8f560] font-mono font-bold truncate block">{item.isrc || "ID-HRM-24-00101"}</span>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Desktop Table (md:block) */}
                      <div className="hidden md:block pt-3 flex-1 overflow-x-auto">
                        <div className="min-w-[580px]">
                          <div className="grid grid-cols-12 text-xs text-white/65 pb-3 border-b border-white/15 px-2">
                            <div className="col-span-4 font-semibold">Title</div>
                            <div className="col-span-2 text-center font-semibold">Release Date</div>
                            <div className="col-span-2 text-center font-semibold">UPC Barcode</div>
                            <div className="col-span-2 text-center font-semibold">ISRC Code</div>
                            <div className="col-span-2 text-right font-semibold">Status</div>
                          </div>

                          {displayedReleases.length === 0 ? (
                            <div className="py-12 text-center text-white/70 space-y-2">
                              <FolderOpen className="w-12 h-12 mx-auto text-white/25 mb-1" />
                              <p className="font-semibold text-base text-white">{emptyTitle}</p>
                              <p className="text-xs text-white/60 max-w-sm mx-auto">{emptyDesc}</p>
                              {activeTab === "releases" && (
                                <button
                                  onClick={() => setActiveTab("upload")}
                                  className="mt-3 px-5 py-2 rounded-full bg-[#312042] text-xs text-[#c8f560] font-semibold hover:scale-105 transition-all shadow-md"
                                >
                                  + Submit Lagu Baru
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="divide-y divide-white/15">
                              {paginatedReleases.map((item) => (
                                <div
                                  key={item.id}
                                  className="grid grid-cols-12 items-center py-3.5 text-xs hover:bg-white/5 rounded-xl px-2 transition-colors"
                                >
                                  <div className="col-span-4 flex items-center gap-3 min-w-0 pr-2">
                                    <img
                                      src={item.coverUrl}
                                      alt={item.title}
                                      className="w-11 h-11 rounded-xl object-cover border border-white/25 shrink-0"
                                    />
                                    <div className="min-w-0">
                                      <p className="font-semibold text-white truncate">{item.title}</p>
                                      <p className="text-[11px] text-white/70 truncate">{item.genre}</p>
                                    </div>
                                  </div>
                                  <div className="col-span-2 text-center font-medium text-white/90 whitespace-nowrap">
                                    {item.releaseDate}
                                  </div>
                                  <div className="col-span-2 text-center font-mono font-semibold text-white/95 text-[11px] whitespace-nowrap">
                                    {item.upc || "899214578101"}
                                  </div>
                                  <div className="col-span-2 text-center font-mono font-bold text-[#c8f560] text-[11px] whitespace-nowrap">
                                    {item.isrc || "ID-HRM-24-00101"}
                                  </div>
                                  <div className="col-span-2 flex justify-end">
                                    {item.status === "Approved" ? (
                                      <span className="px-3 py-1 rounded-full bg-[#c8f560] text-[#312042] font-semibold flex items-center gap-1 text-[11px] whitespace-nowrap">
                                        <Check className="w-3 h-3" /> Approved
                                      </span>
                                    ) : item.status === "Rejected" ? (
                                      <span className="px-3 py-1 rounded-full bg-red-500/25 border border-red-500/40 text-red-200 font-semibold flex items-center gap-1 text-[11px] whitespace-nowrap">
                                        ✕ Rejected
                                      </span>
                                    ) : (
                                      <span className="px-3 py-1 rounded-full bg-[#fde08d] text-[#312042] font-semibold flex items-center gap-1 text-[11px] whitespace-nowrap">
                                        <Clock className="w-3 h-3" /> Review
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Pagination (5 item per halaman) */}
                      <Pagination
                        currentPage={pageReleases}
                        totalItems={displayedReleases.length}
                        pageSize={5}
                        onPageChange={setPageReleases}
                      />
                    </div>

                    {/* Release Calendar — Translucent Lavender */}
                    <div
                      className={`lg:col-span-4 ${ROYALTY_CARD} flex flex-col justify-between animate-card-enter`}
                      style={{ animationDelay: "320ms" }}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-medium text-white">Release Calendar</h3>
                          <span className="text-xs text-white/75">Schedule ▾</span>
                        </div>
                        <p className="text-xs text-white/70">
                          Jadwal rilis live multi-DSP (Spotify, Apple Music, YouTube Music, Deezer)
                        </p>
                      </div>

                      <div className="mt-4 p-4 rounded-2xl bg-white/10 border border-white/10 space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white/70">Status Moderasi</span>
                          <span className="font-bold text-[#c8f560]">24 - 48 Jam</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white/70">Jangkauan DSP</span>
                          <span className="font-bold text-white">150+ Negara</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white/70">Split Royalti</span>
                          <span className="font-bold text-[#c8f560]">100% Artist Share</span>
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => setActiveTab("upload")}
                          className="w-full py-2.5 rounded-xl bg-[#c8f560] text-[#312042] font-bold text-xs hover:bg-[#b5e050] transition-colors shadow"
                        >
                          + Submit Release Baru
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* =========================================================
              VIEW 5: ROYALTY & WITHDRAWALS — ALL CARDS MATCH ROYALTY GROWTH
             ========================================================= */}
          {activeTab === "wallet" && (
            <div key={`wallet-${animKey}`} className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 animate-card-enter">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-semibold text-white">
                    Welcome Back, {user?.name || "Abdul"}!
                  </h1>
                  <p className="text-xs text-white/80 mt-1">
                    information designed to accurate insights
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <p className="text-xs text-white/80">Periode Royalti</p>
                    <p className="text-xl sm:text-2xl font-bold text-[#c8f560] mt-0.5">
                      Bulan {user?.royaltyMonth || "November"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/80">Total Royalti</p>
                    <p className="text-2xl sm:text-3xl font-semibold text-white mt-0.5 tabular-nums">
                      Rp {animatedRoyaltyBalance.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/80">Royalti Pending</p>
                    <p className="text-2xl sm:text-3xl font-semibold text-white mt-0.5 tabular-nums">
                      Rp {animatedRoyaltyPending.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("upload")}
                    className="px-5 py-3 rounded-full bg-[#312042] hover:bg-[#422c58] text-white text-xs font-medium flex items-center gap-2 shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Release</span>
                  </button>
                </div>
              </div>

              {/* 3 Big Balance Cards — Styled as Luxury VISA Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <VisaMetricCard
                  title="Royalty Balance"
                  value={`Rp ${Math.round((user?.royaltyBalance || 0) * animProgress).toLocaleString("id-ID")}`}
                  subtitle="Available for withdrawal"
                  dotColor="bg-[#c8f560]"
                  valueColor="text-[#c8f560]"
                  cardNumber="4532 •••• •••• 8891"
                  holderName={`${user?.name || "ARTIST"} • BREAKOUT PAY`}
                  expiry="09/29"
                  tier="INFINITE"
                  variant="lime-tint"
                  delayMs={60}
                />

                <VisaMetricCard
                  title="Total Withdrawn"
                  value={`Rp ${Math.round((user?.totalWithdrawn || 0) * animProgress).toLocaleString("id-ID")}`}
                  subtitle="Completed payouts"
                  dotColor="bg-[#c4c3f0]"
                  valueColor="text-white"
                  cardNumber="4532 •••• •••• 5204"
                  holderName={`${user?.name || "ARTIST"} • SETTLED`}
                  expiry="11/28"
                  tier="SIGNATURE"
                  variant="lavender"
                  delayMs={130}
                />

                <VisaMetricCard
                  title="Pending Withdrawal"
                  value={`Rp ${Math.round((user?.pendingWithdraw || 0) * animProgress).toLocaleString("id-ID")}`}
                  subtitle="Processing"
                  dotColor="bg-[#f59e0b]"
                  valueColor="text-[#fde08d]"
                  cardNumber="4532 •••• •••• 0309"
                  holderName={`${user?.name || "ARTIST"} • ESCROW`}
                  expiry="04/29"
                  tier="PLATINUM"
                  variant="plum"
                  delayMs={200}
                />
              </div>

              {/* Bottom Row: Withdrawal History + Withdraw Form */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div
                  className={`lg:col-span-7 ${ROYALTY_CARD} flex flex-col animate-card-enter`}
                  style={{ animationDelay: "260ms" }}
                >
                  <div className="pb-3 flex items-center justify-between border-b border-white/15">
                    <h3 className="text-sm font-medium text-white">Withdrawal History</h3>
                    <span className="text-xs text-[#c8f560] underline cursor-pointer">
                      Total: {withdrawals.length} Transaksi
                    </span>
                  </div>

                  <div className="pt-3 flex-1">
                    {/* Mobile Withdrawal Cards (< sm) */}
                    <div className="sm:hidden space-y-2.5">
                      {withdrawals.length === 0 ? (
                        <div className="py-8 text-center text-white/70">
                          <Building2 className="w-8 h-8 mx-auto text-white/25 mb-1" />
                          <p className="font-semibold text-xs text-white">Belum Ada Riwayat Penarikan</p>
                        </div>
                      ) : (
                        withdrawals.map((w) => (
                          <div
                            key={w.id}
                            className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 font-medium text-white">
                                {w.method.includes("E-Wallet") ? (
                                  <Smartphone className="w-3.5 h-3.5 text-[#c8f560]" />
                                ) : (
                                  <Building2 className="w-3.5 h-3.5 text-[#c8f560]" />
                                )}
                                <span>{w.method}</span>
                              </div>
                              {w.status === "Approved" ? (
                                <span className="px-2 py-0.5 rounded-full bg-[#c8f560] text-[#312042] font-bold text-[10px]">
                                  ✓ Approved
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-[#fde08d] text-[#312042] font-bold text-[10px]">
                                  ⏳ {w.status}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-white/10">
                              <div>
                                <span className="text-white/60 text-[11px] block">{w.date}</span>
                                {w.accountHolder && (
                                  <span className="text-[10px] text-white/80">A/N: {w.accountHolder}</span>
                                )}
                              </div>
                              <span className="font-bold text-sm text-[#c8f560]">
                                Rp {w.amount.toLocaleString("id-ID")}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Desktop Withdrawal Table (sm:block) */}
                    <div className="hidden sm:block">
                      <div className="grid grid-cols-12 text-xs text-white/65 pb-3 border-b border-white/15">
                        <div className="col-span-3">Date</div>
                        <div className="col-span-3 text-center">Amount</div>
                        <div className="col-span-3 text-center">Method</div>
                        <div className="col-span-3 text-right">Status</div>
                      </div>

                      {withdrawals.length === 0 ? (
                        <div className="py-10 text-center text-white/70">
                          <Building2 className="w-10 h-10 mx-auto text-white/25 mb-2" />
                          <p className="font-semibold text-sm text-white">Belum Ada Riwayat Penarikan</p>
                          <p className="text-xs text-white/60 mt-1 max-w-sm mx-auto">
                            Anda belum mengajukan pencairan saldo royalti. Ajukan penarikan melalui formulir di samping.
                          </p>
                        </div>
                      ) : (
                        <div className="divide-y divide-white/15">
                          {withdrawals.map((w) => (
                            <div
                              key={w.id}
                              className="grid grid-cols-12 items-center py-4 text-xs"
                            >
                              <div className="col-span-3">
                                <span className="font-medium text-white/90 block">{w.date}</span>
                                {w.accountHolder && (
                                  <span className="text-[10px] text-white/70">A/N: {w.accountHolder}</span>
                                )}
                              </div>
                              <div className="col-span-3 text-center font-bold text-[#c8f560]">
                                Rp {w.amount.toLocaleString("id-ID")}
                              </div>
                              <div className="col-span-3 flex items-center justify-center gap-1.5 font-medium text-white">
                                {w.method.includes("E-Wallet") ? (
                                  <Smartphone className="w-3.5 h-3.5 text-[#c8f560]" />
                                ) : (
                                  <Building2 className="w-3.5 h-3.5 text-[#c8f560]" />
                                )}
                                <span>{w.method}</span>
                              </div>
                              <div className="col-span-3 flex justify-end">
                                {w.status === "Approved" ? (
                                  <span className="px-3.5 py-1 rounded-full bg-[#c8f560] text-[#312042] font-semibold flex items-center gap-1 text-[11px]">
                                    <Check className="w-3 h-3" /> Approved
                                  </span>
                                ) : (
                                  <span className="px-3.5 py-1 rounded-full bg-[#fde08d] text-[#312042] font-semibold flex items-center gap-1 text-[11px]">
                                    <Clock className="w-3 h-3" /> {w.status}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Withdraw Form Card — Translucent Lavender */}
                <div
                  className={`lg:col-span-5 ${ROYALTY_CARD} animate-card-enter`}
                  style={{ animationDelay: "320ms" }}
                >
                  <h3 className="text-sm font-medium text-white mb-4">Withdraw Form</h3>

                  <form onSubmit={handleWithdrawSubmit} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block text-white/75 mb-1">Withdrawal Method</label>
                      <select
                        value={withdrawMethod}
                        onChange={(e) => setWithdrawMethod(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/15 border border-white/25 font-medium text-white focus:outline-none focus:border-[#c8f560]"
                      >
                        <option value="Bank • BCA" className="bg-[#312042]">Bank • BCA</option>
                        <option value="Bank • Mandiri" className="bg-[#312042]">Bank • Mandiri</option>
                        <option value="Bank • BNI" className="bg-[#312042]">Bank • BNI</option>
                        <option value="Bank • BRI" className="bg-[#312042]">Bank • BRI</option>
                        <option value="Bank • Seabank" className="bg-[#312042]">Bank • Seabank</option>
                        <option value="E-Wallet • OVO" className="bg-[#312042]">E-Wallet • OVO</option>
                        <option value="E-Wallet • GoPay" className="bg-[#312042]">E-Wallet • GoPay</option>
                        <option value="E-Wallet • DANA" className="bg-[#312042]">E-Wallet • DANA</option>
                        <option value="E-Wallet • ShopeePay" className="bg-[#312042]">E-Wallet • ShopeePay</option>
                      </select>

                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {[
                          { label: "Mandiri", val: "Bank • Mandiri", bg: "bg-white/20 text-white" },
                          { label: "BNI", val: "Bank • BNI", bg: "bg-white/20 text-white" },
                          { label: "BRI", val: "Bank • BRI", bg: "bg-white/20 text-white" },
                          { label: "Seabank", val: "Bank • Seabank", bg: "bg-white/20 text-white" },
                          { label: "OVO", val: "E-Wallet • OVO", bg: "bg-[#c8f560] text-[#312042]" },
                          { label: "GoPay", val: "E-Wallet • GoPay", bg: "bg-[#c8f560] text-[#312042]" },
                          { label: "DANA", val: "E-Wallet • DANA", bg: "bg-white/15 text-white" },
                          { label: "ShopeePay", val: "E-Wallet • ShopeePay", bg: "bg-white/15 text-white" },
                        ].map((m) => (
                          <button
                            key={m.label}
                            type="button"
                            onClick={() => setWithdrawMethod(m.val)}
                            className={`px-2 py-0.5 rounded text-[10px] font-medium ${m.bg} hover:opacity-85`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-white/75 mb-1">
                        Nama Pemilik Rekening Bank <span className="text-[#c8f560] text-[11px] font-normal">(Sesuai Buku Tabungan / KTP)</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={accountHolder}
                        onChange={(e) => setAccountHolder(e.target.value)}
                        placeholder="Contoh: Budi Santoso"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/15 border border-white/25 font-medium text-white focus:outline-none focus:border-[#c8f560] placeholder-white/35"
                      />
                      <p className="text-[10px] text-white/60 mt-1">
                        *Nama asli pemilik rekening (bisa berbeda dari nama panggung artis).
                      </p>
                    </div>

                    <div>
                      <label className="block text-white/75 mb-1">Nomor Rekening / No. HP E-Wallet</label>
                      <input
                        type="text"
                        required
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="Contoh: 1234 5678 9012"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/15 border border-white/25 font-medium text-white focus:outline-none focus:border-[#c8f560]"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-white/75">Jumlah Penarikan (Amount)</label>
                        <span className="text-[10px] text-white/60">
                          Maks: <strong className="text-[#c8f560]">Rp {Math.max(0, user?.royaltyBalance || 0).toLocaleString("id-ID")}</strong>
                        </span>
                      </div>
                      <div className={`px-3.5 py-2 rounded-xl bg-white/15 border transition-colors ${
                        parseFormattedNumber(withdrawAmount) > Math.max(0, user?.royaltyBalance || 0)
                          ? "border-red-400 bg-red-500/10"
                          : "border-white/25 focus-within:border-[#c8f560]"
                      }`}>
                        <div className="flex items-center font-semibold text-white">
                          <span className={`mr-2 text-sm font-bold ${
                            parseFormattedNumber(withdrawAmount) > Math.max(0, user?.royaltyBalance || 0)
                              ? "text-red-400"
                              : "text-[#c8f560]"
                          }`}>Rp</span>
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder="0"
                            disabled={Math.max(0, user?.royaltyBalance || 0) <= 0}
                            value={withdrawAmount}
                            onChange={(e) => {
                              const parsed = parseFormattedNumber(e.target.value);
                              const maxBal = Math.max(0, user?.royaltyBalance || 0);
                              if (parsed > maxBal) {
                                setWithdrawAmount(formatNumberWithDots(maxBal));
                                showNotice(`Batas maksimal penarikan sesuai saldo Anda: Rp ${maxBal.toLocaleString("id-ID")}`);
                              } else {
                                const formatted = formatNumberWithDots(e.target.value);
                                setWithdrawAmount(formatted);
                              }
                            }}
                            className="w-full bg-transparent text-white focus:outline-none placeholder-white/40 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </div>
                      </div>

                      {/* Warning text if exceeding */}
                      {parseFormattedNumber(withdrawAmount) > Math.max(0, user?.royaltyBalance || 0) && (
                        <p className="text-[11px] font-semibold text-red-300 mt-1.5 flex items-center gap-1 bg-red-500/20 px-2.5 py-1 rounded-lg border border-red-500/40">
                          ⚠️ Melebihi saldo! Saldo maksimal Anda Rp {Math.max(0, user?.royaltyBalance || 0).toLocaleString("id-ID")}
                        </p>
                      )}

                      {/* Quick Fill Percentage Shortcuts */}
                      {Math.max(0, user?.royaltyBalance || 0) > 0 && (
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="text-[10px] text-white/60 mr-1">Pilih Cepat:</span>
                          <button
                            type="button"
                            onClick={() => setWithdrawAmount(formatNumberWithDots(Math.floor(Math.max(0, user?.royaltyBalance || 0) * 0.25)))}
                            className="px-2 py-0.5 rounded-lg bg-white/15 hover:bg-white/25 text-[10px] font-medium text-white transition-colors"
                          >
                            25%
                          </button>
                          <button
                            type="button"
                            onClick={() => setWithdrawAmount(formatNumberWithDots(Math.floor(Math.max(0, user?.royaltyBalance || 0) * 0.5)))}
                            className="px-2 py-0.5 rounded-lg bg-white/15 hover:bg-white/25 text-[10px] font-medium text-white transition-colors"
                          >
                            50%
                          </button>
                          <button
                            type="button"
                            onClick={() => setWithdrawAmount(formatNumberWithDots(Math.max(0, user?.royaltyBalance || 0)))}
                            className="px-2.5 py-0.5 rounded-lg bg-[#c8f560] hover:bg-[#d8ff75] text-[10px] font-bold text-[#312042] transition-colors"
                          >
                            Tarik Semua (100%)
                          </button>
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={
                        submittingWithdraw ||
                        Math.max(0, user?.royaltyBalance || 0) <= 0 ||
                        parseFormattedNumber(withdrawAmount) <= 0 ||
                        parseFormattedNumber(withdrawAmount) > Math.max(0, user?.royaltyBalance || 0)
                      }
                      className={`w-full py-3 rounded-xl font-bold text-xs transition-all ${
                        Math.max(0, user?.royaltyBalance || 0) <= 0
                          ? "bg-white/10 text-white/35 cursor-not-allowed border border-white/10"
                          : parseFormattedNumber(withdrawAmount) > Math.max(0, user?.royaltyBalance || 0)
                          ? "bg-red-500/20 text-red-300 border border-red-500/40 cursor-not-allowed"
                          : parseFormattedNumber(withdrawAmount) <= 0
                          ? "bg-white/15 text-white/50 cursor-not-allowed"
                          : "bg-[#c8f560] text-[#312042] hover:bg-[#d8ff75] shadow-md hover:scale-[1.01]"
                      }`}
                    >
                      {submittingWithdraw
                        ? "Memproses Penarikan..."
                        : Math.max(0, user?.royaltyBalance || 0) <= 0
                        ? "Saldo Rp 0 (Tidak Ada Saldo)"
                        : parseFormattedNumber(withdrawAmount) > Math.max(0, user?.royaltyBalance || 0)
                        ? "Nominal Melebihi Saldo Tersedia"
                        : parseFormattedNumber(withdrawAmount) <= 0
                        ? "Masukkan Jumlah Penarikan"
                        : `Tarik Saldo Rp ${parseFormattedNumber(withdrawAmount).toLocaleString("id-ID")}`}
                    </button>

                    <p className="text-center text-[10px] text-white/65">
                      Funds arrive within 1–3 business days
                    </p>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              VIEW: INBOX (PESAN MASUK DARI ADMIN)
             ========================================================= */}
          {activeTab === "inbox" && (
            <div key={`inbox-${animKey}`} className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 animate-card-enter">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-semibold text-white">
                    Pesan Masuk (Inbox)
                  </h1>
                  <p className="text-xs text-white/80 mt-1">
                    Pemberitahuan resmi dan pesan dari Label Admin BREAKOUT
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1.5 rounded-full bg-white/15 border border-white/20 text-xs font-medium text-[#c8f560]">
                    {messages.length} Pesan Diterima
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className={`${ROYALTY_CARD} text-center py-16 animate-card-enter`}>
                    <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3 text-white/60">
                      <Mail className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-semibold text-white">Belum Ada Pesan Masuk</h3>
                    <p className="text-xs text-white/70 mt-1">
                      Pesan atau pengumuman dari label admin akan tampil di sini
                    </p>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div
                      key={msg.id}
                      className={`${ROYALTY_CARD} animate-card-enter flex flex-col gap-2.5 transition-all hover:bg-[#8a88b5]/85`}
                      style={{ animationDelay: `${idx * 80}ms` }}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/15 pb-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#312042] text-[#c8f560] flex items-center justify-center font-bold text-xs">
                            B
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-[#c8f560]">
                              {msg.sender || "Admin BREAKOUT"}
                            </span>
                            <span className="text-[10px] text-white/60 ml-2">
                              {new Date(msg.createdAt).toLocaleString("id-ID")}
                            </span>
                          </div>
                        </div>

                        <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-[10px] font-medium text-white/90">
                          {msg.userId ? "Pesan Khusus" : "Broadcast Semua Artis"}
                        </span>
                      </div>

                      <h3 className="text-sm font-semibold text-white mt-1">{msg.title}</h3>
                      <p className="text-xs text-white/85 leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* =========================================================
              VIEW: OFFICIAL MUSIC CATALOG & PUBLISHER MASTER LINKS
             ========================================================= */}
          {activeTab === "catalog" && (
            <div className="space-y-6 animate-card-enter">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-[#c8f560] text-[#312042] shadow-md">
                      <ListMusic className="w-5 h-5" />
                    </span>
                    <span>Official Music Catalog & Publishing</span>
                  </h2>
                  <p className="text-xs text-white/75 mt-1">
                    Daftar resmi SONG ID, Judul Lagu, Vokal/Artis, Publisher Hak Cipta, Status Aktif, dan Tautan Master YouTube / Google Drive
                  </p>
                </div>

                {/* Source Switcher Pills */}
                <div className="flex items-center gap-2 bg-black/25 p-1 rounded-2xl border border-white/15">
                  <button
                    type="button"
                    onClick={() => {
                      setCatalogSource("master");
                      setPageCatalog(1);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      catalogSource === "master"
                        ? "bg-[#c8f560] text-[#312042] shadow"
                        : "text-white/80 hover:text-white"
                    }`}
                  >
                    Katalog Master & Drive ({catalogs.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCatalogSource("damarlangit");
                      setDamarPage(1);
                      if (damarSongs.length === 0) fetchDamarCatalog(1, catalogSearch);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      catalogSource === "damarlangit"
                        ? "bg-[#c8f560] text-[#312042] shadow"
                        : "text-white/80 hover:text-white"
                    }`}
                  >
                    <span>Publisher Damarlangit</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                      {damarTotal > 0 ? `${damarTotal.toLocaleString("id-ID")}` : "8.400+"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md">
                  <div className="relative flex-1 min-w-[240px]">
                    <Search className="w-4 h-4 text-white/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={catalogSearch}
                      onChange={(e) => {
                        setCatalogSearch(e.target.value);
                        setPageCatalog(1);
                        setDamarPage(1);
                      }}
                      placeholder={
                        catalogSource === "master"
                          ? "Cari berdasarkan Song ID, Judul Lagu, Vokal / Artis, atau Publisher..."
                          : "Cari lagu Damarlangit (Judul lagu, artis, pencipta/komposer)..."
                      }
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/15 border border-white/25 text-white text-xs placeholder:text-white/40 focus:outline-none focus:border-[#c8f560]"
                    />
                  </div>
                  {catalogSearch && (
                    <button
                      type="button"
                      onClick={() => {
                        setCatalogSearch("");
                        setPageCatalog(1);
                        setDamarPage(1);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs hover:bg-white/20"
                    >
                      Reset Filter
                    </button>
                  )}
                </div>

                {/* Publisher Quick Filters (For Master Catalog) */}
                {catalogSource === "master" && (
                  <div className="flex flex-wrap items-center gap-2 px-1">
                    <span className="text-[11px] font-bold text-white/70 uppercase tracking-wider mr-1">
                      Publisher:
                    </span>
                    {["ALL", ...Array.from(new Set(catalogs.map((c) => c.publisher))).filter(Boolean)].map((pub) => {
                      const isSel = catalogPublisherFilter === pub;
                      return (
                        <button
                          key={pub}
                          type="button"
                          onClick={() => {
                            setCatalogPublisherFilter(pub);
                            setPageCatalog(1);
                          }}
                          className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                            isSel
                              ? "bg-[#c8f560] text-[#312042] shadow scale-102"
                              : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white border border-white/10"
                          }`}
                        >
                          {pub === "ALL" ? "Semua Publisher" : pub}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* VIEW 1: MASTER CATALOG WITH YT & DRIVE LINKS */}
              {catalogSource === "master" && (
                <div className={`${ROYALTY_CARD} p-3 sm:p-5 border border-white/20`}>
                  {(() => {
                    const filteredCatalogs = catalogs.filter((item) => {
                      const matchSearch =
                        !catalogSearch ||
                        item.songId?.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                        item.title?.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                        item.artist?.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                        item.publisher?.toLowerCase().includes(catalogSearch.toLowerCase());
                      const matchPub =
                        catalogPublisherFilter === "ALL" ||
                        item.publisher?.toLowerCase() === catalogPublisherFilter.toLowerCase();
                      return matchSearch && matchPub;
                    });
                    const paginatedCatalogs = filteredCatalogs.slice((pageCatalog - 1) * 6, pageCatalog * 6);

                    return (
                      <>
                        {/* Mobile Catalog Card List (< md) */}
                        <div className="md:hidden space-y-3">
                          {catalogs.length === 0 ? (
                            <div className="py-10 text-center text-white/60 text-xs">
                              <ListMusic className="w-8 h-8 mx-auto text-white/20 mb-2" />
                              <p className="font-semibold text-white/80">Katalog Musik Masih Kosong</p>
                              <p className="text-white/50 text-[11px] mt-1">Lagu resmi yang diupload oleh label/admin akan tercantum di sini.</p>
                            </div>
                          ) : filteredCatalogs.length === 0 ? (
                            <div className="py-8 text-center text-white/60 text-xs">
                              Tidak ada lagu di katalog yang sesuai dengan pencarian Anda.
                            </div>
                          ) : (
                            paginatedCatalogs.map((item) => (
                              <div
                                key={item.id}
                                className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5 text-xs"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/25 border border-white/15">
                                    <span className="text-[#c8f560] font-mono font-bold text-[11px]">{item.songId}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleCopySongId(item.songId)}
                                      title="Salin Song ID"
                                      className="text-white/60 hover:text-white"
                                    >
                                      {copiedSongId === item.songId ? (
                                        <Check className="w-3 h-3 text-[#c8f560]" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </button>
                                  </div>

                                  {item.status.toLowerCase() === "aktif" ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#c8f560] text-[#312042] font-bold text-[10px]">
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#312042] animate-pulse" />
                                      Aktif
                                    </span>
                                  ) : item.status.toLowerCase() === "review" ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#fde08d] text-[#312042] font-bold text-[10px]">
                                      Review
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-white font-medium text-[10px]">
                                      Nonaktif
                                    </span>
                                  )}
                                </div>

                                <div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg bg-white/15 flex items-center justify-center text-[#c8f560] shrink-0">
                                      <Music className="w-3 h-3" />
                                    </div>
                                    <h4 className="font-bold text-white text-xs truncate">{item.title}</h4>
                                  </div>
                                  <p className="text-white/80 text-[11px] truncate mt-1">
                                    Vokal / Artis: <strong className="text-white">{item.artist}</strong>
                                  </p>
                                  <p className="text-white/60 text-[10px] truncate mt-0.5">
                                    Publisher: <span className="text-white/85">{item.publisher}</span>
                                  </p>
                                </div>

                                {(item.youtubeLink || item.driveLink) && (
                                  <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                                    {item.youtubeLink && (
                                      <a
                                        href={item.youtubeLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex-1 py-1 px-2 rounded-lg bg-red-600/85 hover:bg-red-600 text-white font-bold text-[10px] flex items-center justify-center gap-1 shadow"
                                      >
                                        <Youtube className="w-3 h-3" />
                                        <span>YouTube</span>
                                      </a>
                                    )}
                                    {item.driveLink && (
                                      <a
                                        href={item.driveLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex-1 py-1 px-2 rounded-lg bg-blue-600/85 hover:bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center gap-1 shadow"
                                      >
                                        <HardDrive className="w-3 h-3" />
                                        <span>Drive</span>
                                      </a>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>

                        {/* Desktop Catalog Table (md:block) */}
                        <div className="hidden md:block overflow-x-auto">
                          <table className="w-full text-left text-xs text-white">
                            <thead className="bg-[#312042]/60 border-b border-white/15 text-[11px] uppercase tracking-wider text-white/75">
                              <tr>
                                <th className="py-3.5 px-4 font-semibold">SONG ID</th>
                                <th className="py-3.5 px-4 font-semibold">JUDUL LAGU</th>
                                <th className="py-3.5 px-4 font-semibold">VOKAL / ARTIS</th>
                                <th className="py-3.5 px-4 font-semibold">PUBLISHER</th>
                                <th className="py-3.5 px-4 font-semibold">STATUS / AKTIF</th>
                                <th className="py-3.5 px-4 font-semibold text-center">LINK (YT & DRIVE)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                              {catalogs.length === 0 ? (
                                <tr>
                                  <td colSpan={6} className="py-14 text-center text-white/60 text-xs">
                                    <ListMusic className="w-10 h-10 mx-auto text-white/20 mb-2" />
                                    <p className="font-semibold text-sm text-white/80">Katalog Musik Masih Kosong</p>
                                    <p className="text-white/50 text-[11px] mt-1">Lagu resmi yang diupload oleh label/admin akan tercantum di sini.</p>
                                  </td>
                                </tr>
                              ) : filteredCatalogs.length === 0 ? (
                                <tr>
                                  <td colSpan={6} className="py-12 text-center text-white/60 text-xs">
                                    Tidak ada lagu di katalog yang sesuai dengan pencarian Anda.
                                  </td>
                                </tr>
                              ) : (
                                paginatedCatalogs.map((item) => (
                                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                    {/* SONG ID */}
                                    <td className="py-3.5 px-4 font-mono font-bold whitespace-nowrap">
                                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/25 border border-white/15">
                                        <span className="text-[#c8f560]">{item.songId}</span>
                                        <button
                                          type="button"
                                          onClick={() => handleCopySongId(item.songId)}
                                          title="Salin Song ID"
                                          className="text-white/60 hover:text-white"
                                        >
                                          {copiedSongId === item.songId ? (
                                            <Check className="w-3 h-3 text-[#c8f560]" />
                                          ) : (
                                            <Copy className="w-3 h-3" />
                                          )}
                                        </button>
                                      </div>
                                    </td>

                                    {/* JUDUL LAGU */}
                                    <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                                      <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center text-[#c8f560] shrink-0">
                                          <Music className="w-3.5 h-3.5" />
                                        </div>
                                        <span>{item.title}</span>
                                      </div>
                                    </td>

                                    {/* VOKAL / ARTIS */}
                                    <td className="py-3.5 px-4 text-white/90 whitespace-nowrap">
                                      {item.artist}
                                    </td>

                                    {/* PUBLISHER */}
                                    <td className="py-3.5 px-4 text-white/80 whitespace-nowrap">
                                      <span className="px-2.5 py-1 rounded-md bg-white/10 border border-white/10 font-medium">
                                        {item.publisher}
                                      </span>
                                    </td>

                                    {/* STATUS / AKTIF */}
                                    <td className="py-3.5 px-4 whitespace-nowrap">
                                      {item.status.toLowerCase() === "aktif" ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c8f560] text-[#312042] font-bold text-[10px]">
                                          <span className="w-1.5 h-1.5 rounded-full bg-[#312042] animate-pulse" />
                                          Aktif
                                        </span>
                                      ) : item.status.toLowerCase() === "review" ? (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#fde08d] text-[#312042] font-bold text-[10px]">
                                          Review
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 text-white font-medium text-[10px]">
                                          Nonaktif
                                        </span>
                                      )}
                                    </td>

                                    {/* LINK YT / DRIVE */}
                                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                      <div className="flex items-center justify-center gap-2">
                                        {item.youtubeLink ? (
                                          <a
                                            href={item.youtubeLink}
                                            target="_blank"
                                            rel="noreferrer"
                                            title="Buka Link YouTube"
                                            className="px-2.5 py-1 rounded-lg bg-red-600/85 hover:bg-red-600 text-white font-bold text-[10px] flex items-center gap-1 shadow transition-all hover:scale-105"
                                          >
                                            <Youtube className="w-3.5 h-3.5" />
                                            <span>YouTube</span>
                                          </a>
                                        ) : (
                                          <span className="text-[10px] text-white/40">-</span>
                                        )}

                                        {item.driveLink ? (
                                          <a
                                            href={item.driveLink}
                                            target="_blank"
                                            rel="noreferrer"
                                            title="Buka Master di Google Drive"
                                            className="px-2.5 py-1 rounded-lg bg-blue-600/85 hover:bg-blue-600 text-white font-bold text-[10px] flex items-center gap-1 shadow transition-all hover:scale-105"
                                          >
                                            <HardDrive className="w-3.5 h-3.5" />
                                            <span>Drive</span>
                                          </a>
                                        ) : (
                                          <span className="text-[10px] text-white/40">-</span>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* Pagination */}
                        <Pagination
                          currentPage={pageCatalog}
                          totalItems={filteredCatalogs.length}
                          pageSize={6}
                          onPageChange={setPageCatalog}
                        />
                      </>
                    );
                  })()}
                </div>
              )}

              {/* VIEW 2: DAMARLANGIT LIVE CATALOG (8,421 Songs) */}
              {catalogSource === "damarlangit" && (
                <div className={`${ROYALTY_CARD} p-3 sm:p-5 border border-white/20 space-y-4`}>
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/15">
                    <div>
                      <h3 className="font-bold text-sm text-white flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#c8f560] animate-pulse" />
                        <span>Katalog Publik PT. Damarlangit Khatulistiwa</span>
                      </h3>
                      <p className="text-white/70 text-xs mt-0.5">
                        Terkoneksi langsung ke upstream publisher dengan lebih dari {damarTotal > 0 ? damarTotal.toLocaleString("id-ID") : "8.400"} lagu terdaftar
                      </p>
                    </div>
                    {damarLoading && (
                      <span className="text-xs text-[#c8f560] font-bold flex items-center gap-1.5 animate-pulse">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Sinkronisasi Upstream...</span>
                      </span>
                    )}
                  </div>

                  {/* Desktop Table for Damarlangit */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-white">
                      <thead className="bg-[#312042]/60 border-b border-white/15 text-[11px] uppercase tracking-wider text-white/75">
                        <tr>
                          <th className="py-3 px-4 font-semibold">KODE</th>
                          <th className="py-3 px-4 font-semibold">JUDUL LAGU</th>
                          <th className="py-3 px-4 font-semibold">PERFORMER / ARTIS</th>
                          <th className="py-3 px-4 font-semibold">KOMPOSER / PENCIPTA</th>
                          <th className="py-3 px-4 font-semibold">HAK CIPTA / KONTROL</th>
                          <th className="py-3 px-4 font-semibold text-center">LINK YOUTUBE</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {damarLoading && damarSongs.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-14 text-center text-white/60 text-xs">
                              <RefreshCw className="w-8 h-8 mx-auto text-[#c8f560] animate-spin mb-2" />
                              <p className="font-semibold text-white">Memuat Katalog Damarlangit...</p>
                            </td>
                          </tr>
                        ) : damarSongs.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-white/60 text-xs">
                              Tidak ada lagu yang ditemukan di katalog Damarlangit.
                            </td>
                          </tr>
                        ) : (
                          damarSongs.map((song: any) => (
                            <tr key={song.kd_katalog} className="hover:bg-white/5 transition-colors">
                              <td className="py-3 px-4 font-mono font-bold text-[#c8f560] whitespace-nowrap">
                                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/25 border border-white/10">
                                  <span>DK-{song.kd_katalog}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopySongId(`DK-${song.kd_katalog}`)}
                                    title="Salin Kode Katalog"
                                    className="text-white/60 hover:text-white"
                                  >
                                    {copiedSongId === `DK-${song.kd_katalog}` ? (
                                      <Check className="w-3 h-3 text-[#c8f560]" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                              </td>

                              <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                                {song.judul_lagu || "-"}
                              </td>

                              <td className="py-3 px-4 text-white/90 whitespace-nowrap">
                                {song.performer || "-"}
                              </td>

                              <td className="py-3 px-4 text-white/80 whitespace-nowrap">
                                {song.composer || "-"}
                              </td>

                              <td className="py-3 px-4 whitespace-nowrap">
                                <span className="px-2 py-0.5 rounded-md bg-white/10 text-white/80 font-medium text-[11px]">
                                  {song.song_control || "100%"} • {song.member_name || "Damarlangit"}
                                </span>
                              </td>

                              <td className="py-3 px-4 text-center whitespace-nowrap">
                                {song.link ? (
                                  <a
                                    href={song.link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-600/85 hover:bg-red-600 text-white font-bold text-[10px] shadow transition-all hover:scale-105"
                                  >
                                    <Youtube className="w-3.5 h-3.5" />
                                    <span>Tonton YouTube</span>
                                  </a>
                                ) : (
                                  <span className="text-[10px] text-white/40">-</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Damarlangit Pagination */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10 text-xs">
                    <span className="text-white/70">
                      Halaman <strong className="text-white">{damarPage}</strong> (Menampilkan 12 lagu per halaman)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={damarPage <= 1 || damarLoading}
                        onClick={() => {
                          const prev = Math.max(1, damarPage - 1);
                          setDamarPage(prev);
                          fetchDamarCatalog(prev, catalogSearch);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 disabled:opacity-40 text-white font-semibold transition-all cursor-pointer"
                      >
                        ← Sebelumnya
                      </button>
                      <button
                        type="button"
                        disabled={damarLoading}
                        onClick={() => {
                          const next = damarPage + 1;
                          setDamarPage(next);
                          fetchDamarCatalog(next, catalogSearch);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-[#c8f560] hover:bg-[#b8e450] disabled:opacity-40 text-[#312042] font-bold transition-all cursor-pointer"
                      >
                        Berikutnya →
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              VIEW: STUDIO AI COVER ART GENERATOR (3000x3000px)
             ========================================================= */}
          {activeTab === "generator" && (
            <AICoverArtGenerator
              onSelectForSubmit={(url) => {
                setUploadCoverUrl(url);
                setActiveTab("upload");
                showNotice("Artwork berhasil diterapkan ke form Submit Track!");
              }}
              onNotice={showNotice}
            />
          )}

          {/* =========================================================
              VIEW: PROFIL ARTIS & CREATOR (CREATE NEW ARTIST)
             ========================================================= */}
          {activeTab === "artists" && (
            <div key={`artists-${animKey}`} className="space-y-6 animate-card-enter">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-semibold text-white">
                    Profil Artis & Creator
                  </h1>
                  <p className="text-xs text-white/80 mt-1">
                    Kelola nama artis resmi Anda. Artis yang didaftarkan di sini otomatis muncul di menu Submit Track tanpa perlu mengetik manual.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setArtistModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-[#c8f560] text-[#312042] font-bold text-xs hover:bg-[#b5e050] transition-colors shadow flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Buat Artis Baru</span>
                  </button>
                </div>
              </div>

              {/* Grid of Artist Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {userArtists.length === 0 ? (
                  <div className="sm:col-span-2 lg:col-span-3 p-10 rounded-[28px] bg-[#8a88b5]/60 border border-white/20 text-center text-white/80 space-y-3">
                    <Mic2 className="w-12 h-12 mx-auto text-[#c8f560]/70" />
                    <h3 className="text-base font-bold text-white">Belum Ada Profil Artis</h3>
                    <p className="text-xs text-white/70 max-w-md mx-auto">
                      Daftarkan nama panggung atau moniker musik Anda terlebih dahulu agar dapat langsung dipilih saat submit rilisan baru tanpa harus mengetik manual.
                    </p>
                    <button
                      type="button"
                      onClick={() => setArtistModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-[#c8f560] text-[#312042] font-bold text-xs inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> Buat Artis Pertama
                    </button>
                  </div>
                ) : (
                  userArtists.map((artist) => (
                    <div
                      key={artist.id}
                      className="p-5 rounded-[24px] bg-[#8a88b5]/70 border border-white/20 text-white shadow-lg space-y-4 hover:border-[#c8f560]/40 transition-all flex flex-col justify-between"
                    >
                      <div className="flex items-start gap-3.5">
                        <img
                          src={
                            artist.photoUrl ||
                            user?.avatar ||
                            "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=80"
                          }
                          alt={artist.name}
                          className="w-14 h-14 rounded-2xl object-cover border border-white/25 shrink-0 shadow"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <h3 className="font-bold text-base text-white truncate">
                              {artist.name}
                            </h3>
                            <span className="px-2 py-0.5 rounded-full bg-[#312042] text-[#c8f560] text-[10px] font-semibold shrink-0">
                              {artist.genre || "Pop"}
                            </span>
                          </div>
                          {artist.bio ? (
                            <p className="text-xs text-white/70 line-clamp-2 mt-1">
                              {artist.bio}
                            </p>
                          ) : (
                            <p className="text-[11px] text-white/50 italic mt-1">
                              Terdaftar di BREAKOUT.ID
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1.5 text-[11px] text-white/80 bg-white/10 p-3 rounded-xl border border-white/10">
                        <div className="flex items-center justify-between">
                          <span className="text-white/60">Spotify ID / Link:</span>
                          <span className="font-mono text-[#c8f560] truncate max-w-[130px]">
                            {artist.spotifyId || "Auto Generate"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/60">Apple Music ID:</span>
                          <span className="font-mono text-white/90 truncate max-w-[130px]">
                            {artist.appleId || "Auto Generate"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => {
                            setTrackArtist(artist.name);
                            setActiveTab("upload");
                            showNotice(`Artis "${artist.name}" dipilih untuk Submit Track!`);
                          }}
                          className="flex-1 py-2 px-3 rounded-xl bg-[#c8f560] hover:bg-[#b5e050] text-[#312042] font-bold text-xs transition-colors text-center flex items-center justify-center gap-1.5"
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>Rilis Lagu</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteArtist(artist.id, artist.name)}
                          className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/40 text-red-200 transition-colors"
                          title="Hapus Profil Artis"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* =========================================================
              VIEW 6: PENGATURAN / SETTINGS — ALL CARDS MATCH ROYALTY GROWTH
             ========================================================= */}
          {activeTab === "settings" && (
            <div key={`settings-${animKey}`} className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 animate-card-enter">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-semibold text-white">
                    Pengaturan Akun & Distribusi
                  </h1>
                  <p className="text-xs text-white/80 mt-1">
                    Kelola profil artis, keamanan akun, preferensi DSP, dan rekening royalti default
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab("upload")}
                    className="px-5 py-3 rounded-full bg-[#312042] hover:bg-[#422c58] text-white text-xs font-medium flex items-center gap-2 shadow-md transition-all"
                  >
                    <UploadCloud className="w-4 h-4 text-[#c8f560]" />
                    <span>+ Submit Track Baru</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left Column: Artist Profile & Security Form */}
                <form
                  onSubmit={handleSaveSettings}
                  className={`lg:col-span-7 ${ROYALTY_CARD} space-y-5 animate-card-enter`}
                  style={{ animationDelay: "60ms" }}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-white/15">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-[#c8f560]">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">
                          Profil Artis & Keamanan
                        </h3>
                        <p className="text-[11px] text-white/70">
                          Tersinkronisasi langsung dengan database Prisma
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#c8f560] text-[#312042] text-[10px] font-semibold">
                      Verified Artist
                    </span>
                  </div>

                  {/* Avatar Preview + URL */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-white/10 border border-white/15">
                    <img
                      src={settingsAvatar}
                      alt="Profile Avatar"
                      className="w-16 h-16 rounded-full object-cover border-2 border-[#c8f560]"
                    />
                    <div className="flex-1 w-full text-xs">
                      <label className="block text-white/75 mb-1 font-medium">
                        Avatar Photo URL
                      </label>
                      <input
                        type="text"
                        value={settingsAvatar}
                        onChange={(e) => setSettingsAvatar(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-white/15 border border-white/25 text-white focus:outline-none focus:border-[#c8f560]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-white/75 mb-1">Nama Artis / Panggung</label>
                      <input
                        type="text"
                        value={settingsName}
                        onChange={(e) => setSettingsName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/15 border border-white/25 font-medium text-white focus:outline-none focus:border-[#c8f560]"
                      />
                    </div>

                    <div>
                      <label className="block text-white/75 mb-1">Alamat Email</label>
                      <input
                        type="email"
                        value={settingsEmail}
                        onChange={(e) => setSettingsEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/15 border border-white/25 font-medium text-white focus:outline-none focus:border-[#c8f560]"
                      />
                    </div>

                    <div>
                      <label className="block text-white/75 mb-1">Nama Label Rekaman</label>
                      <input
                        type="text"
                        value={settingsLabelName}
                        onChange={(e) => setSettingsLabelName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/15 border border-white/25 font-medium text-white focus:outline-none focus:border-[#c8f560]"
                      />
                    </div>

                    <div>
                      <label className="block text-white/75 mb-1">Kode ISRC Prefix</label>
                      <input
                        type="text"
                        value={settingsIsrcPrefix}
                        onChange={(e) => setSettingsIsrcPrefix(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/15 border border-white/25 font-medium text-white focus:outline-none focus:border-[#c8f560]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-white/75 mb-1">
                        Password Baru (Kosongkan jika tidak ingin mengubah)
                      </label>
                      <div className="relative">
                        <Lock className="w-3.5 h-3.5 text-white/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          value={settingsPassword}
                          onChange={(e) => setSettingsPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white/15 border border-white/25 font-medium text-white placeholder:text-white/40 focus:outline-none focus:border-[#c8f560]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="submit"
                      disabled={savingSettings}
                      className="px-6 py-3 rounded-full bg-[#312042] hover:bg-[#422c58] text-white font-semibold text-xs flex items-center gap-2 shadow-md transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#c8f560]" />
                      <span>
                        {savingSettings ? "Menyimpan..." : "Simpan Pengaturan Profil"}
                      </span>
                    </button>
                  </div>
                </form>

                {/* Right Column: Theme Selector + Distribution & Royalty Automation Preferences */}
                <div
                  className="lg:col-span-5 flex flex-col gap-5 animate-card-enter"
                  style={{ animationDelay: "140ms" }}
                >
                  {/* Tema Tampilan Dashboard User */}
                  <div className={`${ROYALTY_CARD} space-y-3.5`}>
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/15">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-[#c8f560]">
                          <Palette className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-white">
                            Tema Tampilan Dashboard
                          </h3>
                          <p className="text-[11px] text-white/70">
                            Pilih warna antarmuka (Tema standar: <strong>Ungu / Lavender</strong>)
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-[#312042] border border-[#c8f560]/40 text-[#c8f560] text-xs font-bold">
                        {currentTheme.name}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                      {THEMES.map((t) => {
                        const isSelected = theme === t.id;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => changeTheme(t.id)}
                            className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all text-xs font-bold cursor-pointer ${
                              isSelected
                                ? "bg-[#312042] text-white border-[#c8f560] ring-2 ring-[#c8f560]/50 shadow-md scale-102"
                                : "bg-white/5 hover:bg-white/15 text-white/80 border-white/15"
                            }`}
                          >
                            <span className={`w-3.5 h-3.5 rounded-full ${t.dotBg} border ${t.dotBorder} shrink-0`} />
                            <span className="truncate">{t.name.split(" ")[0]}</span>
                            {isSelected && <span className="text-[#c8f560] ml-auto text-xs">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className={`${ROYALTY_CARD} space-y-4`}>
                    <div className="flex items-center gap-2.5 pb-2 border-b border-white/15">
                      <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-[#c8f560]">
                        <Sliders className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">
                          Preferensi Distribusi & Audio
                        </h3>
                        <p className="text-[11px] text-white/70">
                          Pengaturan otomatis saat mengunggah lagu baru
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3.5 text-xs">
                      {[
                        {
                          title: "YouTube Content ID & TikTok Monetization",
                          desc: "Klaim royalti otomatis saat lagu dipakai di video Shorts/Reels",
                          val: autoContentId,
                          toggle: () => setAutoContentId(!autoContentId),
                        },
                        {
                          title: "Dolby Atmos & 24-bit Lossless Mastering",
                          desc: "Kirim kualitas audio Hi-Res ke Apple Music & Tidal",
                          val: dolbyAtmos,
                          toggle: () => setDolbyAtmos(!dolbyAtmos),
                        },
                        {
                          title: "Auto-Withdraw Royalti Bulanan",
                          desc: "Tarik otomatis ke rekening utama saat saldo di atas Rp 500.000",
                          val: autoPayout,
                          toggle: () => setAutoPayout(!autoPayout),
                        },
                        {
                          title: "Notifikasi Laporan Stream & Pembayaran",
                          desc: "Terima laporan harian ketika rilis telah disetujui Admin",
                          val: emailAlerts,
                          toggle: () => setEmailAlerts(!emailAlerts),
                        },
                      ].map((pref, i) => (
                        <div
                          key={i}
                          onClick={pref.toggle}
                          className="p-3.5 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-between gap-3 cursor-pointer hover:bg-white/20 transition-colors"
                        >
                          <div>
                            <p className="font-semibold text-white">{pref.title}</p>
                            <p className="text-[11px] text-white/70 mt-0.5">{pref.desc}</p>
                          </div>
                          <div
                            className={`w-11 h-6 rounded-full p-1 transition-colors shrink-0 ${
                              pref.val ? "bg-[#312042]" : "bg-white/25"
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full transition-transform ${
                                pref.val
                                  ? "translate-x-5 bg-[#c8f560]"
                                  : "translate-x-0 bg-white"
                              }`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Default Payout Account Summary */}
                  <div className={`${ROYALTY_CARD} flex flex-col justify-between`}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-white">
                        Rekening Pencairan Default
                      </h3>
                      <button
                        type="button"
                        onClick={() => setActiveTab("wallet")}
                        className="text-xs text-[#c8f560] underline font-medium"
                      >
                        Ubah di Menu Wallet
                      </button>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#312042] text-[#c8f560] flex items-center justify-center font-bold text-xs">
                          Rp
                        </div>
                        <div>
                          <p className="font-bold text-white">{withdrawMethod}</p>
                          <p className="text-[11px] text-white/75">No. Rek: {accountNumber}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-[#c8f560] text-[#312042] font-semibold text-[10px]">
                        100% Share
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          </main>
        </div>
      </div>

      {/* MODAL: POPUP CREATE NEW ARTIST */}
      {artistModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-[#46385f] border border-white/25 rounded-3xl p-6 text-white shadow-2xl animate-card-enter space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/15">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#c8f560] text-[#312042] flex items-center justify-center font-bold">
                  <Mic2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Buat Profil Artis Baru</h3>
                  <p className="text-[11px] text-white/70">Daftarkan nama artis untuk rilis lagu</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setArtistModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateArtist} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-white/80 font-medium mb-1">
                  Nama Artis / Stage Name <span className="text-[#c8f560]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newArtistName}
                  onChange={(e) => setNewArtistName(e.target.value)}
                  placeholder="Contoh: Sarah Viola / Basstrack Indo"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-[#c8f560]"
                />
              </div>

              <div>
                <label className="block text-white/80 font-medium mb-1">Genre Utama</label>
                <select
                  value={newArtistGenre}
                  onChange={(e) => setNewArtistGenre(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-[#c8f560]"
                >
                  <option value="Pop" className="bg-[#312042]">Pop</option>
                  <option value="Electronic / EDM" className="bg-[#312042]">Electronic / EDM</option>
                  <option value="Hip-Hop / Rap" className="bg-[#312042]">Hip-Hop / Rap</option>
                  <option value="R&B / Soul" className="bg-[#312042]">R&B / Soul</option>
                  <option value="Rock / Indie" className="bg-[#312042]">Rock / Indie</option>
                  <option value="Dangdut / Nusantara" className="bg-[#312042]">Dangdut / Nusantara</option>
                  <option value="Acoustic" className="bg-[#312042]">Acoustic</option>
                </select>
              </div>

              <div>
                <label className="block text-white/80 font-medium mb-1">
                  Spotify Artist URI / ID (Opsional)
                </label>
                <input
                  type="text"
                  value={newArtistSpotify}
                  onChange={(e) => setNewArtistSpotify(e.target.value)}
                  placeholder="Kosongkan jika artis baru (akan dibuatkan)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-[#c8f560]"
                />
              </div>

              <div>
                <label className="block text-white/80 font-medium mb-1">
                  Apple Music Artist ID (Opsional)
                </label>
                <input
                  type="text"
                  value={newArtistApple}
                  onChange={(e) => setNewArtistApple(e.target.value)}
                  placeholder="Kosongkan jika artis baru"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-[#c8f560]"
                />
              </div>

              <div>
                <label className="block text-white/80 font-medium mb-1">
                  URL Foto Profil Artis (Opsional)
                </label>
                <input
                  type="text"
                  value={newArtistPhoto}
                  onChange={(e) => setNewArtistPhoto(e.target.value)}
                  placeholder="https://... atau biarkan avatar default"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-[#c8f560]"
                />
              </div>

              <div>
                <label className="block text-white/80 font-medium mb-1">Bio Singkat</label>
                <textarea
                  rows={2}
                  value={newArtistBio}
                  onChange={(e) => setNewArtistBio(e.target.value)}
                  placeholder="Deskripsi singkat profil artis..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-[#c8f560]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setArtistModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingArtist}
                  className="flex-1 py-2.5 rounded-xl bg-[#c8f560] text-[#312042] font-bold hover:bg-[#b5e050] transition-colors shadow flex items-center justify-center gap-1.5"
                >
                  {savingArtist ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Artis</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
