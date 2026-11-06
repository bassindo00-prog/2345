"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  Music,
  CheckCircle,
  Clock,
  DollarSign,
  ArrowRight,
  TrendingUp,
  Globe,
  BookOpen,
  CloudLightning,
  Sparkles,
} from "lucide-react";

type MonthlyPayout = {
  month: string;
  amount: number;
};

type OverviewData = {
  totalArtists: number;
  pendingArtists: number;
  totalReleases: number;
  pendingReleases: number;
  totalRevenue: number;
  saldoEndap?: number;
  totalClearedPayout?: number;
  pendingWithdrawals: number;
  monthlyApprovedPayouts?: MonthlyPayout[];
  recentWithdrawals: any[];
  recentArtists: any[];
};

export function AdminOverviewClient({ data }: { data: OverviewData }) {
  const [currency, setCurrency] = useState<"IDR" | "USD">("IDR");
  const exchangeRate = 16200;

  const formatCurrency = (amount: number = 0) => {
    if (currency === "USD") {
      return (
        "$" +
        (amount / exchangeRate).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    }
    return "Rp " + Math.round(amount).toLocaleString("id-ID");
  };

  const chartData =
    data.monthlyApprovedPayouts && data.monthlyApprovedPayouts.length > 0
      ? data.monthlyApprovedPayouts
      : [
          { month: "Jan", amount: 0 },
          { month: "Feb", amount: 0 },
          { month: "Mar", amount: 0 },
          { month: "Apr", amount: 0 },
          { month: "Mei", amount: 0 },
          { month: "Jun", amount: 0 },
          { month: "Jul", amount: 0 },
          { month: "Agu", amount: 0 },
          { month: "Sep", amount: 0 },
          { month: "Okt", amount: 0 },
          { month: "Nov", amount: data.totalClearedPayout || 0 },
          { month: "Des", amount: 0 },
        ];

  const currentMonthIdx = new Date().getMonth();
  const displayedSaldoEndap =
    data.saldoEndap !== undefined
      ? data.saldoEndap
      : Math.max(
          0,
          data.totalRevenue -
            (data.totalClearedPayout || 0) -
            (data.pendingWithdrawals || 0)
        );

  return (
    <div className="w-full pb-14 space-y-6 animate-fade-in text-white">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome Back, Admin!
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#c8f560] text-[#1a1024] text-[10px] font-black uppercase tracking-wider">
              Super Admin
            </span>
          </div>
          <p className="text-xs sm:text-sm text-white/70 mt-1">
            Executive label distribution & royalty settlement control center
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Currency Toggle */}
          <div className="flex bg-black/40 backdrop-blur-md rounded-2xl p-1 border border-white/15">
            <button
              onClick={() => setCurrency("IDR")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                currency === "IDR"
                  ? "bg-[#c8f560] text-[#1a1024] shadow-sm"
                  : "text-white/70 hover:text-white"
              }`}
            >
              IDR
            </button>
            <button
              onClick={() => setCurrency("USD")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                currency === "USD"
                  ? "bg-[#c8f560] text-[#1a1024] shadow-sm"
                  : "text-white/70 hover:text-white"
              }`}
            >
              USD
            </button>
          </div>

          <Link
            href="/admin/withdrawals"
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#c8f560] hover:bg-[#d6ff73] text-[#1a1024] font-bold text-xs shadow-lg shadow-[#c8f560]/20 transition-all active:scale-95"
          >
            <DollarSign className="w-4 h-4" />
            <span>ACC Penarikan Dana</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: Card 1 (VISA) & Card 2 (Monthly ACC Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Card 1: Luxury VISA Card for Total Royalty Musisi */}
        <div className="lg:col-span-5 rounded-3xl p-6 sm:p-7 relative overflow-hidden text-white shadow-2xl border border-white/20 bg-gradient-to-br from-[#4d3765] via-[#3c2952] to-[#251736] flex flex-col justify-between min-h-[290px]">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#c8f560]/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold tracking-widest uppercase text-white/80">
                TOTAL ROYALTY MUSISI (SALDO ENDAP)
              </span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#c8f560] animate-pulse" />
                <span className="text-xs font-black tracking-wider text-[#c8f560]">
                  VISA INFINITE
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 my-3">
              {/* Gold Chip */}
              <div className="w-11 h-8 rounded-lg bg-gradient-to-br from-[#f3db8b] via-[#d4af37] to-[#aa8018] border border-[#ffecb3]/80 shadow-md flex items-center justify-center shrink-0">
                <div className="w-6 h-4 border border-black/30 rounded-[2px]" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#c8f560] tracking-tight truncate">
                {formatCurrency(displayedSaldoEndap)}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-white/70 mt-2">
              <span className="font-mono tracking-widest text-[11px]">
                4532 •••• •••• 9924
              </span>
              <span className="text-[11px] font-medium text-white/90">
                {data.totalArtists} Musisi Aktif • Saldo Endap
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-white/15 mt-5">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-2.5 rounded-2xl bg-black/30 border border-white/10">
                <p className="text-[10px] text-white/60 font-medium">Cleared Payout (ACC)</p>
                <p className="text-xs sm:text-sm font-bold text-white mt-0.5 truncate">
                  {formatCurrency(data.totalClearedPayout || 0)}
                </p>
              </div>
              <div className="p-2.5 rounded-2xl bg-black/30 border border-white/10">
                <p className="text-[10px] text-[#fde08d] font-medium">Antrean Withdraw</p>
                <p className="text-xs sm:text-sm font-bold text-[#fde08d] mt-0.5 truncate">
                  {formatCurrency(data.pendingWithdrawals || 0)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-white/60">
                Breakout Label • Executive
              </span>
              <Link
                href="/admin/withdrawals"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#c8f560] hover:bg-[#d4ff6b] text-[#1a1024] font-bold text-xs shadow transition active:scale-95"
              >
                <span>Kelola Antrean</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Card 2: Grafik Bulanan Royalti Yang Udah Di-ACC */}
        <div className="lg:col-span-7 rounded-3xl p-6 relative overflow-hidden text-white shadow-2xl border border-white/15 bg-gradient-to-br from-[#3b274e] via-[#2f1f40] to-[#1e132b] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Grafik Bulanan Royalti (Yang Sudah Di-ACC)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#c8f560]/20 text-[#c8f560] text-[10px] font-bold border border-[#c8f560]/40">
                  Sinkron
                </span>
              </div>
              <p className="text-xs text-white/60 mt-0.5">
                Total pencairan dana royalti seluruh musisi yang disetujui (ACC)
              </p>
            </div>
            <span className="text-xs font-bold text-[#c8f560] bg-black/30 px-3 py-1 rounded-xl border border-white/10">
              12 Bulan
            </span>
          </div>

          <div className="h-56 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: 600 }}
                  dy={6}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }}
                  tickFormatter={(val) =>
                    val >= 1000000
                      ? `${(val / 1000000).toFixed(1)}M`
                      : val >= 1000
                      ? `${(val / 1000).toFixed(0)}K`
                      : val
                  }
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-[#1f142b] border border-[#c8f560]/60 p-2.5 rounded-xl shadow-xl text-xs">
                          <p className="font-bold text-white mb-0.5">
                            Bulan {item.month}
                          </p>
                          <p className="font-extrabold text-[#c8f560]">
                            {formatCurrency(item.amount)}
                          </p>
                          <p className="text-[10px] text-white/60">
                            Total ACC Payout
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]} barSize={26}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`admin-bar-${index}`}
                      fill={
                        index === currentMonthIdx || entry.amount > 0
                          ? "#c8f560"
                          : "rgba(255,255,255,0.2)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs text-white/60 pt-3 border-t border-white/10 mt-2">
            <span>
              Total Cleared Payout:{" "}
              <strong className="text-white">
                {formatCurrency(data.totalClearedPayout || 0)}
              </strong>
            </span>
            <span className="flex items-center gap-1 text-[#c8f560]">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Otomatis Sinkron Setiap ACC</span>
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: Status & Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Review Rilisan */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#3b274e] to-[#251736] border border-white/15 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs text-white/60 font-medium">Review Rilisan</p>
            <h4 className="text-2xl font-black text-white mt-1">
              {data.pendingReleases}
            </h4>
            <Link
              href="/admin/releases"
              className="text-[10px] text-[#c8f560] font-semibold mt-1 hover:underline inline-flex items-center gap-1"
            >
              <span>Tinjau Submisi</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-400/15 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
            <Music className="w-6 h-6" />
          </div>
        </div>

        {/* Verifikasi Identitas */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#3b274e] to-[#251736] border border-white/15 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs text-white/60 font-medium">Verifikasi Identitas</p>
            <h4 className="text-2xl font-black text-white mt-1">
              {data.pendingArtists}
            </h4>
            <Link
              href="/admin/registrations"
              className="text-[10px] text-[#fde08d] font-semibold mt-1 hover:underline inline-flex items-center gap-1"
            >
              <span>Verifikasi KTP & Akun</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#fde08d]/15 border border-[#fde08d]/30 flex items-center justify-center text-[#fde08d]">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Website CMS */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#3b274e] to-[#251736] border border-white/15 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs text-white/60 font-medium">Website CMS</p>
            <h4 className="text-base font-bold text-white mt-1">Landing Page</h4>
            <Link
              href="/admin/website-cms"
              className="text-[10px] text-[#c8f560] font-semibold mt-1 hover:underline inline-flex items-center gap-1"
            >
              <span>Kelola Tampilan Beranda</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
            <Globe className="w-6 h-6" />
          </div>
        </div>

        {/* Katalog Publisher & Gerbang R2 */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#3b274e] to-[#251736] border border-white/15 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs text-white/60 font-medium">Publisher & R2</p>
            <h4 className="text-sm font-bold text-white mt-1">Katalog & Cloud</h4>
            <div className="flex gap-2 mt-2">
              <Link
                href="/admin/publisher-catalog"
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-semibold text-[#c8f560] transition border border-white/10"
              >
                Publisher
              </Link>
              <Link
                href="/admin/r2-gate"
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-semibold text-white transition border border-white/10"
              >
                R2 Gate
              </Link>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-400/15 border border-purple-400/30 flex items-center justify-center text-purple-300">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Row 3: Musisi Baru & Antrean Penarikan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Antrean Penarikan Terakhir */}
        <div className="rounded-3xl p-6 bg-gradient-to-br from-[#3b274e] via-[#2f1f40] to-[#1e132b] border border-white/15 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
            <div>
              <h3 className="text-base font-bold text-white">
                Antrean & Riwayat Penarikan
              </h3>
              <p className="text-xs text-white/60">
                Pengajuan pencairan royalti musisi
              </p>
            </div>
            <Link
              href="/admin/withdrawals"
              className="text-xs font-semibold text-[#c8f560] hover:underline flex items-center gap-1"
            >
              <span>Semua Antrean</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {data.recentWithdrawals && data.recentWithdrawals.length > 0 ? (
            <div className="divide-y divide-white/10">
              {data.recentWithdrawals.map((wd: any, i: number) => (
                <div
                  key={wd.id || i}
                  className="py-3 flex items-center justify-between hover:bg-white/5 px-2 rounded-xl transition"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                        wd.status === "PAID"
                          ? "bg-[#c8f560]/20 text-[#c8f560]"
                          : "bg-[#fde08d]/20 text-[#fde08d]"
                      }`}
                    >
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-white">
                        {wd.user?.name || "Musisi"}
                      </p>
                      <p className="text-[10px] text-white/50">
                        {wd.method || "Bank Transfer"} •{" "}
                        {new Date(wd.createdAt).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs sm:text-sm font-bold text-white">
                      {formatCurrency(wd.amount)}
                    </p>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        wd.status === "PAID"
                          ? "bg-[#c8f560] text-[#1a1024]"
                          : "bg-[#fde08d] text-[#1a1024]"
                      }`}
                    >
                      {wd.status === "PAID" ? "Approved" : "Pending"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-white/50 text-xs">
              Belum ada antrean penarikan dana.
            </div>
          )}
        </div>

        {/* Musisi Terdaftar Baru */}
        <div className="rounded-3xl p-6 bg-gradient-to-br from-[#3b274e] via-[#2f1f40] to-[#1e132b] border border-white/15 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
            <div>
              <h3 className="text-base font-bold text-white">Musisi Terdaftar</h3>
              <p className="text-xs text-white/60">
                Pendaftaran musisi dan artis terbaru
              </p>
            </div>
            <Link
              href="/admin/all-artists"
              className="text-xs font-semibold text-[#c8f560] hover:underline flex items-center gap-1"
            >
              <span>Daftar Artis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {data.recentArtists && data.recentArtists.length > 0 ? (
            <div className="divide-y divide-white/10">
              {data.recentArtists.map((artist: any, i: number) => (
                <div
                  key={i}
                  className="py-3 flex items-center justify-between hover:bg-white/5 px-2 rounded-xl transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-black/40 border border-white/20 overflow-hidden flex items-center justify-center">
                      <img
                        src={
                          artist.image ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${artist.name}`
                        }
                        alt={artist.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-white">
                        {artist.name}
                      </p>
                      <p className="text-[10px] text-white/50">Akun Musisi Aktif</p>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white/80 text-[10px] font-semibold border border-white/10">
                    Artis
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-white/50 text-xs">
              Belum ada musisi terdaftar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
