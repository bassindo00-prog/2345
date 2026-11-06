"use client";

import React from "react";
import { Wifi } from "lucide-react";

type VisaMetricCardProps = {
  title: string;
  value: string | number;
  subtitle: string;
  dotColor: string;
  valueColor?: string;
  valueSize?: string;
  cardNumber: string;
  holderName: string;
  expiry?: string;
  tier?: string;
  variant?: "lavender" | "plum" | "lime-tint";
  delayMs?: number;
  className?: string;
  children?: React.ReactNode;
};

export default function VisaMetricCard({
  title,
  value,
  subtitle,
  dotColor,
  valueColor = "text-white",
  valueSize = "text-2xl sm:text-3xl lg:text-3xl xl:text-4xl",
  cardNumber,
  holderName,
  expiry = "11/28",
  tier = "SIGNATURE",
  variant = "lavender",
  delayMs = 60,
  className = "",
  children,
}: VisaMetricCardProps) {
  const bgStyle =
    variant === "plum"
      ? "bg-gradient-to-br from-[#38254c]/90 via-[#5a4678]/80 to-[#2b1c3b]/95 border-white/25"
      : variant === "lime-tint"
      ? "bg-gradient-to-br from-[#7e7ca8]/80 via-[#8a88b5]/75 to-[#49456b]/85 border-[#c8f560]/35"
      : "bg-gradient-to-br from-[#8a88b5]/80 via-[#7876a6]/75 to-[#575482]/85 border-white/25";

  return (
    <div
      style={{ animationDelay: `${delayMs}ms` }}
      className={`relative overflow-hidden rounded-[26px] border p-5 sm:p-6 text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl group animate-card-enter select-none ${bgStyle} ${className}`}
    >
      {/* Decorative Visa Card Holographic Circles & Mesh */}
      <div className="pointer-events-none absolute -right-10 -top-10 w-40 h-40 rounded-full bg-[#c8f560]/10 blur-xl group-hover:bg-[#c8f560]/20 transition-all" />
      <div className="pointer-events-none absolute -left-12 -bottom-12 w-44 h-44 rounded-full bg-white/10 blur-xl" />
      <div
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage:
            "radial-gradient(circle at 85% 20%, rgba(255,255,255,0.35) 0%, transparent 50%)",
        }}
      />

      {/* Shimmer Sweep on Hover */}
      <div className="pointer-events-none absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-[250%] transition-transform duration-1000 ease-in-out" />

      {/* Top Row: Title Pill + EMV Chip + Contactless + VISA Logo */}
      <div className="relative z-10 flex items-center justify-between gap-2">
        <span className="px-3.5 py-1 rounded-full bg-white/15 border border-white/20 text-[11px] font-semibold tracking-wide text-white">
          {title}
        </span>

        <div className="flex items-center gap-2.5">
          {/* Contactless NFC Icon */}
          <Wifi className="w-4 h-4 text-white/75 rotate-90" />
          {/* VISA Wordmark */}
          <div className="text-right leading-none">
            <span className="font-black italic tracking-wider text-lg sm:text-xl text-white drop-shadow">
              VISA
            </span>
            <p className="text-[7px] tracking-[0.22em] uppercase text-[#c8f560] font-semibold">
              {tier}
            </p>
          </div>
        </div>
      </div>

      {/* Middle Row: EMV Metallic Chip + Big Animated Metric Value */}
      <div className="relative z-10 my-4 flex items-center justify-between gap-3 sm:gap-4">
        {/* Realistic Metallic EMV Chip */}
        <div className="w-11 h-8 rounded-lg bg-gradient-to-br from-[#f6e27a] via-[#d4af37] to-[#aa820a] p-1 shadow-inner border border-white/40 shrink-0 flex flex-col justify-between">
          <div className="w-full h-[1px] bg-black/25" />
          <div className="flex items-center justify-between h-3">
            <div className="w-2.5 h-2.5 rounded-sm border border-black/30" />
            <div className="w-2.5 h-2.5 rounded-sm border border-black/30" />
          </div>
          <div className="w-full h-[1px] bg-black/25" />
        </div>

        {/* Big Metric Number */}
        <p
          className={`font-bold tracking-tight tabular-nums drop-shadow ${valueSize} ${valueColor}`}
        >
          {value}
        </p>
      </div>

      {/* Card Number Strip */}
      <div className="relative z-10 mb-3 flex items-center justify-between text-[11px] font-mono tracking-[0.18em] text-white/80">
        <span>{cardNumber}</span>
        <span className="text-[10px] text-white/65">{expiry}</span>
      </div>

      {/* Bottom Row: Cardholder Name + Status Badge */}
      <div className="relative z-10 pt-2.5 border-t border-white/15 flex items-center justify-between gap-2 text-xs">
        <span className="text-[10px] uppercase tracking-[0.16em] text-white/75 font-medium truncate">
          {holderName}
        </span>

        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/15 text-[11px] text-white/95 shrink-0">
          <span className={`w-2 h-2 rounded-full ${dotColor}`} />
          {subtitle}
        </span>
      </div>

      {/* Optional Children/Footer Slot */}
      {children && (
        <div className="relative z-10 mt-3 pt-2.5 border-t border-white/15">
          {children}
        </div>
      )}
    </div>
  );
}

