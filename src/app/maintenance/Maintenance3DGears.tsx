"use client";

import React, { useEffect, useRef, useState } from "react";

export function Maintenance3DGears() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Mouse move 3D tilt effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotateX = -(y / (rect.height / 2)) * 14;
    const rotateY = (x / (rect.width / 2)) * 14;
    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-[340px] h-[240px] mx-auto my-2 flex items-center justify-center cursor-pointer select-none"
      style={{ perspective: "1000px" }}
    >
      {/* 3D Mechanical Stage */}
      <div
        className="relative w-full h-full flex items-center justify-center transition-transform duration-200 ease-out"
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(${isHovered ? 1.05 : 1}, ${isHovered ? 1.05 : 1}, 1)`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Ambient Glow Aura */}
        <div className="absolute w-52 h-52 rounded-full bg-gradient-to-tr from-[#c8f560]/20 via-[#a855f7]/25 to-[#00f0ff]/20 blur-2xl animate-pulse" />

        {/* Outer Tech Hologram Orbit Ring */}
        <div
          className="absolute w-64 h-64 rounded-full border border-dashed border-[#c8f560]/30 animate-spin"
          style={{ animationDuration: "25s" }}
        />
        <div
          className="absolute w-52 h-52 rounded-full border border-dotted border-[#a855f7]/40 animate-spin"
          style={{ animationDuration: "18s", animationDirection: "reverse" }}
        />

        {/* MAIN GEAR 1: Large Titanium Master Gear (Left, Rotates Clockwise) */}
        <div
          className="absolute -left-1 sm:left-4 top-6 w-36 h-36 drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)]"
          style={{
            transform: "translateZ(30px)",
            transformStyle: "preserve-3d",
          }}
        >
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full animate-spin"
            style={{ animationDuration: "9s" }}
          >
            <defs>
              <linearGradient id="gearMetallic" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f3f4f6" />
                <stop offset="25%" stopColor="#9ca3af" />
                <stop offset="50%" stopColor="#374151" />
                <stop offset="75%" stopColor="#9ca3af" />
                <stop offset="100%" stopColor="#1f2937" />
              </linearGradient>
              <linearGradient id="gearNeonLime" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#c8f560" />
                <stop offset="100%" stopColor="#84cc16" />
              </linearGradient>
              <filter id="gearShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.7" />
              </filter>
            </defs>

            {/* Gear Body with 12 Teeth */}
            <path
              filter="url(#gearShadow)"
              fill="url(#gearMetallic)"
              stroke="#c8f560"
              strokeWidth="1.2"
              d="
                M 47,4 L 53,4 L 54,12 L 61,14 L 67,8 L 72,12 L 69,19 L 75,23 L 82,19 L 85,25 L 79,30 L 83,37 L 91,36 L 92,42 L 85,46 L 86,53 L 94,55 L 93,61 L 85,63 L 83,70 L 89,76 L 86,81 L 79,78 L 74,83 L 78,91 L 72,94 L 67,88 L 60,91 L 62,99 L 56,100 L 53,92 L 46,92 L 43,100 L 37,99 L 39,91 L 32,88 L 27,94 L 21,91 L 25,83 L 20,78 L 13,81 L 10,76 L 16,70 L 14,63 L 6,61 L 5,55 L 13,53 L 14,46 L 7,42 L 8,36 L 16,37 L 20,30 L 14,25 L 17,19 L 24,23 L 30,19 L 27,12 L 32,8 L 38,14 L 45,12 Z
              "
            />
            {/* Inner Recessed Bevel Rim */}
            <circle cx="50" cy="50" r="28" fill="#1e162a" stroke="url(#gearNeonLime)" strokeWidth="2" />
            <circle cx="50" cy="50" r="22" fill="#140f1c" stroke="#4b5563" strokeWidth="1" />
            
            {/* 4 Spokes with Bolt Holes */}
            <circle cx="50" cy="36" r="3.5" fill="#374151" stroke="#c8f560" strokeWidth="1" />
            <circle cx="50" cy="64" r="3.5" fill="#374151" stroke="#c8f560" strokeWidth="1" />
            <circle cx="36" cy="50" r="3.5" fill="#374151" stroke="#c8f560" strokeWidth="1" />
            <circle cx="64" cy="50" r="3.5" fill="#374151" stroke="#c8f560" strokeWidth="1" />

            {/* Central Axle Hub */}
            <circle cx="50" cy="50" r="10" fill="url(#gearMetallic)" stroke="#c8f560" strokeWidth="1.5" />
            <polygon points="50,44 54,47 54,53 50,56 46,53 46,47" fill="#09090b" />
          </svg>
        </div>

        {/* GEAR 2: Secondary Neon Purple Interlocking Cog (Right, Rotates Counter-Clockwise) */}
        <div
          className="absolute right-1 sm:right-6 top-10 w-28 h-28 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
          style={{
            transform: "translateZ(20px)",
            transformStyle: "preserve-3d",
          }}
        >
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full animate-spin"
            style={{ animationDuration: "6s", animationDirection: "reverse" }}
          >
            <defs>
              <linearGradient id="gearPurpleMetallic" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#d8b4fe" />
                <stop offset="30%" stopColor="#9333ea" />
                <stop offset="70%" stopColor="#581c87" />
                <stop offset="100%" stopColor="#2e1065" />
              </linearGradient>
            </defs>

            {/* 8 Teeth Cog */}
            <path
              fill="url(#gearPurpleMetallic)"
              stroke="#f0abfc"
              strokeWidth="1.2"
              d="
                M 46,6 L 54,6 L 56,16 L 66,20 L 73,13 L 79,19 L 72,26 L 76,36 L 86,38 L 86,46 L 76,48 L 72,58 L 79,65 L 73,71 L 66,64 L 56,68 L 54,78 L 46,78 L 44,68 L 34,64 L 27,71 L 21,65 L 28,58 L 24,48 L 14,46 L 14,38 L 24,36 L 28,26 L 21,19 L 27,13 L 34,20 L 44,16 Z
              "
              transform="translate(8, 8) scale(0.84)"
            />
            {/* Center Core */}
            <circle cx="50" cy="50" r="20" fill="#180e29" stroke="#d8b4fe" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="13" fill="url(#gearPurpleMetallic)" />
            <circle cx="50" cy="50" r="5" fill="#09090b" stroke="#c8f560" strokeWidth="1" />
          </svg>
        </div>

        {/* GEAR 3: Micro Gold Precision Gear (Bottom Center, Rotates Clockwise) */}
        <div
          className="absolute left-24 sm:left-28 bottom-2 w-20 h-20 drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]"
          style={{
            transform: "translateZ(40px)",
            transformStyle: "preserve-3d",
          }}
        >
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full animate-spin"
            style={{ animationDuration: "4s" }}
          >
            <defs>
              <linearGradient id="gearGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="40%" stopColor="#eab308" />
                <stop offset="80%" stopColor="#854d0e" />
                <stop offset="100%" stopColor="#ca8a04" />
              </linearGradient>
            </defs>
            <path
              fill="url(#gearGold)"
              stroke="#fef08a"
              strokeWidth="1"
              d="
                M 46,10 L 54,10 L 55,20 L 64,24 L 71,17 L 77,23 L 70,30 L 74,39 L 84,40 L 84,48 L 74,49 L 70,58 L 77,65 L 71,71 L 64,64 L 55,68 L 54,78 L 46,78 L 45,68 L 36,64 L 29,71 L 23,65 L 30,58 L 26,49 L 16,48 L 16,40 L 26,39 L 30,30 L 23,23 L 29,17 L 36,24 L 45,20 Z
              "
              transform="translate(6, 6) scale(0.88)"
            />
            <circle cx="50" cy="50" r="16" fill="#1c1326" stroke="#fef08a" strokeWidth="1.5" />
            <polygon points="50,44 55,47 55,53 50,56 45,53 45,47" fill="#fef08a" />
          </svg>
        </div>

        {/* 3D CROSSED WRENCHES / KUNCI PAS (Front Layer with 3D Depth) */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            transform: "translateZ(55px)",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Wrench 1 (Tilted 40 deg) */}
          <div
            className="absolute w-44 sm:w-48 h-10 transition-transform duration-300"
            style={{
              transform: `rotate(42deg) ${isHovered ? "scale(1.08)" : ""}`,
              filter: "drop-shadow(0 14px 18px rgba(0,0,0,0.85)) drop-shadow(0 0 12px rgba(200,245,96,0.25))",
            }}
          >
            <svg viewBox="0 0 160 36" className="w-full h-full">
              <defs>
                <linearGradient id="chromeSteel1" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="25%" stopColor="#d1d5db" />
                  <stop offset="50%" stopColor="#6b7280" />
                  <stop offset="75%" stopColor="#e5e7eb" />
                  <stop offset="100%" stopColor="#374151" />
                </linearGradient>
                <linearGradient id="limeHandle" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#c8f560" />
                  <stop offset="100%" stopColor="#84cc16" />
                </linearGradient>
              </defs>
              {/* Left Open Jaw */}
              <path
                d="M 28,6 C 24,1 16,1 10,4 C 4,8 1,16 3,23 C 5,29 12,34 19,34 C 25,34 30,30 33,26 L 132,24 C 136,29 144,32 150,30 C 156,27 159,20 158,13 C 156,7 149,2 143,3 C 137,4 133,8 130,12 L 28,12 Z"
                fill="url(#chromeSteel1)"
                stroke="#ffffff"
                strokeWidth="0.8"
              />
              {/* Left Jaw Opening Cutout */}
              <polygon points="2,18 14,10 20,18 14,26" fill="#09090b" stroke="#9ca3af" strokeWidth="0.8" />
              {/* Right Ring Cutout */}
              <polygon points="146,12 153,16 153,22 146,26 140,22 140,16" fill="#09090b" stroke="#9ca3af" strokeWidth="0.8" />
              {/* Ergonomic Grip Inlay (Lime Neon) */}
              <rect x="42" y="14" width="76" height="8" rx="4" fill="url(#limeHandle)" stroke="#1c1326" strokeWidth="0.8" />
              <text x="80" y="20.5" fill="#1c1326" fontSize="5.5" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
                BREAKOUT // PRO 14
              </text>
            </svg>
          </div>

          {/* Wrench 2 (Tilted -40 deg, Crossing Under Wrench 1) */}
          <div
            className="absolute w-44 sm:w-48 h-10 transition-transform duration-300"
            style={{
              transform: `rotate(-42deg) ${isHovered ? "scale(1.08)" : ""}`,
              filter: "drop-shadow(0 14px 18px rgba(0,0,0,0.85)) drop-shadow(0 0 12px rgba(168,85,247,0.25))",
            }}
          >
            <svg viewBox="0 0 160 36" className="w-full h-full">
              <defs>
                <linearGradient id="chromeSteel2" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#f3f4f6" />
                  <stop offset="30%" stopColor="#9ca3af" />
                  <stop offset="55%" stopColor="#4b5563" />
                  <stop offset="85%" stopColor="#d1d5db" />
                  <stop offset="100%" stopColor="#1f2937" />
                </linearGradient>
                <linearGradient id="purpleHandle" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#c084fc" />
                  <stop offset="100%" stopColor="#7e22ce" />
                </linearGradient>
              </defs>
              {/* Wrench Body */}
              <path
                d="M 28,6 C 24,1 16,1 10,4 C 4,8 1,16 3,23 C 5,29 12,34 19,34 C 25,34 30,30 33,26 L 132,24 C 136,29 144,32 150,30 C 156,27 159,20 158,13 C 156,7 149,2 143,3 C 137,4 133,8 130,12 L 28,12 Z"
                fill="url(#chromeSteel2)"
                stroke="#e2e8f0"
                strokeWidth="0.8"
              />
              {/* Left Cutout */}
              <polygon points="2,18 14,10 20,18 14,26" fill="#09090b" stroke="#9ca3af" strokeWidth="0.8" />
              {/* Right Cutout */}
              <polygon points="146,12 153,16 153,22 146,26 140,22 140,16" fill="#09090b" stroke="#9ca3af" strokeWidth="0.8" />
              {/* Grip Inlay (Purple Neon) */}
              <rect x="42" y="14" width="76" height="8" rx="4" fill="url(#purpleHandle)" stroke="#1c1326" strokeWidth="0.8" />
              <text x="80" y="20.5" fill="#ffffff" fontSize="5.5" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
                HEAVY DUTY 17
              </text>
            </svg>
          </div>

          {/* Central Crossing Bolt Shield */}
          <div
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#c8f560] via-[#9333ea] to-[#1e1b4b] p-0.5 shadow-[0_0_24px_rgba(200,245,96,0.6)] animate-pulse"
            style={{
              transform: "translateZ(70px)",
            }}
          >
            <div className="w-full h-full bg-[#0d0914] rounded-2xl flex items-center justify-center border border-white/20">
              <span className="text-sm font-extrabold text-[#c8f560] tracking-tighter">
                3D
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Sparks / Contact Points */}
        <div className="absolute top-12 left-28 w-2 h-2 rounded-full bg-[#c8f560] shadow-[0_0_10px_#c8f560] animate-ping" />
        <div className="absolute bottom-16 right-24 w-1.5 h-1.5 rounded-full bg-[#00f0ff] shadow-[0_0_8px_#00f0ff] animate-ping" />
        <div className="absolute top-20 right-32 w-1.5 h-1.5 rounded-full bg-[#f0abfc] shadow-[0_0_8px_#f0abfc] animate-ping" />
      </div>

      {/* Floating Mechanical Status Tag below the 3D unit */}
      <div
        className="absolute -bottom-1 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-[#c8f560]/40 text-[10px] font-mono text-[#c8f560] flex items-center gap-1.5 shadow-lg tracking-wider pointer-events-none"
        style={{
          transform: "translateZ(80px)",
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#c8f560] animate-ping" />
        <span>MECHANICAL ENGINE TUNING</span>
      </div>
    </div>
  );
}

