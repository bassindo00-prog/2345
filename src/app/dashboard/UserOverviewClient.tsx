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
  ArrowUpRight,
  Music,
  Clock,
  DollarSign,
  Plus,
  CreditCard,
  Disc,
  PlayCircle,
  TrendingUp,
  FileText,
  BookOpen,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { resolveMediaUrl } from "@/lib/r2";

type MonthlyPayout = {
  month: string;
  amount: number;
};

type OverviewData = {
  totalReleases: number;
  pendingReleases: number;
  totalRevenue: number;
  availableBalance: number;
  totalWithdrawn?: number;
  pendingWithdrawal?: number;
  monthlyApprovedPayouts?: MonthlyPayout[];
  totalStreams: number;
  recentWithdrawals: any[];
};

export function UserOverviewClient({
  data,
  user,
}: {
  data: OverviewData;
  user: any;
}) {
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
          { month: "Nov", amount: data.totalWithdrawn || 0 },
          { month: "Des", amount: 0 },
        ];

  const currentMonthIdx = new Date().getMonth();

  return (
    <div className="w-full pb-14 space-y-6 animate-fade-in text-white">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Selamat Datang, {user?.name || "Musisi"}!
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#c8f560] text-[#1a1024] text-[10px] font-black uppercase tracking-wider">
              Artis Pro
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
            href="/dashboard/upload"
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#c8f560] hover:bg-[#d6ff73] text-[#1a1024] font-bold text-xs shadow-lg shadow-[#c8f560]/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Rilis Lagu Baru</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: Card 1 (VISA) & Card 2 (Monthly ACC Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Card 1: Luxury VISA Card for Saldo Endap */}
        <div className="lg:col-span-5 rounded-3xl p-6 sm:p-7 relative overflow-hidden text-white shadow-2xl border border-white/20 bg-gradient-to-br from-[#4d3765] via-[#3c2952] to-[#251736] flex flex-col justify-between min-h-[290px]">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#c8f560]/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold tracking-widest uppercase text-white/80">
                SALDO ROYALTI ANDA (SALDO ENDAP)
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
                {formatCurrency(data.availableBalance)}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-white/70 mt-2">
              <span className="font-mono tracking-widest text-[11px]">
                4532 •••• •••• 8891
              </span>
              <span className="text-[11px] font-medium text-white/90">
                Bulan Ini • Siap Dicairkan
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-white/15 mt-5">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-2.5 rounded-2xl bg-black/30 border border-white/10">
                <p className="text-[10px] text-white/60 font-medium">Cleared Payout (ACC)</p>
                <p className="text-xs sm:text-sm font-bold text-white mt-0.5 truncate">
                  {formatCurrency(data.totalWithdrawn || 0)}
                </p>
              </div>
              <div className="p-2.5 rounded-2xl bg-black/30 border border-white/10">
                <p className="text-[10px] text-[#fde08d] font-medium">Antrean Withdraw</p>
                <p className="text-xs sm:text-sm font-bold text-[#fde08d] mt-0.5 truncate">
                  {formatCurrency(data.pendingWithdrawal || 0)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-white/60">
                {data.totalReleases} Rilis Disetujui
              </span>
              <Link
                href="/dashboard/withdraw"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#c8f560] hover:bg-[#d4ff6b] text-[#1a1024] font-bold text-xs shadow transition active:scale-95"
              >
                <span>Tarik Saldo</span>
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
                Total pencairan dana royalti yang disetujui admin sepanjang tahun
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
                            Status: ACC / Dicairkan
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
                      key={`bar-${index}`}
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
              Total Telah Dicairkan:{" "}
              <strong className="text-white">
                {formatCurrency(data.totalWithdrawn || 0)}
              </strong>
            </span>
            <span className="flex items-center gap-1 text-[#c8f560]">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Otomatis Terpotong Saat ACC</span>
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: Status Cards & Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Streams */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#3b274e] to-[#251736] border border-white/15 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs text-white/60 font-medium">Total Streams</p>
            <h4 className="text-2xl font-black text-white mt-1">
              {(data.totalStreams || 0).toLocaleString("id-ID")}
            </h4>
            <span className="text-[10px] text-[#c8f560] font-semibold mt-1 inline-block">
              Multi-Platform Streaming
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#c8f560]/15 border border-[#c8f560]/30 flex items-center justify-center text-[#c8f560]">
            <PlayCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Active Releases */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#3b274e] to-[#251736] border border-white/15 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs text-white/60 font-medium">Rilis Aktif (Live)</p>
            <h4 className="text-2xl font-black text-white mt-1">
              {data.totalReleases}
            </h4>
            <Link
              href="/dashboard/releases"
              className="text-[10px] text-[#c8f560] font-semibold mt-1 hover:underline inline-flex items-center gap-1"
            >
              <span>Lihat Katalog Rilis</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-400/15 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
            <Disc className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Releases */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#3b274e] to-[#251736] border border-white/15 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs text-white/60 font-medium">Menunggu ACC</p>
            <h4 className="text-2xl font-black text-white mt-1">
              {data.pendingReleases}
            </h4>
            <span className="text-[10px] text-[#fde08d] font-semibold mt-1 inline-block">
              Sedang Direview Label
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#fde08d]/15 border border-[#fde08d]/30 flex items-center justify-center text-[#fde08d]">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Kontrak & Publisher Shortcut */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#3b274e] to-[#251736] border border-white/15 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs text-white/60 font-medium">Katalog & Kontrak</p>
            <h4 className="text-sm font-bold text-white mt-1">Publisher & Legal</h4>
            <div className="flex gap-2 mt-2">
              <Link
                href="/dashboard/contracts"
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-semibold text-white transition border border-white/10"
              >
                Kontrak
              </Link>
              <Link
                href="/dashboard/publisher-catalog"
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-semibold text-[#c8f560] transition border border-white/10"
              >
                Publisher
              </Link>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-400/15 border border-purple-400/30 flex items-center justify-center text-purple-300">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Row 3: Riwayat Penarikan Dana Terbaru */}
      <div className="rounded-3xl p-6 bg-gradient-to-br from-[#3b274e] via-[#2f1f40] to-[#1e132b] border border-white/15 shadow-xl">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10">
          <div>
            <h3 className="text-base font-bold text-white">
              Riwayat Penarikan Dana Terakhir
            </h3>
            <p className="text-xs text-white/60">
              Daftar transaksi penarikan saldo royalti musisi
            </p>
          </div>
          <Link
            href="/dashboard/withdraw"
            className="text-xs font-semibold text-[#c8f560] hover:underline flex items-center gap-1"
          >
            <span>Buka Halaman Withdraw</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {data.recentWithdrawals && data.recentWithdrawals.length > 0 ? (
          <div className="divide-y divide-white/10">
            {data.recentWithdrawals.map((wd: any, i: number) => (
              <div
                key={wd.id || i}
                className="py-3.5 flex items-center justify-between hover:bg-white/5 px-2 rounded-xl transition"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                      wd.status === "PAID"
                        ? "bg-[#c8f560]/20 text-[#c8f560] border border-[#c8f560]/30"
                        : "bg-[#fde08d]/20 text-[#fde08d] border border-[#fde08d]/30"
                    }`}
                  >
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-white">
                      Penarikan Saldo Royalti
                    </p>
                    <p className="text-[10px] text-white/50">
                      {wd.method || "Transfer Bank"} •{" "}
                      {wd.accountNumber
                        ? `Rek: ${wd.accountNumber}`
                        : new Date(wd.createdAt).toLocaleDateString("id-ID")}
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
                    {wd.status === "PAID" ? "Selesai (ACC)" : "Antrean (Pending)"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-white/50 text-xs">
            Belum ada riwayat penarikan saldo.
          </div>
        )}
      </div>
    </div>
  );
}
