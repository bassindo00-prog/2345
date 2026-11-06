export function normalizeImageUrl(url?: string | null): string {
  if (!url) return "";
  return url.replace(/https?:\/\/storage\.vpsmurah\.co\.id/g, "/api/storage");
}

export interface ReleaseItem {
  id: string | number;
  title: string;
  artist: string;
  coverUrl: string;
  tag?: string;
  listenUrl?: string;
}

export interface FeatureItem {
  id: string | number;
  title: string;
  desc: string;
  linkText?: string;
  linkUrl?: string;
}

export interface FaqItem {
  id: string | number;
  q: string;
  a: string;
}

export interface TestiItem {
  id: string | number;
  text: string;
  author: string;
  avatar: string;
}

export interface RosterArtist {
  id: string | number;
  name: string;
  imageUrl: string;
}

export interface ContactSectionData {
  headline: string;
  subtitle: string;
  buttonText: string;
  placeholder: string;
}

export interface LandingPageData {
  id?: string;
  platforms?: string[];
  releases?: ReleaseItem[];
  features?: FeatureItem[];
  faqs?: FaqItem[];
  testimonials?: TestiItem[];
  roster?: RosterArtist[];
  contact?: ContactSectionData;
  [key: string]: any;
}

export const DEFAULT_PLATFORMS: string[] = [
  "Spotify",
  "Apple Music",
  "TikTok",
  "YouTube Music",
  "Amazon Music",
  "Deezer",
  "Tidal",
  "SoundCloud",
  "JOOX",
  "Beatport",
  "Shazam",
];

export const DEFAULT_RELEASES: ReleaseItem[] = [
  {
    id: 1,
    title: "Semoga Ku Sekuat...",
    artist: "Pop Punk Boy",
    coverUrl: "https://placehold.co/400x600/141114/ffffff?text=Pop+Punk+Boy",
    tag: "Live di DSP",
    listenUrl: "/login",
  },
  {
    id: 2,
    title: "Irritado Funk",
    artist: "eckohell, Notble",
    coverUrl: "https://placehold.co/400x600/7a6870/ffffff?text=eckohell+Notble",
    tag: "Live di DSP",
    listenUrl: "/login",
  },
  {
    id: 3,
    title: "Relacao Funk",
    artist: "eckohell, AXKALXND",
    coverUrl: "https://placehold.co/400x600/ff7fab/ffffff?text=Relacao+Funk",
    tag: "Live di DSP",
    listenUrl: "/login",
  },
  {
    id: 4,
    title: "Maliping",
    artist: "Anime Ost Vibes",
    coverUrl: "https://placehold.co/400x600/d6c3ca/141114?text=Anime+Ost",
    tag: "Live di DSP",
    listenUrl: "/login",
  },
  {
    id: 5,
    title: "Night Drive",
    artist: "Trap King, LC",
    coverUrl: "https://placehold.co/400x600/141114/ffffff?text=Trap+King",
    tag: "Live di DSP",
    listenUrl: "/login",
  },
];

export const DEFAULT_FEATURES: FeatureItem[] = [
  {
    id: 1,
    title: "Rilis Musik (DMD)",
    desc: "Distribusikan lagu orisinalmu ke 33+ platform digital, termasuk Spotify, Apple Music, TikTok, dan YouTube Music. Kelola setiap rilisan dari satu dashboard dan pantau status live secara real time.",
    linkText: "Pelajari Selengkapnya →",
    linkUrl: "/register",
  },
  {
    id: 2,
    title: "Cover Lagu (CTM)",
    desc: "Rilis dan monetisasi lagu cover secara legal dan aman, dengan perizinan lisensi mekanikal resmi melalui PT Khana Media Nusantara dan partner publishing. Bebas dari klaim hak cipta dan royalti pencipta lagu terbayar otomatis.",
    linkText: "Pelajari Selengkapnya →",
    linkUrl: "/register",
  },
  {
    id: 3,
    title: "Royalty Center",
    desc: "Ketahui secara pasti dari mana pendapatan musikmu berasal. Royalti streaming dirinci per platform, per lagu, dan per periode, dengan laporan transparan siap ekspor ke CSV dan Excel.",
    linkText: "Pelajari Selengkapnya →",
    linkUrl: "/register",
  },
  {
    id: 4,
    title: "Pusat Penarikan Dana",
    desc: "Tarik royalti langsung ke rekening bank lokal atau e-wallet. Tanpa penundaan panjang, tanpa proses manual yang berbelit: jalur pencairan dana langsung dan instan ke rekening Anda.",
    linkText: "Pelajari Selengkapnya →",
    linkUrl: "/register",
  },
  {
    id: 5,
    title: "Penandatanganan Kontrak",
    desc: "Tanda tangani perjanjian kerjasama secara digital dengan kekuatan hukum sah UU ITE, langsung dari dashboard Anda. Tanpa cetak, tanpa scan, tanpa hambatan.",
    linkText: "Pelajari Selengkapnya →",
    linkUrl: "/register",
  },
  {
    id: 6,
    title: "Rp 0 Rilis Gratis",
    desc: "Rilis lagu original tanpa biaya. Isi formulir DMD dan CTM, tentukan tanggal rilis, dan lagu akan aktif sesuai jadwal yang kamu pilih.",
    linkText: "Pelajari Selengkapnya →",
    linkUrl: "/register",
  },
];

export const DEFAULT_FAQS: FaqItem[] = [
  {
    id: 1,
    q: "How much does distribution cost?",
    a: "BREAKOUT.ID is 100% free to sign up and release your tracks. We only take a small commission from your generated royalties once your music starts gaining traction.",
  },
  {
    id: 2,
    q: "How long does it take for my music to go live?",
    a: "Typically, your releases will be available on major platforms like Spotify and Apple Music within 2 to 5 business days after approval.",
  },
  {
    id: 3,
    q: "Do I keep the rights to my music?",
    a: "Yes, absolutely. You retain 100% ownership of your masters and publishing. We only act as your distribution partner.",
  },
  {
    id: 4,
    q: "Can I distribute cover songs?",
    a: "Yes! However, you must ensure you have secured the appropriate mechanical licenses for the cover song before submitting it for distribution.",
  },
];

export const DEFAULT_TESTIMONIALS_LIST: TestiItem[] = [
  {
    id: 1,
    text: "Switching to BREAKOUT.ID was the best decision for my career. The analytics are crystal clear and payouts are always on time.",
    author: "Sarah V. / Indie Pop",
    avatar: "https://placehold.co/100x100/ff7fab/ffffff?text=S",
  },
  {
    id: 2,
    text: "They helped my debut single reach playlists I never thought possible. Their support team is extremely responsive.",
    author: "Mike & The Waves",
    avatar: "https://placehold.co/100x100/141114/ffffff?text=M",
  },
  {
    id: 3,
    text: "Free distribution that actually works. I love the community they are building for independent creators.",
    author: "Jian L. / Electronic",
    avatar: "https://placehold.co/100x100/d6c3ca/141114?text=J",
  },
];

export const DEFAULT_ROSTER: RosterArtist[] = [
  {
    id: 1,
    name: "Pink Rider",
    imageUrl: "https://placehold.co/300x300/ff7fab/ffffff?text=Pink+Rider",
  },
  {
    id: 2,
    name: "Neon Skies",
    imageUrl: "https://placehold.co/300x300/141114/ffffff?text=Neon+Skies",
  },
  {
    id: 3,
    name: "The Velvets",
    imageUrl: "https://placehold.co/300x300/d6c3ca/141114?text=The+Velvets",
  },
  {
    id: 4,
    name: "DJ Aura",
    imageUrl: "https://placehold.co/300x300/ff7fab/ffffff?text=DJ+Aura",
  },
  {
    id: 5,
    name: "Lunar Wave",
    imageUrl: "https://placehold.co/300x300/141114/ffffff?text=Lunar+Wave",
  },
  {
    id: 6,
    name: "Zero Gravity",
    imageUrl: "https://placehold.co/300x300/d6c3ca/141114?text=Zero+Gravity",
  },
];

export const DEFAULT_CONTACT_DATA: ContactSectionData = {
  headline: "Ready to Drop Your Next Hit?",
  subtitle: "Join thousands of independent artists distributing their music globally with BREAKOUT.ID.",
  buttonText: "Get Started",
  placeholder: "Enter your email address",
};

export const DEFAULT_LANDING_DATA: LandingPageData = {
  platforms: DEFAULT_PLATFORMS,
  releases: DEFAULT_RELEASES,
  features: DEFAULT_FEATURES,
  faqs: DEFAULT_FAQS,
  testimonials: DEFAULT_TESTIMONIALS_LIST,
  roster: DEFAULT_ROSTER,
  contact: DEFAULT_CONTACT_DATA,
};

// Legacy compatibility aliases
export type LandingArtist = RosterArtist;
export const DEFAULT_PRISMA_TESTIMONIALS: any[] = DEFAULT_ROSTER;
