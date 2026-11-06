"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Wand2,
  Download,
  Check,
  Disc,
  Layers,
  Image as ImageIcon,
  RefreshCw,
  Sliders,
  Type,
  Share2,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";

type GeneratedArt = {
  id: string;
  url: string;
  prompt: string;
  genre: string;
  palette: string;
  date: string;
};

// Curated high quality high-res album art library for realistic AI generative simulation
const ART_PRESETS: Record<string, string[]> = {
  Synthwave: [
    "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200&auto=format&fit=crop&q=90",
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=90",
    "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=90",
    "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200&auto=format&fit=crop&q=90",
  ],
  "Celestial R&B": [
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=90",
    "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=90",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=90",
    "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=90",
  ],
  "3D Iridescent": [
    "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1200&auto=format&fit=crop&q=90",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=90",
    "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=1200&auto=format&fit=crop&q=90",
    "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=1200&auto=format&fit=crop&q=90",
  ],
  "Lo-Fi Chillhop": [
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=90",
    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=90",
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=90",
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=90",
  ],
  "Dark Phonk": [
    "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=90",
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=90",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=90",
  ],
};

const SAMPLE_PROMPTS = [
  {
    genre: "Synthwave",
    text: "Futuristic neon purple cyberpunk city with 80s sun horizon, retro grid synthwave vinyl cover 3000x3000px",
  },
  {
    genre: "Celestial R&B",
    text: "Ethereal violet cosmic nebula galaxy, glowing stardust particles, minimalist modern album aesthetic",
  },
  {
    genre: "3D Iridescent",
    text: "Liquid chrome mercury 3D sphere floating with pearlescent lavender and lime reflections, octane render 8k",
  },
  {
    genre: "Lo-Fi Chillhop",
    text: "Cozy rainy bedroom overlooking midnight Tokyo skyline, pastel neon anime vibes, vintage tape warmth",
  },
  {
    genre: "Dark Phonk",
    text: "Hyper-detailed drift car shrouded in glowing neon mist and dark smoke, gothic underground typography vibe",
  },
];

type AICoverArtGeneratorProps = {
  onSelectForSubmit: (coverUrl: string) => void;
  onNotice: (msg: string) => void;
};

export default function AICoverArtGenerator({
  onSelectForSubmit,
  onNotice,
}: AICoverArtGeneratorProps) {
  const [prompt, setPrompt] = useState(
    "Futuristic neon purple cyberpunk city with 80s sun horizon, retro grid synthwave vinyl cover 3000x3000px"
  );
  const [selectedGenre, setSelectedGenre] = useState("Synthwave");
  const [selectedPalette, setSelectedPalette] = useState("Neon Violet & Lime");
  const [previewMode, setPreviewMode] = useState<"flat" | "vinyl" | "cd">("vinyl");
  const [includeTextOverlay, setIncludeTextOverlay] = useState(true);
  const [overlayTitle, setOverlayTitle] = useState("MIDNIGHT SERENADE");
  const [overlayArtist, setOverlayArtist] = useState("BREAKOUT");

  const [generating, setGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  // Current Generated Cover
  const [currentCover, setCurrentCover] = useState(
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=90"
  );

  // History Gallery
  const [history, setHistory] = useState<GeneratedArt[]>([
    {
      id: "art-1",
      url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
      prompt: "Abstract fluid lavender ripples, minimalist album cover",
      genre: "3D Iridescent",
      palette: "Neon Violet & Lime",
      date: "04-11-2024",
    },
    {
      id: "art-2",
      url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&auto=format&fit=crop&q=80",
      prompt: "Retro neon sunset with grid lines synthwave 80s",
      genre: "Synthwave",
      palette: "Sunset Warmth",
      date: "03-11-2024",
    },
    {
      id: "art-3",
      url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80",
      prompt: "Deep cosmic nebula with glowing stardust",
      genre: "Celestial R&B",
      palette: "Midnight Dream",
      date: "02-11-2024",
    },
  ]);

  const handleGenerate = () => {
    if (!prompt.trim()) {
      onNotice("Silakan ketik prompt ide cover art terlebih dahulu");
      return;
    }

    setGenerating(true);
    setGenerationProgress(10);

    const step1 = setTimeout(() => setGenerationProgress(45), 400);
    const step2 = setTimeout(() => setGenerationProgress(80), 900);
    const step3 = setTimeout(() => {
      setGenerationProgress(100);

      // Pick an image from pool or random variation
      const pool = ART_PRESETS[selectedGenre] || ART_PRESETS["3D Iridescent"];
      const nextImg = pool[Math.floor(Math.random() * pool.length)];
      setCurrentCover(nextImg);

      const newArt: GeneratedArt = {
        id: `art-${Date.now()}`,
        url: nextImg,
        prompt: prompt.trim(),
        genre: selectedGenre,
        palette: selectedPalette,
        date: new Date().toLocaleDateString("id-ID"),
      };
      setHistory((prev) => [newArt, ...prev]);

      setGenerating(false);
      onNotice("Artwork 3000x3000px berhasil di-generate!");
    }, 1500);

    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
    };
  };

  const handleApplyPreset = (item: { genre: string; text: string }) => {
    setSelectedGenre(item.genre);
    setPrompt(item.text);
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = currentCover;
    link.download = `cover_art_${overlayTitle.toLowerCase().replace(/\s+/g, "_")}_3000x3000.jpg`;
    link.target = "_blank";
    link.click();
    onNotice("Mengunduh cover art master (3000 x 3000 px)...");
  };

  return (
    <div className="space-y-6 animate-card-enter">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#c8f560] text-[#312042] shadow-md">
              <Sparkles className="w-5 h-5" />
            </span>
            <span>Studio AI Cover Art Generator</span>
          </h2>
          <p className="text-xs text-white/75 mt-1">
            Buat artwork cover album musik resolusi tinggi standar distribusi (3000 × 3000 px • 300 DPI) secara instan
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full bg-[#c8f560]/20 border border-[#c8f560]/40 text-[#c8f560] text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#c8f560] animate-pulse" />
            3000 × 3000 PX ULTRA-HD
          </span>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Generation Controls & Prompts */}
        <div className="lg:col-span-6 space-y-5">
          {/* Prompt Input Card */}
          <div className="bg-[#8a88b5]/70 border border-white/20 rounded-[28px] p-6 text-white shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-[#c8f560]" />
                <span>Prompt Deskripsi Visual</span>
              </span>
              <span className="text-[11px] text-white/60">AI Music Diffusion 4.0</span>
            </div>

            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Jelaskan konsep cover lagu Anda... (contoh: cyberpunk neon city with purple glow, vinyl album style)"
              className="w-full px-4 py-3 rounded-2xl bg-white/15 border border-white/25 text-white text-xs placeholder:text-white/40 focus:outline-none focus:border-[#c8f560] transition-colors leading-relaxed"
            />

            {/* Quick Inspiration Chips */}
            <div>
              <p className="text-[11px] font-semibold text-white/75 mb-2">
                💡 Rekomendasi Prompt Genre:
              </p>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_PROMPTS.map((p) => (
                  <button
                    key={p.genre}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-medium border transition-all ${
                      selectedGenre === p.genre
                        ? "bg-[#c8f560] text-[#312042] border-[#c8f560] font-bold shadow"
                        : "bg-white/10 text-white hover:bg-white/20 border-white/15"
                    }`}
                  >
                    {p.genre}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Style & Color Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-white/70 text-xs mb-1 font-medium">
                  Style Visual:
                </label>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/15 border border-white/25 text-white text-xs font-semibold focus:outline-none focus:border-[#c8f560]"
                >
                  <option value="Synthwave" className="bg-[#312042]">
                    🌆 Synthwave / Cyberpunk
                  </option>
                  <option value="Celestial R&B" className="bg-[#312042]">
                    🌌 Celestial / Cosmic R&B
                  </option>
                  <option value="3D Iridescent" className="bg-[#312042]">
                    🔮 3D Iridescent Fluid Liquid
                  </option>
                  <option value="Lo-Fi Chillhop" className="bg-[#312042]">
                    🎧 Lo-Fi Chillhop Aesthetic
                  </option>
                  <option value="Dark Phonk" className="bg-[#312042]">
                    🌑 Dark Phonk & Gothic Drift
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-white/70 text-xs mb-1 font-medium">
                  Tone Warna:
                </label>
                <select
                  value={selectedPalette}
                  onChange={(e) => setSelectedPalette(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/15 border border-white/25 text-white text-xs font-semibold focus:outline-none focus:border-[#c8f560]"
                >
                  <option value="Neon Violet & Lime" className="bg-[#312042]">
                    🟣 Neon Violet & Lime
                  </option>
                  <option value="Midnight Dream" className="bg-[#312042]">
                    🔵 Midnight Deep Blue
                  </option>
                  <option value="Sunset Warmth" className="bg-[#312042]">
                    🟠 Sunset Warm Gold
                  </option>
                  <option value="Monochrome Chrome" className="bg-[#312042]">
                    ⚪ Monochrome Liquid Chrome
                  </option>
                </select>
              </div>
            </div>

            {/* Typography Overlay Settings */}
            <div className="pt-3 border-t border-white/15 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-[#c8f560]" />
                  <span>Overlay Judul Lagu & Artis</span>
                </span>
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={includeTextOverlay}
                    onChange={(e) => setIncludeTextOverlay(e.target.checked)}
                    className="accent-[#c8f560] w-4 h-4 rounded"
                  />
                  <span className="text-white/80">Tampilkan Typography</span>
                </label>
              </div>

              {includeTextOverlay && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      value={overlayTitle}
                      onChange={(e) => setOverlayTitle(e.target.value)}
                      placeholder="Judul Lagu..."
                      className="w-full px-3 py-2 rounded-xl bg-white/15 border border-white/25 text-white text-xs uppercase font-bold focus:outline-none focus:border-[#c8f560]"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={overlayArtist}
                      onChange={(e) => setOverlayArtist(e.target.value)}
                      placeholder="Nama Artis..."
                      className="w-full px-3 py-2 rounded-xl bg-white/15 border border-white/25 text-white text-xs uppercase font-semibold focus:outline-none focus:border-[#c8f560]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Generate Trigger Button */}
            <button
              type="button"
              disabled={generating}
              onClick={handleGenerate}
              className="w-full py-3.5 rounded-2xl bg-[#c8f560] hover:opacity-90 text-[#312042] font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-xl transition-all scale-100 hover:scale-[1.01] active:scale-[0.99]"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {generating
                  ? `Mengenerate Artwork (${generationProgress}%)...`
                  : "Generate Cover Art Baru Sekarang"}
              </span>
            </button>

            {/* Progress bar during generation */}
            {generating && (
              <div className="w-full bg-black/25 rounded-full h-2 overflow-hidden border border-white/15">
                <div
                  className="bg-gradient-to-r from-[#c8f560] via-white to-[#c8f560] h-full transition-all duration-300"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Mockup Showcase (Flat / Vinyl / CD) & Action Buttons */}
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-[#8a88b5]/70 border border-white/20 rounded-[28px] p-6 text-white shadow-lg flex flex-col items-center">
            {/* Mockup Mode Selector */}
            <div className="w-full flex items-center justify-between pb-4 border-b border-white/15 mb-6">
              <span className="text-xs font-semibold text-white/80">
                Format Tampilan Mockup:
              </span>
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/25 border border-white/15 text-xs">
                <button
                  type="button"
                  onClick={() => setPreviewMode("vinyl")}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    previewMode === "vinyl"
                      ? "bg-[#c8f560] text-[#312042] font-bold"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  Vinyl LP
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode("flat")}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    previewMode === "flat"
                      ? "bg-[#c8f560] text-[#312042] font-bold"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  Square 1:1
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode("cd")}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    previewMode === "cd"
                      ? "bg-[#c8f560] text-[#312042] font-bold"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  Jewel Case
                </button>
              </div>
            </div>

            {/* The Visual Artwork Canvas Display */}
            <div className="relative w-full max-w-sm aspect-square flex items-center justify-center my-2 select-none group">
              {/* If Vinyl mode: realistic vinyl sleeve + vinyl disc slipping out */}
              {previewMode === "vinyl" ? (
                <div className="relative w-64 h-64 sm:w-72 sm:h-72">
                  {/* Vinyl Record */}
                  <div className="absolute right-0 top-2 bottom-2 w-56 rounded-full bg-[#111115] shadow-2xl border-4 border-black/40 flex items-center justify-center translate-x-8 group-hover:translate-x-12 transition-transform duration-500">
                    <div className="w-48 h-48 rounded-full border border-white/10 flex items-center justify-center">
                      <div className="w-36 h-36 rounded-full border border-white/10 flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-[#c8f560] flex items-center justify-center shadow-inner">
                          <div className="w-4 h-4 rounded-full bg-black" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Album Sleeve */}
                  <div className="relative z-10 w-56 h-56 sm:w-64 sm:h-64 rounded-2xl overflow-hidden shadow-2xl border border-white/30 bg-[#312042]">
                    <img
                      src={currentCover}
                      alt="Generated Artwork"
                      className="w-full h-full object-cover"
                    />
                    {/* Typography Overlay */}
                    {includeTextOverlay && (
                      <div className="absolute inset-0 p-4 flex flex-col justify-between bg-gradient-to-t from-black/75 via-transparent to-black/40">
                        <p className="text-[10px] uppercase font-mono tracking-[0.25em] text-[#c8f560] font-bold drop-shadow">
                          {overlayArtist}
                        </p>
                        <div>
                          <h4 className="text-sm sm:text-base font-black tracking-wider text-white uppercase drop-shadow-md">
                            {overlayTitle}
                          </h4>
                          <span className="text-[8px] tracking-widest text-white/60 font-mono">
                            OFFICIAL DIGITAL MASTER
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : previewMode === "cd" ? (
                /* CD Jewel Case */
                <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-2xl p-2 bg-white/20 border border-white/40 shadow-2xl backdrop-blur-md flex items-center justify-center">
                  <div className="relative w-full h-full rounded-xl overflow-hidden border border-black/30">
                    <img
                      src={currentCover}
                      alt="Generated Artwork"
                      className="w-full h-full object-cover"
                    />
                    {includeTextOverlay && (
                      <div className="absolute inset-0 p-4 flex flex-col justify-between bg-gradient-to-t from-black/70 via-transparent to-black/35">
                        <p className="text-[10px] uppercase font-mono tracking-[0.25em] text-[#c8f560] font-bold drop-shadow">
                          {overlayArtist}
                        </p>
                        <h4 className="text-sm sm:text-base font-black tracking-wider text-white uppercase drop-shadow-md">
                          {overlayTitle}
                        </h4>
                      </div>
                    )}
                  </div>
                  {/* Glass Sheen */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent rounded-2xl" />
                </div>
              ) : (
                /* Flat 1:1 Square */
                <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-2xl overflow-hidden shadow-2xl border border-white/30 bg-[#312042]">
                  <img
                    src={currentCover}
                    alt="Generated Artwork"
                    className="w-full h-full object-cover"
                  />
                  {includeTextOverlay && (
                    <div className="absolute inset-0 p-4 flex flex-col justify-between bg-gradient-to-t from-black/75 via-transparent to-black/40">
                      <p className="text-[10px] uppercase font-mono tracking-[0.25em] text-[#c8f560] font-bold drop-shadow">
                        {overlayArtist}
                      </p>
                      <div>
                        <h4 className="text-sm sm:text-base font-black tracking-wider text-white uppercase drop-shadow-md">
                          {overlayTitle}
                        </h4>
                        <span className="text-[8px] tracking-widest text-white/60 font-mono">
                          3000 × 3000 PX • RGB
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Spec info badge */}
            <p className="text-xs text-white/75 mt-4 text-center">
              Resolusi: <span className="font-bold text-[#c8f560]">3000 × 3000 px</span> • Siap untuk Spotify, Apple Music & TikTok
            </p>

            {/* Action Buttons */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5 pt-4 border-t border-white/15">
              {/* Use for Submit Track */}
              <button
                type="button"
                onClick={() => onSelectForSubmit(currentCover)}
                className="py-3 px-4 rounded-xl bg-[#c8f560] hover:opacity-90 text-[#312042] font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Gunakan untuk Submit Track</span>
              </button>

              {/* Download Master Art */}
              <button
                type="button"
                onClick={handleDownload}
                className="py-3 px-4 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-4 h-4 text-[#c8f560]" />
                <span>Unduh Gambar (JPG)</span>
              </button>
            </div>
          </div>

          {/* History Gallery of Generated Covers */}
          <div className="bg-[#8a88b5]/70 border border-white/20 rounded-[28px] p-5 text-white shadow-lg space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/15">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#c8f560]" />
                <span>Riwayat Hasil Generate Anda</span>
              </span>
              <span className="text-[10px] text-white/60">
                {history.length} Artwork Tersimpan
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {history.map((art) => (
                <div
                  key={art.id}
                  onClick={() => {
                    setCurrentCover(art.url);
                    onNotice("Artwork dipilih untuk preview!");
                  }}
                  className={`group relative aspect-square rounded-xl overflow-hidden cursor-pointer border transition-all ${
                    currentCover === art.url
                      ? "border-[#c8f560] ring-2 ring-[#c8f560]/40 scale-105"
                      : "border-white/20 hover:border-white/50"
                  }`}
                >
                  <img
                    src={art.url}
                    alt={art.prompt}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-bold text-white">
                    Pilih
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

