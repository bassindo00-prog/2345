"use client";

import React, { useState } from "react";
import {
  Wifi,
  X,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Building2,
  Smartphone,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

type WithdrawalData = {
  id: string;
  date: string;
  amount: number;
  method: string;
  accountNumber: string;
  accountHolder?: string;
  status: string;
  user?: {
    id?: string;
    name?: string;
    email?: string;
    avatar?: string;
    royaltyBalance?: number;
  };
};

type VisaWithdrawalCardModalProps = {
  isOpen: boolean;
  withdrawal: WithdrawalData | null;
  onClose: () => void;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
};

export default function VisaWithdrawalCardModal({
  isOpen,
  withdrawal,
  onClose,
  onApprove,
  onReject,
}: VisaWithdrawalCardModalProps) {
  const [copied, setCopied] = useState(false);
  const [processing, setProcessing] = useState(false);

  if (!isOpen || !withdrawal) return null;

  const isEWallet =
    withdrawal.method.toLowerCase().includes("e-wallet") ||
    withdrawal.method.toLowerCase().includes("ovo") ||
    withdrawal.method.toLowerCase().includes("gopay") ||
    withdrawal.method.toLowerCase().includes("dana") ||
    withdrawal.method.toLowerCase().includes("shopee");

  // Format account number in groups of 4 for authentic VISA debit/credit embossing
  const cleanNum = withdrawal.accountNumber.replace(/\s+/g, "");
  const formattedCardNumber =
    cleanNum.match(/.{1,4}/g)?.join("  ") || withdrawal.accountNumber;

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAction = async (type: "approve" | "reject") => {
    setProcessing(true);
    try {
      if (type === "approve") {
        await onApprove(withdrawal.id);
      } else {
        await onReject(withdrawal.id);
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-card-enter">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-[#7e7ca8]/90 via-[#8a88b5]/85 to-[#575482]/95 border border-white/25 rounded-[32px] p-6 sm:p-8 shadow-2xl text-white overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Glow Accents */}
        <div className="pointer-events-none absolute -right-16 -top-16 w-60 h-60 rounded-full bg-[#c8f560]/15 blur-2xl" />
        <div className="pointer-events-none absolute -left-16 -bottom-16 w-60 h-60 rounded-full bg-[#312042]/35 blur-2xl" />

        {/* Modal Header */}
        <div className="relative z-10 flex items-center justify-between pb-4 border-b border-white/15">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#c8f560] text-[#312042] flex items-center justify-center font-bold">
              💳
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Verifikasi & ACC Penarikan Dana
              </h3>
              <p className="text-xs text-white/70">
                Informasi rekening dan e-wallet artis dalam kartu VISA Signature
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* =========================================================================
            THE LUXURY VISA WITHDRAWAL CARD (Authentic Embossed Layout)
           ========================================================================= */}
        <div className="relative z-10 my-6">
          <div className="relative overflow-hidden rounded-[26px] p-6 sm:p-7 border border-white/30 shadow-2xl bg-gradient-to-br from-[#3b2752] via-[#523d70] to-[#241738] text-white select-none transition-transform hover:scale-[1.01]">
            {/* Hologram & Sheen effects */}
            <div className="pointer-events-none absolute -right-12 -top-12 w-48 h-48 rounded-full bg-[#c8f560]/20 blur-2xl" />
            <div className="pointer-events-none absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-white/10 blur-xl" />
            <div
              className="pointer-events-none absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 85% 15%, rgba(255,255,255,0.4) 0%, transparent 55%)",
              }}
            />

            {/* Top Bar: Bank/Wallet Badge + Contactless + VISA Logo */}
            <div className="relative z-10 flex items-center justify-between">
              {/* Bank / E-Wallet Pill */}
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/20 backdrop-blur-md">
                {isEWallet ? (
                  <Smartphone className="w-4 h-4 text-[#c8f560]" />
                ) : (
                  <Building2 className="w-4 h-4 text-[#c8f560]" />
                )}
                <span className="text-xs font-bold tracking-wide uppercase text-[#c8f560]">
                  {withdrawal.method}
                </span>
              </div>

              {/* NFC & VISA Wordmark */}
              <div className="flex items-center gap-3">
                <Wifi className="w-5 h-5 text-white/80 rotate-90" />
                <div className="text-right leading-none">
                  <span className="font-black italic tracking-wider text-2xl text-white drop-shadow">
                    VISA
                  </span>
                  <p className="text-[8px] tracking-[0.24em] uppercase text-[#c8f560] font-bold">
                    PLATINUM ACC
                  </p>
                </div>
              </div>
            </div>

            {/* Middle Section: Metallic Chip + Payout Amount */}
            <div className="relative z-10 my-6 flex items-center justify-between gap-4">
              {/* Metallic Golden EMV Chip */}
              <div className="w-13 h-9 sm:w-14 sm:h-10 rounded-lg bg-gradient-to-br from-[#f8e58c] via-[#d4af37] to-[#8d6904] p-1.5 shadow-inner border border-white/40 shrink-0 flex flex-col justify-between">
                <div className="w-full h-[1px] bg-black/30" />
                <div className="flex items-center justify-between h-3">
                  <div className="w-3 h-3 rounded-sm border border-black/30" />
                  <div className="w-3 h-3 rounded-sm border border-black/30" />
                </div>
                <div className="w-full h-[1px] bg-black/30" />
              </div>

              {/* Amount Display */}
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-white/70 font-medium">
                  Jumlah Penarikan (Payout)
                </p>
                <p className="text-3xl sm:text-4xl font-extrabold text-[#c8f560] tracking-tight drop-shadow tabular-nums">
                  Rp {withdrawal.amount.toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            {/* Card Account Number (Embossed Digits) */}
            <div className="relative z-10 my-3">
              <p className="text-[10px] text-white/60 uppercase tracking-widest mb-1">
                Nomor Rekening / Virtual Account Tujuan
              </p>
              <div className="flex items-center justify-between bg-black/25 px-4 py-2.5 rounded-xl border border-white/15">
                <span className="font-mono text-base sm:text-lg font-bold tracking-[0.18em] text-white drop-shadow">
                  {formattedCardNumber}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(withdrawal.accountNumber)}
                  title="Salin Nomor Rekening"
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#c8f560] transition-colors"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-[#c8f560]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Bottom Row: Cardholder Name + Request Date + Status Badge */}
            <div className="relative z-10 mt-5 pt-3 border-t border-white/15 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <p className="text-[9px] uppercase tracking-wider text-[#c8f560] font-semibold">
                  Nama Pemilik Rekening Bank
                </p>
                <p className="font-bold text-white uppercase tracking-wider text-sm mt-0.5">
                  {withdrawal.accountHolder || withdrawal.user?.name || "PEMILIK REKENING"}
                </p>
                <p className="text-[10px] text-white/70">
                  Akun Artis: {withdrawal.user?.name || "Artist"} • <span className="font-mono text-white/60 lowercase">{withdrawal.user?.email || "artist@breakout.id"}</span>
                </p>
              </div>

              <div className="text-right">
                <p className="text-[9px] uppercase tracking-wider text-white/60">
                  Tanggal Pengajuan
                </p>
                <p className="font-semibold text-white mt-0.5">{withdrawal.date}</p>
                <div className="mt-1">
                  {withdrawal.status === "Approved" ? (
                    <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#c8f560] text-[#312042] font-bold text-[10px]">
                      <CheckCircle2 className="w-3 h-3" />
                      BERHASIL DI-ACC
                    </span>
                  ) : withdrawal.status === "Rejected" ? (
                    <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-red-400 text-black font-bold text-[10px]">
                      <XCircle className="w-3 h-3" />
                      DITOLAK
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#fde08d] text-[#312042] font-bold text-[10px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#312042] animate-ping" />
                      MENUNGGU ACC
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown Box */}
        <div className="relative z-10 bg-white/10 border border-white/15 rounded-2xl p-4 text-xs space-y-2 mb-6">
          <div className="flex items-center justify-between text-white/80">
            <span>Nama Pemilik Rekening:</span>
            <span className="font-bold text-[#c8f560] text-sm">
              {withdrawal.accountHolder || withdrawal.user?.name || "-"}
            </span>
          </div>
          <div className="flex items-center justify-between text-white/80">
            <span>Nama Artis / User Akun:</span>
            <span className="font-semibold text-white">{withdrawal.user?.name || "-"}</span>
          </div>
          <div className="flex items-center justify-between text-white/80">
            <span>Metode Pembayaran:</span>
            <span className="font-semibold text-white">{withdrawal.method}</span>
          </div>
          <div className="flex items-center justify-between text-white/80">
            <span>Nomor Rekening / Akun:</span>
            <span className="font-mono font-bold text-white">
              {withdrawal.accountNumber}
            </span>
          </div>
          <div className="flex items-center justify-between text-white/80">
            <span>Biaya Transfer / Admin Fee:</span>
            <span className="font-semibold text-[#c8f560]">Rp 0 (Gratis)</span>
          </div>
          <div className="flex items-center justify-between text-white/80 pt-2 border-t border-white/15">
            <span>Total Bersih yang Ditransfer:</span>
            <span className="text-sm font-bold text-[#c8f560]">
              Rp {withdrawal.amount.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        {/* Action Controls for Admin */}
        <div className="relative z-10 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-medium text-xs transition-colors"
          >
            Tutup
          </button>

          {withdrawal.status === "Pending" ? (
            <>
              <button
                type="button"
                disabled={processing}
                onClick={() => handleAction("reject")}
                className="px-4 py-2.5 rounded-xl bg-red-500/30 hover:bg-red-500/50 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>{processing ? "Memproses..." : "Tolak Penarikan"}</span>
              </button>

              <button
                type="button"
                disabled={processing}
                onClick={() => handleAction("approve")}
                className="px-6 py-2.5 rounded-xl bg-[#c8f560] hover:opacity-90 text-[#312042] font-extrabold text-xs shadow-lg transition-all flex items-center gap-2 scale-100 hover:scale-105 active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {processing
                    ? "Menyelesaikan Transfer..."
                    : "✓ ACC & Setujui Penarikan Sekarang"}
                </span>
              </button>
            </>
          ) : withdrawal.status === "Approved" ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-[#c8f560] bg-[#312042]/80 px-4 py-2 rounded-xl border border-[#c8f560]/40">
              <ShieldCheck className="w-4 h-4" />
              <span>Penarikan ini telah disetujui & dicairkan.</span>
            </div>
          ) : (
            <div className="text-xs text-red-300 bg-red-900/30 px-4 py-2 rounded-xl">
              Permintaan ini telah ditolak.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

