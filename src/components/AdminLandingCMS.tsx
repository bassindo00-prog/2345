"use client";

import React, { useState, useEffect } from "react";
import {
  Globe,
  Upload,
  Plus,
  Trash2,
  Edit2,
  Check,
  Save,
  RotateCcw,
  ExternalLink,
  Image as ImageIcon,
  Users,
  Sparkles,
  CheckCircle2,
  Music,
  HelpCircle,
  MessageSquare,
  Layers,
  Send,
} from "lucide-react";
import {
  DEFAULT_LANDING_DATA,
  DEFAULT_PLATFORMS,
  DEFAULT_RELEASES,
  DEFAULT_FEATURES,
  DEFAULT_FAQS,
  DEFAULT_TESTIMONIALS_LIST,
  DEFAULT_ROSTER,
  DEFAULT_CONTACT_DATA,
  normalizeImageUrl,
  type ReleaseItem,
  type FeatureItem,
  type FaqItem,
  type TestiItem,
  type RosterArtist,
  type ContactSectionData,
  type LandingPageData,
} from "@/lib/landingDefaults";
import { resolveDspPlatform } from "@/lib/dspPlatforms";

const ROYALTY_CARD =
  "bg-[#8a88b5]/70 border border-white/20 rounded-[28px] p-6 text-white shadow-lg";

interface AdminLandingCMSProps {
  showNotice: (msg: string) => void;
}

export default function AdminLandingCMS({ showNotice }: AdminLandingCMSProps) {
  const [activeSubTab, setActiveSubTab] = useState<
    "releases" | "roster" | "testimonials" | "features" | "faqs" | "platforms" | "contact"
  >("releases");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  // State from Bar 2 to Bar 8
  const [platforms, setPlatforms] = useState<string[]>(DEFAULT_PLATFORMS);
  const [newPlatformText, setNewPlatformText] = useState("");

  const [releases, setReleases] = useState<ReleaseItem[]>(DEFAULT_RELEASES);
  const [releaseModalOpen, setReleaseModalOpen] = useState(false);
  const [editingReleaseId, setEditingReleaseId] = useState<string | number | null>(null);
  const [releaseForm, setReleaseForm] = useState<ReleaseItem>({
    id: "",
    title: "",
    artist: "",
    coverUrl: "",
    tag: "Live di DSP",
    listenUrl: "/login",
  });

  const [roster, setRoster] = useState<RosterArtist[]>(DEFAULT_ROSTER);
  const [rosterModalOpen, setRosterModalOpen] = useState(false);
  const [editingRosterId, setEditingRosterId] = useState<string | number | null>(null);
  const [rosterForm, setRosterForm] = useState<RosterArtist>({
    id: "",
    name: "",
    imageUrl: "",
  });

  const [testimonials, setTestimonials] = useState<TestiItem[]>(DEFAULT_TESTIMONIALS_LIST);
  const [testiModalOpen, setTestiModalOpen] = useState(false);
  const [editingTestiId, setEditingTestiId] = useState<string | number | null>(null);
  const [testiForm, setTestiForm] = useState<TestiItem>({
    id: "",
    text: "",
    author: "",
    avatar: "",
  });

  const [features, setFeatures] = useState<FeatureItem[]>(DEFAULT_FEATURES);
  const [faqs, setFaqs] = useState<FaqItem[]>(DEFAULT_FAQS);
  const [contact, setContact] = useState<ContactSectionData>(DEFAULT_CONTACT_DATA);

  // Fetch CMS Data
  useEffect(() => {
    fetchCmsData();
  }, []);

  const fetchCmsData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cms/landing");
      const json = await res.json();
      if (json?.data) {
        const d: LandingPageData = json.data;
        if (Array.isArray(d.platforms) && d.platforms.length > 0) setPlatforms(d.platforms);
        if (Array.isArray(d.releases) && d.releases.length > 0) setReleases(d.releases);
        if (Array.isArray(d.features) && d.features.length > 0) setFeatures(d.features);
        if (Array.isArray(d.faqs) && d.faqs.length > 0) setFaqs(d.faqs);
        if (Array.isArray(d.testimonials) && d.testimonials.length > 0) setTestimonials(d.testimonials);
        if (Array.isArray(d.roster) && d.roster.length > 0) setRoster(d.roster);
        if (d.contact && typeof d.contact === "object") setContact(d.contact);
      }
    } catch (err) {
      console.error("Fetch CMS error:", err);
      showNotice("Gagal mengambil data CMS Landing Page.");
    } finally {
      setLoading(false);
    }
  };

  // Upload Image Handler
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldKey: string,
    callback: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showNotice("Ukuran file maksimal 10MB!");
      return;
    }

    setUploadingField(fieldKey);

    const reader = new FileReader();
    reader.onload = async (readEvt) => {
      const clientDataUrl = readEvt.target?.result as string;

      try {
        const fd = new FormData();
        fd.append("file", file);

        const res = await fetch("/api/cms/upload", {
          method: "POST",
          body: fd,
        });

        const json = await res.json().catch(() => null);
        if (res.ok && json?.url) {
          const finalUrl = normalizeImageUrl(json.url);
          callback(finalUrl);
          showNotice(`✅ Foto berhasil diunggah: ${file.name}`);
        } else if (clientDataUrl) {
          callback(clientDataUrl);
          showNotice(`✅ Foto berhasil dimuat: ${file.name}`);
        } else {
          showNotice(json?.error || "Gagal mengunggah gambar.");
        }
      } catch (err) {
        console.warn("Upload network error, using client Data URL fallback:", err);
        if (clientDataUrl) {
          callback(clientDataUrl);
          showNotice(`✅ Foto berhasil dimuat: ${file.name}`);
        }
      } finally {
        setUploadingField(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save All CMS Data to DB
  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const payload = {
        platforms,
        releases,
        features,
        faqs,
        testimonials,
        roster,
        contact,
      };

      const res = await fetch("/api/cms/landing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok && json?.ok) {
        showNotice("🎉 Berhasil! Seluruh data Bar 2 sampai bawah tersimpan & singkron dengan landing page!");
      } else {
        showNotice(json?.error || "Gagal menyimpan perubahan CMS.");
      }
    } catch (err: any) {
      console.error("Save CMS error:", err);
      showNotice("Terjadi kesalahan saat menyimpan ke database.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={`${ROYALTY_CARD} flex flex-col items-center justify-center p-12 text-center`}>
        <div className="w-10 h-10 border-4 border-pink-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-semibold text-lg">Memuat data Web CMS Landing Page...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Save Button */}
      <div className={`${ROYALTY_CARD} flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
        <div>
          <div className="flex items-center gap-2.5">
            <Globe className="w-6 h-6 text-[#ff7fab]" />
            <h2 className="text-xl md:text-2xl font-black tracking-tight">Web CMS Landing Page</h2>
          </div>
          <p className="text-xs md:text-sm text-white/80 mt-1">
            Singkronkan dan kelola seluruh konten dari Bar 2 (Platforms) hingga Bar 8 (Kontak & Roster) secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-xs md:text-sm font-semibold transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Lihat Web</span>
          </a>

          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#ff7fab] hover:bg-[#ff6a9c] text-white font-bold text-xs md:text-sm shadow-lg hover:shadow-pink-500/30 transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Subtabs Bar 2 to Bar 8 */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10">
        <button
          onClick={() => setActiveSubTab("releases")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === "releases"
              ? "bg-[#ff7fab] text-white shadow-md"
              : "bg-white/10 text-white/70 hover:bg-white/15 hover:text-white"
          }`}
        >
          <Music className="w-3.5 h-3.5" />
          <span>Bar 3: New Releases ({releases.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("roster")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === "roster"
              ? "bg-[#ff7fab] text-white shadow-md"
              : "bg-white/10 text-white/70 hover:bg-white/15 hover:text-white"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Bar 7: Artis Roster ({roster.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("testimonials")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === "testimonials"
              ? "bg-[#ff7fab] text-white shadow-md"
              : "bg-white/10 text-white/70 hover:bg-white/15 hover:text-white"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Bar 6: Testimoni ({testimonials.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("features")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === "features"
              ? "bg-[#ff7fab] text-white shadow-md"
              : "bg-white/10 text-white/70 hover:bg-white/15 hover:text-white"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Bar 4: Fitur & Layanan ({features.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("faqs")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === "faqs"
              ? "bg-[#ff7fab] text-white shadow-md"
              : "bg-white/10 text-white/70 hover:bg-white/15 hover:text-white"
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Bar 5: FAQ ({faqs.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("platforms")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === "platforms"
              ? "bg-[#ff7fab] text-white shadow-md"
              : "bg-white/10 text-white/70 hover:bg-white/15 hover:text-white"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Bar 2: Platforms Ticker</span>
        </button>

        <button
          onClick={() => setActiveSubTab("contact")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === "contact"
              ? "bg-[#ff7fab] text-white shadow-md"
              : "bg-white/10 text-white/70 hover:bg-white/15 hover:text-white"
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>Bar 8: Kontak / CTA</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: BAR 3 - NEW RELEASES DECK
         ========================================================================= */}
      {activeSubTab === "releases" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-white/80">
              Kelola rilisan lagu pada 3D Coverflow Deck di Bar 3 landing page.
            </p>
            <button
              onClick={() => {
                setEditingReleaseId(null);
                setReleaseForm({
                  id: Date.now(),
                  title: "",
                  artist: "",
                  coverUrl: "https://placehold.co/400x600/141114/ffffff?text=New+Song",
                  tag: "Live di DSP",
                  listenUrl: "/login",
                });
                setReleaseModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#ff7fab] hover:bg-[#ff6a9c] text-white font-bold text-xs shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Rilisan Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {releases.map((rel, idx) => (
              <div
                key={rel.id || idx}
                className={`${ROYALTY_CARD} flex gap-4 items-center group relative overflow-hidden`}
              >
                <div className="w-20 h-28 rounded-xl overflow-hidden bg-black/40 flex-shrink-0 border border-white/10 shadow-md">
                  <img
                    src={normalizeImageUrl(rel.coverUrl)}
                    alt={rel.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "https://placehold.co/400x600/141114/ffffff?text=Cover";
                    }}
                  />
                </div>

                <div className="flex-grow min-w-0">
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-1">
                    {rel.tag || "Live di DSP"}
                  </span>
                  <h4 className="font-bold text-sm text-white truncate">{rel.artist}</h4>
                  <p className="text-xs text-white/70 truncate">{rel.title}</p>
                  <p className="text-[11px] text-[#ff7fab] mt-2 truncate">{rel.listenUrl || "/login"}</p>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setEditingReleaseId(rel.id);
                      setReleaseForm(rel);
                      setReleaseModalOpen(true);
                    }}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Hapus rilisan "${rel.title}"?`)) {
                        setReleases((prev) => prev.filter((r) => r.id !== rel.id));
                      }
                    }}
                    className="p-2 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: BAR 7 - ARTIS ROSTER
         ========================================================================= */}
      {activeSubTab === "roster" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-white/80">
              Kelola artis pada Featured Roster horizontal slider di Bar 7 landing page.
            </p>
            <button
              onClick={() => {
                setEditingRosterId(null);
                setRosterForm({
                  id: Date.now(),
                  name: "",
                  imageUrl: "https://placehold.co/300x300/ff7fab/ffffff?text=Artis+Baru",
                });
                setRosterModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#ff7fab] hover:bg-[#ff6a9c] text-white font-bold text-xs shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Artis Roster</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {roster.map((art, idx) => (
              <div
                key={art.id || idx}
                className={`${ROYALTY_CARD} flex flex-col items-center text-center p-4 relative group`}
              >
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#ff7fab]/60 bg-black/40 shadow-md mb-3">
                  <img
                    src={normalizeImageUrl(art.imageUrl)}
                    alt={art.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "https://placehold.co/300x300/ff7fab/ffffff?text=Artis";
                    }}
                  />
                </div>
                <h4 className="font-bold text-sm text-white truncate w-full mb-3">{art.name}</h4>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingRosterId(art.id);
                      setRosterForm(art);
                      setRosterModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Hapus artis "${art.name}"?`)) {
                        setRoster((prev) => prev.filter((a) => a.id !== art.id));
                      }
                    }}
                    className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white text-xs"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: BAR 6 - TESTIMONI
         ========================================================================= */}
      {activeSubTab === "testimonials" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-white/80">
              Kelola kutipan ulasan artis pada bagian Testimoni di Bar 6 landing page.
            </p>
            <button
              onClick={() => {
                setEditingTestiId(null);
                setTestiForm({
                  id: Date.now(),
                  text: "",
                  author: "",
                  avatar: "https://placehold.co/100x100/ff7fab/ffffff?text=A",
                });
                setTestiModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#ff7fab] hover:bg-[#ff6a9c] text-white font-bold text-xs shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Testimoni</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {testimonials.map((t, idx) => (
              <div key={t.id || idx} className={`${ROYALTY_CARD} flex flex-col justify-between`}>
                <p className="text-xs md:text-sm italic text-white/90 mb-4 leading-relaxed">
                  "{t.text}"
                </p>
                <div className="flex items-center justify-between border-t border-white/10 pt-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={normalizeImageUrl(t.avatar)}
                      alt={t.author}
                      className="w-9 h-9 rounded-full object-cover border border-[#ff7fab]/60 flex-shrink-0"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "https://placehold.co/100x100/ff7fab/ffffff?text=A";
                      }}
                    />
                    <span className="text-xs font-bold text-white truncate">{t.author}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => {
                        setEditingTestiId(t.id);
                        setTestiForm(t);
                        setTestiModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus testimoni oleh "${t.author}"?`)) {
                          setTestimonials((prev) => prev.filter((item) => item.id !== t.id));
                        }
                      }}
                      className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white text-xs"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: BAR 4 - FITUR & LAYANAN
         ========================================================================= */}
      {activeSubTab === "features" && (
        <div className="space-y-4">
          <p className="text-sm text-white/80">
            Edit judul dan penjelasan kartu fitur & layanan di Bar 4 landing page.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feat, idx) => (
              <div key={feat.id || idx} className={`${ROYALTY_CARD} space-y-3`}>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#ff7fab]/20 text-[#ff7fab] border border-[#ff7fab]/30">
                    Layanan #{idx + 1}
                  </span>
                </div>

                <div>
                  <label className="text-xs text-white/70 block mb-1">Judul Layanan</label>
                  <input
                    type="text"
                    value={feat.title}
                    onChange={(e) => {
                      const updated = [...features];
                      updated[idx].title = e.target.value;
                      setFeatures(updated);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-black/20 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-[#ff7fab]"
                  />
                </div>

                <div>
                  <label className="text-xs text-white/70 block mb-1">Deskripsi Lengkap</label>
                  <textarea
                    rows={3}
                    value={feat.desc}
                    onChange={(e) => {
                      const updated = [...features];
                      updated[idx].desc = e.target.value;
                      setFeatures(updated);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-black/20 border border-white/10 text-white text-xs leading-relaxed focus:outline-none focus:border-[#ff7fab]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[11px] text-white/60 block mb-1">Teks Link</label>
                    <input
                      type="text"
                      value={feat.linkText || "Pelajari Selengkapnya →"}
                      onChange={(e) => {
                        const updated = [...features];
                        updated[idx].linkText = e.target.value;
                        setFeatures(updated);
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-black/20 border border-white/10 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-white/60 block mb-1">Tujuan Link (URL)</label>
                    <input
                      type="text"
                      value={feat.linkUrl || "/register"}
                      onChange={(e) => {
                        const updated = [...features];
                        updated[idx].linkUrl = e.target.value;
                        setFeatures(updated);
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-black/20 border border-white/10 text-white text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: BAR 5 - FAQ
         ========================================================================= */}
      {activeSubTab === "faqs" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-white/80">
              Kelola pertanyaan dan jawaban accordion FAQ di Bar 5 landing page.
            </p>
            <button
              onClick={() => {
                setFaqs((prev) => [
                  ...prev,
                  {
                    id: Date.now(),
                    q: "Pertanyaan Baru?",
                    a: "Jawaban penjelasan di sini.",
                  },
                ]);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#ff7fab] hover:bg-[#ff6a9c] text-white font-bold text-xs shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Pertanyaan FAQ</span>
            </button>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={faq.id || idx} className={`${ROYALTY_CARD} space-y-3`}>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#ff7fab]">Pertanyaan #{idx + 1}</span>
                  <button
                    onClick={() => {
                      if (confirm("Hapus pertanyaan FAQ ini?")) {
                        setFaqs((prev) => prev.filter((_, i) => i !== idx));
                      }
                    }}
                    className="p-1 rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div>
                  <input
                    type="text"
                    value={faq.q}
                    onChange={(e) => {
                      const updated = [...faqs];
                      updated[idx].q = e.target.value;
                      setFaqs(updated);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-black/20 border border-white/10 text-white text-xs font-bold"
                    placeholder="Pertanyaan"
                  />
                </div>
                <div>
                  <textarea
                    rows={2}
                    value={faq.a}
                    onChange={(e) => {
                      const updated = [...faqs];
                      updated[idx].a = e.target.value;
                      setFaqs(updated);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-black/20 border border-white/10 text-white text-xs leading-relaxed"
                    placeholder="Jawaban"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: BAR 2 - PLATFORMS TICKER
         ========================================================================= */}
      {activeSubTab === "platforms" && (
        <div className={`${ROYALTY_CARD} space-y-6`}>
          <div>
            <h3 className="font-bold text-base text-white">Platform Digital Streaming (Bar 2)</h3>
            <p className="text-xs text-white/70 mt-1">
              Daftar platform musik yang ditampilkan berjalan ke kiri pada ticker hitam Bar 2.
            </p>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newPlatformText}
              onChange={(e) => setNewPlatformText(e.target.value)}
              placeholder="Ketik nama platform baru (misal: Beatport, JOOX)..."
              className="flex-grow px-3 py-2.5 rounded-xl bg-black/20 border border-white/10 text-white text-xs focus:outline-none focus:border-[#ff7fab]"
            />
            <button
              onClick={() => {
                if (!newPlatformText.trim()) return;
                setPlatforms((prev) => [...prev, newPlatformText.trim()]);
                setNewPlatformText("");
              }}
              className="px-4 py-2.5 rounded-xl bg-[#ff7fab] hover:bg-[#ff6a9c] text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2.5 pt-2">
            {platforms.map((p, idx) => {
              const info = resolveDspPlatform(p);
              return (
                <span
                  key={idx}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-white/20 text-xs text-white"
                >
                  <img
                    src={info.logoUrl}
                    alt={p}
                    className="w-4 h-4 rounded-full object-contain bg-white p-0.5"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = "none";
                    }}
                  />
                  <span className="font-semibold">{info.name}</span>
                  {info.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 bg-[#ff7fab]/25 text-[#ff7fab] font-bold rounded">
                      {info.badge}
                    </span>
                  )}
                  <button
                    onClick={() => setPlatforms((prev) => prev.filter((_, i) => i !== idx))}
                    className="hover:text-rose-400 ml-1 text-xs font-bold"
                    title="Hapus"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 7: BAR 8 - KONTAK / CTA
         ========================================================================= */}
      {activeSubTab === "contact" && (
        <div className={`${ROYALTY_CARD} space-y-4 max-w-xl`}>
          <h3 className="font-bold text-base text-white">Bagian Kontak & Ajakan Rilis (Bar 8)</h3>
          <div>
            <label className="text-xs text-white/70 block mb-1">Judul Utama (Headline)</label>
            <input
              type="text"
              value={contact.headline}
              onChange={(e) => setContact({ ...contact, headline: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-black/20 border border-white/10 text-white text-xs font-bold"
            />
          </div>
          <div>
            <label className="text-xs text-white/70 block mb-1">Subjudul (Deskripsi)</label>
            <textarea
              rows={2}
              value={contact.subtitle}
              onChange={(e) => setContact({ ...contact, subtitle: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-black/20 border border-white/10 text-white text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/70 block mb-1">Teks Tombol</label>
              <input
                type="text"
                value={contact.buttonText}
                onChange={(e) => setContact({ ...contact, buttonText: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-black/20 border border-white/10 text-white text-xs font-bold"
              />
            </div>
            <div>
              <label className="text-xs text-white/70 block mb-1">Placeholder Email</label>
              <input
                type="text"
                value={contact.placeholder}
                onChange={(e) => setContact({ ...contact, placeholder: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-black/20 border border-white/10 text-white text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: EDIT / TAMBAH RILISAN (BAR 3)
         ========================================================================= */}
      {releaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1f1a24] border border-white/20 rounded-2xl w-full max-w-md p-6 text-white shadow-2xl space-y-4">
            <h3 className="text-lg font-bold">
              {editingReleaseId ? "Edit Rilisan Lagu" : "Tambah Rilisan Baru"}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-white/70 block mb-1">Nama Artis</label>
                <input
                  type="text"
                  value={releaseForm.artist}
                  onChange={(e) => setReleaseForm({ ...releaseForm, artist: e.target.value })}
                  placeholder="Misal: Pop Punk Boy"
                  className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-xs text-white/70 block mb-1">Judul Lagu</label>
                <input
                  type="text"
                  value={releaseForm.title}
                  onChange={(e) => setReleaseForm({ ...releaseForm, title: e.target.value })}
                  placeholder="Misal: Semoga Ku Sekuat..."
                  className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-xs text-white/70 block mb-1">Badge Tag</label>
                <input
                  type="text"
                  value={releaseForm.tag || "Live di DSP"}
                  onChange={(e) => setReleaseForm({ ...releaseForm, tag: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-xs text-white/70 block mb-1">Link Dengarkan (URL)</label>
                <input
                  type="text"
                  value={releaseForm.listenUrl || "/login"}
                  onChange={(e) => setReleaseForm({ ...releaseForm, listenUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-xs text-white/70 block mb-1">Cover Foto Rilisan</label>
                <div className="flex gap-3 items-center">
                  <div className="w-14 h-18 rounded-lg overflow-hidden bg-black/40 border border-white/10 flex-shrink-0">
                    <img
                      src={normalizeImageUrl(releaseForm.coverUrl)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "https://placehold.co/400x600/141114/ffffff?text=Cover";
                      }}
                    />
                  </div>
                  <label className="cursor-pointer px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1.5 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Cover Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleFileUpload(e, "releaseCover", (url) =>
                          setReleaseForm((prev) => ({ ...prev, coverUrl: url }))
                        )
                      }
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => setReleaseModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (!releaseForm.artist || !releaseForm.title) {
                    showNotice("Nama artis dan judul lagu wajib diisi!");
                    return;
                  }
                  if (editingReleaseId) {
                    setReleases((prev) =>
                      prev.map((r) => (r.id === editingReleaseId ? { ...releaseForm } : r))
                    );
                  } else {
                    setReleases((prev) => [...prev, { ...releaseForm, id: Date.now() }]);
                  }
                  setReleaseModalOpen(false);
                }}
                className="px-5 py-2 rounded-xl bg-[#ff7fab] hover:bg-[#ff6a9c] text-white text-xs font-bold shadow-md"
              >
                Simpan Rilisan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: EDIT / TAMBAH ARTIS ROSTER (BAR 7)
         ========================================================================= */}
      {rosterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1f1a24] border border-white/20 rounded-2xl w-full max-w-md p-6 text-white shadow-2xl space-y-4">
            <h3 className="text-lg font-bold">
              {editingRosterId ? "Edit Artis Roster" : "Tambah Artis Baru"}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-white/70 block mb-1">Nama Artis</label>
                <input
                  type="text"
                  value={rosterForm.name}
                  onChange={(e) => setRosterForm({ ...rosterForm, name: e.target.value })}
                  placeholder="Misal: Pink Rider"
                  className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-xs text-white/70 block mb-1">Foto Artis</label>
                <div className="flex gap-3 items-center">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-black/40 border border-[#ff7fab] flex-shrink-0">
                    <img
                      src={normalizeImageUrl(rosterForm.imageUrl)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "https://placehold.co/300x300/ff7fab/ffffff?text=Artis";
                      }}
                    />
                  </div>
                  <label className="cursor-pointer px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1.5 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Foto Artis</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleFileUpload(e, "rosterImage", (url) =>
                          setRosterForm((prev) => ({ ...prev, imageUrl: url }))
                        )
                      }
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => setRosterModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (!rosterForm.name) {
                    showNotice("Nama artis wajib diisi!");
                    return;
                  }
                  if (editingRosterId) {
                    setRoster((prev) =>
                      prev.map((a) => (a.id === editingRosterId ? { ...rosterForm } : a))
                    );
                  } else {
                    setRoster((prev) => [...prev, { ...rosterForm, id: Date.now() }]);
                  }
                  setRosterModalOpen(false);
                }}
                className="px-5 py-2 rounded-xl bg-[#ff7fab] hover:bg-[#ff6a9c] text-white text-xs font-bold shadow-md"
              >
                Simpan Artis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: EDIT / TAMBAH TESTIMONI (BAR 6)
         ========================================================================= */}
      {testiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1f1a24] border border-white/20 rounded-2xl w-full max-w-md p-6 text-white shadow-2xl space-y-4">
            <h3 className="text-lg font-bold">
              {editingTestiId ? "Edit Testimoni" : "Tambah Testimoni Baru"}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-white/70 block mb-1">Nama & Peran Artis</label>
                <input
                  type="text"
                  value={testiForm.author}
                  onChange={(e) => setTestiForm({ ...testiForm, author: e.target.value })}
                  placeholder="Misal: Sarah V. / Indie Pop"
                  className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-xs text-white/70 block mb-1">Isi Testimoni</label>
                <textarea
                  rows={3}
                  value={testiForm.text}
                  onChange={(e) => setTestiForm({ ...testiForm, text: e.target.value })}
                  placeholder="Kutipan pengalaman menggunakan platform..."
                  className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-xs text-white/70 block mb-1">Avatar / Foto Artis</label>
                <div className="flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-black/40 border border-[#ff7fab] flex-shrink-0">
                    <img
                      src={normalizeImageUrl(testiForm.avatar)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "https://placehold.co/100x100/ff7fab/ffffff?text=A";
                      }}
                    />
                  </div>
                  <label className="cursor-pointer px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1.5 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Avatar</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleFileUpload(e, "testiAvatar", (url) =>
                          setTestiForm((prev) => ({ ...prev, avatar: url }))
                        )
                      }
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => setTestiModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (!testiForm.author || !testiForm.text) {
                    showNotice("Nama artis dan isi testimoni wajib diisi!");
                    return;
                  }
                  if (editingTestiId) {
                    setTestimonials((prev) =>
                      prev.map((t) => (t.id === editingTestiId ? { ...testiForm } : t))
                    );
                  } else {
                    setTestimonials((prev) => [...prev, { ...testiForm, id: Date.now() }]);
                  }
                  setTestiModalOpen(false);
                }}
                className="px-5 py-2 rounded-xl bg-[#ff7fab] hover:bg-[#ff6a9c] text-white text-xs font-bold shadow-md"
              >
                Simpan Testimoni
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
