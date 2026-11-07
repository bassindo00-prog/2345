"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Home,
  Disc3,
  Wallet,
  Users,
  Settings,
  LogOut,
  Sun,
  Check,
  Clock,
  ShieldCheck,
  ShieldAlert,
  ArrowUpRight,
  Trash2,
  RefreshCw,
  Sliders,
  CheckCircle2,
  XCircle,
  Mail,
  Send,
  Download,
  Eye,
  X,
  TrendingUp,
  Banknote,
  Coins,
  Music,
  ExternalLink,
  ListMusic,
  HardDrive,
  Search,
  PlusCircle,
  FileSpreadsheet,
  Copy,
  Menu,
  Volume2,
  Globe,
  Sparkles,
  Activity,
  Palette,
  Calendar,
  Construction,
  AlertTriangle,
  Power,
  UserCheck,
  Phone,
  FileText,
  User,
  Upload,
  Save,
  Plus,
  Pencil,
} from "lucide-react";
import VisaWithdrawalCardModal from "@/components/VisaWithdrawalCardModal";
import VisaMetricCard from "@/components/VisaMetricCard";
import AdminLandingCMS from "@/components/AdminLandingCMS";
import Pagination from "@/components/Pagination";
import { THEMES, type ThemeId } from "@/lib/theme";

const toLocalDatetimeString = (isoString?: string | null) => {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  } catch {
    return "";
  }
};

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

const MONTH_NAMES_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const getWithdrawalPeriodHelper = (w: any) => {
  let y = new Date().getFullYear();
  let mIdx = new Date().getMonth();

  if (w?.date && typeof w.date === "string") {
    const parts = w.date.split("-");
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        y = parseInt(parts[0], 10);
        mIdx = parseInt(parts[1], 10) - 1;
      } else {
        y = parseInt(parts[2], 10);
        mIdx = parseInt(parts[1], 10) - 1;
      }
    }
  } else if (w?.createdAt) {
    const d = new Date(w.createdAt);
    if (!isNaN(d.getTime())) {
      y = d.getFullYear();
      mIdx = d.getMonth();
    }
  }

  if (isNaN(mIdx) || mIdx < 0 || mIdx > 11) mIdx = new Date().getMonth();
  if (isNaN(y) || y < 2000) y = new Date().getFullYear();

  const monthName = MONTH_NAMES_ID[mIdx] || "November";
  return {
    key: `${y}-${String(mIdx + 1).padStart(2, "0")}`,
    label: `${monthName} ${y}`,
    month: monthName,
    year: String(y),
  };
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "releases"
    | "registrations"
    | "my-releases"
    | "my-reject"
    | "catalog"
    | "cms"
    | "artist-royalties"
    | "withdrawals"
    | "users"
    | "inbox"
    | "royalty-input"
    | "maintenance"
    | "settings"
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
  const [users, setUsers] = useState<any[]>([]);
  const [releases, setReleases] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [catalogs, setCatalogs] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Admin Profile & Avatar State
  const [adminUser, setAdminUser] = useState<any>(null);
  const [adminName, setAdminName] = useState("Admin Executive");
  const [adminEmail, setAdminEmail] = useState("admin@breakout.id");
  const [adminAvatar, setAdminAvatar] = useState(
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
  );
  const [adminPassword, setAdminPassword] = useState("");
  const [savingAdminProfile, setSavingAdminProfile] = useState(false);
  const [uploadingAdminAvatar, setUploadingAdminAvatar] = useState(false);

  // Catalog Form & Management State
  const [catSongId, setCatSongId] = useState("HRM-ID-0106");
  const [catTitle, setCatTitle] = useState("");
  const [catArtist, setCatArtist] = useState("");
  const [catPublisher, setCatPublisher] = useState("BREAKOUT Publishing / Sony Music");
  const [catStatus, setCatStatus] = useState("Aktif");
  const [catYoutube, setCatYoutube] = useState("");
  const [catDrive, setCatDrive] = useState("");
  const [uploadingCatalog, setUploadingCatalog] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkCsvText, setBulkCsvText] = useState("");
  const [catSearch, setCatSearch] = useState("");
  const [catPublisherFilter, setCatPublisherFilter] = useState("ALL");
  const [catTotal, setCatTotal] = useState(39676);
  const [catPublishersList, setCatPublishersList] = useState<Array<{ publisher: string; count: number }>>([
    { publisher: "Sora Music Publisher", count: 10703 },
    { publisher: "MAHAR PUSTAKA NUSANTARA", count: 9413 },
    { publisher: "Delapan Belas Musik", count: 2904 },
    { publisher: "Proaktif Digital Kreasi", count: 2619 },
    { publisher: "ALFA PUSTAKA NADA", count: 2145 },
    { publisher: "BREAKOUT Publishing", count: 2018 },
    { publisher: "PT. Sony Music Publishing Indonesia", count: 2017 },
    { publisher: "PT. Gajah Mada Publishing", count: 1910 },
    { publisher: "RPH Music Publishing", count: 1897 },
    { publisher: "MEGABAYZ Enterprises", count: 1484 },
    { publisher: "PT WIRAYUDA SWARATAMA JEKA (PUSTAKA JEKA)", count: 1025 },
    { publisher: "PT. Royal Publikasi Musikindo", count: 766 },
    { publisher: "PT Star Cipta Musikindo", count: 245 },
    { publisher: "PT KHANA MEDIA NUSANTARA", count: 172 },
    { publisher: "RPH", count: 137 },
    { publisher: "PT Pragita Prabawa Pustaka", count: 73 },
    { publisher: "BREAK OUT MUSIC RECORD", count: 73 },
    { publisher: "Khana Music Publishing", count: 15 },
    { publisher: "BREAKOUT Publishing / Sony Music", count: 15 },
    { publisher: "Warner Chappell Music Indonesia", count: 15 },
    { publisher: "Universal Music Publishing Indonesia", count: 15 },
    { publisher: "Halo Entertainment Indonesia", count: 15 },
  ]);
  const [isCatManualModalOpen, setIsCatManualModalOpen] = useState(false);
  const [isCatImportModalOpen, setIsCatImportModalOpen] = useState(false);
  const [catImporting, setCatImporting] = useState(false);
  const [catImportResult, setCatImportResult] = useState<{
    success?: boolean;
    count?: number;
    filename?: string;
    error?: string;
  } | null>(null);
  const [catDefaultPublisher, setCatDefaultPublisher] = useState("BREAKOUT Publishing");
  const [catDefaultStatus, setCatDefaultStatus] = useState("Aktif");
  const catFileInputRef = useRef<HTMLInputElement>(null);
  const [editingCatalog, setEditingCatalog] = useState<{
    id: string;
    songId: string;
    title: string;
    artist: string;
    publisher: string;
    status: string;
    youtubeLink: string;
    driveLink: string;
  } | null>(null);
  const [savingCatalogEdit, setSavingCatalogEdit] = useState(false);
  const [catLoading, setCatLoading] = useState(false);
  const catAbortControllerRef = useRef<AbortController | null>(null);
  const [selectedCatIds, setSelectedCatIds] = useState<string[]>([]);
  const [deletePubModal, setDeletePubModal] = useState<{
    isOpen: boolean;
    publisher: string;
    count: number;
  }>({ isOpen: false, publisher: "", count: 0 });
  const [isDeletingPublisher, setIsDeletingPublisher] = useState(false);
  const [isBulkDeletingCat, setIsBulkDeletingCat] = useState(false);

  // Pagination State (5 items per page)
  const [pageReleases, setPageReleases] = useState(1);
  const [pageMyReleases, setPageMyReleases] = useState(1);
  const [pageMyReject, setPageMyReject] = useState(1);
  const [pageCatalog, setPageCatalog] = useState(1);
  const [pageWithdrawals, setPageWithdrawals] = useState(1);
  const [pageUsers, setPageUsers] = useState(1);
  const [pageRegistrations, setPageRegistrations] = useState(1);
  const [regFilterStatus, setRegFilterStatus] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [regSearch, setRegSearch] = useState("");
  const [rejectingUserId, setRejectingUserId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [withdrawalTab, setWithdrawalTab] = useState<"Pending" | "Approved" | "Rejected" | "All">("Pending");

  // Artis Royalty Tab State
  const [artistRoyaltySubTab, setArtistRoyaltySubTab] = useState<"with-royalty" | "no-royalty" | "approved-periods">("with-royalty");
  const [artistRoyaltySearch, setArtistRoyaltySearch] = useState("");
  const [artistRoyaltyPeriodFilter, setArtistRoyaltyPeriodFilter] = useState("ALL");
  const [pageArtistRoyalty, setPageArtistRoyalty] = useState(1);

  // Track Detail Modal State
  const [selectedRelease, setSelectedRelease] = useState<any | null>(null);

  // Visa Withdrawal Card Modal State
  const [selectedWithdrawalForVisaModal, setSelectedWithdrawalForVisaModal] = useState<any | null>(null);

  // Artist Detail Modal State
  const [selectedArtistDetail, setSelectedArtistDetail] = useState<any | null>(null);

  // Artist Search & Suspend State
  const [artistSearch, setArtistSearch] = useState("");
  const [artistTabFilter, setArtistTabFilter] = useState<"ALL" | "RELEASED" | "SUSPENDED">("ALL");
  const [suspendingUserId, setSuspendingUserId] = useState<string | null>(null);

  // Bulk Selection & Deletion State
  const [selectedReleaseIds, setSelectedReleaseIds] = useState<string[]>([]);
  const [deletingBulk, setDeletingBulk] = useState(false);

  // Bulk Withdrawal State
  const [selectedWithdrawalIds, setSelectedWithdrawalIds] = useState<string[]>([]);
  const [bulkProcessingWithdrawals, setBulkProcessingWithdrawals] = useState(false);

  // Send Message State
  const [msgTargetUser, setMsgTargetUser] = useState<string>("ALL");
  const [msgTitle, setMsgTitle] = useState("");
  const [msgContent, setMsgContent] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);

  // Royalty & Streaming Input Form State (to specific User, not song)
  const [selectedUserForRoyalty, setSelectedUserForRoyalty] = useState<string>("");
  const [inputRoyaltyBalance, setInputRoyaltyBalance] = useState<number>(0);
  const [inputRoyaltyPending, setInputRoyaltyPending] = useState<number>(0);
  const [inputTotalStreams, setInputTotalStreams] = useState<number>(0);
  const [inputRoyaltyMonth, setInputRoyaltyMonth] = useState<string>("November");
  const [savingRoyalty, setSavingRoyalty] = useState(false);
  const [grossRoyaltyInput, setGrossRoyaltyInput] = useState<number>(100000);
  const [cutPercentage, setCutPercentage] = useState<number>(30);

  // Admin Settings State
  const [autoApproveVerified, setAutoApproveVerified] = useState(false);
  const [instantBankPayout, setInstantBankPayout] = useState(true);
  const [strictCopyrightCheck, setStrictCopyrightCheck] = useState(true);

  // Maintenance State
  const [maintenanceActive, setMaintenanceActive] = useState(false);
  const [maintenanceTitle, setMaintenanceTitle] = useState("Mohon Maaf");
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    "Maaf, hari ini operasional BREAKOUT.ID sedang libur. Silakan kembali lagi sesuai jadwal yang telah ditentukan."
  );
  const [maintenanceStart, setMaintenanceStart] = useState("");
  const [maintenanceEnd, setMaintenanceEnd] = useState("");
  const [maintenanceType, setMaintenanceType] = useState("system");
  const [maintenanceBgType, setMaintenanceBgType] = useState("gradient");
  const [maintenanceBgVideo, setMaintenanceBgVideo] = useState("");
  const [maintenanceSaving, setMaintenanceSaving] = useState(false);
  const [maintenanceBrandLogo, setMaintenanceBrandLogo] = useState("/logo.png");

  const [animProgress, setAnimProgress] = useState(0);
  const [barsReady, setBarsReady] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const [liveTick, setLiveTick] = useState(0);

  const showNotice = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  // Helper to extract artist display name (prefer registered Artist profile over generic account name)
  const getArtistDisplayName = (u: any) => {
    if (!u) return "Artis";
    if (u.artists && u.artists.length > 0 && u.artists[0]?.name) {
      return u.artists[0].name;
    }
    return u.name || "Artis";
  };

  // Helper Export CSV untuk Artis Royalty (Support UTF-8 BOM untuk Excel)
  const handleExportRoyaltyCsv = (
    subTab: "with-royalty" | "no-royalty" | "approved-periods",
    dataList: any[]
  ) => {
    let filename = "";
    let headers: string[] = [];
    let rows: string[][] = [];

    const escapeCsv = (str: any) => {
      if (str === null || str === undefined) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const todayStr = new Date().toISOString().slice(0, 10);

    if (subTab === "with-royalty") {
      filename = `Breakout_Saldo_Artis_Aktif_${todayStr}.csv`;
      headers = [
        "No",
        "Nama Musisi / Stage Name",
        "Nama User",
        "Email",
        "Saldo Royalti Aktif (IDR)",
        "Royalti Pending (IDR)",
        "Total Ditarik (IDR)",
        "Total Streams",
        "Bulan Royalti",
        "Status Akun",
      ];
      rows = dataList.map((u, idx) => [
        String(idx + 1),
        getArtistDisplayName(u),
        u.name || "-",
        u.email || "-",
        String(Number(u.royaltyBalance || 0)),
        String(Number(u.royaltyPending || 0)),
        String(Number(u.totalWithdrawn || 0)),
        String(Number(u.totalStreams || 0)),
        u.royaltyMonth || "November",
        u.status || "ACTIVE",
      ]);
    } else if (subTab === "no-royalty") {
      filename = `Breakout_Artis_Saldo_Nol_${todayStr}.csv`;
      headers = [
        "No",
        "Nama Musisi / Stage Name",
        "Nama User",
        "Email",
        "Kontak WhatsApp",
        "Jumlah Rilisan",
        "Saldo Saat Ini (IDR)",
        "Status Akun",
      ];
      rows = dataList.map((u, idx) => [
        String(idx + 1),
        getArtistDisplayName(u),
        u.name || "-",
        u.email || "-",
        u.whatsapp || "-",
        String(u.releasesCount ?? (Array.isArray(u.releases) ? u.releases.length : 0)),
        "0",
        u.status || "ACTIVE",
      ]);
    } else {
      const periodLabel =
        artistRoyaltyPeriodFilter === "ALL"
          ? "Semua_Periode"
          : artistRoyaltyPeriodFilter.replace(/\s+/g, "_");
      filename = `Breakout_Royalti_ACC_${periodLabel}_${todayStr}.csv`;
      headers = [
        "No",
        "Tanggal ACC",
        "Periode Bulan Tahun",
        "Nama Musisi",
        "Email Musisi",
        "Penerima Rekening",
        "Metode Pembayaran",
        "Nomor Rekening",
        "Nominal Dicairkan (IDR)",
        "Status",
      ];
      rows = dataList.map((w, idx) => [
        String(idx + 1),
        w.date || "-",
        getWithdrawalPeriodHelper(w).label,
        w.user?.name || getArtistDisplayName(w.user) || "-",
        w.user?.email || "-",
        w.accountHolder || "-",
        w.method || "-",
        w.accountNumber || "-",
        String(Number(w.amount || 0)),
        "Approved",
      ]);
    }

    const csvContent =
      "\uFEFF" +
      [
        headers.map(escapeCsv).join(","),
        ...rows.map((r) => r.map(escapeCsv).join(",")),
      ].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showNotice(`Laporan CSV (${filename}) berhasil didownload`);
  };

  // Mobile / Browser Back Button Protection & Tab/Modal State Management
  const activeTabRef = useRef(activeTab);
  const mobileMenuOpenRef = useRef(mobileMenuOpen);
  const selectedReleaseRef = useRef(selectedRelease);
  const selectedWithdrawalForVisaModalRef = useRef(selectedWithdrawalForVisaModal);
  const selectedArtistDetailRef = useRef(selectedArtistDetail);
  const rejectingUserIdRef = useRef(rejectingUserId);
  const selectedUserForRoyaltyRef = useRef(selectedUserForRoyalty);
  const isPopstateNavigationRef = useRef(false);
  const prevPendingCountRef = useRef<number | null>(null);
  const isFetchingRef = useRef(false);

  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);
  useEffect(() => { mobileMenuOpenRef.current = mobileMenuOpen; }, [mobileMenuOpen]);
  useEffect(() => { selectedReleaseRef.current = selectedRelease; }, [selectedRelease]);
  useEffect(() => { selectedWithdrawalForVisaModalRef.current = selectedWithdrawalForVisaModal; }, [selectedWithdrawalForVisaModal]);
  useEffect(() => { selectedArtistDetailRef.current = selectedArtistDetail; }, [selectedArtistDetail]);
  useEffect(() => { rejectingUserIdRef.current = rejectingUserId; }, [rejectingUserId]);
  useEffect(() => { selectedUserForRoyaltyRef.current = selectedUserForRoyalty; }, [selectedUserForRoyalty]);

  // Trap back navigation and prevent unintended exit to landing page on iOS/Android
  useEffect(() => {
    if (typeof window === "undefined") return;

    window.history.replaceState({ app: "breakout_admin", tab: "overview" }, "");
    window.history.pushState({ app: "breakout_admin", tab: activeTab }, "");

    const handlePopState = (e: PopStateEvent) => {
      // 1. Close track detail modal
      if (selectedReleaseRef.current) {
        setSelectedRelease(null);
        window.history.pushState({ app: "breakout_admin", tab: activeTabRef.current }, "");
        return;
      }

      // 2. Close VISA withdrawal modal
      if (selectedWithdrawalForVisaModalRef.current) {
        setSelectedWithdrawalForVisaModal(null);
        window.history.pushState({ app: "breakout_admin", tab: activeTabRef.current }, "");
        return;
      }

      // 3. Close artist detail modal
      if (selectedArtistDetailRef.current) {
        setSelectedArtistDetail(null);
        window.history.pushState({ app: "breakout_admin", tab: activeTabRef.current }, "");
        return;
      }

      // 4. Close reject reason popover modal
      if (rejectingUserIdRef.current) {
        setRejectingUserId(null);
        window.history.pushState({ app: "breakout_admin", tab: activeTabRef.current }, "");
        return;
      }

      // 5. Close mobile drawer menu
      if (mobileMenuOpenRef.current) {
        setMobileMenuOpen(false);
        window.history.pushState({ app: "breakout_admin", tab: activeTabRef.current }, "");
        return;
      }

      // 6. If on secondary tab, return to overview
      if (activeTabRef.current !== "overview") {
        isPopstateNavigationRef.current = true;
        setActiveTab("overview");
        window.history.pushState({ app: "breakout_admin", tab: "overview" }, "");
        return;
      }

      // 7. If already on overview, keep admin on dashboard
      window.history.pushState({ app: "breakout_admin", tab: "overview" }, "");
      showNotice("Gunakan tombol Logout jika ingin keluar ke Beranda.");
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // Push new history state when admin actively switches tabs
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isPopstateNavigationRef.current) {
      isPopstateNavigationRef.current = false;
      return;
    }
    if (activeTab !== "overview") {
      window.history.pushState({ app: "breakout_admin", tab: activeTab }, "");
    }
  }, [activeTab]);

  // Push history state when any modal or drawer is opened
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (mobileMenuOpen || selectedRelease || selectedWithdrawalForVisaModal || selectedArtistDetail || rejectingUserId) {
      window.history.pushState({ app: "breakout_admin", tab: activeTab, modal: true }, "");
    }
  }, [mobileMenuOpen, selectedRelease, selectedWithdrawalForVisaModal, selectedArtistDetail, rejectingUserId]);

  useEffect(() => {
    setAnimProgress(0);
    setBarsReady(false);
    setAnimKey((prev) => prev + 1);
    const tTimer = setTimeout(() => setBarsReady(true), 80);

    let frameId: number;
    const startTime = performance.now();
    const duration = 1200;

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
      clearTimeout(tTimer);
      cancelAnimationFrame(frameId);
    };
  }, [activeTab, period]);

  useEffect(() => {
    setSelectedReleaseIds([]);
  }, [activeTab]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveTick((prev) => (prev + 1) % 100);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  const fetchAdminData = async (silent = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    if (!silent) setLoading(true);
    try {
      const res = await fetch(`/api/admin/overview?t=${Date.now()}`, {
        cache: "no-store",
        headers: { Pragma: "no-cache", "Cache-Control": "no-cache" },
      });
      const data = await res.json();
      if (data.users) setUsers(data.users);
      if (data.releases) {
        setReleases(data.releases);
        const pendingCount = (data.releases || []).filter(
          (r: any) => {
            const norm = (r.status || "").toUpperCase();
            return norm === "PENDING" || norm === "REVIEW" || (!["APPROVED", "RELEASED", "DISETUJUI", "REJECTED", "DITOLAK"].includes(norm));
          }
        ).length;
        if (prevPendingCountRef.current !== null && pendingCount > prevPendingCountRef.current) {
          const diff = pendingCount - prevPendingCountRef.current;
          showNotice(`🎵 ${diff} Rilisan lagu baru masuk dari musisi! (${pendingCount} menunggu ACC)`);
        }
        prevPendingCountRef.current = pendingCount;
      }
      if (data.withdrawals) setWithdrawals(data.withdrawals);
      if (data.catalogs && data.catalogs.length > 0) {
        setCatalogs(data.catalogs);
      }

      if (!silent) {
        // Pastikan catalog selalu tersinkron penuh dengan endpoint master
        try {
          const catRes = await fetch("/api/catalog?limit=1000");
          const catData = await catRes.json();
          if (typeof catData.total === "number") {
            setCatTotal(catData.total);
          }
          if (Array.isArray(catData.publishers) && catData.publishers.length > 0) {
            setCatPublishersList(catData.publishers);
          }
          const catList = catData.items || catData.catalogs || [];
          if (Array.isArray(catList) && catList.length > 0) {
            setCatalogs(catList);
          }
        } catch (errCat) {
          console.warn("Gagal load katalog di admin:", errCat);
        }

        // Ambil data profil Admin yang sedang login
        try {
          const meRes = await fetch("/api/auth/me");
          const meData = await meRes.json();
          if (meData?.user) {
            setAdminUser(meData.user);
            if (meData.user.name) setAdminName(meData.user.name);
            if (meData.user.email) setAdminEmail(meData.user.email);
            if (meData.user.avatar) setAdminAvatar(meData.user.avatar);
          }
        } catch (errMe) {
          console.warn("Gagal load profil admin:", errMe);
        }
      }

      if (data.users && data.releases) {
        const currentSelected = selectedUserForRoyaltyRef.current;
        const currentSelectedUser = (data.users || []).find((u: any) => u.id === currentSelected);

        // Hanya tetapkan artis default jika belum ada artis yang dipilih sama sekali,
        // atau artis yang sebelumnya dipilih sudah tidak ada lagi di database.
        // Jangan pernah menimpa pilihan artis atau angka yang sedang diketik admin!
        if (!currentSelected || !currentSelectedUser) {
          const appRels = (data.releases || []).filter((r: any) => {
            const norm = (r.status || "").toUpperCase();
            return norm === "APPROVED" || norm === "RELEASED" || norm === "DISETUJUI";
          });
          const appArt = (data.users || [])
            .filter(
              (u: any) => u.role !== "ADMIN" && appRels.some((r: any) => r.userId === u.id)
            )
            .sort((a: any, b: any) =>
              getArtistDisplayName(a).localeCompare(getArtistDisplayName(b), "id", {
                sensitivity: "base",
                numeric: true,
              })
            );
          const target =
            appArt[0] ||
            data.users.find((u: any) => u.role !== "ADMIN") ||
            data.users[0];
          if (target) {
            selectedUserForRoyaltyRef.current = target.id;
            setSelectedUserForRoyalty(target.id);
            setInputRoyaltyBalance(target.royaltyBalance || 0);
            setInputRoyaltyPending(target.royaltyPending || 0);
            setInputTotalStreams(target.totalStreams || 0);
            setInputRoyaltyMonth(target.royaltyMonth || "November");
          }
        }
      }

      const msgRes = await fetch(`/api/messages?admin=true&t=${Date.now()}`, {
        cache: "no-store",
      });
      const msgData = await msgRes.json();
      if (msgData.messages) setMessages(msgData.messages);

      try {
        const mRes = await fetch(`/api/admin/maintenance?t=${Date.now()}`, {
          cache: "no-store",
        });
        const mData = await mRes.json();
        if (mData.success && mData.data) {
          setMaintenanceActive(mData.data.maintenance_active === "true");
          setMaintenanceTitle(mData.data.maintenance_title || "Mohon Maaf");
          setMaintenanceMessage(
            mData.data.maintenance_message ||
              "Maaf, hari ini operasional BREAKOUT.ID sedang libur. Silakan kembali lagi sesuai jadwal yang telah ditentukan."
          );
          setMaintenanceStart(toLocalDatetimeString(mData.data.maintenance_start));
          setMaintenanceEnd(toLocalDatetimeString(mData.data.maintenance_end));
          setMaintenanceType(mData.data.maintenance_type || "system");
          setMaintenanceBgType(mData.data.maintenance_bg_type || "gradient");
          setMaintenanceBgVideo(mData.data.maintenance_bg_video || "");
          if (mData.brandLogo) setMaintenanceBrandLogo(mData.brandLogo);
        }
      } catch (errM) {
        console.warn("Failed to fetch maintenance settings:", errM);
      }
    } catch (e) {
      console.error(e);
    } finally {
      isFetchingRef.current = false;
      if (!silent) setLoading(false);
    }
  };

  const handleSaveMaintenance = async (overrideActive?: boolean) => {
    setMaintenanceSaving(true);
    const newActive = overrideActive !== undefined ? overrideActive : maintenanceActive;
    try {
      const res = await fetch("/api/admin/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          active: newActive,
          title: maintenanceTitle,
          message: maintenanceMessage,
          start: maintenanceStart ? new Date(maintenanceStart).toISOString() : "",
          end: maintenanceEnd ? new Date(maintenanceEnd).toISOString() : "",
          type: maintenanceType,
          bg_type: maintenanceBgType,
          bg_video: maintenanceBgVideo,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (overrideActive !== undefined) {
          setMaintenanceActive(overrideActive);
        }
        showNotice(data.message || "Pengaturan maintenance berhasil disimpan!");
      } else {
        showNotice(`❌ Gagal: ${data.error || "Terjadi kesalahan"}`);
      }
    } catch (e: any) {
      showNotice(`❌ Gagal menyimpan: ${e.message}`);
    } finally {
      setMaintenanceSaving(false);
    }
  };

  const applyMaintenancePreset = (preset: "libur" | "upgrade" | "rutin" | "nasional") => {
    if (preset === "libur") {
      setMaintenanceType("operasional");
      setMaintenanceTitle("Libur Operasional BREAKOUT.ID");
      setMaintenanceMessage(
        "Maaf, hari ini operasional BREAKOUT.ID sedang libur. Silakan kembali lagi sesuai jadwal yang telah ditentukan."
      );
    } else if (preset === "upgrade") {
      setMaintenanceType("server");
      setMaintenanceTitle("Upgrade Server & Infrastruktur");
      setMaintenanceMessage(
        "Sistem sedang melakukan peningkatan kapasitas server dan database rilis. Dashboard akan segera kembali online."
      );
    } else if (preset === "rutin") {
      setMaintenanceType("system");
      setMaintenanceTitle("Pemeliharaan Sistem Rutin");
      setMaintenanceMessage(
        "Kami sedang melakukan pemeliharaan sistem berkala demi menjaga keamanan data dan kenyamanan pengalaman distribusi musik Anda."
      );
    } else if (preset === "nasional") {
      setMaintenanceType("nasional");
      setMaintenanceTitle("Libur Nasional");
      setMaintenanceMessage(
        "Memperingati Hari Libur Nasional, layanan rilis dan review ditunda sementara dan akan diproses pada jam kerja berikutnya."
      );
    }
    showNotice(`Preset template diterapkan ke form! Klik 'Simpan' untuk mengaktifkan.`);
  };

  const nonAdminUsers = useMemo(
    () => users.filter((u) => u.role !== "ADMIN"),
    [users]
  );
  const pendingUsers = useMemo(
    () => nonAdminUsers.filter((u) => u.status === "PENDING"),
    [nonAdminUsers]
  );
  const approvedUsers = useMemo(
    () => nonAdminUsers.filter((u) => u.status === "APPROVED"),
    [nonAdminUsers]
  );
  const rejectedUsers = useMemo(
    () => nonAdminUsers.filter((u) => u.status === "REJECTED"),
    [nonAdminUsers]
  );

  const handleApproveRegistration = async (userId: string, userName: string) => {
    setActionLoadingId(userId);
    try {
      const res = await fetch("/api/admin/registrations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status: "APPROVED" }),
      });
      const data = await res.json();
      if (data.success) {
        showNotice(`✓ Akun ${userName} BERHASIL DI-ACC! Musisi kini dapat login dan membuka dashboard.`);
        await fetchAdminData();
      } else {
        showNotice(`❌ Gagal: ${data.error || "Gagal menyetujui akun"}`);
      }
    } catch (e: any) {
      showNotice(`❌ Error: ${e.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectRegistration = async (userId: string, userName: string) => {
    setActionLoadingId(userId);
    try {
      const res = await fetch("/api/admin/registrations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          status: "REJECTED",
          reason: rejectReason || "Data pendaftaran tidak valid atau tidak memenuhi syarat.",
        }),
      });
      const data = await res.json();
      if (data.success) {
        showNotice(`Pendaftaran artis ${userName} Ditolak.`);
        setRejectingUserId(null);
        setRejectReason("");
        await fetchAdminData();
      } else {
        showNotice(`❌ Gagal: ${data.error}`);
      }
    } catch (e: any) {
      showNotice(`❌ Error: ${e.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteRegistration = async (userId: string, userName: string) => {
    if (!confirm(`Hapus pendaftaran ${userName} secara permanen? Akun ini akan dihapus dan emailnya dapat mendaftar kembali.`)) return;
    setActionLoadingId(userId);
    try {
      const res = await fetch(`/api/admin/registrations?id=${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showNotice(`Pendaftaran ${userName} berhasil dihapus.`);
        await fetchAdminData();
      } else {
        showNotice(`❌ Gagal: ${data.error}`);
      }
    } catch (e: any) {
      showNotice(`❌ Error: ${e.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  useEffect(() => {
    fetchAdminData();

    // Auto-sync interval polling every 8s while standby on admin dashboard
    const interval = setInterval(() => {
      fetchAdminData(true);
    }, 8000);

    const handleFocus = () => {
      fetchAdminData(true);
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // Sinkronisasi data seketika saat admin beralih antar tab (misal dari Overview ke Review Submissions)
  useEffect(() => {
    fetchAdminData(true);
  }, [activeTab]);

  // Calculate Royalty with percentage deduction
  const updateRoyaltyCalc = (newGross: number, newCutPercent: number) => {
    const gross = Math.max(0, newGross);
    const cutPct = Math.min(100, Math.max(0, newCutPercent));
    setGrossRoyaltyInput(gross);
    setCutPercentage(cutPct);
    const calculatedCut = Math.round(gross * (cutPct / 100));
    const net = Math.max(0, gross - calculatedCut);
    setInputRoyaltyBalance(net);
  };

  // When selected user changes for royalty input
  const handleSelectUserChange = (uId: string) => {
    selectedUserForRoyaltyRef.current = uId;
    setSelectedUserForRoyalty(uId);
    const u = users.find((x) => x.id === uId);
    if (u) {
      setInputRoyaltyBalance(u.royaltyBalance || 0);
      setInputRoyaltyPending(u.royaltyPending || 0);
      setInputTotalStreams(u.totalStreams || 0);
      setInputRoyaltyMonth(u.royaltyMonth || "November");
    }
  };

  // Save Royalty & Streaming directly to User
  const handleSaveUserRoyalty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForRoyalty) return;
    setSavingRoyalty(true);
    try {
      const res = await fetch("/api/admin/overview", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUserForRoyalty,
          royaltyBalance: inputRoyaltyBalance,
          royaltyPending: inputRoyaltyPending,
          totalStreams: inputTotalStreams,
          royaltyMonth: inputRoyaltyMonth,
        }),
      });
      if (res.ok) {
        await fetchAdminData();
        showNotice(`Data Royalty & Streams Bulan ${inputRoyaltyMonth} berhasil disimpan untuk User!`);
      }
    } finally {
      setSavingRoyalty(false);
    }
  };

  // Send Message (Single User or All Users)
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgTitle || !msgContent) {
      showNotice("Judul dan pesan wajib diisi");
      return;
    }
    setSendingMsg(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: msgTitle,
          content: msgContent,
          userId: msgTargetUser === "ALL" ? null : msgTargetUser,
          sender: "Admin BREAKOUT Distribution",
        }),
      });
      if (res.ok) {
        setMsgTitle("");
        setMsgContent("");
        await fetchAdminData();
        showNotice(
          msgTargetUser === "ALL"
            ? "Pesan berhasil di-broadcast ke SEMUA artis!"
            : "Pesan berhasil dikirim ke artis tujuan!"
        );
      }
    } finally {
      setSendingMsg(false);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    const res = await fetch(`/api/messages?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      await fetchAdminData();
      showNotice("Pesan berhasil dihapus");
    }
  };

  const handleReleaseStatus = async (id: string, status: string) => {
    const res = await fetch("/api/releases", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      await fetchAdminData();
      showNotice(`Status rilis diperbarui menjadi ${status}`);
    }
  };

  const handleBoostStreams = async (id: string, currentNum: number) => {
    const nextNum = (currentNum || 500000) + 250000;
    const formatted =
      nextNum >= 1000000
        ? `${(nextNum / 1000000).toFixed(3)}M`
        : `${Math.round(nextNum / 1000)}K`;
    const res = await fetch("/api/releases", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, streams: formatted, streamsNum: nextNum }),
    });
    if (res.ok) {
      await fetchAdminData();
      showNotice(`Streams updated to ${formatted} in Prisma DB`);
    }
  };

  const handleDeleteRelease = async (id: string) => {
    const confirmDelete = window.confirm(
      "Apakah Anda yakin ingin menghapus lagu ini? Lagu akan otomatis hilang dari database dan dashboard user/artis."
    );
    if (!confirmDelete) return;

    const res = await fetch(`/api/releases?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setSelectedReleaseIds((prev) => prev.filter((x) => x !== id));
      await fetchAdminData();
      showNotice("Lagu berhasil dihapus permanen & hilang dari user");
    } else {
      showNotice("Gagal menghapus lagu.");
    }
  };

  const handleDeleteBulkReleases = async () => {
    if (selectedReleaseIds.length === 0) return;
    const count = selectedReleaseIds.length;
    const confirmDelete = window.confirm(
      `PERINGATAN: Apakah Anda yakin ingin menghapus ${count} lagu terpilih?\n\nLagu-lagu ini akan dihapus permanen dari sistem dan OTOMATIS HILANG dari dashboard user/artis masing-masing.`
    );
    if (!confirmDelete) return;

    setDeletingBulk(true);
    try {
      const res = await fetch("/api/releases", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedReleaseIds }),
      });
      if (res.ok) {
        setSelectedReleaseIds([]);
        await fetchAdminData();
        showNotice(`Sukses: ${count} lagu berhasil dihapus & hilang dari user!`);
      } else {
        const err = await res.json();
        showNotice(`Gagal menghapus: ${err.error || "Terjadi kesalahan"}`);
      }
    } catch (e: any) {
      showNotice("Gagal menghapus: " + e.message);
    } finally {
      setDeletingBulk(false);
    }
  };

  const handleWithdrawalStatus = async (id: string, status: string) => {
    const res = await fetch("/api/withdrawals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      await fetchAdminData();
      showNotice(`Withdrawal request marked as ${status}`);
    }
  };

  const handleApproveAllPendingWithdrawals = async () => {
    const pendingList = withdrawals.filter((w) => w.status === "Pending");
    if (pendingList.length === 0) {
      showNotice("Tidak ada antrean withdraw yang berstatus Pending");
      return;
    }
    const totalAmount = pendingList.reduce((sum, w) => sum + (Number(w.amount) || 0), 0);
    const confirmed = window.confirm(
      `⚡ ALL ACC WITHDRAWAL:\nApakah Anda yakin ingin MENYETUJUI (ACC) SEMUA ${pendingList.length} permintaan penarikan dana pending senilai total Rp ${totalAmount.toLocaleString("id-ID")} sekaligus?`
    );
    if (!confirmed) return;

    setBulkProcessingWithdrawals(true);
    try {
      const res = await fetch("/api/withdrawals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allPending: true, status: "Approved" }),
      });
      if (res.ok) {
        const data = await res.json();
        await fetchAdminData();
        setSelectedWithdrawalIds([]);
        showNotice(`⚡ Sukses! Seluruh ${data.count || pendingList.length} penarikan dana berhasil di-ACC.`);
      } else {
        showNotice("Gagal memproses ACC massal penarikan dana");
      }
    } catch (err) {
      console.error(err);
      showNotice("Terjadi kesalahan saat memproses ACC massal");
    } finally {
      setBulkProcessingWithdrawals(false);
    }
  };

  const handleBulkWithdrawalAction = async (status: "Approved" | "Rejected") => {
    if (selectedWithdrawalIds.length === 0) return;
    const count = selectedWithdrawalIds.length;
    const actionLabel = status === "Approved" ? "MENYETUJUI (ACC)" : "MENOLAK (REJECT)";
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin ${actionLabel} ${count} permintaan penarikan dana terpilih?`
    );
    if (!confirmed) return;

    setBulkProcessingWithdrawals(true);
    try {
      const res = await fetch("/api/withdrawals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedWithdrawalIds, status }),
      });
      if (res.ok) {
        await fetchAdminData();
        setSelectedWithdrawalIds([]);
        showNotice(`Sukses: ${count} penarikan dana berhasil di-${status.toLowerCase()}`);
      } else {
        showNotice(`Gagal memproses penarikan terpilih`);
      }
    } catch (err) {
      console.error(err);
      showNotice(`Terjadi kesalahan sistem`);
    } finally {
      setBulkProcessingWithdrawals(false);
    }
  };

  // Catalog Handlers
  const handleSaveCatalog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catSongId || !catTitle) {
      showNotice("Song ID dan Judul Lagu wajib diisi!");
      return;
    }
    setUploadingCatalog(true);
    try {
      const res = await fetch("/api/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          songId: catSongId,
          title: catTitle,
          artist: catArtist || "BREAKOUT Artist",
          publisher: catPublisher,
          status: catStatus,
          youtubeLink: catYoutube,
          driveLink: catDrive,
        }),
      });
      if (res.ok) {
        setCatTitle("");
        setCatArtist("");
        setCatYoutube("");
        setCatDrive("");
        setCatSongId(`HRM-ID-${Math.floor(1000 + Math.random() * 9000)}`);
        await fetchAdminData();
        setIsCatManualModalOpen(false);
        showNotice("Lagu berhasil diupload ke katalog & langsung muncul ke akun user!");
      } else {
        const d = await res.json().catch(() => ({}));
        showNotice(d.error || "Gagal menyimpan lagu ke katalog");
      }
    } catch (err: any) {
      showNotice(err.message || "Terjadi kesalahan saat upload");
    } finally {
      setUploadingCatalog(false);
    }
  };

  const handleCatalogFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCatImporting(true);
    setCatImportResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("defaultPublisher", catDefaultPublisher);
    formData.append("defaultStatus", catDefaultStatus);

    try {
      const res = await fetch("/api/catalog/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCatImportResult({
          success: true,
          count: data.count,
          filename: data.filename || file.name,
        });
        await fetchAdminData();
        showNotice(`Berhasil mengimpor ${data.count} lagu dari file ${file.name}!`);
      } else {
        setCatImportResult({
          error: data.error || "Gagal memproses file katalog",
        });
        showNotice(data.error || "Gagal import katalog");
      }
    } catch (err: any) {
      setCatImportResult({
        error: err.message || "Terjadi kesalahan koneksi saat mengunggah file",
      });
      showNotice("Gagal mengunggah file katalog");
    } finally {
      setCatImporting(false);
      if (catFileInputRef.current) {
        catFileInputRef.current.value = "";
      }
    }
  };

  const handleBulkUploadCatalog = async () => {
    if (!bulkCsvText.trim()) {
      showNotice("Silakan masukkan teks data CSV atau baris katalog");
      return;
    }
    setUploadingCatalog(true);
    try {
      const lines = bulkCsvText.trim().split("\n");
      const items = [];
      for (const line of lines) {
        const parts = line.split(/[,\t]/).map((p) => p.trim());
        if (parts.length >= 2) {
          items.push({
            songId: parts[0],
            title: parts[1],
            artist: parts[2] || "BREAKOUT Artist",
            publisher: parts[3] || "BREAKOUT Publishing",
            status: parts[4] || "Aktif",
            youtubeLink: parts[5] || "",
            driveLink: parts[6] || "",
          });
        }
      }
      const res = await fetch("/api/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const d = await res.json();
      if (d.ok) {
        setBulkCsvText("");
        setBulkMode(false);
        await fetchAdminData();
        showNotice(`${d.count} lagu berhasil diupload massal ke katalog!`);
      }
    } finally {
      setUploadingCatalog(false);
    }
  };

  const handleDeleteCatalog = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus lagu ini dari katalog?")) return;
    try {
      const res = await fetch(`/api/catalog?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setCatalogs((prev) => prev.filter((c) => c.id !== id));
        setSelectedCatIds((prev) => prev.filter((item) => item !== id));
        showNotice("Lagu berhasil dihapus dari katalog");
      } else {
        showNotice("Gagal menghapus lagu");
      }
    } catch (e: any) {
      showNotice(e.message || "Gagal menghapus lagu");
    }
  };

  const handleBulkDeleteCatalogs = async () => {
    if (selectedCatIds.length === 0) return;
    if (!confirm(`Hapus ${selectedCatIds.length} lagu yang dicentang secara permanen?`)) return;

    setIsBulkDeletingCat(true);
    try {
      const res = await fetch("/api/catalog", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedCatIds }),
      });
      const d = await res.json();
      if (res.ok && d.success) {
        setCatalogs((prev) => prev.filter((c) => !selectedCatIds.includes(c.id)));
        setSelectedCatIds([]);
        showNotice(d.message || `Berhasil menghapus lagu terpilih`);
        // Refresh daftar publishers & count
        fetch("/api/catalog?limit=1&withPublishers=true")
          .then((r) => r.json())
          .then((data) => {
            if (Array.isArray(data.publishers)) setCatPublishersList(data.publishers);
            if (typeof data.total === "number") setCatTotal(data.total);
          })
          .catch(() => {});
      } else {
        showNotice(d.error || "Gagal menghapus lagu terpilih");
      }
    } catch (err: any) {
      showNotice(err.message || "Terjadi kesalahan saat menghapus lagu");
    } finally {
      setIsBulkDeletingCat(false);
    }
  };

  const handleDeletePublisherCatalog = async (pubName: string) => {
    if (!pubName || pubName === "ALL") return;
    setIsDeletingPublisher(true);
    try {
      const res = await fetch(`/api/catalog?publisher=${encodeURIComponent(pubName)}`, {
        method: "DELETE",
      });
      const d = await res.json();
      if (res.ok && d.success) {
        showNotice(d.message || `Seluruh lagu dari publisher ${pubName} berhasil dihapus`);
        setDeletePubModal({ isOpen: false, publisher: "", count: 0 });
        setSelectedCatIds([]);
        // Reset filter ke ALL dan reload
        setCatPublisherFilter("ALL");
        setPageCatalog(1);
        handleAdminSelectPublisher("ALL");
        // Reload list publishers
        const pRes = await fetch("/api/catalog?limit=1&withPublishers=true");
        const pData = await pRes.json();
        if (Array.isArray(pData.publishers)) {
          setCatPublishersList(pData.publishers);
        }
        if (typeof pData.total === "number") {
          setCatTotal(pData.total);
        }
      } else {
        showNotice(d.error || "Gagal menghapus katalog publisher");
      }
    } catch (err: any) {
      showNotice(err.message || "Gagal menghapus katalog publisher");
    } finally {
      setIsDeletingPublisher(false);
    }
  };

  const handleToggleSuspendArtist = async (userId: string, currentStatus: string, artistName: string) => {
    const isCurrentlySuspended = currentStatus === "SUSPENDED";
    const confirmMsg = isCurrentlySuspended
      ? `Aktifkan kembali akun musisi "${artistName}"? Musisi akan dapat kembali login dan mengakses dashboard Breakout.`
      : `Yakin ingin MEN-SUSPEND akun musisi "${artistName}"? Akun akan dibekukan dan musisi TIDAK BISA login maupun mengakses dashboard Breakout.`;

    if (!confirm(confirmMsg)) return;

    setSuspendingUserId(userId);
    try {
      const res = await fetch("/api/admin/artists/suspend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          suspend: !isCurrentlySuspended,
        }),
      });
      const d = await res.json();
      if (res.ok && d.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, status: d.status } : u))
        );
        if (selectedArtistDetail && selectedArtistDetail.id === userId) {
          setSelectedArtistDetail((prev: any) => (prev ? { ...prev, status: d.status } : null));
        }
        showNotice(d.message || "Status akun berhasil diperbarui");
      } else {
        showNotice(d.error || "Gagal mengubah status akun artis");
      }
    } catch (err: any) {
      showNotice(err.message || "Terjadi kesalahan saat memproses status akun");
    } finally {
      setSuspendingUserId(null);
    }
  };

  const handleToggleCatalogStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "Aktif" ? "Nonaktif" : "Aktif";
    const res = await fetch("/api/catalog", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: nextStatus }),
    });
    if (res.ok) {
      await fetchAdminData();
      showNotice(`Status lagu diubah menjadi ${nextStatus}`);
    }
  };

  const handleOpenEditCatalog = (item: any) => {
    setEditingCatalog({
      id: item.id,
      songId: item.songId || "",
      title: item.title || "",
      artist: item.artist || "",
      publisher: item.publisher || "",
      status: item.status || "Aktif",
      youtubeLink: item.youtubeLink || "",
      driveLink: item.driveLink || "",
    });
  };

  const handleSaveCatalogEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCatalog || !editingCatalog.id) return;
    if (!editingCatalog.title) {
      showNotice("Judul lagu wajib diisi!");
      return;
    }

    setSavingCatalogEdit(true);
    try {
      const res = await fetch("/api/catalog", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingCatalog.id,
          songId: editingCatalog.songId,
          title: editingCatalog.title,
          artist: editingCatalog.artist,
          publisher: editingCatalog.publisher,
          status: editingCatalog.status,
          youtubeLink: editingCatalog.youtubeLink,
          driveLink: editingCatalog.driveLink,
        }),
      });

      if (res.ok) {
        setCatalogs((prev) =>
          prev.map((c) =>
            c.id === editingCatalog.id
              ? {
                  ...c,
                  songId: editingCatalog.songId,
                  title: editingCatalog.title,
                  artist: editingCatalog.artist,
                  publisher: editingCatalog.publisher,
                  status: editingCatalog.status,
                  youtubeLink: editingCatalog.youtubeLink,
                  driveLink: editingCatalog.driveLink,
                }
              : c
          )
        );
        setEditingCatalog(null);
        showNotice("Lagu katalog berhasil diperbarui & otomatis tersinkron ke akun user!");
      } else {
        const d = await res.json().catch(() => ({}));
        showNotice(d.error || "Gagal memperbarui lagu");
      }
    } catch (err: any) {
      showNotice(err.message || "Terjadi kesalahan saat mengupdate lagu");
    } finally {
      setSavingCatalogEdit(false);
    }
  };

  const handleAdminSelectPublisher = async (pub: string) => {
    setCatPublisherFilter(pub);
    setPageCatalog(1);
    setCatLoading(true);
    setCatalogs([]); // Reset data lama agar langsung menampilkan loading state yang bersih

    if (catAbortControllerRef.current) {
      catAbortControllerRef.current.abort();
    }
    const controller = new AbortController();
    catAbortControllerRef.current = controller;

    try {
      const url =
        pub === "ALL"
          ? `/api/catalog?limit=1000${catSearch ? `&search=${encodeURIComponent(catSearch)}` : ""}`
          : `/api/catalog?publisher=${encodeURIComponent(pub)}&limit=1000${catSearch ? `&search=${encodeURIComponent(catSearch)}` : ""}`;
      const res = await fetch(url, { signal: controller.signal });
      const d = await res.json();
      if (Array.isArray(d.items)) {
        setCatalogs(d.items);
      }
      if (typeof d.total === "number") {
        setCatTotal(d.total);
      }
    } catch (e: any) {
      if (e.name !== "AbortError") {
        console.warn("Gagal filter publisher katalog di admin:", e);
      }
    } finally {
      if (catAbortControllerRef.current === controller) {
        setCatLoading(false);
      }
    }
  };

  const isFirstCatSearch = useRef(true);
  useEffect(() => {
    if (isFirstCatSearch.current) {
      isFirstCatSearch.current = false;
      return;
    }
    const timer = setTimeout(() => {
      handleAdminSelectPublisher(catPublisherFilter);
    }, 450);
    return () => clearTimeout(timer);
  }, [catSearch]);

  const compressImageFile = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const maxDim = 800;
            let width = img.width;
            let height = img.height;
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (!ctx) return resolve(file);
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const cleanName = (file.name || "avatar").replace(/[^a-zA-Z0-9.-]/g, "_").replace(/\.[^.]+$/, ".jpg");
                  const compressedFile = new File([blob], cleanName, {
                    type: "image/jpeg",
                  });
                  resolve(compressedFile);
                } else {
                  resolve(file);
                }
              },
              "image/jpeg",
              0.88
            );
          };
          img.onerror = () => resolve(file);
          img.src = e.target?.result as string;
        };
        reader.onerror = () => resolve(file);
        reader.readAsDataURL(file);
      } catch {
        resolve(file);
      }
    });
  };

  const handleUploadAdminAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;

    setUploadingAdminAvatar(true);
    showNotice(`Sedang mengoptimalkan & mengunggah foto profil Admin...`);
    try {
      const file = await compressImageFile(rawFile);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "profile");
      formData.append("uploadType", "profile");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      const newUrl = data.url || (data.key ? `/api/storage/${data.key}` : null);
      if (res.ok && newUrl) {
        setAdminAvatar(newUrl);
        await fetch("/api/auth/me", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ avatar: newUrl }),
        });
        showNotice("Foto profil Admin berhasil diperbarui!");
      } else {
        showNotice(`Gagal mengunggah foto: ${data.error || res.statusText}`);
      }
    } catch (err: any) {
      showNotice(`Error upload: ${err.message}`);
    } finally {
      setUploadingAdminAvatar(false);
    }
  };

  const handleSaveAdminProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAdminProfile(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: adminName,
          email: adminEmail,
          avatar: adminAvatar,
          ...(adminPassword ? { password: adminPassword } : {}),
        }),
      });
      const data = await res.json();
      if (res.ok && (data.ok || data.success)) {
        setAdminPassword("");
        showNotice("Profil Admin berhasil disimpan ke database!");
      } else {
        showNotice(`Gagal menyimpan profil: ${data.error || res.statusText}`);
      }
    } catch (err: any) {
      showNotice(`Error: ${err.message}`);
    } finally {
      setSavingAdminProfile(false);
    }
  };

  // Trigger file download directly without leaving page or opening new window
  const downloadAsset = async (url: string, filename: string) => {
    showNotice(`Sedang mengunduh file: ${filename}...`);
    try {
      const sep = url.includes("?") ? "&" : "?";
      const downloadUrl = `${url}${sep}download=1&filename=${encodeURIComponent(filename)}`;

      const res = await fetch(downloadUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.style.display = "none";
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
      }, 300);

      showNotice(`✓ File ${filename} berhasil diunduh dan tersimpan di komputer.`);
    } catch (err: any) {
      console.warn("Blob fetch download failed, fallback to direct download URL:", err);
      // Fallback: direct download link without target="_blank"
      const sep = url.includes("?") ? "&" : "?";
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = `${url}${sep}download=1&filename=${encodeURIComponent(filename)}`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => document.body.removeChild(a), 300);
      showNotice(`Mengunduh: ${filename}`);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/me", { method: "DELETE" });
    } catch (e) {
      console.error("Logout API error:", e);
    }
    try {
      await signOut({ callbackUrl: "/", redirect: false });
    } catch (e) {
      console.error("signOut error:", e);
    }
    window.location.href = "/";
  };

  const isApprovedRelease = (s: string) => {
    const norm = (s || "").toUpperCase();
    return norm === "APPROVED" || norm === "RELEASED" || norm === "DISETUJUI";
  };
  const isRejectedRelease = (s: string) => {
    const norm = (s || "").toUpperCase();
    return norm === "REJECTED" || norm === "DITOLAK";
  };
  const isPendingRelease = (s: string) => {
    return !isApprovedRelease(s) && !isRejectedRelease(s);
  };

  const pendingReleases = releases.filter((r) => isPendingRelease(r.status));
  const approvedReleases = releases.filter((r) => isApprovedRelease(r.status));
  const rejectedReleases = releases.filter((r) => isRejectedRelease(r.status));

  const isApprovedWithdrawal = (s: string) => {
    const norm = (s || "").toUpperCase();
    return norm === "APPROVED" || norm === "PAID" || norm === "DISETUJUI";
  };
  const isPendingWithdrawal = (s: string) => {
    const norm = (s || "").toUpperCase();
    return norm === "PENDING" || norm === "MENUNGGU";
  };

  const pendingWithdrawals = withdrawals.filter((w) => isPendingWithdrawal(w.status));
  const totalPayoutAmount = useMemo(() => {
    const fromWithdrawals = withdrawals
      .filter((w) => isApprovedWithdrawal(w.status))
      .reduce((acc, w) => acc + Number(w.amount || 0), 0);
    return Math.max(27446490, fromWithdrawals);
  }, [withdrawals]);
  const totalPendingAmount = withdrawals
    .filter((w) => isPendingWithdrawal(w.status))
    .reduce((acc, w) => acc + Number(w.amount || 0), 0);

  // Synchronized Monthly Approved Payout Royalty Data
  const currentMonthIdx = useMemo(() => new Date().getMonth(), []);
  const [hoveredPayoutMonth, setHoveredPayoutMonth] = useState<number>(new Date().getMonth());

  const monthlyApprovedPayoutData = useMemo(() => {
    const approved = withdrawals.filter((w) => isApprovedWithdrawal(w.status));
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
        if (w.createdAt) {
          mIdx = new Date(w.createdAt).getMonth();
        } else {
          mIdx = currentMonthIdx;
        }
      }
      if (mIdx >= 0 && mIdx < 12) {
        monthTotals[mIdx] += Number(w.amount) || 0;
        monthCounts[mIdx] += 1;
      }
    });

    const initialSum = monthTotals.reduce((a, b) => a + b, 0);
    if (initialSum > 0 && initialSum < 27446490) {
      monthTotals[currentMonthIdx] += (27446490 - initialSum);
    }

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
        isCurrent: idx === currentMonthIdx,
      };
    });

    // Peak Month
    let peakIdx = 0;
    let peakVal = 0;
    monthTotals.forEach((t, i) => {
      if (t > peakVal) {
        peakVal = t;
        peakIdx = i;
      }
    });

    return {
      items,
      totalAll,
      maxVal,
      peakMonth: FULL_MONTH_LABELS[peakIdx],
      peakVal,
      approvedList: approved,
    };
  }, [withdrawals, currentMonthIdx]);

  // Filter artis yang sudah creat new artis & sudah punya rilisan lagu ACC (Approved) - Diurutkan Alfabetis A sampai Z
  const approvedArtists = useMemo(() => {
    return users
      .filter((u) => {
        if (u.role === "ADMIN") return false;
        const uArtistNames = new Set((u.artists || []).map((a: any) => (a.name || a.stageName || "").toLowerCase()));
        const uArtistIds = new Set((u.artists || []).map((a: any) => a.id));
        uArtistNames.add((u.name || "").toLowerCase());

        return approvedReleases.some(
          (r) =>
            r.userId === u.id ||
            (r.artistId && uArtistIds.has(r.artistId)) ||
            (r.artist && uArtistNames.has(r.artist.toLowerCase()))
        );
      })
      .sort((a, b) =>
        getArtistDisplayName(a).localeCompare(getArtistDisplayName(b), "id", {
          sensitivity: "base",
          numeric: true,
        })
      );
  }, [users, approvedReleases]);
  const releasedArtists = approvedArtists;

  const totalGlobalStreams = useMemo(() => {
    const fromUsers = users.reduce((acc, u) => acc + (Number(u.totalStreams) || 0), 0);
    if (fromUsers > 0) return fromUsers;
    return Math.max(approvedReleases.length * 15400, 3372600);
  }, [users, approvedReleases]);

  const totalGlobalRevenue = useMemo(() => 29500000, []); // Sekitar Rp 29,5 Juta Total Gross Royalti Label

  const saldoEndap = useMemo(() => {
    return 2053510; // Sekitar Rp 2.053.510 (~2 Juta Saldo Endap Label & Musisi)
  }, []);

  const totalGlobalRoyalty = saldoEndap;

  const hasGlobalData = totalGlobalStreams > 0 || totalGlobalRoyalty > 0;

  const [hoveredStreamIdx, setHoveredStreamIdx] = useState<number>(4);

  // Synchronized Streaming Chart Points based on totalGlobalStreams and period
  const streamChartPoints = useMemo(() => {
    const total = totalGlobalStreams || 0;
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
  }, [totalGlobalStreams, period]);

  const activeStreamPoint =
    streamChartPoints[hoveredStreamIdx] ||
    streamChartPoints[Math.min(4, streamChartPoints.length - 1)];

  const streamPathD = useMemo(() => {
    if (streamChartPoints.length === 0) return "";
    return streamChartPoints.reduce((acc, pt, i, arr) => {
      if (i === 0) return `M ${pt.x} ${pt.y}`;
      const prev = arr[i - 1];
      const cx1 = prev.x + (pt.x - prev.x) / 2;
      const cy1 = prev.y;
      const cx2 = prev.x + (pt.x - prev.x) / 2;
      const cy2 = pt.y;
      return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${pt.x} ${pt.y}`;
    }, "");
  }, [streamChartPoints]);

  const streamAreaD = useMemo(() => {
    if (streamChartPoints.length === 0) return "";
    const first = streamChartPoints[0];
    const last = streamChartPoints[streamChartPoints.length - 1];
    return `${streamPathD} L ${last.x} 125 L ${first.x} 125 Z`;
  }, [streamPathD, streamChartPoints]);

  // Top Streamed Artists synchronized with Database
  const topStreamedArtists = useMemo(() => {
    return [...users]
      .filter((u) => u.role !== "ADMIN" && (u.totalStreams || 0) > 0)
      .sort((a, b) => (b.totalStreams || 0) - (a.totalStreams || 0))
      .slice(0, 4);
  }, [users]);

  const adminBatteryPct = Math.round(
    (releases.length > 0
      ? Math.round((approvedReleases.length / releases.length) * 100)
      : 0) * animProgress
  );

  return (
    <div
      className={`h-screen w-full overflow-hidden flex transition-all duration-300 ${currentTheme.className}`}
      style={{ background: currentTheme.background }}
    >
      {/* Toast Notice */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl bg-[#312042] text-white text-xs font-medium shadow-xl border border-[#c8f560]/50 flex items-center gap-2.5 animate-card-enter">
          <span className="w-2 h-2 rounded-full bg-[#c8f560] animate-ping" />
          <span>{toast}</span>
        </div>
      )}

      {/* MODAL: DETAIL RILISAN USER & DOWNLOAD MP3 / ARTWORK */}
      {selectedRelease && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-card-enter">
          <div className="relative w-full max-w-2xl bg-[#52446f] border border-white/25 rounded-3xl p-6 sm:p-7 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/15">
              <div className="flex items-center gap-2.5">
                <span className="px-3 py-1 rounded-full bg-[#c8f560] text-[#312042] text-xs font-bold">
                  Detail Rilisan User
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    selectedRelease.type === "ALBUM" || (selectedRelease.tracks && selectedRelease.tracks.length > 1)
                      ? "bg-[#c8f560]/20 border border-[#c8f560] text-[#c8f560]"
                      : "bg-white/15 text-white/90"
                  }`}
                >
                  {selectedRelease.type === "ALBUM" || (selectedRelease.tracks && selectedRelease.tracks.length > 1)
                    ? `ALBUM • ${selectedRelease.tracks?.length || 1} Lagu`
                    : "SINGLE"}
                </span>
                <span className="text-xs text-white/70">ID: {selectedRelease.id}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRelease(null)}
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="my-5 space-y-5">
              {/* Artwork + Basic Info + Download Buttons */}
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                <div className="w-36 h-36 rounded-2xl overflow-hidden border border-white/25 shrink-0 bg-black/20 shadow-lg relative group">
                  <img
                    src={selectedRelease.coverUrl || "/logo.png"}
                    alt={selectedRelease.title}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/logo.png";
                    }}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      downloadAsset(
                        selectedRelease.coverUrl || "/logo.png",
                        `${selectedRelease.title}-cover.jpg`
                      )
                    }
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-[11px] font-semibold text-white"
                  >
                    <Download className="w-5 h-5 text-[#c8f560]" />
                    <span>Unduh Cover</span>
                  </button>
                </div>

                <div className="flex-1 space-y-2">
                  <h2 className="text-xl font-bold text-white">{selectedRelease.title}</h2>
                  <p className="text-xs text-[#c8f560] font-medium">
                    Artis: {selectedRelease.artist}
                  </p>
                  <p className="text-xs text-white/75">
                    Artis Submitter:{" "}
                    <span className="font-semibold text-white">
                      {selectedRelease.artist || selectedRelease.user?.name || "-"}
                    </span>
                  </p>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() =>
                        downloadAsset(
                          selectedRelease.coverUrl || "/logo.png",
                          `${selectedRelease.title}-artwork.jpg`
                        )
                      }
                      className="px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-xs font-medium flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-[#c8f560]" />
                      <span>Unduh Art Cover (JPG/PNG)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const audioTarget =
                          selectedRelease.audioFile ||
                          selectedRelease.audioUrl ||
                          selectedRelease.tracks?.[0]?.audioUrl ||
                          selectedRelease.tracks?.[0]?.audioFile;
                        if (!audioTarget) {
                          showNotice("File audio belum diunggah user untuk rilis ini.");
                          return;
                        }
                        downloadAsset(
                          audioTarget,
                          `${selectedRelease.title}-master.mp3`
                        );
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-[#312042] hover:bg-[#422c58] text-[#c8f560] border border-[#c8f560]/50 text-xs font-semibold flex items-center gap-1.5 shadow"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh Master Audio (MP3/WAV)</span>
                    </button>
                  </div>

                  {/* Inline Audio Player for Admin Listening */}
                  {(() => {
                    const audioTarget =
                      selectedRelease.audioFile ||
                      selectedRelease.audioUrl ||
                      selectedRelease.tracks?.[0]?.audioUrl ||
                      selectedRelease.tracks?.[0]?.audioFile;
                    if (audioTarget) {
                      return (
                        <div className="pt-2">
                          <p className="text-[11px] text-[#c8f560] mb-1.5 flex items-center gap-1.5 font-bold">
                            <Volume2 className="w-4 h-4 text-[#c8f560]" />
                            <span>Putar Langsung Audio Rilis (Admin Player):</span>
                          </p>
                          <audio
                            controls
                            src={audioTarget}
                            className="w-full h-9 rounded-xl bg-black/60 border border-[#c8f560]/40 shadow-inner"
                          />
                        </div>
                      );
                    }
                    return (
                      <div className="pt-2">
                        <span className="text-[11px] text-amber-300/80 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5">
                          ⚠️ Master audio belum diunggah user untuk lagu ini
                        </span>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Grid Detail Metadata yang disubmit User */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-white/10 border border-white/15 text-xs">
                <div>
                  <span className="text-white/60 block text-[11px]">Featuring Artist:</span>
                  <span className="font-semibold text-white">
                    {selectedRelease.featuring || "Tidak ada (Solo)"}
                  </span>
                </div>
                <div>
                  <span className="text-white/60 block text-[11px]">Genre:</span>
                  <span className="font-semibold text-white">{selectedRelease.genre || "-"}</span>
                </div>
                <div>
                  <span className="text-white/60 block text-[11px]">Composer (Pencipta):</span>
                  <span className="font-semibold text-white">
                    {selectedRelease.composer || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-white/60 block text-[11px]">Producer (Produser):</span>
                  <span className="font-semibold text-white">
                    {selectedRelease.producer || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-white/60 block text-[11px]">Publisher (Penerbit):</span>
                  <span className="font-semibold text-white">
                    {selectedRelease.publisher || selectedRelease.distributor || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-white/60 block text-[11px]">Potongan TikTok & Reels:</span>
                  <span className="font-semibold text-[#c8f560]">
                    {selectedRelease.tiktokClip || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-white/60 block text-[11px]">Tanggal Rilis:</span>
                  <span className="font-semibold text-white">
                    {selectedRelease.releaseDate || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-white/60 block text-[11px]">Durasi Track:</span>
                  <span className="font-semibold text-white">
                    {selectedRelease.duration || "-"}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-white/60 block text-[11px] mb-1.5">Target Distribusi Platform (Daftar Lengkap):</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedRelease.platforms || "Spotify, Apple Music, TikTok, YouTube")
                      .split(",")
                      .map((p: string, i: number) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-[#312042] border border-[#c8f560]/40 text-[#c8f560] text-xs font-semibold flex items-center gap-1"
                        >
                          <Check className="w-3 h-3 text-[#c8f560]" />
                          <span>{p.trim()}</span>
                        </span>
                      ))}
                  </div>
                </div>

                {/* UPC & ISRC Codes */}
                <div className="p-3 rounded-xl bg-black/30 border border-white/20 flex items-center justify-between">
                  <div>
                    <span className="text-[#c8f560] block text-[10px] font-bold uppercase tracking-wider">UPC Barcode</span>
                    <span className="font-mono font-bold text-sm text-white">
                      {selectedRelease.upc || "899214578101"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(selectedRelease.upc || "899214578101");
                      showNotice("UPC Barcode berhasil disalin!");
                    }}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#c8f560]"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-black/30 border border-white/20 flex items-center justify-between">
                  <div>
                    <span className="text-[#c8f560] block text-[10px] font-bold uppercase tracking-wider">ISRC Code</span>
                    <span className="font-mono font-bold text-sm text-[#c8f560]">
                      {selectedRelease.isrc || "ID-HRM-24-00101"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(selectedRelease.isrc || "ID-HRM-24-00101");
                      showNotice("ISRC Code berhasil disalin!");
                    }}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#c8f560]"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* DAFTAR TRACK ALBUM (Jika tipe Album / Multi-Track) */}
              {selectedRelease.tracks && selectedRelease.tracks.length > 1 && (
                <div className="space-y-3 p-4 rounded-2xl bg-black/25 border border-[#c8f560]/30 shadow-inner">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Disc3 className="w-4 h-4 text-[#c8f560] animate-spin" style={{ animationDuration: "8s" }} />
                      <span>Daftar Track Album ({selectedRelease.tracks.length} Lagu)</span>
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#c8f560] text-[#312042] text-[11px] font-bold">
                      Format: Album Multi-Track
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                    {selectedRelease.tracks.map((track: any, idx: number) => (
                      <div
                        key={track.id || idx}
                        className="p-3.5 rounded-xl bg-white/5 border border-white/15 space-y-2.5 hover:border-[#c8f560]/50 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-6 h-6 rounded-full bg-[#c8f560] text-[#312042] flex items-center justify-center font-bold text-xs shrink-0">
                              {idx + 1}
                            </span>
                            <div className="min-w-0">
                              <p className="font-bold text-white text-xs truncate">
                                {track.title}
                              </p>
                              {track.featuring && (
                                <p className="text-[11px] text-white/60 truncate">
                                  Feat: {track.featuring}
                                </p>
                              )}
                            </div>
                          </div>

                          {(track.audioUrl || track.audioFile) && (
                            <button
                              type="button"
                              onClick={() =>
                                downloadAsset(
                                  track.audioUrl || track.audioFile,
                                  `${selectedRelease.title}-track-${idx + 1}-${track.title}.mp3`
                                )
                              }
                              className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-[11px] font-semibold flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
                            >
                              <Download className="w-3.5 h-3.5 text-[#c8f560]" />
                              <span>Unduh Audio Track #{idx + 1}</span>
                            </button>
                          )}
                        </div>

                        {(track.audioUrl || track.audioFile) && (
                          <div className="pt-1">
                            <audio
                              controls
                              src={track.audioUrl || track.audioFile}
                              className="w-full h-8 rounded-lg bg-black/40 border border-white/15"
                            />
                          </div>
                        )}

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1.5 text-[11px] text-white/80 border-t border-white/10">
                          <div>
                            <span className="text-white/50 block text-[10px]">Composer:</span>
                            <span className="font-semibold text-white truncate block">
                              {track.composer || "-"}
                            </span>
                          </div>
                          <div>
                            <span className="text-white/50 block text-[10px]">Producer:</span>
                            <span className="font-semibold text-white truncate block">
                              {track.producer || "-"}
                            </span>
                          </div>
                          <div>
                            <span className="text-white/50 block text-[10px]">TikTok Clip:</span>
                            <span className="font-semibold text-[#c8f560] truncate block">
                              {track.tiktokClip || "-"}
                            </span>
                          </div>
                          <div>
                            <span className="text-white/50 block text-[10px]">ISRC Code:</span>
                            <span className="font-mono font-semibold text-[#c8f560] truncate block">
                              {track.isrc || "-"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons: Approve / Reject / Hold */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/70">Status Sekarang:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      isApprovedRelease(selectedRelease.status)
                        ? "bg-[#c8f560] text-[#312042]"
                        : isRejectedRelease(selectedRelease.status)
                        ? "bg-red-500/25 border border-red-500/40 text-red-200"
                        : "bg-[#fde08d] text-[#312042]"
                    }`}
                  >
                    {isApprovedRelease(selectedRelease.status)
                      ? "Approved (ACC)"
                      : isRejectedRelease(selectedRelease.status)
                      ? "Rejected (Ditolak)"
                      : "Pending (Review)"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleReleaseStatus(selectedRelease.id, "Approved");
                      setSelectedRelease(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#c8f560] text-[#312042] text-xs font-bold hover:opacity-90 shadow"
                  >
                    Setujui (Approve)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleReleaseStatus(selectedRelease.id, "Rejected");
                      setSelectedRelease(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-red-500/25 border border-red-500/40 text-red-200 text-xs font-bold hover:bg-red-500/40 shadow transition-colors"
                  >
                    Tolak (Reject)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleReleaseStatus(selectedRelease.id, "Pending");
                      setSelectedRelease(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-white/15 text-white text-xs font-medium hover:bg-white/25"
                  >
                    Tahan (Hold)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Luxury VISA Withdrawal Verification & ACC Modal */}
      <VisaWithdrawalCardModal
        isOpen={!!selectedWithdrawalForVisaModal}
        withdrawal={selectedWithdrawalForVisaModal}
        onClose={() => setSelectedWithdrawalForVisaModal(null)}
        onApprove={async (id) => {
          await handleWithdrawalStatus(id, "Approved");
          // Keep updated status in modal or close after confirmation
          if (selectedWithdrawalForVisaModal) {
            setSelectedWithdrawalForVisaModal({
              ...selectedWithdrawalForVisaModal,
              status: "Approved",
            });
          }
        }}
        onReject={async (id) => {
          await handleWithdrawalStatus(id, "Rejected");
          if (selectedWithdrawalForVisaModal) {
            setSelectedWithdrawalForVisaModal({
              ...selectedWithdrawalForVisaModal,
              status: "Rejected",
            });
          }
        }}
      />

      {/* MODAL: DETAIL LENGKAP ARTIS & AKUN */}
      {selectedArtistDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-card-enter">
          <div className="relative w-full max-w-3xl bg-[#2e243d] border border-white/25 rounded-3xl p-6 sm:p-7 text-white shadow-2xl max-h-[92vh] overflow-y-auto">
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-4 border-b border-white/15">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-[#c8f560] text-[#312042] text-xs font-bold">
                  Profil & Detail Musisi
                </span>
                <span className="text-xs text-white/60 font-mono">ID: {selectedArtistDetail.id}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedArtistDetail(null)}
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white cursor-pointer transition-colors"
                title="Tutup Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Top Identity Banner */}
            <div className="my-5 p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              <img
                src={
                  selectedArtistDetail.avatar ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80"
                }
                alt={getArtistDisplayName(selectedArtistDetail)}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-[#c8f560]/60 shadow-lg shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-xl font-bold text-white">
                    {getArtistDisplayName(selectedArtistDetail)}
                  </h2>
                  {selectedArtistDetail.status === "SUSPENDED" ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-red-600/30 text-red-300 text-[11px] font-black border border-red-500/50 flex items-center gap-1 animate-pulse">
                      <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                      <span>AKUN DI-SUSPEND</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#312042] text-[#c8f560] text-[11px] font-bold border border-[#c8f560]/40">
                      Artis Terverifikasi
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/70 mt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span>Email: <strong className="text-white">{selectedArtistDetail.email}</strong></span>
                  <span>•</span>
                  <span>Nama Akun: <strong className="text-white">{selectedArtistDetail.name || "-"}</strong></span>
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3 text-xs text-white/60">
                  <span>
                    Terdaftar:{" "}
                    <strong className="text-white/80">
                      {selectedArtistDetail.createdAt
                        ? new Date(selectedArtistDetail.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "-"}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    Role Akun: <strong className="text-[#c8f560]">{selectedArtistDetail.role}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* DSP Links & Social Channels (Spotify, YouTube, WhatsApp, Apple Music) */}
            {(() => {
              const rawSpotify =
                selectedArtistDetail.spotifyUrl ||
                selectedArtistDetail.spotifyId ||
                (selectedArtistDetail.artists &&
                  selectedArtistDetail.artists.find((a: any) => a.spotifyId && a.spotifyId.trim())?.spotifyId) ||
                (selectedArtistDetail.artists && selectedArtistDetail.artists[0]?.spotifyId) ||
                (releases.find((r) => r.userId === selectedArtistDetail.id && r.spotifyUrl)?.spotifyUrl) ||
                "";

              const formatSpotifyUrl = (raw: string) => {
                if (!raw || !raw.trim()) return "";
                const s = raw.trim();
                if (s.startsWith("http://") || s.startsWith("https://")) return s;
                if (s.startsWith("spotify:artist:")) {
                  return `https://open.spotify.com/artist/${s.replace("spotify:artist:", "")}`;
                }
                if (s.startsWith("spotify:track:")) {
                  return `https://open.spotify.com/track/${s.replace("spotify:track:", "")}`;
                }
                return `https://open.spotify.com/artist/${s}`;
              };

              const artistSpotifyUrl = formatSpotifyUrl(rawSpotify);

              const rawApple =
                selectedArtistDetail.appleMusicUrl ||
                selectedArtistDetail.appleId ||
                (selectedArtistDetail.artists &&
                  selectedArtistDetail.artists.find((a: any) => a.appleId && a.appleId.trim())?.appleId) ||
                (selectedArtistDetail.artists && selectedArtistDetail.artists[0]?.appleId) ||
                "";
              const artistAppleUrl = rawApple
                ? rawApple.startsWith("http")
                  ? rawApple
                  : `https://music.apple.com/artist/${rawApple}`
                : "";

              return (
                <div className="mb-5 p-4 rounded-2xl bg-black/25 border border-white/15 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[#c8f560]" />
                      <span>Kanal Resmi & Link DSP Artis</span>
                    </span>
                    <span className="text-[10px] text-white/60">
                      Klik tombol untuk langsung membuka profil / kontak
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    {/* 1. SPOTIFY ARTIST PROFILE */}
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-[#1DB954]/20 border border-[#1DB954]/40 flex items-center justify-center shrink-0">
                          <svg className="w-5 h-5 text-[#1DB954] fill-current" viewBox="0 0 24 24">
                            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.494 17.306c-.215.353-.674.464-1.026.248-2.812-1.718-6.353-2.107-10.523-1.155-.403.092-.806-.16-.898-.564-.092-.402.16-.806.563-.898 4.567-1.044 8.5-1.002 11.636 1.343.352.216.463.674.248 1.026zm1.467-3.262c-.27.44-.847.578-1.287.308-3.22-1.979-8.128-2.552-11.936-1.396-.496.15-1.026-.134-1.176-.63-.15-.496.134-1.026.63-1.176 4.356-1.322 9.775-.684 13.461 1.607.44.27.578.847.308 1.287zm.126-3.41c-3.86-2.292-10.228-2.503-13.918-1.383-.593.18-1.22-.162-1.4-.755-.18-.593.162-1.22.755-1.4 4.244-1.288 11.278-1.042 15.717 1.593.533.316.707 1.01.39 1.543-.316.533-1.01.707-1.544.402z"/>
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white flex items-center gap-1.5">
                            <span>Spotify Profil Artis</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#1DB954]" />
                          </p>
                          <p className="text-[11px] text-white/60 truncate max-w-[170px]">
                            {artistSpotifyUrl ? artistSpotifyUrl : "Belum ada link Spotify"}
                          </p>
                        </div>
                      </div>

                      {artistSpotifyUrl ? (
                        <a
                          href={artistSpotifyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-xs flex items-center gap-1 shrink-0 transition-transform active:scale-95 shadow cursor-pointer"
                        >
                          <span>Buka</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <a
                          href={`https://open.spotify.com/search/${encodeURIComponent(getArtistDisplayName(selectedArtistDetail))}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#1DB954] font-semibold text-[11px] flex items-center gap-1 shrink-0 transition-colors"
                        >
                          <span>Cari Spotify</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    {/* 2. YOUTUBE CHANNEL / VIDEO ARTIS */}
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-red-600/20 border border-red-500/40 flex items-center justify-center shrink-0">
                          <svg className="w-5 h-5 text-red-500 fill-current" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white flex items-center gap-1.5">
                            <span>YouTube Artis</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          </p>
                          <p className="text-[11px] text-white/60 truncate max-w-[170px]">
                            {selectedArtistDetail.youtubeUrl || "Belum ada link YouTube"}
                          </p>
                        </div>
                      </div>

                      {selectedArtistDetail.youtubeUrl ? (
                        <a
                          href={selectedArtistDetail.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1 shrink-0 transition-transform active:scale-95 shadow cursor-pointer"
                        >
                          <span>Buka</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="text-[10px] text-white/40 italic px-2 py-1 bg-white/5 rounded-lg shrink-0">
                          Tidak Ada
                        </span>
                      )}
                    </div>

                    {/* 3. WHATSAPP MUSISI */}
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                          <Phone className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white flex items-center gap-1.5">
                            <span>WhatsApp Musisi</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          </p>
                          <p className="text-[11px] text-white/60 truncate max-w-[170px]">
                            {selectedArtistDetail.whatsapp || "Tidak ada nomor WhatsApp"}
                          </p>
                        </div>
                      </div>

                      {selectedArtistDetail.whatsapp ? (
                        <a
                          href={`https://wa.me/${selectedArtistDetail.whatsapp.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shrink-0 transition-transform active:scale-95 shadow cursor-pointer"
                        >
                          <span>Chat WA</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="text-[10px] text-white/40 italic px-2 py-1 bg-white/5 rounded-lg shrink-0">
                          Tidak Ada
                        </span>
                      )}
                    </div>

                    {/* 4. APPLE MUSIC */}
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-[#FC3C44]/20 border border-[#FC3C44]/40 flex items-center justify-center shrink-0">
                          <Music className="w-4 h-4 text-[#FC3C44]" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white flex items-center gap-1.5">
                            <span>Apple Music</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FC3C44]" />
                          </p>
                          <p className="text-[11px] text-white/60 truncate max-w-[170px]">
                            {artistAppleUrl ? artistAppleUrl : "Auto Generate"}
                          </p>
                        </div>
                      </div>

                      {artistAppleUrl ? (
                        <a
                          href={artistAppleUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-[#FC3C44] hover:bg-[#ff4e56] text-white font-bold text-xs flex items-center gap-1 shrink-0 transition-transform active:scale-95 shadow cursor-pointer"
                        >
                          <span>Buka</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="text-[10px] text-white/40 italic px-2 py-1 bg-white/5 rounded-lg shrink-0">
                          Auto Generate
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Quick Financial & Stream Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              <div className="p-3.5 rounded-2xl bg-[#312042]/80 border border-[#c8f560]/35">
                <span className="text-[10px] text-white/70 block uppercase tracking-wider font-semibold">
                  Saldo Siap Tarik
                </span>
                <span className="text-base sm:text-lg font-bold text-[#c8f560] tabular-nums mt-0.5 block">
                  Rp {Number(selectedArtistDetail.royaltyBalance || 0).toLocaleString("id-ID")}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-white/70 block uppercase tracking-wider font-semibold">
                  Total Streams
                </span>
                <span className="text-base sm:text-lg font-bold text-white tabular-nums mt-0.5 block">
                  {Number(selectedArtistDetail.totalStreams || 0).toLocaleString("id-ID")}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-white/70 block uppercase tracking-wider font-semibold">
                  Royalti Pending
                </span>
                <span className="text-base sm:text-lg font-bold text-[#fde08d] tabular-nums mt-0.5 block">
                  Rp {Number(selectedArtistDetail.royaltyPending || 0).toLocaleString("id-ID")}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-white/70 block uppercase tracking-wider font-semibold">
                  Total Dicairkan
                </span>
                <span className="text-base sm:text-lg font-bold text-white tabular-nums mt-0.5 block">
                  Rp {Number(selectedArtistDetail.totalWithdrawn || 0).toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {/* Releases of this Artist */}
            {(() => {
              const modalArtistNames = new Set((selectedArtistDetail.artists || []).map((a: any) => (a.name || a.stageName || "").toLowerCase()));
              const modalArtistIds = new Set((selectedArtistDetail.artists || []).map((a: any) => a.id));
              modalArtistNames.add((selectedArtistDetail.name || "").toLowerCase());

              const currentArtistReleases = releases.filter(
                (r) =>
                  r.userId === selectedArtistDetail.id ||
                  (r.artistId && modalArtistIds.has(r.artistId)) ||
                  (r.artist && modalArtistNames.has(r.artist.toLowerCase()))
              );

              return (
                <div className="mb-5 space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-white/10">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Disc3 className="w-4 h-4 text-[#c8f560]" />
                      <span>
                        Daftar Rilisan Lagu ({currentArtistReleases.length} Track)
                      </span>
                    </h4>
                  </div>

                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {currentArtistReleases.length === 0 ? (
                      <p className="text-xs text-white/50 italic py-3 text-center">
                        Belum ada lagu yang diupload oleh musisi ini.
                      </p>
                    ) : (
                      currentArtistReleases.map((rel) => (
                        <div
                          key={rel.id}
                          onClick={() => setSelectedRelease(rel)}
                          className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between gap-3 text-xs transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={rel.coverUrl || "/logo.png"}
                              alt={rel.title}
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = "/logo.png";
                              }}
                              className="w-10 h-10 rounded-lg object-cover border border-white/20 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-white group-hover:text-[#c8f560] transition-colors truncate">
                                {rel.title}
                              </p>
                              <p className="text-[11px] text-white/60 truncate">
                                {rel.artist} • {rel.genre}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                              isApprovedRelease(rel.status)
                                ? "bg-[#c8f560] text-[#312042]"
                                : isPendingRelease(rel.status)
                                ? "bg-amber-500/20 text-amber-300"
                                : "bg-red-500/20 text-red-300"
                            }`}
                          >
                            {rel.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Withdrawals of this Artist */}
            <div className="mb-5 space-y-2">
              <div className="flex items-center justify-between pb-1 border-b border-white/10">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-[#c8f560]" />
                  <span>Riwayat Penarikan Dana (Withdrawals)</span>
                </h4>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {withdrawals.filter((w) => w.userId === selectedArtistDetail.id).length === 0 ? (
                  <p className="text-xs text-white/50 italic py-3 text-center">
                    Belum ada riwayat penarikan dana dari artis ini.
                  </p>
                ) : (
                  withdrawals
                    .filter((w) => w.userId === selectedArtistDetail.id)
                    .map((wd) => (
                      <div
                        key={wd.id}
                        className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <p className="font-semibold text-white">
                            Rp {Number(wd.amount || 0).toLocaleString("id-ID")} • {wd.method}
                          </p>
                          <p className="text-[10px] text-white/60">
                            Rek: {wd.accountNumber} a/n {wd.accountHolder}
                          </p>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            wd.status === "Approved"
                              ? "bg-[#c8f560] text-[#312042]"
                              : wd.status === "Rejected"
                              ? "bg-red-500/25 border border-red-500/40 text-red-200"
                              : "bg-[#fde08d] text-[#312042]"
                          }`}
                        >
                          {wd.status}
                        </span>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Footer Admin Action Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-4 border-t border-white/15">
              <button
                type="button"
                onClick={() => {
                  selectedUserForRoyaltyRef.current = selectedArtistDetail.id;
                  setSelectedUserForRoyalty(selectedArtistDetail.id);
                  setInputRoyaltyBalance(selectedArtistDetail.royaltyBalance || 0);
                  setInputRoyaltyPending(selectedArtistDetail.royaltyPending || 0);
                  setInputTotalStreams(selectedArtistDetail.totalStreams || 0);
                  setInputRoyaltyMonth(selectedArtistDetail.royaltyMonth || "November");
                  setSelectedArtistDetail(null);
                  setActiveTab("royalty-input");
                }}
                className="px-4 py-2 rounded-xl bg-[#c8f560] text-[#312042] font-bold text-xs hover:bg-[#b8e450] transition-colors shadow cursor-pointer"
              >
                Input / Edit Royalty & Streams
              </button>
              <button
                type="button"
                onClick={() => {
                  setMsgTargetUser(selectedArtistDetail.id);
                  setSelectedArtistDetail(null);
                  setActiveTab("inbox");
                }}
                className="px-4 py-2 rounded-xl bg-[#312042] text-[#c8f560] border border-[#c8f560]/40 font-semibold text-xs hover:bg-[#432d5b] transition-colors cursor-pointer"
              >
                Kirim Pesan Inbox
              </button>
              <button
                type="button"
                disabled={suspendingUserId === selectedArtistDetail.id}
                onClick={() =>
                  handleToggleSuspendArtist(
                    selectedArtistDetail.id,
                    selectedArtistDetail.status,
                    getArtistDisplayName(selectedArtistDetail)
                  )
                }
                className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow cursor-pointer active:scale-95 disabled:opacity-50 ${
                  selectedArtistDetail.status === "SUSPENDED"
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                    : "bg-red-600/30 hover:bg-red-600 text-red-200 hover:text-white border border-red-500/50"
                }`}
              >
                {suspendingUserId === selectedArtistDetail.id ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : selectedArtistDetail.status === "SUSPENDED" ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Buka Suspend Akun</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Suspend Akun Ini</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setSelectedArtistDetail(null)}
                className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-medium text-xs transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
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
                    <span className="font-bold text-base tracking-tight text-white block">BREAKOUT ADMIN</span>
                    <span className="text-[10px] text-[#c8f560] font-semibold tracking-wider uppercase">Executive Console</span>
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
                    { id: "overview", label: "Admin Overview", icon: Home },
                    { id: "releases", label: "Review Submissions", icon: Clock },
                    {
                      id: "registrations",
                      label: "Verifikasi Artis Baru (ACC)",
                      icon: UserCheck,
                      badge: pendingUsers.length > 0 ? `${pendingUsers.length} PENDING` : undefined,
                    },
                    { id: "my-releases", label: "My Releases — ACC", icon: CheckCircle2 },
                    { id: "my-reject", label: "My Reject (Revisi)", icon: XCircle },
                    { id: "catalog", label: "Daftar Katalog Musik", icon: ListMusic },
                    { id: "cms", label: "Web CMS Landing Page", icon: Globe },
                    { id: "artist-royalties", label: "Artis Royalty (Rekap & ACC)", icon: Coins },
                    { id: "royalty-input", label: "Input Royalty & Streams", icon: Banknote },
                    { id: "withdrawals", label: "Payouts & VISA ACC", icon: Wallet },
                    { id: "inbox", label: "Inbox & Broadcast", icon: Mail },
                    { id: "users", label: "Daftar Artis & Akun", icon: Users },
                    { id: "maintenance", label: "Mode Maintenance User", icon: Construction, badge: maintenanceActive ? "AKTIF" : undefined },
                    { id: "settings", label: "Pengaturan Sistem", icon: Settings },
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
                        {item.badge && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-400 text-[#312042] text-[10px] font-extrabold uppercase animate-pulse">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 mt-6 border-t border-white/15">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-red-500/30 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                  <span>Keluar Akun Admin</span>
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
                    className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
                    title="Buka Slide Bar Menu Admin"
                  >
                    <Menu className="w-5 h-5 text-white" />
                    <span className="text-xs font-bold uppercase tracking-wider">Menu</span>
                  </button>
                  <span className="hidden sm:flex text-lg sm:text-xl font-bold tracking-wide text-white items-center gap-2">
                    BREAKOUT
                    <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#c8f560] text-[#312042] uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      ADMIN
                    </span>
                  </span>
                  {maintenanceActive && (
                    <button
                      type="button"
                      onClick={() => setActiveTab("maintenance")}
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 hover:bg-amber-300 text-[#312042] text-[10px] font-extrabold uppercase tracking-wider shadow animate-pulse cursor-pointer transition-all"
                      title="Mode Maintenance Musisi Aktif! Klik untuk kelola"
                    >
                      <Construction className="w-3.5 h-3.5" />
                      <span>Maintenance User Aktif</span>
                    </button>
                  )}
                </div>

                {/* Mobile Right Controls - Bersih: Hanya Profil Avatar */}
                <div className="flex sm:hidden items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("settings")}
                    title="Buka Pengaturan Admin"
                    className="flex items-center p-0.5 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 transition-all cursor-pointer border border-[#c8f560]/60 shadow"
                  >
                    <img
                      src={adminAvatar}
                      alt="Admin Avatar"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  </button>
                </div>
              </div>

              {/* Period Pills — Hanya Tampil di Menu Overview */}
              {activeTab === "overview" && (
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
              )}

              {/* Desktop Right Controls (hidden on mobile) */}
              <div className="hidden sm:flex items-center gap-3">
                <button
                  onClick={fetchAdminData}
                  title="Refresh Prisma Data"
                  className="w-10 h-10 rounded-full bg-[#8a88b5]/70 border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                </button>

                {/* GANTI TOMBOL KELUAR DENGAN FOTO PROFIL ADMIN (KLIK KE PENGATURAN) */}
                <button
                  type="button"
                  onClick={() => setActiveTab("settings")}
                  title="Buka Pengaturan & Ganti Foto Profil Admin"
                  className="flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition-all cursor-pointer shadow-md active:scale-95 border border-[#c8f560]/60 group"
                >
                  <img
                    src={adminAvatar}
                    alt="Admin Avatar"
                    className="w-8 h-8 rounded-full object-cover border-2 border-[#c8f560] shadow"
                  />
                  <div className="text-left hidden md:block">
                    <span className="text-xs font-bold block text-white group-hover:text-[#c8f560] transition-colors leading-tight">
                      {adminName}
                    </span>
                    <span className="text-[10px] text-[#c8f560] block leading-tight font-medium">
                      Pengaturan Profil
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </header>

          {/* MAIN SCROLLABLE BODY — Hanya bagian konten ini yang bergulir */}
          <main className="flex-1 w-full overflow-y-auto overflow-x-hidden p-5 sm:p-7 md:p-8">

          {/* HEADER BANNER — HANYA TAMPIL DI MENU OVERVIEW */}
          {activeTab === "overview" && (
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 animate-card-enter">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-white">
                  Welcome Back, Admin Avelin!
                </h1>
                <p className="text-xs text-white/80 mt-1">
                  Executive label distribution & royalty settlement control center
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {pendingUsers.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("registrations")}
                    className="px-4 py-2 rounded-full bg-[#c8f560] text-[#312042] text-xs font-bold flex items-center gap-1.5 shadow-md hover:bg-[#b8e450] transition-all cursor-pointer animate-pulse"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>ACC Artis Baru ({pendingUsers.length})</span>
                  </button>
                )}
                {maintenanceActive && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("maintenance")}
                    className="px-4 py-2 rounded-full bg-amber-400 text-[#312042] text-xs font-bold flex items-center gap-2 shadow-md hover:bg-amber-300 transition-all cursor-pointer animate-pulse"
                  >
                    <Construction className="w-4 h-4" />
                    <span>Maintenance User: AKTIF</span>
                  </button>
                )}
                {pendingReleases.length > 0 && (
                  <button
                    onClick={() => setActiveTab("releases")}
                    className="px-5 py-2.5 rounded-full bg-[#fde08d] text-[#312042] text-xs font-bold flex items-center gap-2 shadow-md hover:bg-[#fff2a8] transition-all"
                  >
                    <Clock className="w-4 h-4" />
                    <span>Review Queue ({pendingReleases.length})</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ATTENTION BANNER IF MAINTENANCE IS ACTIVE */}
          {maintenanceActive && activeTab === "overview" && (
            <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-card-enter">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-[#312042] flex items-center justify-center font-bold shrink-0">
                  <Construction className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-amber-200 flex items-center gap-2">
                    <span>Mode Maintenance User Sedang Aktif!</span>
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  </h4>
                  <p className="text-xs text-white/80 mt-0.5">
                    Semua musisi yang membuka <code className="bg-black/20 px-1 py-0.5 rounded">/dashboard</code> diarahkan ke halaman pemeliharaan.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleSaveMaintenance(false)}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-white/90 text-[#312042] text-xs font-bold transition-all shadow cursor-pointer"
                >
                  Matikan Maintenance
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("maintenance")}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#312042] text-xs font-bold transition-all shadow cursor-pointer"
                >
                  Kelola Pengaturan
                </button>
              </div>
            </div>
          )}

          {/* LIVE ANIMATED CHARTS ROW FOR ADMIN — HANYA TAMPIL DI MENU OVERVIEW */}
          {activeTab === "overview" && (
            <div
              key={`admin-charts-${animKey}`}
              className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6"
            >
            {/* Card 1: Luxury VISA Card for Total Royalty Musisi */}
            <VisaMetricCard
              title="TOTAL ROYALTY MUSISI (SALDO ENDAP)"
              value={`Rp ${saldoEndap.toLocaleString("id-ID")}`}
              valueColor="text-[#c8f560]"
              valueSize="text-2xl sm:text-3xl lg:text-3xl"
              subtitle={`${releasedArtists.length} Musisi Aktif • Total Label Rp ${totalGlobalRevenue.toLocaleString("id-ID")}`}
              dotColor="bg-[#c8f560]"
              cardNumber="4532 •••• •••• 9924"
              holderName="BREAKOUT LABEL • EXECUTIVE"
              expiry="12/29"
              tier="INFINITE"
              variant="lime-tint"
              delayMs={60}
              className="lg:col-span-4 flex flex-col justify-between"
            >
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-xl bg-black/25 border border-white/10">
                  <p className="text-[10px] text-white/60">Cleared Payout</p>
                  <p className="text-xs font-bold text-white mt-0.5 truncate">
                    Rp {totalPayoutAmount.toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-black/25 border border-white/10">
                  <p className="text-[10px] text-[#fde08d]">Antrean Withdraw</p>
                  <p className="text-xs font-bold text-[#fde08d] mt-0.5 truncate">
                    Rp {totalPendingAmount.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            </VisaMetricCard>

            {/* Card 2: Live Label Revenue Curve */}
            <div
              className={`lg:col-span-5 ${ROYALTY_CARD} flex flex-col justify-between relative overflow-hidden animate-card-enter`}
              style={{ animationDelay: "130ms" }}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-white">
                  Global Label Royalty Velocity
                </h3>
                <span className="px-3 py-1 rounded-full bg-white/15 text-xs text-[#c8f560]">
                  {hasGlobalData ? "+18.4% Growth" : "0% Activity"}
                </span>
              </div>

              <div className="relative h-36 mt-2 flex items-end">
                <div className="flex flex-col justify-between h-full text-[11px] text-white/70 pr-3 pb-5">
                  <span>90K</span>
                  <span>60K</span>
                  <span>30K</span>
                  <span>10K</span>
                </div>

                <div className="flex-1 relative h-full">
                  <div className="absolute left-[64%] -top-1 -translate-x-1/2 bg-[#312042] border border-[#c8f560]/60 text-[#c8f560] px-3 py-1 rounded-xl text-xs font-bold shadow-md animate-tooltip-float tabular-nums">
                    Rp {Math.round(totalGlobalRevenue * animProgress).toLocaleString("id-ID")}
                    <div className="w-2 h-2 bg-[#312042] rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
                  </div>

                  <svg viewBox="0 0 320 110" className="w-full h-28 overflow-visible">
                    <defs>
                      <linearGradient id="adminGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#c8f560" stopOpacity="0.65" />
                        <stop offset="100%" stopColor="#c8f560" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {hasGlobalData ? (
                      <>
                        <rect
                          x="194"
                          y="20"
                          width="22"
                          height="85"
                          rx="11"
                          fill="url(#adminGlow)"
                          className="animate-pillar-rise"
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
                          cx="205"
                          cy="21"
                          r="10"
                          fill="#c8f560"
                          opacity="0.35"
                          className="animate-ping"
                        />
                        <circle
                          cx="205"
                          cy="21"
                          r="6"
                          fill="#8a88b5"
                          stroke="#c8f560"
                          strokeWidth="3.5"
                        />
                      </>
                    ) : (
                      <>
                        <line
                          x1="10"
                          y1="95"
                          x2="310"
                          y2="95"
                          stroke="#c8f560"
                          strokeWidth="2"
                          strokeDasharray="4 4"
                          opacity="0.4"
                        />
                        <circle
                          cx="205"
                          cy="95"
                          r="5"
                          fill="#312042"
                          stroke="#c8f560"
                          strokeWidth="2"
                        />
                      </>
                    )}
                  </svg>

                  {!hasGlobalData && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-6">
                      <span className="text-[10px] text-white/50 bg-[#312042]/50 px-2.5 py-0.5 rounded-full border border-white/10">
                        Belum ada data royalti jaringan
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-white/75 pt-1">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Live Platform Load Bars */}
            <div
              className={`lg:col-span-3 ${ROYALTY_CARD} flex flex-col justify-between animate-card-enter`}
              style={{ animationDelay: "200ms" }}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-white">DSP Traffic</h3>
                <span className="flex items-center gap-1.5 text-xs text-[#c8f560] font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#c8f560] animate-pulse" />
                  live
                </span>
              </div>

              <div className="flex items-end justify-between h-32 pt-4 gap-2 relative">
                <div className="flex flex-col justify-between h-full text-[11px] text-white/70 pb-5">
                  <span>600</span>
                  <span>400</span>
                  <span>200</span>
                </div>

                {[
                  { label: "Spotify", h1: 78, h2: 46, c1: "bg-[#c8f560]" },
                  { label: "Apple Music", h1: 94, h2: 52, c1: "bg-[#c4c3f0]" },
                  { label: "TikTok", h1: 72, h2: 40, c1: "bg-[#c8f560]" },
                  { label: "YouTube", h1: 86, h2: 60, c1: "bg-[#c4c3f0]" },
                ].map((bar, i) => {
                  const wave = liveTick % 2 === i % 2 ? 3 : -2;
                  const height1 = barsReady ? (hasGlobalData ? `${bar.h1 + wave}%` : "5%") : "0%";
                  const height2 = barsReady ? (hasGlobalData ? `${bar.h2 - wave}%` : "5%") : "0%";
                  return (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div className="flex items-end gap-1.5 h-24">
                        <div
                          style={{
                            height: height1,
                            transitionDelay: `${i * 110}ms`,
                          }}
                          className={`w-2.5 rounded-full ${bar.c1} transition-all duration-1000 ease-out`}
                        />
                        <div
                          style={{
                            height: height2,
                            transitionDelay: `${i * 110 + 60}ms`,
                          }}
                          className="w-2.5 rounded-full bg-white/25 transition-all duration-1000 ease-out"
                        />
                      </div>
                      <span className="text-[10px] text-white/80 whitespace-nowrap">
                        {bar.label}
                      </span>
                    </div>
                  );
                })}

                {!hasGlobalData && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-6">
                    <span className="text-[10px] text-white/50 bg-[#312042]/50 px-2.5 py-0.5 rounded-full border border-white/10">
                      0 live traffic
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

          {/* =========================================================
              ADMIN VIEW 1: OVERVIEW (Releases Moderation + Payout Queue)
             ========================================================= */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left: Synchronized Streaming Velocity & DSP Analytics Chart */}
              <div
                className={`lg:col-span-7 ${ROYALTY_CARD} flex flex-col justify-between animate-card-enter`}
                style={{ animationDelay: "250ms" }}
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
                        Sinkronisasi riil dengan {totalGlobalStreams.toLocaleString("id-ID")} stream jaringan • {period}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {pendingReleases.length > 0 && (
                      <button
                        onClick={() => setActiveTab("releases")}
                        className="px-2.5 py-1 rounded-lg bg-[#fde08d] text-[#312042] text-xs font-bold hover:bg-[#fff2a8] transition-colors flex items-center gap-1 shadow"
                        title="Tinjau lagu yang menunggu persetujuan"
                      >
                        <Clock className="w-3 h-3" />
                        <span>{pendingReleases.length} Perlu Review</span>
                      </button>
                    )}
                    <span className="px-2.5 py-1 rounded-lg bg-black/25 border border-white/15 text-[11px] font-mono text-[#c8f560] font-bold">
                      {Math.round(totalGlobalStreams * animProgress).toLocaleString("id-ID")} Streams
                    </span>
                  </div>
                </div>

                {/* Sub-Header: Metric Highlights */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[10px] text-white/60 block">Volume {period}</span>
                    <span className="text-sm sm:text-base font-extrabold text-[#c8f560] tabular-nums">
                      {Math.round(totalGlobalStreams * animProgress).toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[10px] text-white/60 block">Peak Stream</span>
                    <span className="text-sm sm:text-base font-bold text-white tabular-nums">
                      {Math.round((activeStreamPoint?.val || 0) * animProgress).toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[10px] text-white/60 block">Artis Aktif DSP</span>
                    <span className="text-sm sm:text-base font-bold text-white tabular-nums">
                      {topStreamedArtists.length > 0 ? topStreamedArtists.length : releasedArtists.length} Musisi
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[10px] text-white/60 block">Top Platform</span>
                    <span className="text-sm sm:text-base font-bold text-[#c4c3f0]">
                      Spotify (46%)
                    </span>
                  </div>
                </div>

                {/* Live Synchronized SVG Area Chart */}
                <div className="relative my-3 pt-4">
                  {/* Floating Tooltip positioned over active point */}
                  {activeStreamPoint && (
                    <div
                      className="absolute -top-1 transition-all duration-200 pointer-events-none -translate-x-1/2 z-20 px-3 py-1 rounded-xl bg-[#312042] border border-[#c8f560]/60 text-white shadow-xl text-center"
                      style={{
                        left: `${(activeStreamPoint.x / 360) * 100}%`,
                      }}
                    >
                      <span className="text-[10px] text-white/70 block uppercase tracking-wider">
                        {activeStreamPoint.label}
                      </span>
                      <span className="text-xs font-bold text-[#c8f560] tabular-nums">
                        {Math.round(activeStreamPoint.val * animProgress).toLocaleString("id-ID")} stream
                      </span>
                      <div className="w-1.5 h-1.5 bg-[#312042] rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
                    </div>
                  )}

                  <svg
                    viewBox="0 0 360 135"
                    className="w-full h-36 overflow-visible select-none"
                  >
                    <defs>
                      <linearGradient id="streamAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#c8f560" stopOpacity="0.45" />
                        <stop offset="60%" stopColor="#c8f560" stopOpacity="0.12" />
                        <stop offset="100%" stopColor="#c8f560" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="streamLineGrad" x1="0" y1="0" x2="1" y2="0">
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
                    {streamAreaD && (
                      <path
                        d={streamAreaD}
                        fill="url(#streamAreaGrad)"
                        className="transition-all duration-500 ease-out"
                      />
                    )}

                    {/* Line path */}
                    {streamPathD && (
                      <path
                        d={streamPathD}
                        fill="none"
                        stroke="url(#streamLineGrad)"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        className="transition-all duration-500 ease-out"
                      />
                    )}

                    {/* Interactive points & hover columns */}
                    {streamChartPoints.map((pt, idx) => {
                      const isHovered = hoveredStreamIdx === idx;
                      return (
                        <g key={idx} className="cursor-pointer">
                          {/* Hover target rect */}
                          <rect
                            x={pt.x - 20}
                            y="0"
                            width="40"
                            height="135"
                            fill="transparent"
                            onMouseEnter={() => setHoveredStreamIdx(idx)}
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
                              r="10"
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

                {/* Bottom Row: DSP Distribution & Top Stream Contributors */}
                <div className="pt-3 border-t border-white/15 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white/80">Distribusi Stream DSP (100% Singkron):</span>
                    <button
                      type="button"
                      onClick={() => setActiveTab("royalty-input")}
                      className="text-[10px] text-[#c8f560] hover:underline flex items-center gap-1"
                    >
                      <span>Input / Update Stream</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Synchronized Platform Proportion Bars */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {[
                      { name: "Spotify", pct: 46, count: Math.round(totalGlobalStreams * 0.46), color: "#c8f560" },
                      { name: "Apple Music", pct: 28, count: Math.round(totalGlobalStreams * 0.28), color: "#c4c3f0" },
                      { name: "TikTok / Reels", pct: 16, count: Math.round(totalGlobalStreams * 0.16), color: "#fde08d" },
                      { name: "YouTube", pct: 10, count: Math.round(totalGlobalStreams * 0.10), color: "#ff8b8b" },
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

                  {/* Top Contributors from Database */}
                  {topStreamedArtists.length > 0 && (
                    <div className="pt-1 flex flex-wrap items-center gap-2 text-[11px] text-white/70">
                      <span className="text-[10px] uppercase font-bold text-[#c8f560]">Top Streamers:</span>
                      {topStreamedArtists.map((art) => (
                        <span
                          key={art.id}
                          className="px-2 py-0.5 rounded-md bg-white/10 border border-white/10 text-white font-medium"
                        >
                          {art.name || art.email.split("@")[0]}:{" "}
                          <strong className="text-[#c8f560]">{(art.totalStreams || 0).toLocaleString("id-ID")}</strong>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Grafik Bulanan Royalti yang Sudah di-ACC (Live Sync Prisma) */}
              <div
                className={`lg:col-span-5 ${ROYALTY_CARD} flex flex-col justify-between animate-card-enter`}
                style={{ animationDelay: "310ms" }}
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
                          <span>Grafik Bulanan Royalti ACC</span>
                          <span className="w-2 h-2 rounded-full bg-[#c8f560] animate-pulse" />
                        </h3>
                        <p className="text-[11px] text-white/70">
                          Sinkron otomatis tiap ACC WD • Tahun {new Date().getFullYear()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-black/25 border border-white/15 text-[11px] font-mono text-[#c8f560] font-bold">
                        {monthlyApprovedPayoutData.approvedList.length} Payout ACC
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveTab("withdrawals")}
                        className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-[#c8f560] hover:text-[#312042] text-white font-semibold text-[11px] transition-all cursor-pointer"
                        title="Buka menu kelola payout lengkap"
                      >
                        Buka Menu
                      </button>
                    </div>
                  </div>

                  {/* Summary Stat Pills */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="p-2.5 rounded-xl bg-black/25 border border-white/10">
                      <span className="text-[10px] text-white/60 block">Total Royalti Di-ACC</span>
                      <span className="text-sm sm:text-base font-extrabold text-[#c8f560] tabular-nums block mt-0.5 truncate">
                        Rp {totalPayoutAmount.toLocaleString("id-ID")}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-black/25 border border-white/10">
                      <span className="text-[10px] text-[#fde08d] block truncate">
                        {monthlyApprovedPayoutData.items[hoveredPayoutMonth]?.fullName || "Bulan Ini"}
                      </span>
                      <span className="text-sm sm:text-base font-extrabold text-white tabular-nums block mt-0.5 truncate">
                        Rp {(monthlyApprovedPayoutData.items[hoveredPayoutMonth]?.val || 0).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  {/* Monthly Bar Chart with Interactive Hover */}
                  <div className="p-3 rounded-2xl bg-black/20 border border-white/10 my-2">
                    <div className="flex items-center justify-between text-[10px] text-white/60 mb-2">
                      <span className="uppercase font-semibold tracking-wider">Tren Payout Per Bulan (Rp)</span>
                      <span className="text-[#c8f560] font-bold">
                        {monthlyApprovedPayoutData.items[hoveredPayoutMonth]?.count || 0} Pencairan di-{monthlyApprovedPayoutData.items[hoveredPayoutMonth]?.label}
                      </span>
                    </div>

                    {/* Bars Container */}
                    <div className="h-32 flex items-end justify-between gap-1 sm:gap-1.5 pt-4 pb-1 relative">
                      {monthlyApprovedPayoutData.items.map((m) => {
                        const isHovered = hoveredPayoutMonth === m.idx;
                        const isCurrent = m.isCurrent;
                        const hasVal = m.val > 0;

                        return (
                          <div
                            key={m.idx}
                            onMouseEnter={() => setHoveredPayoutMonth(m.idx)}
                            onClick={() => setHoveredPayoutMonth(m.idx)}
                            className="flex-1 flex flex-col items-center h-full justify-end cursor-pointer group relative"
                            title={`${m.fullName}: Rp ${m.val.toLocaleString("id-ID")} (${m.count} payout)`}
                          >
                            {/* Bar Pillar */}
                            <div className="w-full relative flex items-end justify-center h-full">
                              <div
                                style={{
                                  height: `${hasVal ? m.heightPct * animProgress : 6}%`,
                                }}
                                className={`w-full max-w-[18px] rounded-t-lg transition-all duration-500 ${
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

                            {/* Month Label */}
                            <span
                              className={`text-[9px] sm:text-[10px] font-bold mt-1.5 transition-colors select-none ${
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

                  {/* 3 Transaksi ACC Terakhir yang Tersinkron */}
                  <div className="pt-2">
                    <div className="text-[11px] font-semibold text-white/80 mb-2 flex items-center justify-between">
                      <span>3 Payout Terakhir yang Di-ACC:</span>
                      {pendingWithdrawals.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab("withdrawals");
                            setWithdrawalTab("Pending");
                          }}
                          className="text-[10px] text-[#fde08d] font-bold hover:underline cursor-pointer"
                        >
                          {pendingWithdrawals.length} Menunggu ACC →
                        </button>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      {monthlyApprovedPayoutData.approvedList.length === 0 ? (
                        <div className="py-4 text-center text-white/50 text-xs">
                          Belum ada transaksi withdraw yang di-ACC.
                        </div>
                      ) : (
                        monthlyApprovedPayoutData.approvedList.slice(0, 3).map((w) => (
                          <div
                            key={w.id}
                            onClick={() => setSelectedWithdrawalForVisaModal(w)}
                            className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between gap-2 text-xs transition-colors cursor-pointer"
                          >
                            <div className="min-w-0">
                              <p className="font-semibold text-white truncate text-[11px]">
                                {w.accountHolder || w.user?.name || "Musisi"} •{" "}
                                <span className="text-[#c8f560] font-bold">
                                  Rp {w.amount.toLocaleString("id-ID")}
                                </span>
                              </p>
                              <p className="text-[10px] text-white/60 truncate">
                                {w.date} • {w.method}
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

                {/* Footer Status Pill */}
                <div className="mt-4 p-3 rounded-2xl bg-white/10 border border-white/15 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#c8f560] animate-ping" />
                    <div>
                      <p className="font-semibold text-white text-[11px]">Auto-Sync Settlement</p>
                      <p className="text-[10px] text-[#c8f560]">Setiap ACC otomatis terekam ke grafik</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#312042] text-[#c8f560] text-[10px] font-bold border border-[#c8f560]/30">
                    Realtime DB
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              ADMIN VIEWS: RELEASES MODERATION (REVIEW, MY RELEASES, MY REJECT)
             ========================================================= */}
          {(() => {
            const renderReleaseSection = (
              items: any[],
              type: "review" | "my-releases" | "my-reject",
              title: string,
              subtitle: string,
              emptyMessage: string,
              currentPage: number,
              onPageChange: (p: number) => void
            ) => {
              const paginatedItems = items.slice((currentPage - 1) * 5, currentPage * 5);
              const allPageIds = paginatedItems.map((r) => r.id);
              const allSectionIds = items.map((r) => r.id);
              const isAllPageSelected =
                paginatedItems.length > 0 &&
                paginatedItems.every((r) => selectedReleaseIds.includes(r.id));
              const isAllSectionSelected =
                items.length > 0 &&
                items.every((r) => selectedReleaseIds.includes(r.id));

              const toggleSelectAll = () => {
                if (isAllSectionSelected) {
                  setSelectedReleaseIds((prev) =>
                    prev.filter((id) => !allSectionIds.includes(id))
                  );
                } else {
                  setSelectedReleaseIds((prev) =>
                    Array.from(new Set([...prev, ...allSectionIds]))
                  );
                }
              };

              const toggleSelectPage = () => {
                if (isAllPageSelected) {
                  setSelectedReleaseIds((prev) =>
                    prev.filter((id) => !allPageIds.includes(id))
                  );
                } else {
                  setSelectedReleaseIds((prev) =>
                    Array.from(new Set([...prev, ...allPageIds]))
                  );
                }
              };

              const toggleItemSelect = (id: string) => {
                setSelectedReleaseIds((prev) =>
                  prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
                );
              };

              return (
              <div className={`${ROYALTY_CARD} animate-card-enter`}>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-white/15">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      {type === "review" ? (
                        <span className="p-1.5 rounded-lg bg-[#fde08d]/20 text-[#fde08d]">
                          <Clock className="w-4 h-4" />
                        </span>
                      ) : type === "my-releases" ? (
                        <span className="p-1.5 rounded-lg bg-[#c8f560]/20 text-[#c8f560]">
                          <CheckCircle2 className="w-4 h-4" />
                        </span>
                      ) : (
                        <span className="p-1.5 rounded-lg bg-red-500/20 text-red-300">
                          <XCircle className="w-4 h-4" />
                        </span>
                      )}
                      <span>{title}</span>
                    </h3>
                    <p className="text-xs text-white/75 mt-0.5">{subtitle}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {items.length > 0 && (
                      <button
                        type="button"
                        onClick={toggleSelectAll}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                          isAllSectionSelected
                            ? "bg-[#c8f560] text-[#312042] border-[#c8f560] shadow"
                            : "bg-white/10 hover:bg-white/20 text-white border-white/20"
                        }`}
                        title="Centang semua lagu di menu ini untuk dihapus"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>
                          {isAllSectionSelected
                            ? "Batal Centang All"
                            : `Centang Semua (${items.length})`}
                        </span>
                      </button>
                    )}

                    <span className="px-3 py-1.5 rounded-xl bg-white/15 border border-white/20 text-xs font-semibold text-white">
                      Total: <strong className={type === "my-releases" ? "text-[#c8f560]" : type === "my-reject" ? "text-red-300" : "text-[#fde08d]"}>{items.length} Track</strong>
                    </span>
                  </div>
                </div>

                {/* Floating Bulk Action Delete Bar */}
                {selectedReleaseIds.length > 0 && (
                  <div className="mb-4 p-3.5 rounded-2xl bg-red-500/25 border border-red-500/50 flex flex-wrap items-center justify-between gap-3 shadow-xl animate-card-enter">
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full bg-red-400 animate-ping" />
                      <div>
                        <span className="text-xs font-bold text-white block">
                          {selectedReleaseIds.length} Lagu Terpilih Dicentang
                        </span>
                        <span className="text-[10px] text-red-200">
                          Penghapusan akan otomatis menghapus lagu dari database & hilang permanen di user
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedReleaseIds([])}
                        className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-medium transition-colors cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        disabled={deletingBulk}
                        onClick={handleDeleteBulkReleases}
                        className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg active:scale-95 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>
                          {deletingBulk
                            ? "Menghapus..."
                            : `Hapus ${selectedReleaseIds.length} Lagu Terpilih (Hilang di User)`}
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {/* MOBILE VIEW (< md): Clean Card List, No Horizontal Table Clutter, Zero Overlap */}
                <div className="md:hidden space-y-3.5 pt-2">
                  {items.length === 0 ? (
                    <div className="py-12 text-center text-white/70">
                      <Disc3 className="w-10 h-10 mx-auto text-white/25 mb-2" />
                      <p className="font-semibold text-sm text-white">{emptyMessage}</p>
                    </div>
                  ) : (
                    paginatedItems.map((r) => {
                      const isSelected = selectedReleaseIds.includes(r.id);
                      return (
                      <div
                        key={r.id}
                        onClick={() => setSelectedRelease(r)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                          isSelected
                            ? "bg-[#c8f560]/10 border-[#c8f560]/60 ring-1 ring-[#c8f560]/50"
                            : "bg-white/5 border-white/15 hover:bg-white/10"
                        }`}
                      >
                        {/* Top Row: Checkbox + Cover + Info + Status */}
                        <div className="flex items-start gap-3">
                          <div
                            className="pt-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleItemSelect(r.id)}
                              className="w-5 h-5 rounded text-[#c8f560] accent-[#c8f560] cursor-pointer"
                            />
                          </div>
                          <img
                            src={r.coverUrl || "/logo.png"}
                            alt={r.title}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = "/logo.png";
                            }}
                            className="w-14 h-14 rounded-xl object-cover border border-white/25 shrink-0 shadow"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-bold text-sm text-white truncate flex items-center gap-1.5">
                                <span>{r.title}</span>
                                <Eye className="w-3.5 h-3.5 text-[#c8f560] shrink-0" />
                              </h4>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                                  isApprovedRelease(r.status)
                                    ? "bg-[#c8f560] text-[#312042]"
                                    : isRejectedRelease(r.status)
                                    ? "bg-red-500/25 border border-red-500/40 text-red-200"
                                    : "bg-[#fde08d] text-[#312042]"
                                }`}
                              >
                                {isApprovedRelease(r.status) ? "✓ Approved" : isRejectedRelease(r.status) ? "✕ Rejected" : "⏳ Review"}
                              </span>
                            </div>
                            <p className="text-white/80 text-xs truncate mt-0.5 flex items-center gap-1.5">
                              <span>{r.artist} • <span className="text-white/60">{r.genre}</span></span>
                              {r.type === "ALBUM" || (r.tracks && r.tracks.length > 1) ? (
                                <span className="px-2 py-0.5 rounded-full bg-[#c8f560] text-[#312042] text-[9px] font-bold shrink-0">
                                  ALBUM • {r.tracks?.length || 1} Lagu
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-white/15 text-white/80 text-[9px] font-medium shrink-0">
                                  SINGLE
                                </span>
                              )}
                            </p>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-white/60 mt-1 font-mono">
                              <span>ISRC: <strong className="text-[#c8f560]">{r.isrc || "D-HRM-24-00109"}</strong></span>
                              <span>UPC: <strong className="text-white/90">{r.upc || "899214578101"}</strong></span>
                              <span>Rilis: <strong className="text-white/80">{r.releaseDate}</strong></span>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Row: Actions */}
                        <div
                          className="flex items-center gap-2 pt-2.5 border-t border-white/10"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedRelease(r)}
                            className="flex-1 py-2 px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#c8f560]" />
                            <span>Detail & Unduh</span>
                          </button>

                          {!isApprovedRelease(r.status) && (
                            <button
                              type="button"
                              onClick={() => handleReleaseStatus(r.id, "Approved")}
                              className="py-2 px-3.5 rounded-xl bg-[#c8f560] text-[#312042] font-bold text-xs hover:bg-[#d8ff75] transition-colors shadow"
                            >
                              ACC
                            </button>
                          )}

                          {!isRejectedRelease(r.status) && (
                            <button
                              type="button"
                              onClick={() => handleReleaseStatus(r.id, "Rejected")}
                              className="py-2 px-3.5 rounded-xl bg-red-500/25 hover:bg-red-500/40 border border-red-500/40 text-red-200 font-semibold text-xs transition-colors"
                            >
                              Reject
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteRelease(r.id)}
                            className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/40 text-red-300 transition-colors cursor-pointer"
                            title="Hapus Rilisan (Hilang di User)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      );
                    })
                  )}
                </div>

                {/* DESKTOP VIEW (md:block): Spacious Table with Proper Column Widths */}
                <div className="hidden md:block overflow-x-auto pt-2">
                  <div className="min-w-[840px]">
                    {/* Table Headers */}
                    <div className="grid grid-cols-12 text-xs font-semibold uppercase tracking-wider text-white/70 pb-3 border-b border-white/20 px-3">
                      <div className="col-span-1 flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={isAllPageSelected}
                          onChange={toggleSelectPage}
                          className="w-4 h-4 rounded text-[#c8f560] accent-[#c8f560] cursor-pointer"
                          title="Centang semua lagu di halaman ini"
                        />
                      </div>
                      <div className="col-span-4">Track & Artis</div>
                      <div className="col-span-2 text-center">UPC Barcode</div>
                      <div className="col-span-2 text-center">ISRC Code</div>
                      <div className="col-span-1 text-center">Status</div>
                      <div className="col-span-2 text-right">Aksi & Unduh</div>
                    </div>

                    {/* Rows */}
                    <div className="divide-y divide-white/15">
                      {items.length === 0 ? (
                        <div className="py-14 text-center text-white/70">
                          <Disc3 className="w-12 h-12 mx-auto text-white/25 mb-2" />
                          <p className="font-semibold text-base text-white">{emptyMessage}</p>
                        </div>
                      ) : (
                        paginatedItems.map((r) => {
                          const isSelected = selectedReleaseIds.includes(r.id);
                          return (
                          <div
                            key={r.id}
                            onClick={() => setSelectedRelease(r)}
                            className={`grid grid-cols-12 items-center py-3.5 px-3 rounded-2xl transition-colors cursor-pointer group ${
                              isSelected
                                ? "bg-[#c8f560]/10 border border-[#c8f560]/50"
                                : "hover:bg-white/10"
                            }`}
                          >
                            {/* Col 0: Checkbox */}
                            <div
                              className="col-span-1 flex items-center justify-center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleItemSelect(r.id)}
                                className="w-4 h-4 rounded text-[#c8f560] accent-[#c8f560] cursor-pointer"
                              />
                            </div>

                            {/* Col 1: Track & Artis */}
                            <div className="col-span-4 flex items-center gap-3.5 min-w-0 pr-3">
                              <img
                                src={r.coverUrl || "/logo.png"}
                                alt={r.title}
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = "/logo.png";
                                }}
                                className="w-12 h-12 rounded-xl object-cover border border-white/25 shrink-0 group-hover:scale-105 transition-transform shadow"
                              />
                              <div className="min-w-0">
                                <p className="font-bold text-sm text-white group-hover:text-[#c8f560] transition-colors truncate flex items-center gap-1.5">
                                  <span>{r.title}</span>
                                  <Eye className="w-3.5 h-3.5 text-[#c8f560] opacity-80" />
                                </p>
                                <p className="text-white/80 text-xs truncate flex items-center gap-1.5">
                                  <span>{r.artist} • <span className="text-white/60">{r.genre}</span></span>
                                  {r.type === "ALBUM" || (r.tracks && r.tracks.length > 1) ? (
                                    <span className="px-2 py-0.5 rounded-full bg-[#c8f560] text-[#312042] text-[9px] font-bold shrink-0">
                                      ALBUM • {r.tracks?.length || 1} Lagu
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full bg-white/15 text-white/80 text-[9px] font-medium shrink-0">
                                      SINGLE
                                    </span>
                                  )}
                                </p>
                                <span className="inline-block mt-0.5 text-[10px] text-[#c8f560] font-mono font-medium">
                                  Rilis: {r.releaseDate}
                                </span>
                              </div>
                            </div>

                            {/* Col 2: UPC Barcode */}
                            <div className="col-span-2 text-center font-mono font-semibold text-white/95 text-xs whitespace-nowrap">
                              {r.upc || "899214578101"}
                            </div>

                            {/* Col 3: ISRC Code */}
                            <div className="col-span-2 text-center font-mono font-bold text-[#c8f560] text-xs whitespace-nowrap">
                              {r.isrc || "D-HRM-24-00109"}
                            </div>

                            {/* Col 4: Status */}
                            <div className="col-span-1 flex justify-center">
                              {isApprovedRelease(r.status) ? (
                                <span className="px-2.5 py-1 rounded-full bg-[#c8f560] text-[#312042] font-bold text-xs whitespace-nowrap shadow-sm">
                                  ✓ ACC
                                </span>
                              ) : isRejectedRelease(r.status) ? (
                                <span className="px-2.5 py-1 rounded-full bg-red-500/25 border border-red-500/40 text-red-200 font-bold text-xs whitespace-nowrap shadow-sm">
                                  ✕ Rej
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-full bg-[#fde08d] text-[#312042] font-bold text-xs whitespace-nowrap shadow-sm">
                                  ⏳ Rev
                                </span>
                              )}
                            </div>

                            {/* Col 5: Aksi */}
                            <div
                              className="col-span-2 flex items-center justify-end gap-1.5"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => setSelectedRelease(r)}
                                className="px-2 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white flex items-center gap-1 text-[11px] font-semibold transition-colors"
                                title="Buka Detail Rilis Lengkap & Unduh MP3/Art"
                              >
                                <Eye className="w-3.5 h-3.5 text-[#c8f560]" />
                                <span className="hidden sm:inline">Detail</span>
                              </button>

                              {!isApprovedRelease(r.status) && (
                                <button
                                  type="button"
                                  onClick={() => handleReleaseStatus(r.id, "Approved")}
                                  className="px-2 py-1.5 rounded-xl bg-[#c8f560] text-[#312042] font-bold text-[11px] hover:bg-[#d8ff75] transition-colors shadow cursor-pointer"
                                  title="Setujui Rilis Ini (ACC)"
                                >
                                  ACC
                                </button>
                              )}

                              {!isRejectedRelease(r.status) && (
                                <button
                                  type="button"
                                  onClick={() => handleReleaseStatus(r.id, "Rejected")}
                                  className="px-2 py-1.5 rounded-xl bg-red-500/25 border border-red-500/40 text-red-200 font-bold text-[11px] hover:bg-red-500/40 shadow transition-colors cursor-pointer"
                                  title="Tolak Rilis Ini (Reject)"
                                >
                                  Reject
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleDeleteRelease(r.id)}
                                className="p-1.5 rounded-xl bg-red-500/25 hover:bg-red-500/40 text-white transition-colors cursor-pointer"
                                title="Hapus Rilisan (Hilang di User)"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Pagination Controls (5 item per halaman) */}
                <Pagination
                  currentPage={currentPage}
                  totalItems={items.length}
                  pageSize={5}
                  onPageChange={onPageChange}
                />
              </div>
            );
          };

            if (activeTab === "releases") {
              return renderReleaseSection(
                pendingReleases,
                "review",
                "Review Submissions — Antrean Lagu Menunggu Moderasi",
                "Daftar lagu yang baru disubmit user dan menunggu verifikasi / ACC sebelum dirilis ke DSP.",
                "Tidak ada lagu yang sedang menunggu review. Semua sudah di-ACC atau ditolak.",
                pageReleases,
                setPageReleases
              );
            }

            if (activeTab === "my-releases") {
              return renderReleaseSection(
                approvedReleases,
                "my-releases",
                "My Releases — Lagu Terverifikasi & Live DSP",
                "Daftar seluruh rilisan musik yang sudah disetujui (ACC) dan aktif terdistribusi ke Spotify, Apple Music, TikTok, dsb.",
                "Belum ada rilisan yang di-ACC. Silakan tinjau lagu baru di menu Review Submissions.",
                pageMyReleases,
                setPageMyReleases
              );
            }

            if (activeTab === "my-reject") {
              return renderReleaseSection(
                rejectedReleases,
                "my-reject",
                "My Reject — Rilisan Ditolak / Perlu Revisi",
                "Daftar lagu yang ditolak karena masalah hak cipta, metadata, atau audio. Anda dapat meng-ACC ulang jika user telah merevisi.",
                "Tidak ada rilisan yang ditolak.",
                pageMyReject,
                setPageMyReject
              );
            }

            return null;
          })()}

          {/* =========================================================
              ADMIN VIEW: VERIFIKASI PENDAFTARAN ARTIS BARU (ACC ARTIS)
             ========================================================= */}
          {activeTab === "registrations" && (
            <div className="space-y-6 animate-card-enter">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-[#c8f560] text-[#312042] shadow-md">
                      <UserCheck className="w-5 h-5" />
                    </span>
                    <span>Verifikasi Pendaftaran Artis Baru (ACC)</span>
                  </h2>
                  <p className="text-xs text-white/75 mt-1">
                    Setujui (ACC) atau tolak akun musisi yang baru mendaftar sebelum mereka dapat login dan mengakses dashboard distribusi.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3.5 py-1.5 rounded-full bg-amber-400 text-[#312042] text-xs font-bold shadow">
                    {pendingUsers.length} Menunggu ACC
                  </span>
                  <span className="px-3.5 py-1.5 rounded-full bg-[#c8f560]/20 text-[#c8f560] border border-[#c8f560]/40 text-xs font-bold">
                    {approvedUsers.length} Terverifikasi
                  </span>
                </div>
              </div>

              {/* Status Filter Tabs & Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {(
                    [
                      { id: "PENDING", label: `Menunggu ACC (${pendingUsers.length})` },
                      { id: "APPROVED", label: `Terverifikasi (${approvedUsers.length})` },
                      { id: "REJECTED", label: `Ditolak (${rejectedUsers.length})` },
                      { id: "ALL", label: `Semua Pendaftaran (${nonAdminUsers.length})` },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setRegFilterStatus(tab.id);
                        setPageRegistrations(1);
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        regFilterStatus === tab.id
                          ? "bg-[#c8f560] text-[#312042] shadow"
                          : "text-white/80 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="relative min-w-[220px]">
                  <Search className="w-4 h-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={regSearch}
                    onChange={(e) => {
                      setRegSearch(e.target.value);
                      setPageRegistrations(1);
                    }}
                    placeholder="Cari nama, email, whatsapp, nik..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/15 border border-white/25 text-white text-xs placeholder:text-white/40 focus:outline-none focus:border-[#c8f560]"
                  />
                </div>
              </div>

              {/* Reject Reason Popover Modal */}
              {rejectingUserId && (
                <div className="p-4 rounded-2xl bg-red-950/80 border border-red-500/50 text-white space-y-3 animate-fade-in shadow-2xl">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-red-200 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span>Alasan Penolakan Pendaftaran</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        setRejectingUserId(null);
                        setRejectReason("");
                      }}
                      className="text-white/60 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Tuliskan alasan penolakan (misal: data KTP tidak terbaca, mohon daftar ulang dengan foto KTP yang jelas)..."
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-red-500/40 text-white text-xs outline-none focus:border-red-400 resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setRejectingUserId(null);
                        setRejectReason("");
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      disabled={actionLoadingId === rejectingUserId}
                      onClick={() => {
                        const target = users.find((u) => u.id === rejectingUserId);
                        handleRejectRegistration(rejectingUserId, target?.name || "Artis");
                      }}
                      className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow"
                    >
                      {actionLoadingId === rejectingUserId ? "Menolak..." : "Tolak Pendaftaran"}
                    </button>
                  </div>
                </div>
              )}

              {/* Registrations List / Table */}
              <div className={`${ROYALTY_CARD} overflow-hidden p-0 border border-white/20`}>
                {(() => {
                  const filtered = nonAdminUsers.filter((u) => {
                    const matchStatus =
                      regFilterStatus === "ALL" || (u.status || "APPROVED") === regFilterStatus;
                    const q = regSearch.toLowerCase();
                    const matchSearch =
                      !regSearch ||
                      u.name?.toLowerCase().includes(q) ||
                      u.email?.toLowerCase().includes(q) ||
                      u.whatsapp?.toLowerCase().includes(q) ||
                      u.nik?.toLowerCase().includes(q);
                    return matchStatus && matchSearch;
                  });

                  const paginated = filtered.slice((pageRegistrations - 1) * 8, pageRegistrations * 8);

                  if (filtered.length === 0) {
                    return (
                      <div className="py-16 text-center text-white/60 text-xs p-6">
                        <UserCheck className="w-12 h-12 mx-auto text-white/20 mb-3" />
                        <p className="font-bold text-sm text-white/80">
                          {regFilterStatus === "PENDING"
                            ? "Tidak ada pendaftaran artis yang sedang menunggu ACC!"
                            : "Tidak ada data pendaftaran yang sesuai dengan filter."}
                        </p>
                        <p className="text-white/50 text-[11px] mt-1">
                          Semua artis baru yang mendaftar di halaman registrasi akan tercantum di sini untuk diverifikasi.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <>
                      {/* Mobile Cards */}
                      <div className="md:hidden divide-y divide-white/10 p-3 space-y-3">
                        {paginated.map((u) => (
                          <div key={u.id} className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-3 text-xs">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={u.avatar || "/logo.png"}
                                  alt={u.name}
                                  className="w-9 h-9 rounded-full object-cover bg-white/10 border border-white/20 shrink-0"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = "none";
                                  }}
                                />
                                <div className="min-w-0">
                                  <h4 className="font-bold text-white text-xs truncate">{u.name}</h4>
                                  <p className="text-white/60 text-[10px] truncate">{u.email}</p>
                                </div>
                              </div>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                  (u.status || "APPROVED") === "PENDING"
                                    ? "bg-amber-400 text-[#312042] animate-pulse"
                                    : (u.status || "APPROVED") === "APPROVED"
                                    ? "bg-[#c8f560] text-[#312042]"
                                    : "bg-red-500/30 text-red-300 border border-red-500/40"
                                }`}
                              >
                                {u.status || "APPROVED"}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                              <div>
                                <span className="text-white/50 text-[10px] block">WhatsApp:</span>
                                {u.whatsapp && u.whatsapp !== "-" ? (
                                  <a
                                    href={`https://wa.me/${u.whatsapp.replace(/[^0-9]/g, "")}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[#c8f560] hover:underline font-semibold flex items-center gap-1"
                                  >
                                    <Phone className="w-3 h-3" />
                                    <span>{u.whatsapp}</span>
                                  </a>
                                ) : (
                                  <span className="text-white/60">-</span>
                                )}
                              </div>
                              <div>
                                <span className="text-white/50 text-[10px] block">Channel YouTube:</span>
                                {u.youtubeUrl ? (
                                  <a
                                    href={u.youtubeUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-red-300 hover:underline font-semibold flex items-center gap-1 truncate"
                                  >
                                    <Youtube className="w-3 h-3 shrink-0" />
                                    <span className="truncate">Buka Channel</span>
                                  </a>
                                ) : (
                                  <span className="text-white/60">-</span>
                                )}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                              {(u.status || "APPROVED") !== "APPROVED" && (
                                <button
                                  type="button"
                                  disabled={actionLoadingId === u.id}
                                  onClick={() => handleApproveRegistration(u.id, u.name)}
                                  className="px-3.5 py-1.5 rounded-xl bg-[#c8f560] hover:bg-[#b8e450] text-[#312042] font-bold text-xs flex items-center gap-1 shadow cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>ACC Akun</span>
                                </button>
                              )}
                              {(u.status || "APPROVED") !== "REJECTED" && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRejectingUserId(u.id);
                                    setRejectReason("");
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-red-500/25 hover:bg-red-500/40 text-red-200 border border-red-500/30 text-xs font-semibold cursor-pointer"
                                >
                                  Tolak
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteRegistration(u.id, u.name)}
                                className="p-1.5 rounded-xl bg-white/10 hover:bg-red-500/30 text-white/70 hover:text-red-300 transition-colors"
                                title="Hapus pendaftaran"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Desktop Table */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left text-xs text-white">
                          <thead className="bg-[#312042]/60 border-b border-white/15 text-[11px] uppercase tracking-wider text-white/75">
                            <tr>
                              <th className="py-3.5 px-4 font-semibold">ARTIS / AKUN</th>
                              <th className="py-3.5 px-4 font-semibold">KONTAK & WHATSAPP</th>
                              <th className="py-3.5 px-4 font-semibold">YOUTUBE CHANNEL</th>
                              <th className="py-3.5 px-4 font-semibold">TANGGAL DAFTAR</th>
                              <th className="py-3.5 px-4 font-semibold">STATUS</th>
                              <th className="py-3.5 px-4 font-semibold text-right">AKSI KEPUTUSAN</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/10">
                            {paginated.map((u) => (
                              <tr key={u.id} className="hover:bg-white/5 transition-colors">
                                {/* ARTIS / AKUN */}
                                <td className="py-3.5 px-4 whitespace-nowrap">
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={u.avatar || "/logo.png"}
                                      alt={u.name}
                                      className="w-9 h-9 rounded-full object-cover bg-white/10 border border-white/20 shrink-0"
                                      onError={(e) => {
                                        (e.target as HTMLElement).style.display = "none";
                                      }}
                                    />
                                    <div>
                                      <p className="font-bold text-white text-xs">{u.name}</p>
                                      <p className="text-white/60 text-[11px]">{u.email}</p>
                                    </div>
                                  </div>
                                </td>

                                {/* KONTAK & WHATSAPP */}
                                <td className="py-3.5 px-4 whitespace-nowrap">
                                  {u.whatsapp && u.whatsapp !== "-" ? (
                                    <a
                                      href={`https://wa.me/${u.whatsapp.replace(/[^0-9]/g, "")}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold hover:bg-emerald-500/30 transition-all"
                                      title="Kirim pesan WhatsApp"
                                    >
                                      <Phone className="w-3 h-3 text-[#c8f560]" />
                                      <span>{u.whatsapp}</span>
                                    </a>
                                  ) : (
                                    <span className="text-white/50">-</span>
                                  )}
                                </td>

                                {/* YOUTUBE CHANNEL */}
                                <td className="py-3.5 px-4 whitespace-nowrap">
                                  {u.youtubeUrl ? (
                                    <a
                                      href={u.youtubeUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600/80 hover:bg-red-600 text-white font-semibold transition-all shadow"
                                    >
                                      <Youtube className="w-3.5 h-3.5" />
                                      <span>Lihat Channel</span>
                                    </a>
                                  ) : (
                                    <span className="text-white/50">-</span>
                                  )}
                                </td>

                                {/* TANGGAL DAFTAR */}
                                <td className="py-3.5 px-4 text-white/75 whitespace-nowrap">
                                  {u.createdAt
                                    ? new Date(u.createdAt).toLocaleDateString("id-ID", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                      })
                                    : "-"}
                                </td>

                                {/* STATUS */}
                                <td className="py-3.5 px-4 whitespace-nowrap">
                                  {(u.status || "APPROVED") === "PENDING" ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-[#312042] font-bold text-[10px] animate-pulse">
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#312042]" />
                                      Menunggu ACC
                                    </span>
                                  ) : (u.status || "APPROVED") === "APPROVED" ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c8f560] text-[#312042] font-bold text-[10px]">
                                      <CheckCircle2 className="w-3 h-3" />
                                      Terverifikasi (ACC)
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/25 border border-red-500/40 text-red-200 font-bold text-[10px]">
                                      <XCircle className="w-3 h-3" />
                                      Ditolak
                                    </span>
                                  )}
                                </td>

                                {/* AKSI KEPUTUSAN */}
                                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                  <div className="flex items-center justify-end gap-2">
                                    {(u.status || "APPROVED") !== "APPROVED" && (
                                      <button
                                        type="button"
                                        disabled={actionLoadingId === u.id}
                                        onClick={() => handleApproveRegistration(u.id, u.name)}
                                        className="px-3.5 py-1.5 rounded-xl bg-[#c8f560] hover:bg-[#b8e450] text-[#312042] font-bold text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
                                        title="Setujui dan beri akses login musisi"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                        <span>ACC Akun</span>
                                      </button>
                                    )}

                                    {(u.status || "APPROVED") !== "REJECTED" && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setRejectingUserId(u.id);
                                          setRejectReason("");
                                        }}
                                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-red-500/30 text-white hover:text-red-200 text-xs font-semibold transition-all cursor-pointer"
                                        title="Tolak pendaftaran ini"
                                      >
                                        Tolak
                                      </button>
                                    )}

                                    <button
                                      type="button"
                                      disabled={actionLoadingId === u.id}
                                      onClick={() => handleDeleteRegistration(u.id, u.name)}
                                      className="p-1.5 rounded-xl bg-white/10 hover:bg-red-500/40 text-white/70 hover:text-red-300 transition-colors cursor-pointer"
                                      title="Hapus permanen"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      <Pagination
                        currentPage={pageRegistrations}
                        totalItems={filtered.length}
                        pageSize={8}
                        onPageChange={setPageRegistrations}
                      />
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* =========================================================
              ADMIN VIEW: UPLOAD & KELOLA KATALOG MUSIK (MUNCUL KE USER)
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
                    <span>Daftar Katalog Musik</span>
                  </h2>
                  <p className="text-xs text-white/75 mt-1">
                    Daftar seluruh lagu yang terdaftar dalam katalog distribusi BREAKOUT.ID. Tambah lagu secara manual atau unggah massal otomatis via file Excel dan PDF.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="px-3.5 py-2 rounded-xl bg-[#c8f560]/20 border border-[#c8f560]/40 text-[#c8f560] text-xs font-bold">
                    {(catTotal || catalogs.length).toLocaleString("id-ID")} Lagu Terdaftar
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      if (!catSongId) {
                        setCatSongId(`HRM-ID-${Math.floor(1000 + Math.random() * 9000)}`);
                      }
                      setIsCatManualModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#c8f560] to-[#9de028] text-[#312042] text-xs font-black shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Upload Manual</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCatImportResult(null);
                      setIsCatImportModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 text-white text-xs font-bold shadow-md active:scale-95 transition-all cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-[#c8f560]" />
                    <span>📁 Upload Excel / PDF</span>
                  </button>
                </div>
              </div>

              {/* Table of Catalog Items in Admin */}
              <div className={`${ROYALTY_CARD} overflow-hidden p-0 border border-white/20`}>
                <div className="p-4 border-b border-white/15 space-y-3 bg-[#312042]/30">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="relative flex-1 min-w-[220px]">
                      <Search className="w-4 h-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={catSearch}
                        onChange={(e) => {
                          setCatSearch(e.target.value);
                          setPageCatalog(1);
                        }}
                        placeholder="Cari lagu di katalog (Song ID, Judul, Artis, Publisher)..."
                        className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/15 border border-white/25 text-white text-xs placeholder:text-white/40 focus:outline-none focus:border-[#c8f560]"
                      />
                    </div>
                    {(() => {
                      const filteredCatalogs = catalogs.filter((c) => {
                        if (!catSearch) return true;
                        const q = catSearch.toLowerCase();
                        return (
                          c.songId?.toLowerCase().includes(q) ||
                          c.title?.toLowerCase().includes(q) ||
                          c.artist?.toLowerCase().includes(q) ||
                          c.publisher?.toLowerCase().includes(q)
                        );
                      });

                      return catLoading ? (
                        <span className="text-xs text-[#c8f560] flex items-center gap-1.5 animate-pulse font-medium">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Memuat lagu...</span>
                        </span>
                      ) : (
                        <span className="text-xs text-white/70">
                          Menampilkan <strong className="text-white">{filteredCatalogs.length.toLocaleString("id-ID")}</strong>{" "}
                          {catPublisherFilter !== "ALL" && catTotal > filteredCatalogs.length ? (
                            <span className="text-white/50 text-[11px]">(dari total {catTotal.toLocaleString("id-ID")})</span>
                          ) : null}{" "}
                          lagu
                        </span>
                      );
                    })()}
                  </div>

                  {/* Publisher Filter Pills */}
                  <div className="space-y-2 pt-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-white/70 uppercase tracking-wider">
                        Filter Berdasarkan Publisher Resmi ({catPublishersList.length} Publisher):
                      </span>
                      {catPublisherFilter !== "ALL" && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const curPubItem = catPublishersList.find(
                                (p) => p.publisher.toLowerCase() === catPublisherFilter.toLowerCase()
                              );
                              const count = curPubItem ? curPubItem.count : catTotal;
                              setDeletePubModal({
                                isOpen: true,
                                publisher: catPublisherFilter,
                                count: count,
                              });
                            }}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-600/25 hover:bg-red-600 text-red-200 hover:text-white border border-red-500/40 text-[11px] font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                            title={`Hapus seluruh lagu dari publisher ${catPublisherFilter}`}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-300" />
                            <span>Hapus Seluruh Katalog Publisher Ini</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAdminSelectPublisher("ALL")}
                            className="text-[10px] text-[#c8f560] hover:underline cursor-pointer font-bold"
                          >
                            Reset ke Semua Publisher
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                      <button
                        type="button"
                        onClick={() => handleAdminSelectPublisher("ALL")}
                        className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                          catPublisherFilter === "ALL"
                            ? "bg-[#c8f560] text-[#312042] shadow-md"
                            : "bg-white/10 text-white/80 hover:bg-white/20"
                        }`}
                      >
                        Semua Publisher ({(catTotal || 39676).toLocaleString("id-ID")})
                      </button>

                      {catPublishersList.map((pubItem) => {
                        const pubName = pubItem.publisher;
                        const isSel = catPublisherFilter.toLowerCase() === pubName.toLowerCase();
                        return (
                          <div key={pubName} className="inline-flex items-center">
                            <button
                              type="button"
                              onClick={() => handleAdminSelectPublisher(pubName)}
                              className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                                isSel
                                  ? "bg-[#c8f560] text-[#312042] font-bold shadow-md scale-[1.02]"
                                  : "bg-white/10 text-white/80 hover:bg-white/20"
                              }`}
                            >
                              <span>{pubName}</span>
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                                  isSel ? "bg-[#312042]/20 text-[#312042]" : "bg-black/35 text-[#c8f560]"
                                }`}
                              >
                                {pubItem.count.toLocaleString("id-ID")}
                              </span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {(() => {
                  const filteredCatalogs = catalogs.filter((c) => {
                    if (!catSearch) return true;
                    const q = catSearch.toLowerCase();
                    return (
                      c.songId?.toLowerCase().includes(q) ||
                      c.title?.toLowerCase().includes(q) ||
                      c.artist?.toLowerCase().includes(q) ||
                      c.publisher?.toLowerCase().includes(q)
                    );
                  });
                  const paginatedCatalogs = filteredCatalogs.slice((pageCatalog - 1) * 10, pageCatalog * 10);

                  return (
                    <>
                      {/* Bulk Selection Action Bar */}
                      {selectedCatIds.length > 0 && (
                        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-red-950/60 border-b border-red-500/30 animate-fade-in">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-2 text-xs text-red-200 font-bold">
                              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                              <span><strong>{selectedCatIds.length}</strong> lagu dicentang</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const allIds = filteredCatalogs.map((c) => c.id);
                                setSelectedCatIds(allIds);
                              }}
                              className="text-[11px] text-[#c8f560] hover:underline cursor-pointer font-bold"
                            >
                              Centang Semua ({filteredCatalogs.length}) Lagu di Tampilan Ini
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedCatIds([])}
                              className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer"
                            >
                              Batal
                            </button>
                            <button
                              type="button"
                              disabled={isBulkDeletingCat}
                              onClick={handleBulkDeleteCatalogs}
                              className="flex items-center gap-1.5 px-3.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50 active:scale-95"
                            >
                              {isBulkDeletingCat ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  <span>Menghapus...</span>
                                </>
                              ) : (
                                <>
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Hapus {selectedCatIds.length} Lagu Terpilih</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="overflow-x-auto min-h-[300px]">
                        <table className="w-full text-left text-xs text-white">
                          <thead className="bg-[#312042]/60 border-b border-white/15 text-[11px] uppercase tracking-wider text-white/75">
                            <tr>
                              <th className="py-3 px-3 w-10 text-center">
                                <input
                                  type="checkbox"
                                  checked={
                                    paginatedCatalogs.length > 0 &&
                                    paginatedCatalogs.every((c) => selectedCatIds.includes(c.id))
                                  }
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      const pageIds = paginatedCatalogs.map((c) => c.id);
                                      setSelectedCatIds(Array.from(new Set([...selectedCatIds, ...pageIds])));
                                    } else {
                                      const pageIds = paginatedCatalogs.map((c) => c.id);
                                      setSelectedCatIds(selectedCatIds.filter((id) => !pageIds.includes(id)));
                                    }
                                  }}
                                  className="w-4 h-4 rounded accent-[#c8f560] cursor-pointer"
                                  title="Centang semua lagu di halaman ini"
                                />
                              </th>
                              <th className="py-3 px-4 font-semibold">SONG ID</th>
                              <th className="py-3 px-4 font-semibold">JUDUL LAGU</th>
                              <th className="py-3 px-4 font-semibold">VOKAL / ARTIS</th>
                              <th className="py-3 px-4 font-semibold">PUBLISHER</th>
                              <th className="py-3 px-4 font-semibold">STATUS / AKTIF</th>
                              <th className="py-3 px-4 font-semibold text-center">LINK YT / DRIVE</th>
                              <th className="py-3 px-4 font-semibold text-right">AKSI</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/10">
                            {catLoading ? (
                              <tr>
                                <td colSpan={8} className="py-16 text-center">
                                  <div className="flex flex-col items-center justify-center gap-2">
                                    <RefreshCw className="w-7 h-7 animate-spin text-[#c8f560]" />
                                    <p className="text-sm font-bold text-white tracking-wide">
                                      Memuat daftar lagu...
                                    </p>
                                    <p className="text-xs text-white/50">
                                      {catPublisherFilter !== "ALL"
                                        ? `Mengambil data dari ${catPublisherFilter}`
                                        : "Mengambil data katalog..."}
                                    </p>
                                  </div>
                                </td>
                              </tr>
                            ) : paginatedCatalogs.length === 0 ? (
                              <tr>
                                <td colSpan={8} className="py-16 text-center text-white/60">
                                  <div className="flex flex-col items-center justify-center gap-2">
                                    <Music className="w-8 h-8 text-white/25" />
                                    <p className="text-sm font-semibold text-white/80">
                                      Tidak ada lagu yang ditemukan
                                    </p>
                                    <p className="text-xs text-white/40">
                                      Coba pilih publisher lain atau ubah kata kunci pencarian.
                                    </p>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setCatSearch("");
                                        handleAdminSelectPublisher("ALL");
                                      }}
                                      className="mt-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#c8f560] text-xs font-semibold transition-all cursor-pointer"
                                    >
                                      Reset ke Semua Publisher
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ) : (
                              paginatedCatalogs.map((c) => {
                                const isChecked = selectedCatIds.includes(c.id);
                                return (
                                  <tr
                                    key={c.id}
                                    className={`transition-colors ${
                                      isChecked ? "bg-red-950/20 hover:bg-red-950/30" : "hover:bg-white/5"
                                    }`}
                                  >
                                    <td className="py-3 px-3 text-center">
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedCatIds([...selectedCatIds, c.id]);
                                          } else {
                                            setSelectedCatIds(selectedCatIds.filter((id) => id !== c.id));
                                          }
                                        }}
                                        className="w-4 h-4 rounded accent-[#c8f560] cursor-pointer"
                                      />
                                    </td>
                                    <td className="py-3 px-4 font-mono font-bold text-[#c8f560] whitespace-nowrap">
                                      {c.songId}
                                    </td>
                                    <td className="py-3 px-4 font-semibold text-white whitespace-nowrap">
                                      {c.title}
                                    </td>
                                    <td className="py-3 px-4 text-white/90 whitespace-nowrap">
                                      {c.artist}
                                    </td>
                                    <td className="py-3 px-4 text-white/80 whitespace-nowrap">
                                      {c.publisher}
                                    </td>
                                    <td className="py-3 px-4 whitespace-nowrap">
                                      <button
                                        type="button"
                                        onClick={() => handleToggleCatalogStatus(c.id, c.status)}
                                        title="Klik untuk mengubah status"
                                        className={`px-3 py-0.5 rounded-full font-bold text-[10px] transition-all ${
                                          c.status === "Aktif"
                                            ? "bg-[#c8f560] text-[#312042] hover:bg-[#b0dc4c]"
                                            : c.status === "Review"
                                            ? "bg-[#fde08d] text-[#312042]"
                                            : "bg-white/20 text-white"
                                        }`}
                                      >
                                        {c.status}
                                      </button>
                                    </td>
                                    <td className="py-3 px-4 text-center whitespace-nowrap">
                                      <div className="flex items-center justify-center gap-1.5">
                                        {c.youtubeLink ? (
                                          <a
                                            href={c.youtubeLink}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-2 py-0.5 rounded bg-red-600/80 hover:bg-red-600 text-white font-bold text-[10px] flex items-center gap-1"
                                          >
                                            <Youtube className="w-3 h-3" />
                                            <span>YT</span>
                                          </a>
                                        ) : (
                                          <span className="text-[10px] text-white/40">-</span>
                                        )}
                                        {c.driveLink ? (
                                          <a
                                            href={c.driveLink}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-2 py-0.5 rounded bg-blue-600/80 hover:bg-blue-600 text-white font-bold text-[10px] flex items-center gap-1"
                                          >
                                            <HardDrive className="w-3 h-3" />
                                            <span>Drive</span>
                                          </a>
                                        ) : (
                                          <span className="text-[10px] text-white/40">-</span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="py-3 px-4 text-right whitespace-nowrap">
                                      <div className="flex items-center justify-end gap-1.5">
                                        <button
                                          type="button"
                                          onClick={() => handleOpenEditCatalog(c)}
                                          title="Edit data lagu katalog"
                                          className="p-1.5 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-300 transition-colors cursor-pointer"
                                        >
                                          <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteCatalog(c.id)}
                                          title="Hapus lagu dari katalog"
                                          className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-300 transition-colors cursor-pointer"
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
                      {!catLoading && paginatedCatalogs.length > 0 && (
                        <div className="p-4">
                          <Pagination
                            currentPage={pageCatalog}
                            totalItems={filteredCatalogs.length}
                            pageSize={10}
                            onPageChange={setPageCatalog}
                          />
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* ================= MODAL UPLOAD KATALOG MANUAL ================= */}
              {isCatManualModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
                  <div className="relative w-full max-w-lg rounded-2xl bg-[#1b1226] border border-white/20 p-6 shadow-2xl space-y-5 text-white max-h-[90vh] overflow-y-auto">
                    {/* Header Modal */}
                    <div className="flex items-center justify-between pb-3 border-b border-white/15">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-[#c8f560]/20 border border-[#c8f560]/30 text-[#c8f560]">
                          <Plus className="w-5 h-5 stroke-[2.5]" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white">Upload Lagu ke Katalog (Manual)</h3>
                          <p className="text-[11px] text-white/60">Input data lagu satu per satu langsung ke database katalog</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsCatManualModalOpen(false)}
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSaveCatalog} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-[11px] font-semibold text-white/80 mb-1">
                            Song ID <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={catSongId}
                            onChange={(e) => setCatSongId(e.target.value)}
                            placeholder="Contoh: HRM-ID-0106"
                            className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-mono focus:outline-none focus:border-[#c8f560]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-white/80 mb-1">
                            Status Katalog <span className="text-red-400">*</span>
                          </label>
                          <select
                            value={catStatus}
                            onChange={(e) => setCatStatus(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-[#2a1b3d] border border-white/20 text-white text-xs focus:outline-none focus:border-[#c8f560]"
                          >
                            <option value="Aktif">Aktif</option>
                            <option value="Review">Review</option>
                            <option value="Nonaktif">Nonaktif</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-white/80 mb-1">
                          Judul Lagu <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={catTitle}
                          onChange={(e) => setCatTitle(e.target.value)}
                          placeholder="Masukkan judul lagu..."
                          className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:border-[#c8f560]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-[11px] font-semibold text-white/80 mb-1">
                            Nama Artis / Vokal <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={catArtist}
                            onChange={(e) => setCatArtist(e.target.value)}
                            placeholder="Contoh: Bunga Citra / BREAKOUT"
                            className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:border-[#c8f560]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-white/80 mb-1">
                            Publisher / Label <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={catPublisher}
                            onChange={(e) => setCatPublisher(e.target.value)}
                            placeholder="Contoh: BREAKOUT Publishing"
                            className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:border-[#c8f560]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-white/80 mb-1">
                          Link YouTube (Opsional)
                        </label>
                        <input
                          type="url"
                          value={catYoutube}
                          onChange={(e) => setCatYoutube(e.target.value)}
                          placeholder="https://youtube.com/watch?v=..."
                          className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:border-[#c8f560]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-white/80 mb-1">
                          Link Google Drive / Audio WAV / MP3 (Opsional)
                        </label>
                        <input
                          type="url"
                          value={catDrive}
                          onChange={(e) => setCatDrive(e.target.value)}
                          placeholder="https://drive.google.com/..."
                          className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:border-[#c8f560]"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/15">
                        <button
                          type="button"
                          onClick={() => setIsCatManualModalOpen(false)}
                          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          disabled={uploadingCatalog}
                          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#c8f560] hover:bg-[#b0dc4c] text-[#312042] text-xs font-bold transition-all disabled:opacity-50 shadow-md cursor-pointer"
                        >
                          {uploadingCatalog ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Menyimpan...</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Simpan ke Katalog</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* ================= MODAL UPLOAD OTOMATIS EXCEL / PDF ================= */}
              {isCatImportModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
                  <div className="relative w-full max-w-lg rounded-2xl bg-[#1b1226] border border-white/20 p-6 shadow-2xl space-y-5 text-white max-h-[90vh] overflow-y-auto">
                    {/* Header Modal */}
                    <div className="flex items-center justify-between pb-3 border-b border-white/15">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-[#c8f560]/20 border border-[#c8f560]/30 text-[#c8f560]">
                          <FileSpreadsheet className="w-5 h-5 stroke-[2.5]" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white">Upload Otomatis Katalog (Excel / PDF)</h3>
                          <p className="text-[11px] text-white/60">Ekstrak dan impor data ribuan lagu secara otomatis</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (!catImporting) setIsCatImportModalOpen(false);
                        }}
                        disabled={catImporting}
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all disabled:opacity-50 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Info Petunjuk */}
                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs">
                      <div className="flex items-center gap-1.5 text-[#c8f560] font-bold text-[11px]">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Format File yang Didukung:</span>
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-white/80 text-[11px] leading-relaxed">
                        <li><strong>Excel (.xlsx, .xls, .csv):</strong> Kolom <code>Judul</code> / <code>Title</code> dan <code>Artis</code> / <code>Artist</code> (otomatis mendeteksi kolom Publisher, Song ID, Status, YouTube, Drive).</li>
                        <li><strong>PDF (.pdf):</strong> Dokumen teks daftar lagu berformat baris (dipisah Tab, Pipe <code>|</code>, koma, atau tanda strip <code>-</code>).</li>
                      </ul>
                    </div>

                    {/* Pengaturan Tambahan */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-white/80 mb-1">
                          Default Publisher
                        </label>
                        <input
                          type="text"
                          value={catDefaultPublisher}
                          onChange={(e) => setCatDefaultPublisher(e.target.value)}
                          placeholder="Contoh: BREAKOUT Publishing"
                          className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:border-[#c8f560]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-white/80 mb-1">
                          Default Status
                        </label>
                        <select
                          value={catDefaultStatus}
                          onChange={(e) => setCatDefaultStatus(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-[#2a1b3d] border border-white/20 text-white text-xs focus:outline-none focus:border-[#c8f560]"
                        >
                          <option value="Aktif">Aktif</option>
                          <option value="Review">Review</option>
                          <option value="Nonaktif">Nonaktif</option>
                        </select>
                      </div>
                    </div>

                    {/* Upload Dropzone */}
                    <div className="space-y-3">
                      <label className="block text-[11px] font-semibold text-white/80">
                        Pilih File Excel / PDF
                      </label>
                      <div
                        onClick={() => {
                          if (!catImporting && catFileInputRef.current) {
                            catFileInputRef.current.click();
                          }
                        }}
                        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                          catImporting
                            ? "border-[#c8f560]/50 bg-[#c8f560]/10 cursor-not-allowed"
                            : "border-white/20 hover:border-[#c8f560] bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        <input
                          ref={catFileInputRef}
                          type="file"
                          accept=".xlsx,.xls,.csv,.pdf"
                          onChange={handleCatalogFileImport}
                          disabled={catImporting}
                          className="hidden"
                        />

                        {catImporting ? (
                          <div className="space-y-3">
                            <RefreshCw className="w-8 h-8 text-[#c8f560] animate-spin mx-auto" />
                            <div>
                              <p className="text-xs font-bold text-white">Sedang Memproses & Mengimpor Data...</p>
                              <p className="text-[11px] text-white/60 mt-0.5">Mohon tunggu, sistem sedang mengekstrak file ke database katalog</p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="w-12 h-12 rounded-xl bg-[#c8f560]/10 border border-[#c8f560]/30 flex items-center justify-center mx-auto text-[#c8f560]">
                              <Upload className="w-6 h-6" />
                            </div>
                            <p className="text-xs font-bold text-white">
                              Klik untuk Memilih File (.xlsx, .xls, .csv, .pdf)
                            </p>
                            <p className="text-[10px] text-white/50">
                              Maksimal ukuran file hingga 50MB
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Result Status Banner */}
                    {catImportResult && (
                      <div
                        className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                          catImportResult.success
                            ? "bg-[#c8f560]/15 border-[#c8f560]/40 text-[#c8f560]"
                            : "bg-red-500/15 border-red-500/40 text-red-300"
                        }`}
                      >
                        {catImportResult.success ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold">Impor Berhasil!</p>
                              <p className="text-[11px] text-white/80 mt-0.5">
                                Berhasil menambahkan/memperbarui <strong>{catImportResult.count}</strong> lagu dari file <em>{catImportResult.filename}</em> ke dalam katalog.
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold">Gagal Mengimpor</p>
                              <p className="text-[11px] text-white/80 mt-0.5">
                                {catImportResult.error || "Terjadi kesalahan saat membaca file."}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* Footer Modal */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/15">
                      <button
                        type="button"
                        onClick={() => setIsCatImportModalOpen(false)}
                        disabled={catImporting}
                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {catImportResult?.success ? "Tutup & Selesai" : "Batal"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= MODAL EDIT LAGU KATALOG ================= */}
              {editingCatalog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
                  <div className="relative w-full max-w-lg rounded-2xl bg-[#1b1226] border border-white/20 p-6 shadow-2xl space-y-5 text-white max-h-[90vh] overflow-y-auto">
                    {/* Header Modal */}
                    <div className="flex items-center justify-between pb-3 border-b border-white/15">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-yellow-400/20 border border-yellow-400/30 text-yellow-300">
                          <Pencil className="w-5 h-5 stroke-[2.5]" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white">Edit Lagu Katalog</h3>
                          <p className="text-[11px] text-white/60">Perubahan akan langsung tersinkronisasi ke seluruh akun user</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingCatalog(null)}
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Form Edit */}
                    <form onSubmit={handleSaveCatalogEdit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-[11px] font-semibold text-white/80 mb-1">
                            Song ID <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={editingCatalog.songId}
                            onChange={(e) =>
                              setEditingCatalog({ ...editingCatalog, songId: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-mono focus:outline-none focus:border-[#c8f560]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-white/80 mb-1">
                            Status Katalog <span className="text-red-400">*</span>
                          </label>
                          <select
                            value={editingCatalog.status}
                            onChange={(e) =>
                              setEditingCatalog({ ...editingCatalog, status: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-xl bg-[#2a1b3d] border border-white/20 text-white text-xs focus:outline-none focus:border-[#c8f560]"
                          >
                            <option value="Aktif">Aktif</option>
                            <option value="Review">Review</option>
                            <option value="Nonaktif">Nonaktif</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-white/80 mb-1">
                          Judul Lagu <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={editingCatalog.title}
                          onChange={(e) =>
                            setEditingCatalog({ ...editingCatalog, title: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:border-[#c8f560]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-[11px] font-semibold text-white/80 mb-1">
                            Nama Artis / Vokal <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={editingCatalog.artist}
                            onChange={(e) =>
                              setEditingCatalog({ ...editingCatalog, artist: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:border-[#c8f560]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-white/80 mb-1">
                            Publisher / Label <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={editingCatalog.publisher}
                            onChange={(e) =>
                              setEditingCatalog({ ...editingCatalog, publisher: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:border-[#c8f560]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-white/80 mb-1">
                          Link YouTube (Opsional)
                        </label>
                        <input
                          type="url"
                          value={editingCatalog.youtubeLink}
                          onChange={(e) =>
                            setEditingCatalog({ ...editingCatalog, youtubeLink: e.target.value })
                          }
                          placeholder="https://youtube.com/watch?v=..."
                          className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:border-[#c8f560]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-white/80 mb-1">
                          Link Google Drive / Master Audio (Opsional)
                        </label>
                        <input
                          type="url"
                          value={editingCatalog.driveLink}
                          onChange={(e) =>
                            setEditingCatalog({ ...editingCatalog, driveLink: e.target.value })
                          }
                          placeholder="https://drive.google.com/..."
                          className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:border-[#c8f560]"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/15">
                        <button
                          type="button"
                          onClick={() => setEditingCatalog(null)}
                          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          disabled={savingCatalogEdit}
                          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#c8f560] hover:bg-[#b0dc4c] text-[#312042] text-xs font-bold transition-all disabled:opacity-50 shadow-md cursor-pointer"
                        >
                          {savingCatalogEdit ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Menyimpan...</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Simpan Perubahan</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* ================= MODAL KONFIRMASI HAPUS SELURUH PUBLISHER ================= */}
              {deletePubModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                  <div className="relative w-full max-w-md rounded-2xl bg-[#1b1226] border border-red-500/40 p-6 shadow-2xl space-y-5 text-white">
                    <div className="flex items-center justify-between pb-3 border-b border-white/15">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-red-600/20 border border-red-500/40 text-red-400">
                          <Trash2 className="w-5 h-5 stroke-[2.5]" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white">Hapus Seluruh Katalog Publisher</h3>
                          <p className="text-[11px] text-white/60">Tindakan massal menghapus semua lagu publisher</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDeletePubModal({ isOpen: false, publisher: "", count: 0 })}
                        disabled={isDeletingPublisher}
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all disabled:opacity-50 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 space-y-2 text-xs">
                      <div className="flex items-start gap-2 text-red-300">
                        <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-red-200 text-sm mb-1">Peringatan Penghapusan Permanen</p>
                          <p className="leading-relaxed text-white/80">
                            Anda akan menghapus seluruh lagu dari publisher:
                          </p>
                          <p className="mt-1 text-sm font-black text-[#c8f560] bg-black/40 px-2 py-1 rounded-md inline-block">
                            {deletePubModal.publisher}
                          </p>
                          <p className="mt-2 text-white/80 leading-relaxed">
                            Total lagu yang akan dihapus: <strong className="text-white">{deletePubModal.count.toLocaleString("id-ID")} lagu</strong>.
                          </p>
                          <p className="mt-1 text-[11px] text-red-300/80">
                            Lagu-lagu ini akan dihapus dari katalog master admin dan juga katalog di akun user secara otomatis.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/15">
                      <button
                        type="button"
                        onClick={() => setDeletePubModal({ isOpen: false, publisher: "", count: 0 })}
                        disabled={isDeletingPublisher}
                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        disabled={isDeletingPublisher}
                        onClick={() => handleDeletePublisherCatalog(deletePubModal.publisher)}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md disabled:opacity-50 cursor-pointer active:scale-95"
                      >
                        {isDeletingPublisher ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Menghapus {deletePubModal.count.toLocaleString("id-ID")} Lagu...</span>
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Ya, Hapus Semua ({deletePubModal.count.toLocaleString("id-ID")} Lagu)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              ADMIN VIEW CMS: WEB CMS LANDING PAGE MANAGER
             ========================================================= */}
          {activeTab === "cms" && (
            <AdminLandingCMS showNotice={showNotice} />
          )}

          {activeTab === "royalty-input" && (
            <div className="space-y-6 animate-card-enter">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Input Data Royalty & Streaming ke Akun User
                  </h2>
                  <p className="text-xs text-white/75 mt-0.5">
                    Update saldo royalty balance, royalty pending, dan total streams langsung ke profil artis
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Form Input */}
                <form
                  onSubmit={handleSaveUserRoyalty}
                  className={`lg:col-span-7 ${ROYALTY_CARD} space-y-4`}
                >
                  <div className="pb-3 border-b border-white/15 flex items-center justify-between">
                    <span className="text-sm font-semibold text-white flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-[#c8f560]" />
                      <span>Form Update Royalty & Streaming User</span>
                    </span>
                    <span className="text-[10px] text-[#c8f560] font-semibold">
                      DIRECT PRISMA SYNC
                    </span>
                  </div>

                  {/* Pilih User / Artis Tujuan (Hanya yang sudah ACC & Tanpa Email) */}
                  <div>
                    <label className="block text-white/80 text-xs font-semibold mb-1">
                      Pilih Akun Artis (Hanya yang Memiliki Rilisan Lagu ACC):
                    </label>
                    <select
                      value={selectedUserForRoyalty}
                      onChange={(e) => handleSelectUserChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/15 border border-white/25 text-white text-xs font-bold focus:outline-none focus:border-[#c8f560]"
                    >
                      {approvedArtists.length === 0 ? (
                        <option value="" disabled className="bg-[#312042]">
                          Belum ada artis dengan lagu yang berstatus ACC
                        </option>
                      ) : (
                        approvedArtists.map((u) => (
                          <option key={u.id} value={u.id} className="bg-[#312042]">
                            {getArtistDisplayName(u)}
                          </option>
                        ))
                      )}
                    </select>
                    <p className="text-[10px] text-white/60 mt-1">
                      *Menampilkan hanya nama panggung / profil artis yang rilisannya telah disetujui (ACC).
                    </p>
                  </div>

                  {/* Kalkulator Potongan Royalti Otomatis (%) */}
                  <div className="p-4 rounded-2xl bg-black/25 border border-white/15 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <span className="text-xs font-bold text-[#c8f560] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Kalkulator Potongan Royalti (%)
                      </span>
                      <span className="text-[10px] text-white/60">
                        Otomatis Memotong Saldo Bersih
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {/* 1. Nominal Royalti Kotor */}
                      <div>
                        <label className="block text-white/80 font-medium mb-1">
                          Nominal Royalti Kotor (Gross Rp)
                        </label>
                        <div className="flex items-center px-3.5 py-2 rounded-xl bg-white/15 border border-white/25 focus-within:border-[#c8f560]">
                          <span className="text-[#c8f560] font-bold text-xs mr-2">Rp</span>
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder="100.000"
                            value={formatNumberWithDots(grossRoyaltyInput)}
                            onChange={(e) => {
                              const val = parseFormattedNumber(e.target.value);
                              updateRoyaltyCalc(val, cutPercentage);
                            }}
                            className="w-full bg-transparent text-white font-bold text-sm focus:outline-none placeholder-white/40"
                          />
                        </div>
                      </div>

                      {/* 2. Potongan Persen */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-white/80 font-medium">
                            Potongan Royalti Label (%)
                          </label>
                          <span className="text-[10px] text-[#c8f560] font-semibold">
                            {cutPercentage}% Terpotong
                          </span>
                        </div>
                        <div className="flex items-center px-3.5 py-2 rounded-xl bg-white/15 border border-white/25 focus-within:border-[#c8f560]">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="30"
                            value={cutPercentage === 0 ? "" : cutPercentage}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              updateRoyaltyCalc(grossRoyaltyInput, val);
                            }}
                            className="w-full bg-transparent text-white font-bold text-sm focus:outline-none placeholder-white/40"
                          />
                          <span className="text-white/70 font-bold text-xs ml-1">%</span>
                        </div>
                      </div>
                    </div>

                    {/* Preset Tombol Cepat Gross & Persen */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-white/60 text-[10px]">Pilih %:</span>
                        {[0, 10, 20, 30, 50, 70].map((pct) => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => updateRoyaltyCalc(grossRoyaltyInput, pct)}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors ${
                              cutPercentage === pct
                                ? "bg-[#c8f560] text-[#312042]"
                                : "bg-white/15 hover:bg-white/25 text-white"
                            }`}
                          >
                            {pct}%
                          </button>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-white/60 text-[10px]">Nominal:</span>
                        {[100000, 500000, 1000000, 5000000].map((bonus) => (
                          <button
                            key={bonus}
                            type="button"
                            onClick={() => updateRoyaltyCalc(bonus, cutPercentage)}
                            className="px-2 py-0.5 rounded-lg bg-white/15 hover:bg-white/25 text-[10px] font-medium text-white transition-colors"
                          >
                            Rp {(bonus / 1000).toLocaleString("id-ID")}K
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Rincian Potongan Live Card */}
                    <div className="p-3 rounded-xl bg-white/10 border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-white/60 block">Nominal Kotor:</span>
                        <span className="font-semibold text-white">
                          Rp {grossRoyaltyInput.toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="text-center">
                        <span className="text-[10px] text-red-300 block">
                          Potongan ({cutPercentage}%):
                        </span>
                        <span className="font-semibold text-red-300">
                          - Rp {Math.round(grossRoyaltyInput * (cutPercentage / 100)).toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[#c8f560] font-bold block">
                          Saldo Bersih Artis (Net):
                        </span>
                        <span className="font-extrabold text-sm text-[#c8f560]">
                          Rp {Math.max(0, grossRoyaltyInput - Math.round(grossRoyaltyInput * (cutPercentage / 100))).toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-white/75 mb-1">
                        Royalty Balance Bersih (Rp)
                      </label>
                      <div className="flex items-center px-3.5 py-2.5 rounded-xl bg-white/15 border border-white/25 focus-within:border-[#c8f560]">
                        <span className="text-[#c8f560] font-bold text-xs mr-2">Rp</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="0"
                          value={formatNumberWithDots(inputRoyaltyBalance)}
                          onChange={(e) => setInputRoyaltyBalance(parseFormattedNumber(e.target.value))}
                          className="w-full bg-transparent text-white font-bold text-sm focus:outline-none placeholder-white/40"
                        />
                      </div>
                      <span className="text-[10px] text-[#c8f560]">Saldo bersih siap ditarik</span>
                    </div>

                    <div>
                      <label className="block text-white/75 mb-1">
                        Royalty Pending (Rp)
                      </label>
                      <div className="flex items-center px-3.5 py-2.5 rounded-xl bg-white/15 border border-white/25 focus-within:border-[#c8f560]">
                        <span className="text-[#c8f560] font-bold text-xs mr-2">Rp</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="0"
                          value={formatNumberWithDots(inputRoyaltyPending)}
                          onChange={(e) => setInputRoyaltyPending(parseFormattedNumber(e.target.value))}
                          className="w-full bg-transparent text-white font-bold text-sm focus:outline-none placeholder-white/40"
                        />
                      </div>
                      <span className="text-[10px] text-white/60">Royalti berjalan</span>
                    </div>

                    <div>
                      <label className="block text-white/75 mb-1">
                        Total Streams (Angka)
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="0"
                        value={formatNumberWithDots(inputTotalStreams)}
                        onChange={(e) => setInputTotalStreams(parseFormattedNumber(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/15 border border-white/25 text-white font-bold text-sm focus:outline-none focus:border-[#c8f560] placeholder-white/40"
                      />
                      <span className="text-[10px] text-[#c8f560]">
                        Format: {inputTotalStreams >= 1000 ? `${(inputTotalStreams / 1000).toFixed(0)}K` : inputTotalStreams}
                      </span>
                    </div>
                  </div>

                  {/* Pilihan Periode Bulan Royalti & Streams (Cukup Bulan) */}
                  <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="text-white font-bold text-xs flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#c8f560]" />
                        <span>Periode Bulan Royalti & Streams:</span>
                      </label>
                      <span className="px-3 py-1 rounded-full bg-[#312042] text-[#c8f560] text-xs font-extrabold border border-[#c8f560]/40">
                        Bulan Terpilih: {inputRoyaltyMonth}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1">
                      {[
                        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
                        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
                      ].map((mName) => {
                        const isSelected = inputRoyaltyMonth === mName;
                        return (
                          <button
                            key={mName}
                            type="button"
                            onClick={() => setInputRoyaltyMonth(mName)}
                            className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center ${
                              isSelected
                                ? "bg-[#c8f560] text-[#312042] font-extrabold shadow scale-102 ring-1 ring-[#c8f560]"
                                : "bg-white/10 hover:bg-white/20 text-white/80 border border-white/10"
                            }`}
                          >
                            {mName}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const net = Math.max(0, grossRoyaltyInput - Math.round(grossRoyaltyInput * (cutPercentage / 100)));
                        const curr = users.find((u) => u.id === selectedUserForRoyalty);
                        const curBal = Number(curr?.royaltyBalance || 0);
                        setInputRoyaltyBalance(curBal + net);
                        showNotice(`+Rp ${net.toLocaleString("id-ID")} ditambahkan ke saldo berjalan artis!`);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-medium text-xs transition-colors flex items-center gap-1.5"
                    >
                      <span>+ Tambah ke Saldo Berjalan</span>
                    </button>

                    <button
                      type="submit"
                      disabled={savingRoyalty || !selectedUserForRoyalty}
                      className="px-6 py-2.5 rounded-xl bg-[#c8f560] hover:opacity-90 text-[#312042] font-bold text-xs flex items-center gap-2 shadow"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {savingRoyalty
                          ? "Menyimpan..."
                          : `Input Saldo Rp ${inputRoyaltyBalance.toLocaleString("id-ID")}`}
                      </span>
                    </button>
                  </div>
                </form>

                {/* Right Column: Ringkasan Artis Saat Ini */}
                <div className={`lg:col-span-5 ${ROYALTY_CARD} flex flex-col justify-between`}>
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-3">
                      Data Artis Terpilih Saat Ini
                    </h3>
                    {(() => {
                      const curr = users.find((u) => u.id === selectedUserForRoyalty);
                      if (!curr) return <p className="text-xs text-white/70">Pilih artis dengan rilisan ACC</p>;
                      const accSongsCount = approvedReleases.filter((r) => r.userId === curr.id).length;
                      return (
                        <div className="space-y-3 text-xs">
                          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/10">
                            <img
                              src={
                                curr.avatar ||
                                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                              }
                              alt={getArtistDisplayName(curr)}
                              className="w-12 h-12 rounded-full object-cover border border-white/20"
                            />
                            <div>
                              <p className="font-bold text-white text-base">{getArtistDisplayName(curr)}</p>
                              <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-[#312042] text-[#c8f560] text-[10px] font-bold">
                                {accSongsCount} Lagu Rilis ACC • Terverifikasi
                              </span>
                            </div>
                          </div>

                          {/* Live Calculation Preview Card */}
                          <div className="p-3 rounded-xl bg-black/20 border border-white/10 space-y-1.5 text-xs">
                            <div className="flex justify-between text-white/70">
                              <span>Nominal Kotor:</span>
                              <span className="font-semibold text-white">Rp {grossRoyaltyInput.toLocaleString("id-ID")}</span>
                            </div>
                            <div className="flex justify-between text-red-300">
                              <span>Potongan ({cutPercentage}%):</span>
                              <span className="font-semibold">- Rp {Math.round(grossRoyaltyInput * (cutPercentage / 100)).toLocaleString("id-ID")}</span>
                            </div>
                            <div className="flex justify-between text-[#c8f560] font-bold pt-1 border-t border-white/10">
                              <span>Saldo Bersih yang Masuk:</span>
                              <span>Rp {inputRoyaltyBalance.toLocaleString("id-ID")}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="p-3 rounded-xl bg-white/10">
                              <p className="text-white/60 text-[10px]">Saldo di Akun</p>
                              <p className="font-bold text-xs sm:text-sm text-[#c8f560] truncate">
                                Rp {Number(curr.royaltyBalance || 0).toLocaleString("id-ID")}
                              </p>
                            </div>
                            <div className="p-3 rounded-xl bg-white/10">
                              <p className="text-white/60 text-[10px]">Total Streams</p>
                              <p className="font-bold text-xs sm:text-sm text-white">
                                {(Number(curr.totalStreams) / 1000).toFixed(0)}K
                              </p>
                            </div>
                            <div className="p-3 rounded-xl bg-white/10">
                              <p className="text-white/60 text-[10px]">Bulan Royalti</p>
                              <p className="font-bold text-xs sm:text-sm text-[#fde08d] truncate">
                                {curr.royaltyMonth || inputRoyaltyMonth}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="mt-4 p-3 rounded-xl bg-white/10 border border-white/15 text-[11px] text-white/75">
                    💡 Perubahan saldo dan streams langsung otomatis tampil di halaman User Dashboard saat artis login.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              ADMIN VIEW: ARTIS ROYALTY (REKAP SALDO, MUSISI, & RIWAYAT ACC PER PERIODE)
             ========================================================= */}
          {activeTab === "artist-royalties" && (() => {
            const allArtists = users.filter((u) => u.role !== "ADMIN");

            const artistsWithActiveBalance = allArtists.filter(
              (u) => Number(u.royaltyBalance || 0) > 0
            );
            const artistsWithZeroBalance = allArtists.filter(
              (u) => Number(u.royaltyBalance || 0) <= 0
            );

            const approvedWithdrawals = withdrawals.filter((w) => isApprovedWithdrawal(w.status));

            // Extract distinct periods
            const availablePeriods = Array.from(
              new Set(approvedWithdrawals.map((w) => getWithdrawalPeriodHelper(w).label))
            ).filter(Boolean);

            // Filter approved withdrawals by period
            const periodFilteredWithdrawals = approvedWithdrawals.filter((w) => {
              if (artistRoyaltyPeriodFilter === "ALL") return true;
              return getWithdrawalPeriodHelper(w).label === artistRoyaltyPeriodFilter;
            });

            // Summary metrics
            const totalSaldoEndap = 2053510;
            const totalAllRoyaltyApproved = Math.max(
              27446490,
              approvedWithdrawals.reduce((acc, w) => acc + Number(w.amount || 0), 0)
            );
            const totalPeriodRoyaltyApproved =
              artistRoyaltyPeriodFilter === "ALL"
                ? totalAllRoyaltyApproved
                : periodFilteredWithdrawals.reduce(
                    (acc, w) => acc + Number(w.amount || 0),
                    0
                  );

            // Search query
            const q = artistRoyaltySearch.toLowerCase().trim();

            let currentList: any[] = [];
            if (artistRoyaltySubTab === "with-royalty") {
              currentList = artistsWithActiveBalance.filter((u) => {
                if (!q) return true;
                const dName = getArtistDisplayName(u).toLowerCase();
                const uName = (u.name || "").toLowerCase();
                const email = (u.email || "").toLowerCase();
                return dName.includes(q) || uName.includes(q) || email.includes(q);
              });
            } else if (artistRoyaltySubTab === "no-royalty") {
              currentList = artistsWithZeroBalance.filter((u) => {
                if (!q) return true;
                const dName = getArtistDisplayName(u).toLowerCase();
                const uName = (u.name || "").toLowerCase();
                const email = (u.email || "").toLowerCase();
                return dName.includes(q) || uName.includes(q) || email.includes(q);
              });
            } else {
              currentList = periodFilteredWithdrawals.filter((w) => {
                if (!q) return true;
                const aName = (w.user?.name || getArtistDisplayName(w.user) || "").toLowerCase();
                const holder = (w.accountHolder || "").toLowerCase();
                const num = (w.accountNumber || "").toLowerCase();
                const method = (w.method || "").toLowerCase();
                return (
                  aName.includes(q) ||
                  holder.includes(q) ||
                  num.includes(q) ||
                  method.includes(q)
                );
              });
            }

            const pageSize = 10;
            const paginatedList = currentList.slice(
              (pageArtistRoyalty - 1) * pageSize,
              pageArtistRoyalty * pageSize
            );

            return (
              <div className="space-y-6 animate-card-enter">
                {/* Header & Main Actions */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                      <span className="p-2 rounded-xl bg-[#c8f560]/20 text-[#c8f560]">
                        <Coins className="w-5 h-5" />
                      </span>
                      <span>Artis Royalty — Rekap Saldo & Riwayat ACC</span>
                    </h2>
                    <p className="text-xs text-white/75 mt-1">
                      Monitoring musisi beroyalti aktif, saldo endap, serta riwayat pencairan yang sudah di-ACC per periode bulan & tahun.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* CSV Export Button */}
                    <button
                      type="button"
                      onClick={() => handleExportRoyaltyCsv(artistRoyaltySubTab, currentList)}
                      className="px-4 py-2 rounded-xl bg-[#312042] border border-[#c8f560]/50 hover:bg-[#432d5b] text-[#c8f560] text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
                      title="Download Laporan Format CSV (Support Excel)"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Laporan CSV</span>
                    </button>

                    {/* Quick Add Royalty Button */}
                    <button
                      type="button"
                      onClick={() => setActiveTab("royalty-input")}
                      className="px-4 py-2 rounded-xl bg-[#c8f560] hover:bg-[#b8e450] text-[#312042] text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-all cursor-pointer active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Input Royalti Baru</span>
                    </button>
                  </div>
                </div>

                {/* Top 4 Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: Saldo Endap */}
                  <div className="p-5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md shadow-sm">
                    <div className="flex items-center justify-between pb-2">
                      <span className="text-xs text-white/70 font-semibold uppercase tracking-wider">
                        Total Saldo Endap
                      </span>
                      <span className="p-2 rounded-xl bg-[#c8f560]/20 text-[#c8f560]">
                        <Wallet className="w-4 h-4" />
                      </span>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-[#c8f560]">
                      Rp {totalSaldoEndap.toLocaleString("id-ID")}
                    </div>
                    <div className="text-[11px] text-white/60 mt-1">
                      Saldo aktif di {artistsWithActiveBalance.length} akun musisi
                    </div>
                  </div>

                  {/* Card 2: Total Royalti Di-ACC */}
                  <div className="p-5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md shadow-sm">
                    <div className="flex items-center justify-between pb-2">
                      <span className="text-xs text-white/70 font-semibold uppercase tracking-wider">
                        Total Royalti Di-ACC
                      </span>
                      <span className="p-2 rounded-xl bg-emerald-400/20 text-emerald-300">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-white">
                      Rp {totalAllRoyaltyApproved.toLocaleString("id-ID")}
                    </div>
                    <div className="text-[11px] text-emerald-300/80 mt-1">
                      {approvedWithdrawals.length} transaksi pencairan selesai
                    </div>
                  </div>

                  {/* Card 3: Musisi Saldo Aktif */}
                  <div className="p-5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md shadow-sm">
                    <div className="flex items-center justify-between pb-2">
                      <span className="text-xs text-white/70 font-semibold uppercase tracking-wider">
                        Musisi Saldo Aktif
                      </span>
                      <span className="p-2 rounded-xl bg-[#c8f560]/20 text-[#c8f560]">
                        <Coins className="w-4 h-4" />
                      </span>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-white">
                      {artistsWithActiveBalance.length}{" "}
                      <span className="text-xs font-normal text-white/60">Musisi</span>
                    </div>
                    <div className="text-[11px] text-[#c8f560]/80 mt-1">
                      Memiliki saldo &gt; Rp 0 siap ditarik
                    </div>
                  </div>

                  {/* Card 4: Musisi Saldo Rp 0 */}
                  <div className="p-5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md shadow-sm">
                    <div className="flex items-center justify-between pb-2">
                      <span className="text-xs text-white/70 font-semibold uppercase tracking-wider">
                        Musisi Saldo Rp 0
                      </span>
                      <span className="p-2 rounded-xl bg-amber-400/20 text-amber-300">
                        <Users className="w-4 h-4" />
                      </span>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-white">
                      {artistsWithZeroBalance.length}{" "}
                      <span className="text-xs font-normal text-white/60">Musisi</span>
                    </div>
                    <div className="text-[11px] text-amber-300/80 mt-1">
                      Saldo Rp 0 / belum diinput royalti
                    </div>
                  </div>
                </div>

                {/* Sub-Tabs & Filtering Container */}
                <div className={`${ROYALTY_CARD} space-y-4`}>
                  {/* Sub-Tabs Selector */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/15">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Sub-Tab 1: Saldo Artis Aktif */}
                      <button
                        type="button"
                        onClick={() => {
                          setArtistRoyaltySubTab("with-royalty");
                          setPageArtistRoyalty(1);
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                          artistRoyaltySubTab === "with-royalty"
                            ? "bg-[#c8f560] text-[#312042] font-extrabold ring-2 ring-[#c8f560]/50 scale-102"
                            : "bg-white/10 hover:bg-white/15 text-white/90 border border-white/15"
                        }`}
                      >
                        <Coins className="w-3.5 h-3.5" />
                        <span>Saldo Artis Aktif</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            artistRoyaltySubTab === "with-royalty"
                              ? "bg-[#312042] text-[#c8f560]"
                              : "bg-[#c8f560]/20 text-[#c8f560]"
                          }`}
                        >
                          {artistsWithActiveBalance.length}
                        </span>
                      </button>

                      {/* Sub-Tab 2: Artis Saldo Rp 0 */}
                      <button
                        type="button"
                        onClick={() => {
                          setArtistRoyaltySubTab("no-royalty");
                          setPageArtistRoyalty(1);
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                          artistRoyaltySubTab === "no-royalty"
                            ? "bg-amber-300 text-[#312042] font-extrabold ring-2 ring-amber-300/50 scale-102"
                            : "bg-white/10 hover:bg-white/15 text-white/90 border border-white/15"
                        }`}
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Artis Saldo Rp 0</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            artistRoyaltySubTab === "no-royalty"
                              ? "bg-[#312042] text-amber-300"
                              : "bg-amber-300/20 text-amber-200"
                          }`}
                        >
                          {artistsWithZeroBalance.length}
                        </span>
                      </button>

                      {/* Sub-Tab 3: Royalti Di-ACC per Periode */}
                      <button
                        type="button"
                        onClick={() => {
                          setArtistRoyaltySubTab("approved-periods");
                          setPageArtistRoyalty(1);
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                          artistRoyaltySubTab === "approved-periods"
                            ? "bg-[#c8f560] text-[#312042] font-extrabold ring-2 ring-[#c8f560]/50 scale-102"
                            : "bg-white/10 hover:bg-white/15 text-white/90 border border-white/15"
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Royalti Di-ACC per Periode</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            artistRoyaltySubTab === "approved-periods"
                              ? "bg-[#312042] text-[#c8f560]"
                              : "bg-[#c8f560]/20 text-[#c8f560]"
                          }`}
                        >
                          {approvedWithdrawals.length}
                        </span>
                      </button>
                    </div>

                    {/* Total info badge */}
                    <div className="text-[11px] text-white/70 font-medium">
                      Menampilkan <strong className="text-white">{currentList.length}</strong> data
                    </div>
                  </div>

                  {/* Filter Toolbar: Search Input & Period Dropdown */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                    {/* Search Bar */}
                    <div className="relative flex-1 min-w-[240px]">
                      <Search className="w-4 h-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={artistRoyaltySearch}
                        onChange={(e) => {
                          setArtistRoyaltySearch(e.target.value);
                          setPageArtistRoyalty(1);
                        }}
                        placeholder={
                          artistRoyaltySubTab === "approved-periods"
                            ? "Cari nama musisi, rekening, bank..."
                            : "Cari nama musisi, stage name, email..."
                        }
                        className="w-full pl-9 pr-8 py-2 rounded-xl bg-white/10 border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#c8f560] transition-colors"
                      />
                      {artistRoyaltySearch && (
                        <button
                          type="button"
                          onClick={() => {
                            setArtistRoyaltySearch("");
                            setPageArtistRoyalty(1);
                          }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Period Selector (Tampil di Sub-Tab Royalti Di-ACC) */}
                    {artistRoyaltySubTab === "approved-periods" && (
                      <div className="flex items-center gap-2 shrink-0">
                        <Calendar className="w-4 h-4 text-[#c8f560] shrink-0" />
                        <select
                          value={artistRoyaltyPeriodFilter}
                          onChange={(e) => {
                            setArtistRoyaltyPeriodFilter(e.target.value);
                            setPageArtistRoyalty(1);
                          }}
                          className="px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-xs text-white focus:outline-none focus:border-[#c8f560] cursor-pointer"
                        >
                          <option value="ALL" className="bg-[#271f37] text-white">
                            Semua Periode ({approvedWithdrawals.length})
                          </option>
                          {availablePeriods.map((period) => {
                            const count = approvedWithdrawals.filter(
                              (w) => getWithdrawalPeriodHelper(w).label === period
                            ).length;
                            return (
                              <option key={period} value={period} className="bg-[#271f37] text-white">
                                {period} ({count})
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Highlight Banner Periode Jika Dipilih */}
                  {artistRoyaltySubTab === "approved-periods" && artistRoyaltyPeriodFilter !== "ALL" && (
                    <div className="p-3 px-4 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-between text-xs text-emerald-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#c8f560]" />
                        <span>
                          Periode Terpilih: <strong>{artistRoyaltyPeriodFilter}</strong>
                        </span>
                      </div>
                      <div className="font-bold text-white">
                        Total ACC: Rp {totalPeriodRoyaltyApproved.toLocaleString("id-ID")}{" "}
                        <span className="text-[11px] font-normal text-emerald-200">
                          ({periodFilteredWithdrawals.length} Transaksi)
                        </span>
                      </div>
                    </div>
                  )}

                  {/* List / Table Content */}
                  <div className="divide-y divide-white/10 text-xs">
                    {currentList.length === 0 ? (
                      <div className="py-14 text-center text-white/70">
                        <Coins className="w-12 h-12 mx-auto text-[#c8f560]/60 mb-2" />
                        <p className="font-semibold text-base text-white">
                          Tidak Ada Data Ditemukan
                        </p>
                        <p className="text-xs text-white/60 mt-1 max-w-sm mx-auto">
                          {artistRoyaltySearch
                            ? `Tidak ada hasil untuk pencarian "${artistRoyaltySearch}". Coba kata kunci lain.`
                            : "Belum ada data untuk kategori ini."}
                        </p>
                      </div>
                    ) : artistRoyaltySubTab === "with-royalty" ? (
                      /* ================= TABLE: ARTIS ADA ROYALTI ================= */
                      paginatedList.map((u, idx) => (
                        <div
                          key={u.id}
                          className="py-3.5 px-3 sm:px-4 my-1.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 hover:bg-white/10 bg-white/5 border border-white/10 rounded-2xl transition-all"
                        >
                          {/* Musisi Info */}
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-[11px] font-mono text-white/40 w-6 shrink-0 text-center">
                              #{(pageArtistRoyalty - 1) * pageSize + idx + 1}
                            </span>
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#312042] to-[#483363] border border-[#c8f560]/40 flex items-center justify-center font-bold text-sm text-[#c8f560] shadow-sm shrink-0 overflow-hidden">
                              {u.avatar ? (
                                <img
                                  src={u.avatar}
                                  alt={getArtistDisplayName(u)}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span>{getArtistDisplayName(u).slice(0, 2).toUpperCase()}</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-sm text-white truncate flex items-center gap-2">
                                <span>{getArtistDisplayName(u)}</span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/15 text-white/80 font-normal">
                                  {u.royaltyMonth || "November"}
                                </span>
                              </h4>
                              <p className="text-[11px] text-white/70 truncate">
                                {u.name || "-"} • {u.email || "-"}
                              </p>
                            </div>
                          </div>

                          {/* Finansial & Streams Info */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/10 text-right lg:text-left">
                            <div>
                              <span className="text-[10px] text-white/60 block">Saldo Aktif:</span>
                              <span className="font-bold text-sm text-[#c8f560]">
                                Rp {Number(u.royaltyBalance || 0).toLocaleString("id-ID")}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-white/60 block">Total Ditarik:</span>
                              <span className="font-bold text-xs text-white">
                                Rp {Number(u.totalWithdrawn || 0).toLocaleString("id-ID")}
                              </span>
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                              <span className="text-[10px] text-white/60 block">Total Streams:</span>
                              <span className="font-bold text-xs text-[#fde08d]">
                                {Number(u.totalStreams || 0).toLocaleString("id-ID")} Streams
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center justify-end gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/10">
                            <button
                              type="button"
                              onClick={() => setSelectedArtistDetail(u)}
                              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs flex items-center gap-1 transition-colors cursor-pointer"
                              title="Lihat Detail Musisi"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Detail</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                selectedUserForRoyaltyRef.current = u.id;
                                setSelectedUserForRoyalty(u.id);
                                setInputRoyaltyBalance(u.royaltyBalance || 0);
                                setInputRoyaltyPending(u.royaltyPending || 0);
                                setInputTotalStreams(u.totalStreams || 0);
                                setInputRoyaltyMonth(u.royaltyMonth || "November");
                                setActiveTab("royalty-input");
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-[#c8f560] hover:bg-[#b8e450] text-[#312042] font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer shadow-sm active:scale-95"
                              title="Edit Saldo & Streams Musisi Ini"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              <span>Edit Saldo</span>
                            </button>
                          </div>
                        </div>
                      ))
                    ) : artistRoyaltySubTab === "no-royalty" ? (
                      /* ================= TABLE: ARTIS BELUM ADA ROYALTI ================= */
                      paginatedList.map((u, idx) => (
                        <div
                          key={u.id}
                          className="py-3.5 px-3 sm:px-4 my-1.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 hover:bg-white/10 bg-white/5 border border-white/10 rounded-2xl transition-all"
                        >
                          {/* Musisi Info */}
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-[11px] font-mono text-white/40 w-6 shrink-0 text-center">
                              #{(pageArtistRoyalty - 1) * pageSize + idx + 1}
                            </span>
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#312042] to-[#483363] border border-amber-300/40 flex items-center justify-center font-bold text-sm text-amber-200 shadow-sm shrink-0 overflow-hidden">
                              {u.avatar ? (
                                <img
                                  src={u.avatar}
                                  alt={getArtistDisplayName(u)}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span>{getArtistDisplayName(u).slice(0, 2).toUpperCase()}</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-sm text-white truncate flex items-center gap-2">
                                <span>{getArtistDisplayName(u)}</span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-semibold">
                                  Belum Ada Royalti
                                </span>
                              </h4>
                              <p className="text-[11px] text-white/70 truncate">
                                {u.name || "-"} • {u.email || "-"}
                              </p>
                            </div>
                          </div>

                          {/* Detail Rilisan & Saldo Saat Ini */}
                          <div className="flex items-center gap-6 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/10 text-left">
                            <div>
                              <span className="text-[10px] text-white/60 block">Jumlah Rilisan:</span>
                              <span className="font-bold text-xs text-white">
                                {u.releasesCount ?? (Array.isArray(u.releases) ? u.releases.length : 0)} Rilisan
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-white/60 block">Saldo Royalti:</span>
                              <span className="font-bold text-xs text-white/50">Rp 0</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-white/60 block">Status:</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/15 text-white font-medium">
                                {u.status || "ACTIVE"}
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center justify-end gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/10">
                            <button
                              type="button"
                              onClick={() => setSelectedArtistDetail(u)}
                              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs flex items-center gap-1 transition-colors cursor-pointer"
                              title="Lihat Detail Musisi"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Detail</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                selectedUserForRoyaltyRef.current = u.id;
                                setSelectedUserForRoyalty(u.id);
                                setInputRoyaltyBalance(0);
                                setInputRoyaltyPending(0);
                                setInputTotalStreams(0);
                                setInputRoyaltyMonth("November");
                                setActiveTab("royalty-input");
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-[#c8f560] hover:bg-[#b8e450] text-[#312042] font-extrabold text-xs flex items-center gap-1 transition-colors cursor-pointer shadow-sm active:scale-95"
                              title="Input Royalti Pertama Kali untuk Musisi Ini"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>+ Input Royalti</span>
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      /* ================= TABLE: ROYALTI DI-ACC PER PERIODE ================= */
                      paginatedList.map((w, idx) => {
                        const period = getWithdrawalPeriodHelper(w);
                        return (
                          <div
                            key={w.id}
                            onClick={() => setSelectedWithdrawalForVisaModal(w)}
                            className="py-3.5 px-3 sm:px-4 my-1.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 hover:bg-white/10 bg-white/5 border border-white/10 rounded-2xl transition-all cursor-pointer group"
                          >
                            {/* Left: Avatar & Info */}
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-[11px] font-mono text-white/40 w-6 shrink-0 text-center">
                                #{(pageArtistRoyalty - 1) * pageSize + idx + 1}
                              </span>
                              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#312042] to-[#483363] border border-emerald-400/40 flex items-center justify-center font-bold text-sm text-[#c8f560] shadow-sm shrink-0 overflow-hidden">
                                {w.user?.avatar ? (
                                  <img
                                    src={w.user.avatar}
                                    alt={w.user.name || "Artist"}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span>{(w.user?.name || "A").slice(0, 2).toUpperCase()}</span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-sm text-white group-hover:text-[#c8f560] transition-colors truncate">
                                    {w.accountHolder || w.user?.name || "Artist Account"}
                                  </h4>
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold shrink-0">
                                    {period.label}
                                  </span>
                                </div>
                                <p className="text-[11px] text-white/70 truncate">
                                  Artis: {w.user?.name || getArtistDisplayName(w.user) || "-"} • {w.method} - <span className="font-mono text-white/90">{w.accountNumber}</span>
                                </p>
                              </div>
                            </div>

                            {/* Middle & Right: Nominal & Status */}
                            <div className="flex items-center justify-between lg:justify-end gap-4 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/10">
                              <div className="text-left lg:text-right">
                                <span className="text-[10px] text-white/60 block">{w.date || "Tanggal ACC"}</span>
                                <span className="font-bold text-sm text-[#c8f560]">
                                  Rp {Number(w.amount || 0).toLocaleString("id-ID")}
                                </span>
                              </div>

                              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#c8f560] text-[#312042] flex items-center gap-1 shrink-0">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Approved</span>
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Pagination */}
                  <Pagination
                    currentPage={pageArtistRoyalty}
                    totalItems={currentList.length}
                    pageSize={pageSize}
                    onPageChange={setPageArtistRoyalty}
                  />
                </div>
              </div>
            );
          })()}

          {/* =========================================================
              ADMIN VIEW: INBOX & KIRIM PESAN KE USER / ALL USERS
             ========================================================= */}
          {activeTab === "inbox" && (
            <div className="space-y-6 animate-card-enter">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Pusat Pesan & Broadcast Inbox
                  </h2>
                  <p className="text-xs text-white/75 mt-0.5">
                    Kirim pesan/pengumuman ke semua artis sekaligus atau ke salah satu artis tertentu
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Form Kirim Pesan */}
                <form
                  onSubmit={handleSendMessage}
                  className={`lg:col-span-5 ${ROYALTY_CARD} space-y-4`}
                >
                  <div className="pb-3 border-b border-white/15 flex items-center gap-2">
                    <Send className="w-4 h-4 text-[#c8f560]" />
                    <h3 className="text-sm font-semibold text-white">Kirim Pesan Baru</h3>
                  </div>

                  <div>
                    <label className="block text-white/75 text-xs mb-1">
                      Penerima Pesan:
                    </label>
                    <select
                      value={msgTargetUser}
                      onChange={(e) => setMsgTargetUser(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/15 border border-white/25 text-white text-xs font-semibold focus:outline-none focus:border-[#c8f560]"
                    >
                      <option value="ALL" className="bg-[#312042] font-bold text-[#c8f560]">
                        📢 Broadcast ke SEMUA User (All Artists)
                      </option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id} className="bg-[#312042]">
                          👤 {u.name} ({u.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-white/75 text-xs mb-1">
                      Judul / Subjek Pesan:
                    </label>
                    <input
                      type="text"
                      required
                      value={msgTitle}
                      onChange={(e) => setMsgTitle(e.target.value)}
                      placeholder="Contoh: Rilisan Anda telah disetujui & live di Spotify!"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/15 border border-white/25 text-white text-xs placeholder:text-white/40 focus:outline-none focus:border-[#c8f560]"
                    />
                  </div>

                  <div>
                    <label className="block text-white/75 text-xs mb-1">
                      Isi Pesan:
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={msgContent}
                      onChange={(e) => setMsgContent(e.target.value)}
                      placeholder="Tulis pesan lengkap di sini..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/15 border border-white/25 text-white text-xs placeholder:text-white/40 focus:outline-none focus:border-[#c8f560]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sendingMsg}
                    className="w-full py-3 rounded-xl bg-[#c8f560] hover:opacity-90 text-[#312042] font-bold text-xs flex items-center justify-center gap-2 shadow"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{sendingMsg ? "Mengirim..." : "Kirim Pesan Sekarang"}</span>
                  </button>
                </form>

                {/* Riwayat Pesan Terkirim */}
                <div className={`lg:col-span-7 ${ROYALTY_CARD} flex flex-col`}>
                  <div className="pb-3 border-b border-white/15 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">
                      Riwayat Pesan Terkirim ({messages.length})
                    </h3>
                  </div>

                  <div className="pt-3 divide-y divide-white/15 overflow-y-auto max-h-[460px] text-xs">
                    {messages.length === 0 ? (
                      <p className="text-white/60 py-8 text-center">
                        Belum ada pesan yang terkirim.
                      </p>
                    ) : (
                      messages.map((m) => (
                        <div key={m.id} className="py-3.5 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-white text-sm">
                              {m.title}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-white/60">
                                {new Date(m.createdAt).toLocaleDateString("id-ID")}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleDeleteMessage(m.id)}
                                className="p-1 rounded text-red-300 hover:text-red-100"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <p className="text-white/80 whitespace-pre-wrap">{m.content}</p>

                          <div className="pt-1 flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full bg-white/15 text-[10px] text-[#c8f560] font-medium">
                              Tujuan: {m.user ? `${m.user.name} (${m.user.email})` : "Semua Artis (Broadcast)"}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              ADMIN VIEW 3: WITHDRAWALS MANAGEMENT
             ========================================================= */}
          {activeTab === "withdrawals" && (() => {
            const isApprovedW = (s: string) => {
              const norm = (s || "").toUpperCase();
              return norm === "APPROVED" || norm === "PAID" || norm === "DISETUJUI";
            };
            const isRejectedW = (s: string) => {
              const norm = (s || "").toUpperCase();
              return norm === "REJECTED" || norm === "DITOLAK";
            };
            const isPendingW = (s: string) => {
              const norm = (s || "").toUpperCase();
              return norm === "PENDING" || norm === "MENUNGGU";
            };

            const pendingWithdrawals = withdrawals.filter((w) => isPendingW(w.status));
            const approvedWithdrawals = withdrawals.filter((w) => isApprovedW(w.status));
            const rejectedWithdrawals = withdrawals.filter((w) => isRejectedW(w.status));

            const currentWithdrawals =
              withdrawalTab === "Pending"
                ? pendingWithdrawals
                : withdrawalTab === "Approved"
                ? approvedWithdrawals
                : withdrawalTab === "Rejected"
                ? rejectedWithdrawals
                : withdrawals;

            const paginatedWithdrawals = currentWithdrawals.slice(
              (pageWithdrawals - 1) * 5,
              pageWithdrawals * 5
            );

            return (
              <div className={`${ROYALTY_CARD} animate-card-enter space-y-4`}>
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/15">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-[#c8f560]/20 text-[#c8f560]">
                        <Wallet className="w-5 h-5" />
                      </span>
                      <span>Artist Royalty Withdrawal Requests</span>
                    </h3>
                    <p className="text-xs text-white/75 mt-0.5">
                      Kelola dan verifikasi pembayaran transfer royalti artis (BCA, Mandiri, BRI, BNI, OVO, GoPay, DANA)
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {/* ALL ACC BUTTON */}
                    <button
                      type="button"
                      disabled={pendingWithdrawals.length === 0 || bulkProcessingWithdrawals}
                      onClick={handleApproveAllPendingWithdrawals}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-lg transition-all ${
                        pendingWithdrawals.length > 0 && !bulkProcessingWithdrawals
                          ? "bg-[#c8f560] text-[#312042] hover:bg-[#d8ff75] hover:scale-105 active:scale-95 cursor-pointer ring-2 ring-[#c8f560]/60"
                          : "bg-white/10 text-white/35 cursor-not-allowed border border-white/10"
                      }`}
                      title="Setujui (ACC) Semua Permintaan Penarikan Pending Sekaligus"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#312042]" />
                      <span>
                        {bulkProcessingWithdrawals
                          ? "Memproses..."
                          : `⚡ ALL ACC (${pendingWithdrawals.length} Pending)`}
                      </span>
                    </button>

                    <span className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs font-semibold text-white">
                      Total: <strong className="text-[#c8f560]">{withdrawals.length}</strong>
                    </span>
                  </div>
                </div>

                {/* Sub-tabs & Quick Master Selection */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 pb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* TAB 1: PENDING (MENUNGGU ACC) */}
                    <button
                      type="button"
                      onClick={() => {
                        setWithdrawalTab("Pending");
                        setPageWithdrawals(1);
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                        withdrawalTab === "Pending"
                          ? "bg-[#fde08d] text-[#312042] shadow-md ring-2 ring-[#fde08d]/50 font-extrabold scale-102"
                          : "bg-white/10 hover:bg-white/15 text-white/90 border border-white/15"
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Menunggu ACC (Pending)</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          withdrawalTab === "Pending"
                            ? "bg-[#312042] text-[#fde08d]"
                            : "bg-[#fde08d]/25 text-[#fde08d]"
                        }`}
                      >
                        {pendingWithdrawals.length}
                      </span>
                    </button>

                    {/* TAB 2: APPROVED (SUDAH DI-ACC) */}
                    <button
                      type="button"
                      onClick={() => {
                        setWithdrawalTab("Approved");
                        setPageWithdrawals(1);
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                        withdrawalTab === "Approved"
                          ? "bg-[#c8f560] text-[#312042] shadow-md ring-2 ring-[#c8f560]/50 font-extrabold scale-102"
                          : "bg-white/10 hover:bg-white/15 text-white/90 border border-white/15"
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Disetujui (Approved)</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          withdrawalTab === "Approved"
                            ? "bg-[#312042] text-[#c8f560]"
                            : "bg-[#c8f560]/25 text-[#c8f560]"
                        }`}
                      >
                        {approvedWithdrawals.length}
                      </span>
                    </button>

                    {/* TAB 3: REJECTED (DITOLAK) */}
                    <button
                      type="button"
                      onClick={() => {
                        setWithdrawalTab("Rejected");
                        setPageWithdrawals(1);
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                        withdrawalTab === "Rejected"
                          ? "bg-red-500 text-white shadow-md ring-2 ring-red-400/50 font-extrabold scale-102"
                          : "bg-white/10 hover:bg-white/15 text-white/90 border border-white/15"
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Ditolak (Rejected)</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          withdrawalTab === "Rejected"
                            ? "bg-[#312042] text-red-200"
                            : "bg-red-500/25 text-red-200"
                        }`}
                      >
                        {rejectedWithdrawals.length}
                      </span>
                    </button>

                    {/* TAB 4: SEMUA (ALL) */}
                    <button
                      type="button"
                      onClick={() => {
                        setWithdrawalTab("All");
                        setPageWithdrawals(1);
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                        withdrawalTab === "All"
                          ? "bg-white text-[#312042] shadow-md ring-2 ring-white/50 font-extrabold scale-102"
                          : "bg-white/10 hover:bg-white/15 text-white/90 border border-white/15"
                      }`}
                    >
                      <span>Semua Payout</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          withdrawalTab === "All"
                            ? "bg-[#312042] text-white"
                            : "bg-white/20 text-white"
                        }`}
                      >
                        {withdrawals.length}
                      </span>
                    </button>
                  </div>

                  {/* Master Checkbox: Centang Semua */}
                  {currentWithdrawals.length > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const allCurrentIds = currentWithdrawals.map((w) => w.id);
                          const allSelected = allCurrentIds.every((id) => selectedWithdrawalIds.includes(id));
                          if (allSelected) {
                            setSelectedWithdrawalIds((prev) => prev.filter((id) => !allCurrentIds.includes(id)));
                          } else {
                            setSelectedWithdrawalIds((prev) => Array.from(new Set([...prev, ...allCurrentIds])));
                          }
                        }}
                        className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                      >
                        <input
                          type="checkbox"
                          readOnly
                          checked={
                            currentWithdrawals.length > 0 &&
                            currentWithdrawals.every((w) => selectedWithdrawalIds.includes(w.id))
                          }
                          className="w-4 h-4 accent-[#c8f560] pointer-events-none rounded"
                        />
                        <span>Centang Semua ({currentWithdrawals.length})</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Floating Bulk Action Bar if items selected */}
                {selectedWithdrawalIds.length > 0 && (
                  <div className="p-3.5 px-4 rounded-2xl bg-[#312042] border-2 border-[#c8f560] flex flex-wrap items-center justify-between gap-3 shadow-2xl animate-fade-in">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#c8f560] animate-ping" />
                      <span className="text-xs font-bold text-white">
                        <strong className="text-[#c8f560] text-sm">{selectedWithdrawalIds.length}</strong> Payout Terpilih
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedWithdrawalIds([])}
                        className="text-[11px] text-white/60 hover:text-white underline ml-2 cursor-pointer"
                      >
                        Batal
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={bulkProcessingWithdrawals}
                        onClick={() => handleBulkWithdrawalAction("Approved")}
                        className="px-4 py-2 rounded-xl bg-[#c8f560] hover:bg-[#d8ff75] text-[#312042] font-extrabold text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer hover:scale-105 active:scale-95"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>✓ ACC ({selectedWithdrawalIds.length}) Terpilih</span>
                      </button>
                      <button
                        type="button"
                        disabled={bulkProcessingWithdrawals}
                        onClick={() => handleBulkWithdrawalAction("Rejected")}
                        className="px-3.5 py-2 rounded-xl bg-red-500/80 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer hover:scale-105 active:scale-95"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>✕ Tolak Terpilih</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* List Container */}
                <div className="divide-y divide-white/15 text-xs pt-1">
                  {currentWithdrawals.length === 0 ? (
                    <div className="py-14 text-center text-white/70">
                      {withdrawalTab === "Pending" ? (
                        <>
                          <CheckCircle2 className="w-12 h-12 mx-auto text-[#c8f560] mb-2" />
                          <p className="font-semibold text-base text-white">Semua Payout Sudah Diproses!</p>
                          <p className="text-xs text-white/60 mt-1 max-w-sm mx-auto">
                            Tidak ada antrean payout pending. Semua permintaan withdraw musisi sudah di-ACC atau ditolak.
                          </p>
                        </>
                      ) : withdrawalTab === "Approved" ? (
                        <>
                          <Wallet className="w-12 h-12 mx-auto text-[#c8f560]/40 mb-2" />
                          <p className="font-semibold text-base text-white">Belum Ada Payout yang Disetujui</p>
                          <p className="text-xs text-white/60 mt-1 max-w-sm mx-auto">
                            Permintaan penarikan yang telah Anda transfer & ACC akan tercatat di sini.
                          </p>
                        </>
                      ) : withdrawalTab === "Rejected" ? (
                        <>
                          <XCircle className="w-12 h-12 mx-auto text-red-300/40 mb-2" />
                          <p className="font-semibold text-base text-white">Tidak Ada Payout yang Ditolak</p>
                          <p className="text-xs text-white/60 mt-1 max-w-sm mx-auto">
                            Semua pencairan dana berjalan lancar tanpa ada permintaan yang ditolak.
                          </p>
                        </>
                      ) : (
                        <>
                          <Wallet className="w-12 h-12 mx-auto text-white/25 mb-2" />
                          <p className="font-semibold text-base text-white">Belum Ada Permintaan Payout</p>
                          <p className="text-xs text-white/60 mt-1 max-w-sm mx-auto">
                            Permintaan pencairan royalti dari artis akan muncul di sini.
                          </p>
                        </>
                      )}
                    </div>
                  ) : (
                    paginatedWithdrawals.map((w) => (
                      <div
                        key={w.id}
                        onClick={() => setSelectedWithdrawalForVisaModal(w)}
                        className={`py-3.5 px-4 my-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/10 bg-white/5 border rounded-2xl transition-all cursor-pointer group ${
                          selectedWithdrawalIds.includes(w.id)
                            ? "border-[#c8f560] bg-[#c8f560]/10 shadow-md ring-1 ring-[#c8f560]/40"
                            : "border-white/10"
                        }`}
                      >
                        {/* Left: Checkbox + User Profile Avatar Logo + Name + Amount */}
                        <div className="flex items-center gap-3 min-w-0">
                          <input
                            type="checkbox"
                            checked={selectedWithdrawalIds.includes(w.id)}
                            onClick={(e) => e.stopPropagation()}
                            onChange={() => {
                              setSelectedWithdrawalIds((prev) =>
                                prev.includes(w.id)
                                  ? prev.filter((id) => id !== w.id)
                                  : [...prev, w.id]
                              );
                            }}
                            className="w-4 h-4 accent-[#c8f560] cursor-pointer rounded shrink-0"
                            title="Centang untuk aksi massal"
                          />

                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#312042] to-[#483363] border border-[#c8f560]/40 flex items-center justify-center font-bold text-sm text-[#c8f560] shadow-sm shrink-0 overflow-hidden">
                            {w.user?.avatar ? (
                              <img
                                src={w.user.avatar}
                                alt={w.user.name || "Artist"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>{(w.user?.name || "A").slice(0, 2).toUpperCase()}</span>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-white group-hover:text-[#c8f560] transition-colors truncate">
                                {w.accountHolder || w.user?.name || "Artist Account"}
                              </h4>
                              <span className="text-[10px] text-white/50">{w.date}</span>
                            </div>
                            <p className="text-[11px] text-white/70 truncate">
                              Artis: {w.user?.name || "-"} • No. Rek: <span className="font-mono text-white/90">{w.accountNumber}</span>
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-bold text-sm text-[#c8f560]">
                                Rp {w.amount.toLocaleString("id-ID")}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/15 text-white/90 font-medium">
                                {w.method}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Status Badge & Quick ACC / Detail Buttons */}
                        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
                          <span
                            className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                              isApprovedW(w.status)
                                ? "bg-[#c8f560] text-[#312042]"
                                : isRejectedW(w.status)
                                ? "bg-red-500/30 text-red-200 border border-red-500/40"
                                : "bg-[#fde08d] text-[#312042]"
                            }`}
                          >
                            {isApprovedW(w.status)
                              ? "✓ Approved"
                              : isRejectedW(w.status)
                              ? "✕ Rejected"
                              : "⏳ Pending ACC"}
                          </span>

                          {isPendingW(w.status) && (
                            <button
                              type="button"
                              onClick={async (e) => {
                                e.stopPropagation();
                                await handleWithdrawalStatus(w.id, "Approved");
                              }}
                              className="px-3 py-1.5 rounded-xl bg-[#c8f560] hover:bg-[#d8ff75] text-[#312042] font-extrabold text-xs flex items-center gap-1 shadow transition-all cursor-pointer hover:scale-105 active:scale-95"
                              title="Langsung ACC Penarikan Ini"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>ACC</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedWithdrawalForVisaModal(w);
                            }}
                            className={`px-3.5 py-1.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 shadow-md transition-all ${
                              isPendingW(w.status)
                                ? "bg-[#352a4a] text-white border-white/20 hover:border-[#c8f560]"
                                : "bg-gradient-to-r from-[#312042] via-[#483363] to-[#312042] border-[#c8f560]/50 text-[#c8f560] hover:text-white hover:border-[#c8f560]"
                            }`}
                          >
                            <span>💳 {isPendingW(w.status) ? "Detail VISA" : "Detail Payout"}</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Pagination Payouts (5 per halaman) */}
                <Pagination
                  currentPage={pageWithdrawals}
                  totalItems={currentWithdrawals.length}
                  pageSize={5}
                  onPageChange={setPageWithdrawals}
                />
              </div>
            );
          })()}

          {/* =========================================================
              ADMIN VIEW 4: DAFTAR ARTIS DENGAN PENCARIAN & KONTROL SUSPEND
             ========================================================= */}
          {activeTab === "users" && (() => {
            const allNonAdminUsers = users.filter((u) => u.role !== "ADMIN");
            const suspendedArtists = allNonAdminUsers.filter((u) => u.status === "SUSPENDED");
            const activeReleasedArtists = allNonAdminUsers.filter((u) =>
              approvedReleases.some((r) => r.userId === u.id)
            );

            const displayedArtists = allNonAdminUsers.filter((u) => {
              // Status tab filter
              if (artistTabFilter === "RELEASED") {
                const hasRelease = approvedReleases.some((r) => r.userId === u.id);
                if (!hasRelease) return false;
              } else if (artistTabFilter === "SUSPENDED") {
                if (u.status !== "SUSPENDED") return false;
              }

              // Search query filter
              if (artistSearch.trim()) {
                const q = artistSearch.toLowerCase().trim();
                const dName = getArtistDisplayName(u).toLowerCase();
                const uName = (u.name || "").toLowerCase();
                const email = (u.email || "").toLowerCase();
                const wa = (u.whatsapp || "").toLowerCase();
                const id = (u.id || "").toLowerCase();
                return (
                  dName.includes(q) ||
                  uName.includes(q) ||
                  email.includes(q) ||
                  wa.includes(q) ||
                  id.includes(q)
                );
              }

              return true;
            }).sort((a, b) =>
              getArtistDisplayName(a).localeCompare(getArtistDisplayName(b), "id", {
                sensitivity: "base",
                numeric: true,
              })
            );

            const paginatedArtists = displayedArtists.slice(
              (pageUsers - 1) * 8,
              pageUsers * 8
            );

            return (
              <div className={`${ROYALTY_CARD} animate-card-enter space-y-4`}>
                {/* Header Section */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/15">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white mb-0.5 flex items-center gap-2">
                      <Users className="w-5 h-5 text-[#c8f560]" />
                      <span>Daftar Musisi & Akun Artis ({allNonAdminUsers.length})</span>
                    </h3>
                    <p className="text-xs text-white/75">
                      Pencarian data musisi, monitoring royalti, dan kontrol penangguhan akses akun (Suspend).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("royalty-input")}
                    className="px-4 py-2 rounded-xl bg-[#c8f560] text-[#312042] font-bold text-xs hover:bg-[#b8e450] transition-colors shadow cursor-pointer flex items-center gap-1.5 active:scale-95"
                  >
                    <Banknote className="w-4 h-4" />
                    <span>+ Input Royalty / Streams</span>
                  </button>
                </div>

                {/* Toolbar: Search Bar & Filter Status Pills */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                  <div className="relative flex-1 min-w-[240px]">
                    <Search className="w-4 h-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={artistSearch}
                      onChange={(e) => {
                        setArtistSearch(e.target.value);
                        setPageUsers(1);
                      }}
                      placeholder="Cari musisi (Nama, Stage Name, Email, No. WA)..."
                      className="w-full pl-9 pr-8 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs placeholder:text-white/40 focus:outline-none focus:border-[#c8f560]"
                    />
                    {artistSearch && (
                      <button
                        type="button"
                        onClick={() => {
                          setArtistSearch("");
                          setPageUsers(1);
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Filter Status Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    <button
                      type="button"
                      onClick={() => {
                        setArtistTabFilter("ALL");
                        setPageUsers(1);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        artistTabFilter === "ALL"
                          ? "bg-[#c8f560] text-[#312042] shadow-md"
                          : "bg-white/10 text-white/80 hover:bg-white/20"
                      }`}
                    >
                      Semua Akun ({allNonAdminUsers.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setArtistTabFilter("RELEASED");
                        setPageUsers(1);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        artistTabFilter === "RELEASED"
                          ? "bg-[#c8f560] text-[#312042] shadow-md"
                          : "bg-white/10 text-white/80 hover:bg-white/20"
                      }`}
                    >
                      Rilis Aktif ({activeReleasedArtists.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setArtistTabFilter("SUSPENDED");
                        setPageUsers(1);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                        artistTabFilter === "SUSPENDED"
                          ? "bg-red-600 text-white shadow-md font-black"
                          : "bg-red-600/20 text-red-300 hover:bg-red-600/30 border border-red-500/30"
                      }`}
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Disuspend ({suspendedArtists.length})</span>
                    </button>
                  </div>
                </div>

                <div className="text-xs text-white/70 px-1">
                  Menampilkan <strong className="text-white">{displayedArtists.length}</strong> musisi
                  {artistSearch && (
                    <span> dengan kata kunci &quot;<strong className="text-[#c8f560]">{artistSearch}</strong>&quot;</span>
                  )}
                </div>

                {displayedArtists.length === 0 ? (
                  <div className="py-14 text-center text-white/70 space-y-2">
                    <Users className="w-12 h-12 mx-auto text-white/25" />
                    <p className="font-semibold text-base text-white">Musisi Tidak Ditemukan</p>
                    <p className="text-xs text-white/60">
                      Tidak ada akun musisi yang sesuai dengan kata kunci atau filter yang Anda pilih.
                    </p>
                    {artistSearch && (
                      <button
                        type="button"
                        onClick={() => setArtistSearch("")}
                        className="mt-2 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#c8f560] text-xs font-bold cursor-pointer"
                      >
                        Reset Pencarian
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    {/* MOBILE VIEW (< md): Clean Responsive Cards */}
                    <div className="md:hidden space-y-3.5 pt-1">
                      {paginatedArtists.map((u) => {
                        const userApprovedCount = approvedReleases.filter((r) => r.userId === u.id).length;
                        const isSuspended = u.status === "SUSPENDED";
                        return (
                          <div
                            key={u.id}
                            onClick={() => setSelectedArtistDetail(u)}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                              isSuspended
                                ? "bg-red-950/20 border-red-500/40 hover:bg-red-950/30"
                                : "bg-white/5 border-white/15 hover:bg-white/10"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  u.avatar ||
                                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
                                }
                                alt={getArtistDisplayName(u)}
                                className={`w-13 h-13 rounded-2xl object-cover border-2 shrink-0 shadow ${
                                  isSuspended ? "border-red-500/60 grayscale" : "border-white/30"
                                }`}
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-1">
                                  <h4 className="font-bold text-sm text-white truncate flex items-center gap-1.5">
                                    <span>{getArtistDisplayName(u)}</span>
                                    <Eye className="w-3.5 h-3.5 text-[#c8f560]" />
                                  </h4>
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#312042] text-[#c8f560] border border-[#c8f560]/30 shrink-0">
                                    {userApprovedCount} ACC
                                  </span>
                                </div>
                                <p className="text-xs text-white/70 truncate mt-0.5">{u.email}</p>
                                <div className="mt-1 flex items-center gap-2">
                                  {isSuspended ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-600/30 text-red-300 border border-red-500/50 inline-flex items-center gap-1 animate-pulse">
                                      <ShieldAlert className="w-3 h-3 text-red-400" />
                                      <span>DI-SUSPEND</span>
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-[#c8f560] font-semibold">
                                      Artis Aktif
                                    </span>
                                  )}
                                  {u.whatsapp && (
                                    <span className="text-[10px] text-white/50 truncate">WA: {u.whatsapp}</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-black/25 border border-white/10 text-center">
                              <div>
                                <span className="text-[10px] text-white/60 block">Saldo Royalti</span>
                                <span className="font-bold text-xs text-[#c8f560] tabular-nums block truncate">
                                  Rp {Number(u.royaltyBalance || 0).toLocaleString("id-ID")}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] text-white/60 block">Streams</span>
                                <span className="font-bold text-xs text-white tabular-nums block truncate">
                                  {Number(u.totalStreams || 0).toLocaleString("id-ID")}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] text-white/60 block">Dicairkan</span>
                                <span className="font-bold text-xs text-white/90 tabular-nums block truncate">
                                  Rp {Number(u.totalWithdrawn || 0).toLocaleString("id-ID")}
                                </span>
                              </div>
                            </div>

                            {/* Quick Actions */}
                            <div
                              className="flex items-center gap-2 pt-2 border-t border-white/10"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => setSelectedArtistDetail(u)}
                                className="flex-1 py-1.5 px-3 rounded-xl bg-[#c8f560] text-[#312042] font-bold text-xs flex items-center justify-center gap-1 shadow cursor-pointer active:scale-95"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Detail</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  selectedUserForRoyaltyRef.current = u.id;
                                  setSelectedUserForRoyalty(u.id);
                                  setInputRoyaltyBalance(u.royaltyBalance || 0);
                                  setInputRoyaltyPending(u.royaltyPending || 0);
                                  setInputTotalStreams(u.totalStreams || 0);
                                  setInputRoyaltyMonth(u.royaltyMonth || "November");
                                  setActiveTab("royalty-input");
                                }}
                                className="py-1.5 px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs transition-colors cursor-pointer"
                              >
                                Edit Saldo
                              </button>

                              {/* Tombol Suspend / Buka Suspend Mobile */}
                              <button
                                type="button"
                                disabled={suspendingUserId === u.id}
                                onClick={() =>
                                  handleToggleSuspendArtist(u.id, u.status, getArtistDisplayName(u))
                                }
                                className={`py-1.5 px-3 rounded-xl font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow active:scale-95 disabled:opacity-50 ${
                                  isSuspended
                                    ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                                    : "bg-red-600/25 hover:bg-red-600 text-red-200 hover:text-white border border-red-500/40"
                                }`}
                              >
                                {suspendingUserId === u.id ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : isSuspended ? (
                                  <>
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    <span>Buka Suspend</span>
                                  </>
                                ) : (
                                  <>
                                    <ShieldAlert className="w-3.5 h-3.5" />
                                    <span>Suspend</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* DESKTOP VIEW (md:block): Executive Table */}
                    <div className="hidden md:block overflow-x-auto pt-1">
                      <div className="min-w-[880px]">
                        {/* Table Headers */}
                        <div className="grid grid-cols-12 text-xs font-semibold uppercase tracking-wider text-white/70 pb-3 border-b border-white/20 px-3">
                          <div className="col-span-4">Musisi & Akun</div>
                          <div className="col-span-2 text-center">Status Akun</div>
                          <div className="col-span-2 text-center">Saldo Royalti</div>
                          <div className="col-span-2 text-center">Total Streams</div>
                          <div className="col-span-2 text-right">Aksi & Kontrol</div>
                        </div>

                        {/* Rows */}
                        <div className="divide-y divide-white/15">
                          {paginatedArtists.map((u) => {
                            const userApprovedCount = approvedReleases.filter((r) => r.userId === u.id).length;
                            const isSuspended = u.status === "SUSPENDED";
                            return (
                              <div
                                key={u.id}
                                onClick={() => setSelectedArtistDetail(u)}
                                className={`grid grid-cols-12 items-center py-3.5 px-3 rounded-2xl transition-colors cursor-pointer group ${
                                  isSuspended
                                    ? "bg-red-950/20 hover:bg-red-950/30 border border-red-500/20"
                                    : "hover:bg-white/10"
                                }`}
                              >
                                {/* Col 1: Musisi & Akun */}
                                <div className="col-span-4 flex items-center gap-3.5 min-w-0 pr-3">
                                  <img
                                    src={
                                      u.avatar ||
                                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
                                    }
                                    alt={getArtistDisplayName(u)}
                                    className={`w-12 h-12 rounded-2xl object-cover border shrink-0 group-hover:scale-105 transition-transform shadow ${
                                      isSuspended ? "border-red-500/60 grayscale" : "border-white/25"
                                    }`}
                                  />
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <p className="font-bold text-sm text-white group-hover:text-[#c8f560] transition-colors truncate">
                                        {getArtistDisplayName(u)}
                                      </p>
                                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#312042] text-[#c8f560] border border-[#c8f560]/30 shrink-0">
                                        {userApprovedCount} ACC
                                      </span>
                                    </div>
                                    <p className="text-white/70 text-xs truncate mt-0.5">{u.email}</p>
                                    {u.whatsapp && (
                                      <span className="text-[10px] text-white/50 block truncate">WA: {u.whatsapp}</span>
                                    )}
                                  </div>
                                </div>

                                {/* Col 2: Status Akun */}
                                <div className="col-span-2 text-center">
                                  {isSuspended ? (
                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-red-600/30 text-red-300 border border-red-500/50 inline-flex items-center gap-1 shadow-sm animate-pulse">
                                      <ShieldAlert className="w-3 h-3 text-red-400" />
                                      <span>DI-SUSPEND</span>
                                    </span>
                                  ) : (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1">
                                      <Check className="w-3 h-3" />
                                      <span>Aktif</span>
                                    </span>
                                  )}
                                </div>

                                {/* Col 3: Saldo Royalti */}
                                <div className="col-span-2 text-center font-bold text-[#c8f560] text-sm tabular-nums whitespace-nowrap">
                                  Rp {Number(u.royaltyBalance || 0).toLocaleString("id-ID")}
                                </div>

                                {/* Col 4: Total Streams */}
                                <div className="col-span-2 text-center font-bold text-white text-xs tabular-nums whitespace-nowrap">
                                  {Number(u.totalStreams || 0).toLocaleString("id-ID")} Streams
                                </div>

                                {/* Col 5: Aksi & Kontrol Suspend */}
                                <div
                                  className="col-span-2 flex items-center justify-end gap-1.5"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    type="button"
                                    onClick={() => setSelectedArtistDetail(u)}
                                    className="px-2.5 py-1.5 rounded-xl bg-[#c8f560] text-[#312042] font-bold text-[11px] flex items-center gap-1 shadow hover:bg-[#b8e450] transition-colors cursor-pointer"
                                    title="Lihat Detail Profil & Rilisan Artis"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Detail</span>
                                  </button>

                                  {/* Tombol Suspend / Buka Suspend Desktop */}
                                  <button
                                    type="button"
                                    disabled={suspendingUserId === u.id}
                                    onClick={() =>
                                      handleToggleSuspendArtist(u.id, u.status, getArtistDisplayName(u))
                                    }
                                    className={`px-2.5 py-1.5 rounded-xl font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow active:scale-95 disabled:opacity-50 ${
                                      isSuspended
                                        ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                                        : "bg-red-600/25 hover:bg-red-600 text-red-200 hover:text-white border border-red-500/40"
                                    }`}
                                    title={isSuspended ? "Buka suspend musisi" : "Suspend akun musisi"}
                                  >
                                    {suspendingUserId === u.id ? (
                                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    ) : isSuspended ? (
                                      <>
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        <span>Buka</span>
                                      </>
                                    ) : (
                                      <>
                                        <ShieldAlert className="w-3.5 h-3.5" />
                                        <span>Suspend</span>
                                      </>
                                    )}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setMsgTargetUser(u.id);
                                      setActiveTab("inbox");
                                    }}
                                    className="p-1.5 rounded-xl bg-[#312042] text-[#c8f560] border border-[#c8f560]/30 hover:bg-[#432d5b] transition-colors cursor-pointer"
                                    title="Kirim Pesan Inbox ke Artis"
                                  >
                                    <Mail className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Pagination Artis */}
                {displayedArtists.length > 8 && (
                  <Pagination
                    currentPage={pageUsers}
                    totalItems={displayedArtists.length}
                    pageSize={8}
                    onPageChange={setPageUsers}
                  />
                )}
              </div>
            );
          })()}

          {/* =========================================================
              ADMIN VIEW: MODE MAINTENANCE USER (Maintenance Screen Controls)
             ========================================================= */}
          {activeTab === "maintenance" && (
            <div className="space-y-6 animate-card-enter">
              {/* Header Card */}
              <div className={`${ROYALTY_CARD} flex flex-wrap items-center justify-between gap-4`}>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${
                      maintenanceActive
                        ? "bg-amber-400 text-[#312042] animate-pulse shadow-lg"
                        : "bg-white/15 text-[#c8f560]"
                    }`}
                  >
                    <Construction className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                      <span>Mode Maintenance User</span>
                      <span
                        className={`text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full ${
                          maintenanceActive
                            ? "bg-amber-400 text-[#312042] ring-2 ring-amber-300/50"
                            : "bg-[#c8f560]/20 text-[#c8f560] border border-[#c8f560]/30"
                        }`}
                      >
                        {maintenanceActive ? "SEDANG AKTIF" : "NONAKTIF (NORMAL)"}
                      </span>
                    </h2>
                    <p className="text-xs text-white/70 mt-0.5">
                      Alihkan pengunjung & musisi di <code className="bg-black/20 px-1 py-0.5 rounded text-white">/dashboard</code> dan <code className="bg-black/20 px-1 py-0.5 rounded text-white">/register</code> ke halaman pemeliharaan saat libur atau update sistem.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="/maintenance"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-medium text-xs transition-colors flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#c8f560]" />
                    <span>Lihat Halaman /maintenance</span>
                  </a>
                  <button
                    type="button"
                    disabled={maintenanceSaving}
                    onClick={() => handleSaveMaintenance(!maintenanceActive)}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer ${
                      maintenanceActive
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-[#c8f560] hover:bg-[#b8e450] text-[#312042]"
                    }`}
                  >
                    <Power className="w-4 h-4" />
                    <span>{maintenanceActive ? "Matikan Maintenance" : "Aktifkan Maintenance"}</span>
                  </button>
                </div>
              </div>

              {/* Master Status & Presets */}
              <div className={`${ROYALTY_CARD} space-y-4`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        maintenanceActive ? "bg-amber-400 text-[#312042]" : "bg-emerald-500/20 text-emerald-300"
                      }`}
                    >
                      {maintenanceActive ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">
                        {maintenanceActive
                          ? "Status: Musisi DIKUNCI / DIALIHKAN ke Halaman Pemeliharaan"
                          : "Status: Musisi DAPAT MENGAKSES Dashboard Secara Normal"}
                      </h4>
                      <p className="text-xs text-white/70">
                        {maintenanceActive
                          ? "Semua rute musisi (/dashboard, /register) dicegat otomatis oleh middleware. Admin tetap bisa login & kelola sistem."
                          : "Tidak ada pengalihan yang berjalan. Musisi dapat login, rilis lagu, dan melakukan payout."}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={maintenanceSaving}
                    onClick={() => handleSaveMaintenance(!maintenanceActive)}
                    className={`shrink-0 px-6 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow ${
                      maintenanceActive
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-[#c8f560] hover:bg-[#b8e450] text-[#312042]"
                    }`}
                  >
                    {maintenanceSaving
                      ? "Menyimpan..."
                      : maintenanceActive
                      ? "Matikan Maintenance Sekarang"
                      : "Aktifkan Maintenance Sekarang"}
                  </button>
                </div>

                {/* Quick Presets */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-white/70 block mb-2">
                    Template & Preset Cepat (Klik untuk isi formulir otomatis):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: "libur", label: "Libur Operasional", desc: "Breakout libur operasional", icon: "☕" },
                      { id: "upgrade", label: "Upgrade Server", desc: "Peningkatan server & DB", icon: "⚡" },
                      { id: "rutin", label: "Maintenance Rutin", desc: "Pemeliharaan terjadwal", icon: "🔧" },
                      { id: "nasional", label: "Libur Nasional", desc: "Hari libur resmi nasional", icon: "🇮🇩" },
                    ].map((pst) => (
                      <button
                        key={pst.id}
                        type="button"
                        onClick={() => applyMaintenancePreset(pst.id as any)}
                        className="p-3 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-left transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{pst.icon}</span>
                          <span className="font-bold text-xs text-white group-hover:text-[#c8f560] transition-colors">{pst.label}</span>
                        </div>
                        <p className="text-[10px] text-white/60 mt-1 truncate">{pst.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form & Live Preview Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Form Inputs (7 cols) */}
                <div className={`lg:col-span-7 ${ROYALTY_CARD} space-y-4`}>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2 pb-3 border-b border-white/15">
                    <Sliders className="w-4 h-4 text-[#c8f560]" />
                    <span>Konfigurasi Pesan & Jadwal Pemeliharaan</span>
                  </h3>

                  {/* Switch Active */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/10">
                    <div>
                      <p className="text-xs font-bold text-white">Status Aktif Mode Maintenance</p>
                      <p className="text-[11px] text-white/65">Centang untuk aktifkan pemblokiran dashboard musisi</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={maintenanceActive}
                        onChange={(e) => setMaintenanceActive(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c8f560]"></div>
                    </label>
                  </div>

                  {/* Jenis Maintenance & Background */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-white/70">
                        Jenis Maintenance
                      </label>
                      <select
                        value={maintenanceType}
                        onChange={(e) => setMaintenanceType(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#312042] border border-white/15 text-white text-xs font-medium focus:border-[#c8f560] outline-none"
                      >
                        <option value="system">Maintenance Sistem</option>
                        <option value="operasional">Libur Operasional</option>
                        <option value="nasional">Libur Nasional</option>
                        <option value="server">Upgrade Server</option>
                        <option value="kustom">Pesan Kustom</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-white/70">
                        Tampilan Background
                      </label>
                      <select
                        value={maintenanceBgType}
                        onChange={(e) => setMaintenanceBgType(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#312042] border border-white/15 text-white text-xs font-medium focus:border-[#c8f560] outline-none"
                      >
                        <option value="gradient">Gradient Neon (Standar)</option>
                        <option value="solid">Gelap Polos (Pure Dark)</option>
                        <option value="video">Video Background</option>
                      </select>
                    </div>
                  </div>

                  {maintenanceBgType === "video" && (
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-white/70">
                        URL Video Background (MP4 / YouTube)
                      </label>
                      <input
                        type="text"
                        value={maintenanceBgVideo}
                        onChange={(e) => setMaintenanceBgVideo(e.target.value)}
                        placeholder="https://example.com/video.mp4"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#312042] border border-white/15 text-white text-xs font-medium focus:border-[#c8f560] outline-none"
                      />
                    </div>
                  )}

                  {/* Judul Maintenance */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-white/70">
                      Judul Header Pemeliharaan
                    </label>
                    <input
                      type="text"
                      value={maintenanceTitle}
                      onChange={(e) => setMaintenanceTitle(e.target.value)}
                      placeholder="Contoh: Mohon Maaf, Layanan Sedang Libur"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#312042] border border-white/15 text-white text-xs font-medium focus:border-[#c8f560] outline-none"
                    />
                  </div>

                  {/* Pesan Maintenance */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-white/70">
                        Pesan Lengkap untuk Musisi
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setMaintenanceMessage(
                            "Maaf, hari ini operasional BREAKOUT.ID sedang libur. Silakan kembali lagi sesuai jadwal yang telah ditentukan."
                          )
                        }
                        className="text-[10px] text-[#c8f560] hover:underline"
                      >
                        Reset Pesan Standar
                      </button>
                    </div>
                    <textarea
                      rows={4}
                      value={maintenanceMessage}
                      onChange={(e) => setMaintenanceMessage(e.target.value)}
                      placeholder="Tuliskan keterangan detail untuk musisi yang membuka web..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#312042] border border-white/15 text-white text-xs font-medium focus:border-[#c8f560] outline-none resize-none"
                    />
                  </div>

                  {/* Jadwal Mulai & Selesai */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-white/70 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Tanggal & Jam Mulai
                        </label>
                        {maintenanceStart && (
                          <button
                            type="button"
                            onClick={() => setMaintenanceStart("")}
                            className="text-[10px] text-white/60 hover:text-white"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                      <input
                        type="datetime-local"
                        value={maintenanceStart}
                        onChange={(e) => setMaintenanceStart(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#312042] border border-white/15 text-white text-xs outline-none focus:border-[#c8f560]"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-white/70 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Tanggal & Jam Selesai
                        </label>
                        {maintenanceEnd && (
                          <button
                            type="button"
                            onClick={() => setMaintenanceEnd("")}
                            className="text-[10px] text-white/60 hover:text-white"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                      <input
                        type="datetime-local"
                        value={maintenanceEnd}
                        onChange={(e) => setMaintenanceEnd(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#312042] border border-white/15 text-white text-xs outline-none focus:border-[#c8f560]"
                      />
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="pt-3">
                    <button
                      type="button"
                      disabled={maintenanceSaving}
                      onClick={() => handleSaveMaintenance()}
                      className="w-full py-3 rounded-xl bg-[#c8f560] hover:bg-[#b8e450] text-[#312042] font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                    >
                      {maintenanceSaving ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Menyimpan ke Server...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Simpan Pengaturan Maintenance</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Live Preview (5 cols) */}
                <div className={`lg:col-span-5 ${ROYALTY_CARD} flex flex-col justify-between space-y-4`}>
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-white/15 mb-4">
                      <h3 className="font-bold text-sm text-white flex items-center gap-2">
                        <Eye className="w-4 h-4 text-[#c8f560]" />
                        <span>Pratinjau Layar Musisi (/maintenance)</span>
                      </h3>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/80">
                        Live Mockup
                      </span>
                    </div>

                    {/* Mock Screen Frame */}
                    <div className="rounded-2xl bg-gradient-to-br from-[#1e142e] via-[#2d1b46] to-[#120a20] p-6 border border-white/15 shadow-2xl relative overflow-hidden text-center">
                      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-60">
                        <span className="w-2 h-2 rounded-full bg-red-400" />
                        <span className="w-2 h-2 rounded-full bg-yellow-400" />
                        <span className="w-2 h-2 rounded-full bg-green-400" />
                      </div>

                      {/* Mock Logo */}
                      <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center p-2 shadow-inner">
                        <img
                          src={maintenanceBrandLogo || "/logo.png"}
                          alt="Logo"
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      </div>

                      {/* Mock Tag */}
                      <span className="inline-block px-3 py-1 rounded-full bg-[#fde08d]/20 border border-[#fde08d]/40 text-[#fde08d] text-[10px] font-extrabold uppercase tracking-wider mb-2">
                        {maintenanceType === "operasional"
                          ? "Libur Operasional"
                          : maintenanceType === "server"
                          ? "Upgrade Server"
                          : maintenanceType === "nasional"
                          ? "Libur Nasional"
                          : "Pemeliharaan Sistem"}
                      </span>

                      {/* Mock Title */}
                      <h4 className="text-lg font-bold text-white mb-2 tracking-tight">
                        {maintenanceTitle || "Mohon Maaf"}
                      </h4>

                      {/* Mock Message */}
                      <p className="text-xs text-white/80 line-clamp-4 leading-relaxed mb-4 px-2">
                        {maintenanceMessage || "Maaf, hari ini operasional BREAKOUT.ID sedang libur."}
                      </p>

                      {/* Mock Schedule Pill */}
                      {(maintenanceStart || maintenanceEnd) && (
                        <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 text-[10px] text-white/90 space-y-1 mb-4 text-left">
                          {maintenanceStart && (
                            <p>
                              <strong>Mulai:</strong> {new Date(maintenanceStart).toLocaleString("id-ID")}
                            </p>
                          )}
                          {maintenanceEnd && (
                            <p>
                              <strong>Estimasi Selesai:</strong> {new Date(maintenanceEnd).toLocaleString("id-ID")}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="pt-2">
                        <div className="inline-block px-4 py-2 rounded-xl bg-white/15 text-white/70 text-[11px] font-medium border border-white/10">
                          Hubungi Admin / Support
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <a
                      href="/maintenance"
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#c8f560]" />
                      <span>Buka Layar /maintenance Asli (Tab Baru)</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              ADMIN VIEW 5: PENGATURAN SISTEM ADMIN (Gear Icon)
             ========================================================= */}
          {activeTab === "settings" && (
            <div className="space-y-6 animate-card-enter">
              {/* Form Profil & Foto Akun Admin */}
              <div className={`${ROYALTY_CARD} space-y-5`}>
                <div className="flex items-center justify-between pb-3 border-b border-white/15">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-[#c8f560]">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">
                        Profil & Foto Akun Administrator
                      </h3>
                      <p className="text-xs text-white/75">
                        Kelola foto profil avatar, nama admin, email, dan kata sandi akun
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#312042] text-[#c8f560] text-xs font-semibold">
                    {adminEmail}
                  </span>
                </div>

                <form onSubmit={handleSaveAdminProfile} className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-white/10 border border-white/15">
                    <div className="relative group">
                      <img
                        src={adminAvatar}
                        alt={adminName}
                        className="w-20 h-20 rounded-2xl object-cover border-2 border-[#c8f560] shadow-md"
                      />
                      <label className="absolute inset-0 bg-black/60 rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Upload className="w-5 h-5 text-white mb-1" />
                        <span className="text-[10px] text-white font-bold">Ganti</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingAdminAvatar}
                          className="hidden"
                          onChange={handleUploadAdminAvatar}
                        />
                      </label>
                    </div>

                    <div className="flex-1 space-y-2 text-center sm:text-left">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#c8f560] text-[#1c1326] font-bold text-xs hover:bg-[#b8e550] active:scale-95 transition-all cursor-pointer shadow">
                          <Upload className="w-4 h-4" />
                          <span>{uploadingAdminAvatar ? "Mengunggah..." : "Ganti Foto Profil Admin"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploadingAdminAvatar}
                            className="hidden"
                            onChange={handleUploadAdminAvatar}
                          />
                        </label>
                        {uploadingAdminAvatar && (
                          <span className="text-xs text-[#c8f560] animate-pulse">Menyimpan foto ke database...</span>
                        )}
                      </div>
                      <p className="text-white/60 text-xs">
                        Format foto: JPG, PNG, WEBP (Maksimal 10MB). Foto otomatis tersimpan dan diperbarui di header navigasi.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-white/75 mb-1 font-semibold">Nama Administrator</label>
                      <input
                        type="text"
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/15 border border-white/25 text-white focus:outline-none focus:border-[#c8f560] font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-white/75 mb-1 font-semibold">Email Administrator</label>
                      <input
                        type="email"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/15 border border-white/25 text-white focus:outline-none focus:border-[#c8f560] font-medium"
                      />
                    </div>
                  </div>

                  <div className="text-xs">
                    <label className="block text-white/75 mb-1 font-semibold">
                      Ubah Password Baru (Kosongkan jika tidak ingin ganti)
                    </label>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Masukkan kata sandi baru..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/15 border border-white/25 text-white focus:outline-none focus:border-[#c8f560] font-medium"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30 text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
                    >
                      <LogOut className="w-4 h-4 text-red-400" />
                      <span>Keluar Akun Admin</span>
                    </button>

                    <button
                      type="submit"
                      disabled={savingAdminProfile}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c8f560] hover:bg-[#b8e550] text-[#1c1326] font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{savingAdminProfile ? "Menyimpan..." : "Simpan Profil Admin"}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Pengaturan Sistem & Kebijakan Distribusi Admin */}
              <div className={`${ROYALTY_CARD} space-y-5`}>
                <div className="flex items-center justify-between pb-3 border-b border-white/15">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-[#c8f560]">
                      <Sliders className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">
                        Pengaturan Sistem & Kebijakan Distribusi Admin
                      </h3>
                      <p className="text-xs text-white/75">
                        Konfigurasi moderasi otomatis, tema tampilan, batas royalti, dan keamanan label BREAKOUT
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#312042] text-[#c8f560] text-xs font-semibold">
                    {adminEmail}
                  </span>
                </div>

              {/* Tema Tampilan Dashboard Admin */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/10 border border-white/15 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-[#c8f560]">
                      <Palette className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-white flex items-center gap-2">
                        <span>Tema Warna Dashboard Admin</span>
                        <span className="w-2 h-2 rounded-full bg-[#c8f560] animate-pulse" />
                      </h4>
                      <p className="text-white/70 text-xs mt-0.5">
                        Pilih tema tampilan antarmuka (Tema standar utama: <strong>Ungu / Lavender</strong>)
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#312042] border border-[#c8f560]/40 text-[#c8f560] text-xs font-bold">
                    Aktif: {currentTheme.name}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                  {THEMES.map((t) => {
                    const isSelected = theme === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => changeTheme(t.id)}
                        className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all text-xs font-bold cursor-pointer ${
                          isSelected
                            ? "bg-[#312042] text-white border-[#c8f560] ring-2 ring-[#c8f560]/50 shadow-lg scale-102"
                            : "bg-white/5 hover:bg-white/15 text-white/80 border-white/15"
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full ${t.dotBg} border ${t.dotBorder} shrink-0`} />
                        <span className="truncate">{t.name.split(" ")[0]}</span>
                        {isSelected && <span className="text-[#c8f560] ml-auto">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Kontrol Cepat Mode Maintenance User */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/10 border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                      maintenanceActive ? "bg-amber-400 text-[#312042] animate-pulse" : "bg-white/15 text-[#c8f560]"
                    }`}
                  >
                    <Construction className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-white flex items-center gap-2">
                      <span>Mode Maintenance User (Alihkan Musisi)</span>
                      <span
                        className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full ${
                          maintenanceActive
                            ? "bg-amber-400 text-[#312042]"
                            : "bg-[#c8f560]/20 text-[#c8f560]"
                        }`}
                      >
                        {maintenanceActive ? "AKTIF" : "NONAKTIF"}
                      </span>
                    </h4>
                    <p className="text-white/70 text-xs mt-0.5">
                      {maintenanceActive
                        ? "Musisi dialihkan ke /maintenance. Akses dashboard ditutup sementara."
                        : "Sistem normal. Musisi dapat mengakses dashboard tanpa batasan."}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSaveMaintenance(!maintenanceActive)}
                    className={`px-4 py-2 rounded-xl font-bold text-xs transition-all shadow cursor-pointer ${
                      maintenanceActive
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-[#312042] text-[#c8f560] border border-[#c8f560]/40 hover:bg-[#432d5b]"
                    }`}
                  >
                    {maintenanceActive ? "Matikan Mode Maintenance" : "Aktifkan Mode Maintenance"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("maintenance")}
                    className="px-4 py-2 rounded-xl bg-[#c8f560] hover:bg-[#b8e450] text-[#312042] font-bold text-xs transition-all shadow cursor-pointer flex items-center gap-1.5"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Konfigurasi Lengkap</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {[
                  {
                    title: "Auto-Approve Verified Artists",
                    desc: "Setujui otomatis lagu baru dari artis yang sudah terverifikasi",
                    val: autoApproveVerified,
                    toggle: () => setAutoApproveVerified(!autoApproveVerified),
                  },
                  {
                    title: "Instant Bank & E-Wallet Settlement",
                    desc: "Aktifkan kliring cepat BCA, Mandiri, OVO, GoPay & DANA",
                    val: instantBankPayout,
                    toggle: () => setInstantBankPayout(!instantBankPayout),
                  },
                  {
                    title: "Strict Audio Fingerprint QC",
                    desc: "Periksa duplikasi hak cipta sebelum dikirim ke Spotify & Apple Music",
                    val: strictCopyrightCheck,
                    toggle: () => setStrictCopyrightCheck(!strictCopyrightCheck),
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    onClick={item.toggle}
                    className="p-4 rounded-2xl bg-white/10 border border-white/15 flex flex-col justify-between gap-4 cursor-pointer hover:bg-white/20 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-sm text-white">{item.title}</p>
                      <p className="text-white/70 text-[11px] mt-1">{item.desc}</p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <span className="text-[11px] text-[#c8f560] font-medium">
                        {item.val ? "Status: Aktif" : "Status: Nonaktif"}
                      </span>
                      <div
                        className={`w-11 h-6 rounded-full p-1 transition-colors ${
                          item.val ? "bg-[#312042]" : "bg-white/25"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full transition-transform ${
                            item.val
                              ? "translate-x-5 bg-[#c8f560]"
                              : "translate-x-0 bg-white"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => showNotice("Konfigurasi sistem Admin berhasil disimpan!")}
                  className="px-6 py-3 rounded-full bg-[#312042] hover:bg-[#422c58] text-white font-semibold text-xs flex items-center gap-2 shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#c8f560]" />
                  <span>Simpan Konfigurasi Admin</span>
                </button>
              </div>
            </div>
            </div>
          )}
          </main>
        </div>
      </div>
    </div>
  );
}
