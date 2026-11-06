"use client";

import React, { useEffect, useRef, useState } from "react";
import { Globe2, Layers, Maximize2, Navigation, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";

type StreamHub = {
  id: string;
  city: string;
  country: string;
  flag: string;
  region: "Worldwide" | "Americas" | "Europe" | "Asia";
  lat: number;
  lng: number;
  // Normalized map coordinates (0-100%) on equirectangular projection
  mapX: number;
  mapY: number;
  streams: string;
  growth: string;
  intensity: number; // 0.4 - 1.0 tower height
  color: "lime" | "purple";
};

const STREAM_HUBS: StreamHub[] = [
  {
    id: "us-ny",
    city: "New York",
    country: "United States",
    flag: "🇺🇸",
    region: "Americas",
    lat: 40.71,
    lng: -74.0,
    mapX: 28.5,
    mapY: 34.5,
    streams: "1.20M",
    growth: "+12.4%",
    intensity: 1.0,
    color: "lime",
  },
  {
    id: "us-la",
    city: "Los Angeles",
    country: "United States",
    flag: "🇺🇸",
    region: "Americas",
    lat: 34.05,
    lng: -118.24,
    mapX: 17.5,
    mapY: 38.0,
    streams: "840K",
    growth: "+9.8%",
    intensity: 0.78,
    color: "lime",
  },
  {
    id: "br-sp",
    city: "São Paulo",
    country: "Brazil",
    flag: "🇧🇷",
    region: "Americas",
    lat: -23.55,
    lng: -46.63,
    mapX: 35.8,
    mapY: 68.5,
    streams: "610K",
    growth: "+14.2%",
    intensity: 0.68,
    color: "lime",
  },
  {
    id: "uk-ldn",
    city: "London",
    country: "United Kingdom",
    flag: "🇬🇧",
    region: "Europe",
    lat: 51.5,
    lng: -0.12,
    mapX: 48.8,
    mapY: 27.5,
    streams: "980K",
    growth: "+8.1%",
    intensity: 0.9,
    color: "lime",
  },
  {
    id: "de-ber",
    city: "Berlin",
    country: "Germany",
    flag: "🇩🇪",
    region: "Europe",
    lat: 52.52,
    lng: 13.4,
    mapX: 53.0,
    mapY: 27.0,
    streams: "754K",
    growth: "+5.6%",
    intensity: 0.75,
    color: "purple",
  },
  {
    id: "fr-par",
    city: "Paris",
    country: "France",
    flag: "🇫🇷",
    region: "Europe",
    lat: 48.85,
    lng: 2.35,
    mapX: 50.0,
    mapY: 30.2,
    streams: "530K",
    growth: "+6.9%",
    intensity: 0.62,
    color: "lime",
  },
  {
    id: "id-jkt",
    city: "Jakarta",
    country: "Indonesia",
    flag: "🇮🇩",
    region: "Asia",
    lat: -6.2,
    lng: 106.8,
    mapX: 78.8,
    mapY: 57.5,
    streams: "890K",
    growth: "+19.4%",
    intensity: 0.88,
    color: "lime",
  },
  {
    id: "jp-tky",
    city: "Tokyo",
    country: "Japan",
    flag: "🇯🇵",
    region: "Asia",
    lat: 35.67,
    lng: 139.65,
    mapX: 86.5,
    mapY: 36.8,
    streams: "720K",
    growth: "+11.2%",
    intensity: 0.76,
    color: "purple",
  },
  {
    id: "kr-sel",
    city: "Seoul",
    country: "South Korea",
    flag: "🇰🇷",
    region: "Asia",
    lat: 37.56,
    lng: 126.97,
    mapX: 83.0,
    mapY: 35.5,
    streams: "640K",
    growth: "+15.0%",
    intensity: 0.7,
    color: "lime",
  },
  {
    id: "au-syd",
    city: "Sydney",
    country: "Australia",
    flag: "🇦🇺",
    region: "Asia",
    lat: -33.86,
    lng: 151.2,
    mapX: 89.5,
    mapY: 74.0,
    streams: "490K",
    growth: "+7.4%",
    intensity: 0.58,
    color: "lime",
  },
];

export default function GlobalStreamsMap3D() {
  const [viewMode, setViewMode] = useState<"3d-map" | "3d-globe">("3d-map");
  const [selectedRegion, setSelectedRegion] = useState<
    "Worldwide" | "Americas" | "Europe" | "Asia"
  >("Worldwide");
  const [activeHub, setActiveHub] = useState<StreamHub>(STREAM_HUBS[0]);
  const [pitch, setPitch] = useState(42); // 3D X-axis tilt angle
  const [yaw, setYaw] = useState(-6); // 3D Z-axis rotation angle
  const [zoom, setZoom] = useState(1.08);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; pitch: number; yaw: number }>({
    x: 0,
    y: 0,
    pitch: 42,
    yaw: -6,
  });

  // Canvas reference for 3D Globe mode
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const globeRotationRef = useRef({ lng: -25, lat: 18 });

  const filteredHubs =
    selectedRegion === "Worldwide"
      ? STREAM_HUBS
      : STREAM_HUBS.filter((h) => h.region === selectedRegion);

  // Region camera presets for 3D Map
  const handleSelectRegion = (reg: "Worldwide" | "Americas" | "Europe" | "Asia") => {
    setSelectedRegion(reg);
    if (reg === "Worldwide") {
      setPitch(42);
      setYaw(-6);
      setZoom(1.08);
    } else if (reg === "Americas") {
      setPitch(48);
      setYaw(12);
      setZoom(1.32);
      setActiveHub(STREAM_HUBS[0]);
    } else if (reg === "Europe") {
      setPitch(50);
      setYaw(0);
      setZoom(1.42);
      setActiveHub(STREAM_HUBS[3]);
    } else if (reg === "Asia") {
      setPitch(46);
      setYaw(-14);
      setZoom(1.32);
      setActiveHub(STREAM_HUBS[6]);
    }
  };

  // Interactive 3D Map Drag Handler
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      pitch,
      yaw,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    if (viewMode === "3d-map") {
      const nextYaw = Math.max(-35, Math.min(35, dragStartRef.current.yaw + dx * 0.18));
      const nextPitch = Math.max(15, Math.min(62, dragStartRef.current.pitch - dy * 0.18));
      setYaw(nextYaw);
      setPitch(nextPitch);
    } else {
      globeRotationRef.current.lng += dx * 0.4;
      globeRotationRef.current.lat = Math.max(
        -60,
        Math.min(60, globeRotationRef.current.lat - dy * 0.3)
      );
      dragStartRef.current.x = e.clientX;
      dragStartRef.current.y = e.clientY;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Render 3D Interactive Sphere Globe when in "3d-globe" mode
  useEffect(() => {
    if (viewMode !== "3d-globe") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let tick = 0;

    const drawGlobe = () => {
      tick += 0.025;
      if (!isDragging) {
        globeRotationRef.current.lng += 0.25;
      }

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.41 * zoom;

      ctx.clearRect(0, 0, w, h);

      // Outer 3D Atmosphere Halo
      const haloGrad = ctx.createRadialGradient(
        cx,
        cy,
        radius * 0.85,
        cx,
        cy,
        radius * 1.22
      );
      haloGrad.addColorStop(0, "rgba(157, 155, 227, 0.35)");
      haloGrad.addColorStop(0.6, "rgba(200, 245, 96, 0.15)");
      haloGrad.addColorStop(1, "rgba(157, 155, 227, 0)");
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.22, 0, Math.PI * 2);
      ctx.fill();

      // 3D Sphere Ocean Body with Specular Lighting
      const oceanGrad = ctx.createRadialGradient(
        cx - radius * 0.3,
        cy - radius * 0.3,
        radius * 0.1,
        cx,
        cy,
        radius
      );
      oceanGrad.addColorStop(0, "#4c3b6e");
      oceanGrad.addColorStop(0.55, "#312042");
      oceanGrad.addColorStop(1, "#1c1228");

      ctx.fillStyle = oceanGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      const rotLng = (globeRotationRef.current.lng * Math.PI) / 180;
      const rotLat = (globeRotationRef.current.lat * Math.PI) / 180;

      // Project 3D (lat, lng, altitude) to 2D canvas
      const project3D = (latDeg: number, lngDeg: number, alt = 0) => {
        const lat = (latDeg * Math.PI) / 180;
        const lng = (lngDeg * Math.PI) / 180 - rotLng;

        const x = Math.cos(lat) * Math.sin(lng);
        const y =
          Math.sin(lat) * Math.cos(rotLat) -
          Math.cos(lat) * Math.cos(lng) * Math.sin(rotLat);
        const z =
          Math.sin(lat) * Math.sin(rotLat) +
          Math.cos(lat) * Math.cos(lng) * Math.cos(rotLat);

        const r = radius * (1 + alt);
        return {
          x: cx + x * r,
          y: cy - y * r,
          z,
        };
      };

      // Draw 3D Latitude / Longitude Graticule Grid
      ctx.strokeStyle = "rgba(180, 179, 220, 0.16)";
      ctx.lineWidth = 0.8;

      for (let lng = -180; lng < 180; lng += 30) {
        ctx.beginPath();
        let started = false;
        for (let lat = -80; lat <= 80; lat += 8) {
          const p = project3D(lat, lng);
          if (p.z > 0) {
            if (!started) {
              ctx.moveTo(p.x, p.y);
              started = true;
            } else {
              ctx.lineTo(p.x, p.y);
            }
          } else {
            started = false;
          }
        }
        ctx.stroke();
      }

      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        let started = false;
        for (let lng = -180; lng <= 180; lng += 8) {
          const p = project3D(lat, lng);
          if (p.z > 0) {
            if (!started) {
              ctx.moveTo(p.x, p.y);
              started = true;
            } else {
              ctx.lineTo(p.x, p.y);
            }
          } else {
            started = false;
          }
        }
        ctx.stroke();
      }

      // Draw 3D Extruded Stream Towers & Pulsing Hotspots on the Globe
      STREAM_HUBS.forEach((hub) => {
        const base = project3D(hub.lat, hub.lng, 0);
        const top = project3D(hub.lat, hub.lng, hub.intensity * 0.22);

        if (base.z > 0.05) {
          // Surface radar ring
          const pulseR = 4 + ((Math.sin(tick * 2 + hub.lat) + 1) * 5);
          ctx.strokeStyle =
            hub.color === "lime"
              ? "rgba(200, 245, 96, 0.45)"
              : "rgba(157, 155, 227, 0.55)";
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(base.x, base.y, pulseR, 0, Math.PI * 2);
          ctx.stroke();

          // 3D Extruded Pillar from surface to altitude
          ctx.strokeStyle = hub.color === "lime" ? "#c8f560" : "#b4b3dc";
          ctx.lineWidth = 3.2;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(base.x, base.y);
          ctx.lineTo(top.x, top.y);
          ctx.stroke();

          // Glowing Tip
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(top.x, top.y, 2.5, 0, Math.PI * 2);
          ctx.fill();

          // City Label
          ctx.fillStyle = "rgba(255,255,255,0.92)";
          ctx.font = "600 9px Inter, sans-serif";
          ctx.fillText(`${hub.city} (${hub.streams})`, top.x + 6, top.y + 3);
        }
      });

      animId = requestAnimationFrame(drawGlobe);
    };

    animId = requestAnimationFrame(drawGlobe);
    return () => cancelAnimationFrame(animId);
  }, [viewMode, zoom, isDragging]);

  return (
    <div className="flex flex-col justify-between h-full select-none text-white">
      {/* Header Controls: Title, 3D Map / 3D Globe Switch, Region Dropdown */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-white">Global Streams Heatmap</h3>
          <span className="px-2 py-0.5 rounded-full bg-[#312042] text-[#c8f560] text-[9px] font-semibold tracking-wider uppercase">
            3D LIVE
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Switch between 3D Tilted Real Map & 3D Interactive Globe */}
          <div className="bg-white/15 p-0.5 rounded-full flex items-center text-[10px]">
            <button
              type="button"
              onClick={() => setViewMode("3d-map")}
              className={`px-2.5 py-1 rounded-full font-medium transition-all flex items-center gap-1 ${
                viewMode === "3d-map"
                  ? "bg-[#312042] text-white shadow-sm"
                  : "text-white/80 hover:text-white"
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>3D Map</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("3d-globe")}
              className={`px-2.5 py-1 rounded-full font-medium transition-all flex items-center gap-1 ${
                viewMode === "3d-globe"
                  ? "bg-[#312042] text-white shadow-sm"
                  : "text-white/80 hover:text-white"
              }`}
            >
              <Globe2 className="w-3 h-3" />
              <span>3D Globe</span>
            </button>
          </div>

          {/* Region Filter */}
          <select
            value={selectedRegion}
            onChange={(e) => handleSelectRegion(e.target.value as any)}
            className="px-2.5 py-1 rounded-full bg-white/15 border border-white/20 text-[11px] font-medium text-white focus:outline-none cursor-pointer"
          >
            <option value="Worldwide" className="bg-[#312042] text-white">Worldwide</option>
            <option value="Americas" className="bg-[#312042] text-white">Americas</option>
            <option value="Europe" className="bg-[#312042] text-white">Europe</option>
            <option value="Asia" className="bg-[#312042] text-white">Asia Pacific</option>
          </select>
        </div>
      </div>

      {/* 3D VIEWPORT CONTAINER */}
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="relative rounded-2xl bg-gradient-to-b from-[#1e152a] via-[#2b1e3d] to-[#1a1226] h-56 overflow-hidden cursor-grab active:cursor-grabbing border border-[#9d9be3]/30 shadow-inner"
        style={{ perspective: "900px" }}
      >
        {/* Subtle Starfield & Atmospheric Grid Backdrop */}
        <div
          className="absolute inset-0 opacity-25 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(200, 245, 96, 0.25), transparent 45%), radial-gradient(circle at 80% 75%, rgba(157, 155, 227, 0.3), transparent 50%)",
          }}
        />

        {viewMode === "3d-map" ? (
          /* ==============================================================
             MODE 1: REAL 3D TILTED WORLD MAP WITH 3D EXTRUDED TOWERS
             ============================================================== */
          <div
            className="w-full h-full flex items-center justify-center transition-transform duration-150 ease-out"
            style={{
              transformStyle: "preserve-3d",
              transform: `scale(${zoom}) rotateX(${pitch}deg) rotateZ(${yaw}deg)`,
            }}
          >
            {/* 3D Map Surface Plane */}
            <div
              className="relative w-[94%] h-[86%] rounded-xl border border-[#9d9be3]/40 shadow-[0_22px_40px_rgba(0,0,0,0.65)]"
              style={{
                transformStyle: "preserve-3d",
                background:
                  "linear-gradient(180deg, rgba(49,32,66,0.95) 0%, rgba(35,23,50,0.98) 100%)",
              }}
            >
              {/* Real Cartographic Map Layer (Wikimedia/OSM Dark-Tinted World Map + Detailed Vector Continents) */}
              <div
                className="absolute inset-0 rounded-xl overflow-hidden opacity-90"
                style={{
                  backgroundImage: `url("https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/World_map_blank_without_borders.svg/1280px-World_map_blank_without_borders.svg.png")`,
                  backgroundSize: "100% 100%",
                  backgroundPosition: "center",
                  filter: "invert(0.78) sepia(0.35) saturate(2.5) hue-rotate(215deg) brightness(0.95)",
                }}
              />

              {/* Latitude / Longitude 3D Surface Grid */}
              <div
                className="absolute inset-0 rounded-xl pointer-events-none opacity-25"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, rgba(200,245,96,0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(157,155,227,0.22) 1px, transparent 1px)",
                  backgroundSize: "10% 20%",
                }}
              />

              {/* 3D Glowing Arc Connections Between Major Streaming Hubs */}
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
                style={{ transform: "translateZ(6px)" }}
              >
                <defs>
                  <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#c8f560" stopOpacity="0.9" />
                    <stop offset="50%" stopColor="#ffffff" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#9d9be3" stopOpacity="0.9" />
                  </linearGradient>
                </defs>
                {/* US -> UK */}
                <path
                  d="M 28.5 34.5 Q 38 14 48.8 27.5"
                  fill="none"
                  stroke="url(#arcGrad)"
                  strokeWidth="0.55"
                  strokeDasharray="2 1.5"
                />
                {/* UK -> Germany -> Jakarta */}
                <path
                  d="M 48.8 27.5 Q 65 34 78.8 57.5"
                  fill="none"
                  stroke="url(#arcGrad)"
                  strokeWidth="0.55"
                  strokeDasharray="2 1.5"
                />
                {/* Jakarta -> Tokyo */}
                <path
                  d="M 78.8 57.5 Q 86 46 86.5 36.8"
                  fill="none"
                  stroke="url(#arcGrad)"
                  strokeWidth="0.55"
                  strokeDasharray="2 1.5"
                />
                {/* US -> Brazil */}
                <path
                  d="M 28.5 34.5 Q 26 52 35.8 68.5"
                  fill="none"
                  stroke="url(#arcGrad)"
                  strokeWidth="0.5"
                  strokeDasharray="2 1.5"
                />
              </svg>

              {/* 3D Extruded Vertical Stream Towers Rising from Real City Coordinates */}
              {filteredHubs.map((hub) => {
                const isSelected = activeHub.id === hub.id;
                const towerHeightPx = Math.round(hub.intensity * 38);
                return (
                  <div
                    key={hub.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveHub(hub);
                    }}
                    onMouseEnter={() => setActiveHub(hub)}
                    style={{
                      left: `${hub.mapX}%`,
                      top: `${hub.mapY}%`,
                      transformStyle: "preserve-3d",
                    }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                  >
                    {/* Pulsing Ground Radar Ring on Map Surface */}
                    <div
                      className={`w-6 h-6 rounded-full -translate-x-1/2 -translate-y-1/2 absolute left-1/2 top-1/2 animate-ping ${
                        hub.color === "lime" ? "bg-[#c8f560]/50" : "bg-[#9d9be3]/50"
                      }`}
                    />

                    {/* Ground Base Pad */}
                    <div
                      className={`w-3 h-3 rounded-full border border-white shadow-md ${
                        hub.color === "lime" ? "bg-[#c8f560]" : "bg-[#9d9be3]"
                      }`}
                    />

                    {/* 3D Vertical Extruded Tower Standing Upright on the Tilted Map */}
                    <div
                      style={{
                        height: `${towerHeightPx}px`,
                        transform: "rotateX(-90deg) translateY(-100%)",
                        transformOrigin: "bottom center",
                      }}
                      className={`w-2 rounded-t-full mx-auto transition-all duration-300 ${
                        hub.color === "lime"
                          ? "bg-gradient-to-t from-[#c8f560]/60 via-[#c8f560] to-white shadow-[0_0_12px_#c8f560]"
                          : "bg-gradient-to-t from-[#9d9be3]/60 via-[#9d9be3] to-white shadow-[0_0_12px_#9d9be3]"
                      } ${isSelected ? "w-2.5 brightness-110" : " opacity-90"}`}
                    />

                    {/* Floating 3D Billboard Label Above the Tower */}
                    <div
                      style={{
                        transform: `translateZ(${towerHeightPx + 10}px) rotateX(${-pitch}deg) rotateZ(${-yaw}deg)`,
                      }}
                      className={`pointer-events-none whitespace-nowrap px-2 py-0.5 rounded-md text-[9px] font-semibold transition-all duration-200 ${
                        isSelected
                          ? "bg-[#312042] text-white border border-[#c8f560] shadow-lg scale-110 z-30"
                          : "bg-[#312042]/90 text-white/90 border border-white/20 opacity-85 group-hover:opacity-100"
                      }`}
                    >
                      <span>{hub.flag}</span> <span>{hub.city}</span>{" "}
                      <span className="text-[#c8f560] font-bold">{hub.streams}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ==============================================================
             MODE 2: INTERACTIVE 3D GLOBE SPHERE
             ============================================================== */
          <canvas
            ref={canvasRef}
            width={460}
            height={224}
            className="w-full h-full block"
          />
        )}

        {/* Bottom-Left Live Selected City Telemetry HUD Overlay */}
        <div className="absolute bottom-2.5 left-2.5 z-20 px-3 py-1.5 rounded-xl bg-[#231832]/90 border border-white/20 text-white text-[10px] flex items-center gap-2.5 shadow-md">
          <span className="text-sm">{activeHub.flag}</span>
          <div>
            <p className="font-semibold leading-tight">
              {activeHub.city}, {activeHub.country}
            </p>
            <p className="text-[9px] text-white/75">
              <span className="text-[#c8f560] font-bold">{activeHub.streams} streams</span> •{" "}
              <span className="text-emerald-300">{activeHub.growth}</span>
            </p>
          </div>
        </div>

        {/* Bottom-Right 3D Camera Controls (Zoom + / - / Reset Tilt) */}
        <div className="absolute bottom-2.5 right-2.5 z-20 flex items-center gap-1">
          <button
            type="button"
            title="Zoom In"
            onClick={() => setZoom((z) => Math.min(1.65, +(z + 0.12).toFixed(2)))}
            className="w-6 h-6 rounded-lg bg-[#231832]/85 hover:bg-[#312042] text-white border border-white/20 flex items-center justify-center"
          >
            <ZoomIn className="w-3 h-3" />
          </button>
          <button
            type="button"
            title="Zoom Out"
            onClick={() => setZoom((z) => Math.max(0.85, +(z - 0.12).toFixed(2)))}
            className="w-6 h-6 rounded-lg bg-[#231832]/85 hover:bg-[#312042] text-white border border-white/20 flex items-center justify-center"
          >
            <ZoomOut className="w-3 h-3" />
          </button>
          <button
            type="button"
            title="Reset 3D Camera Angle"
            onClick={() => {
              setPitch(42);
              setYaw(-6);
              setZoom(1.08);
            }}
            className="w-6 h-6 rounded-lg bg-[#231832]/85 hover:bg-[#312042] text-[#c8f560] border border-white/20 flex items-center justify-center"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        {/* Top-Left Drag Hint */}
        <div className="absolute top-2 left-2.5 z-20 text-[9px] text-white/60 flex items-center gap-1 pointer-events-none">
          <Navigation className="w-2.5 h-2.5 text-[#c8f560]" />
          <span>Drag to rotate 3D map • Click city tower</span>
        </div>
      </div>
    </div>
  );
}

