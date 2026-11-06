export interface DspPlatform {
  id: string;
  name: string;
  domain: string;
  category: "Major Global" | "Social & Video" | "Asian & Regional" | "Electronic & DJ" | "Hi-Res & Audiophile" | "Radio & Background";
  badge?: string;
  sub: string;
  logoUrl: string;
}

export const ALL_DSP_PLATFORMS: DspPlatform[] = [
  // 1-10: Major Global DSPs
  {
    id: "spotify",
    name: "Spotify",
    domain: "spotify.com",
    category: "Major Global",
    badge: "VERIFIED",
    sub: "Music & Podcasts • 180+ Countries",
    logoUrl: "https://www.google.com/s2/favicons?domain=spotify.com&sz=128",
  },
  {
    id: "apple_music",
    name: "Apple Music & iTunes",
    domain: "music.apple.com",
    category: "Major Global",
    badge: "24-BIT",
    sub: "Lossless ALAC & Spatial Audio",
    logoUrl: "https://www.google.com/s2/favicons?domain=music.apple.com&sz=128",
  },
  {
    id: "youtube_music",
    name: "YouTube Music",
    domain: "music.youtube.com",
    category: "Major Global",
    badge: "OAC READY",
    sub: "Official Artist Channel & Audio",
    logoUrl: "https://www.google.com/s2/favicons?domain=music.youtube.com&sz=128",
  },
  {
    id: "amazon_music",
    name: "Amazon Music",
    domain: "music.amazon.com",
    category: "Major Global",
    badge: "HD / ULTRA",
    sub: "Prime & Unlimited HD Audio",
    logoUrl: "https://www.google.com/s2/favicons?domain=amazon.com&sz=128",
  },
  {
    id: "deezer",
    name: "Deezer",
    domain: "deezer.com",
    category: "Major Global",
    badge: "FLAC HI-FI",
    sub: "High Fidelity Global Streaming",
    logoUrl: "https://www.google.com/s2/favicons?domain=deezer.com&sz=128",
  },
  {
    id: "tidal",
    name: "Tidal",
    domain: "tidal.com",
    category: "Major Global",
    badge: "MASTER",
    sub: "Hi-Res Studio Quality Audio",
    logoUrl: "https://www.google.com/s2/favicons?domain=tidal.com&sz=128",
  },
  {
    id: "soundcloud",
    name: "SoundCloud Go+",
    domain: "soundcloud.com",
    category: "Major Global",
    badge: "FAN-POWERED",
    sub: "Direct Artist Royalties",
    logoUrl: "https://www.google.com/s2/favicons?domain=soundcloud.com&sz=128",
  },
  {
    id: "pandora",
    name: "Pandora",
    domain: "pandora.com",
    category: "Major Global",
    badge: "US RADIO",
    sub: "Music Genome Project & Radio",
    logoUrl: "https://www.google.com/s2/favicons?domain=pandora.com&sz=128",
  },
  {
    id: "napster",
    name: "Napster",
    domain: "napster.com",
    category: "Major Global",
    badge: "GLOBAL",
    sub: "Premium Streaming Catalog",
    logoUrl: "https://www.google.com/s2/favicons?domain=napster.com&sz=128",
  },
  {
    id: "audiomack",
    name: "Audiomack",
    domain: "audiomack.com",
    category: "Major Global",
    badge: "DISCOVERY",
    sub: "Hip-Hop, Afrobeats & Indie",
    logoUrl: "https://www.google.com/s2/favicons?domain=audiomack.com&sz=128",
  },

  // 11-20: Social, Shorts & Video Platforms
  {
    id: "tiktok",
    name: "TikTok",
    domain: "tiktok.com",
    category: "Social & Video",
    badge: "VIRAL SOUND",
    sub: "Monetisasi Pemakaian Video & Audio",
    logoUrl: "https://www.google.com/s2/favicons?domain=tiktok.com&sz=128",
  },
  {
    id: "youtube_content_id",
    name: "YouTube Content ID",
    domain: "youtube.com",
    category: "Social & Video",
    badge: "COPYRIGHT",
    sub: "Auto-Claim Royalty on Videos & Shorts",
    logoUrl: "https://www.google.com/s2/favicons?domain=youtube.com&sz=128",
  },
  {
    id: "instagram",
    name: "Instagram Music",
    domain: "instagram.com",
    category: "Social & Video",
    badge: "META",
    sub: "Stiker Musik Story & Reels Audio",
    logoUrl: "https://www.google.com/s2/favicons?domain=instagram.com&sz=128",
  },
  {
    id: "facebook",
    name: "Facebook Sound Collection",
    domain: "facebook.com",
    category: "Social & Video",
    badge: "META",
    sub: "Stories & In-Stream Video Ads",
    logoUrl: "https://www.google.com/s2/favicons?domain=facebook.com&sz=128",
  },
  {
    id: "capcut",
    name: "CapCut Sound Library",
    domain: "capcut.com",
    category: "Social & Video",
    badge: "BYTEDANCE",
    sub: "Template Audio Video Kreator",
    logoUrl: "https://www.google.com/s2/favicons?domain=capcut.com&sz=128",
  },
  {
    id: "snapchat",
    name: "Snapchat Sounds",
    domain: "snapchat.com",
    category: "Social & Video",
    badge: "SNAP",
    sub: "Lenses & Snaps Background Audio",
    logoUrl: "https://www.google.com/s2/favicons?domain=snapchat.com&sz=128",
  },
  {
    id: "triller",
    name: "Triller",
    domain: "triller.co",
    category: "Social & Video",
    badge: "CREATOR",
    sub: "Short-Form Video Monetization",
    logoUrl: "https://www.google.com/s2/favicons?domain=triller.co&sz=128",
  },
  {
    id: "twitch",
    name: "Twitch Soundtrack",
    domain: "twitch.tv",
    category: "Social & Video",
    badge: "GAMING",
    sub: "Live Streaming Creator Rights",
    logoUrl: "https://www.google.com/s2/favicons?domain=twitch.tv&sz=128",
  },
  {
    id: "bilibili",
    name: "Bilibili Music",
    domain: "bilibili.com",
    category: "Social & Video",
    badge: "EAST ASIA",
    sub: "Anime & Creator Video Audio",
    logoUrl: "https://www.google.com/s2/favicons?domain=bilibili.com&sz=128",
  },
  {
    id: "roblox",
    name: "Roblox Audio Sync",
    domain: "roblox.com",
    category: "Social & Video",
    badge: "METAVERSE",
    sub: "In-Game Audio Licensing",
    logoUrl: "https://www.google.com/s2/favicons?domain=roblox.com&sz=128",
  },

  // 21-35: Asian, Indonesian & Regional DSPs
  {
    id: "langit_musik",
    name: "Langit Musik",
    domain: "langitmusik.co.id",
    category: "Asian & Regional",
    badge: "INDONESIA",
    sub: "Streaming Resmi Telkomsel Indonesia",
    logoUrl: "https://www.google.com/s2/favicons?domain=langitmusik.co.id&sz=128",
  },
  {
    id: "trebel",
    name: "Trebel Music",
    domain: "trebel.io",
    category: "Asian & Regional",
    badge: "INDONESIA",
    sub: "Free Offline Download Indonesia & Latam",
    logoUrl: "https://www.google.com/s2/favicons?domain=trebel.io&sz=128",
  },
  {
    id: "joox",
    name: "JOOX",
    domain: "joox.com",
    category: "Asian & Regional",
    badge: "SE ASIA",
    sub: "Tencent Music Southeast Asia",
    logoUrl: "https://www.google.com/s2/favicons?domain=joox.com&sz=128",
  },
  {
    id: "resso",
    name: "Resso / Luna",
    domain: "resso.com",
    category: "Asian & Regional",
    badge: "BYTEDANCE",
    sub: "Social Streaming Indonesia & Asia",
    logoUrl: "https://www.google.com/s2/favicons?domain=resso.com&sz=128",
  },
  {
    id: "kkbox",
    name: "KKBOX",
    domain: "kkbox.com",
    category: "Asian & Regional",
    badge: "TAIWAN / HK",
    sub: "Mandopop & Asian Streaming",
    logoUrl: "https://www.google.com/s2/favicons?domain=kkbox.com&sz=128",
  },
  {
    id: "netease",
    name: "NetEase Cloud Music",
    domain: "163.com",
    category: "Asian & Regional",
    badge: "CHINA TOP",
    sub: "800M+ Registered Chinese Listeners",
    logoUrl: "https://www.google.com/s2/favicons?domain=163.com&sz=128",
  },
  {
    id: "qq_music",
    name: "QQ Music",
    domain: "y.qq.com",
    category: "Asian & Regional",
    badge: "TENCENT",
    sub: "China #1 Digital Music Platform",
    logoUrl: "https://www.google.com/s2/favicons?domain=qq.com&sz=128",
  },
  {
    id: "kugou",
    name: "Kugou Music",
    domain: "kugou.com",
    category: "Asian & Regional",
    badge: "CHINA",
    sub: "Tencent Music Mass Audio",
    logoUrl: "https://www.google.com/s2/favicons?domain=kugou.com&sz=128",
  },
  {
    id: "kuwo",
    name: "Kuwo Music",
    domain: "kuwo.cn",
    category: "Asian & Regional",
    badge: "CHINA",
    sub: "Hi-Res Chinese Streaming Network",
    logoUrl: "https://www.google.com/s2/favicons?domain=kuwo.cn&sz=128",
  },
  {
    id: "line_music",
    name: "LINE MUSIC",
    domain: "music.line.me",
    category: "Asian & Regional",
    badge: "JAPAN",
    sub: "Japan & Taiwan Top Social Music",
    logoUrl: "https://www.google.com/s2/favicons?domain=line.me&sz=128",
  },
  {
    id: "awa",
    name: "AWA",
    domain: "awa.fm",
    category: "Asian & Regional",
    badge: "JAPAN",
    sub: "Avex & CyberAgent Japanese Audio",
    logoUrl: "https://www.google.com/s2/favicons?domain=awa.fm&sz=128",
  },
  {
    id: "flo_music",
    name: "FLO Music",
    domain: "music-flo.com",
    category: "Asian & Regional",
    badge: "KOREA",
    sub: "SK Telecom South Korea",
    logoUrl: "https://www.google.com/s2/favicons?domain=music-flo.com&sz=128",
  },
  {
    id: "bugs_korea",
    name: "Bugs!",
    domain: "music.bugs.co.kr",
    category: "Asian & Regional",
    badge: "KOREA HI-FI",
    sub: "Audiophile Korean Streaming",
    logoUrl: "https://www.google.com/s2/favicons?domain=bugs.co.kr&sz=128",
  },
  {
    id: "vibe_naver",
    name: "VIBE by Naver",
    domain: "vibe.naver.com",
    category: "Asian & Regional",
    badge: "NAVER",
    sub: "South Korea Major Portal Music",
    logoUrl: "https://www.google.com/s2/favicons?domain=naver.com&sz=128",
  },
  {
    id: "jiosaavn",
    name: "JioSaavn",
    domain: "jiosaavn.com",
    category: "Asian & Regional",
    badge: "INDIA",
    sub: "Reliance Jio South Asian Platform",
    logoUrl: "https://www.google.com/s2/favicons?domain=jiosaavn.com&sz=128",
  },
  {
    id: "gaana",
    name: "Gaana",
    domain: "gaana.com",
    category: "Asian & Regional",
    badge: "INDIA",
    sub: "Times Internet Commercial Audio",
    logoUrl: "https://www.google.com/s2/favicons?domain=gaana.com&sz=128",
  },
  {
    id: "boomplay",
    name: "Boomplay",
    domain: "boomplay.com",
    category: "Asian & Regional",
    badge: "AFRICA #1",
    sub: "Transsnet Pan-African Streaming",
    logoUrl: "https://www.google.com/s2/favicons?domain=boomplay.com&sz=128",
  },
  {
    id: "anghami",
    name: "Anghami",
    domain: "anghami.com",
    category: "Asian & Regional",
    badge: "MENA",
    sub: "Middle East & North Africa",
    logoUrl: "https://www.google.com/s2/favicons?domain=anghami.com&sz=128",
  },
  {
    id: "claro_musica",
    name: "Claro Música",
    domain: "claromusica.com",
    category: "Asian & Regional",
    badge: "LATAM",
    sub: "América Móvil Latin America",
    logoUrl: "https://www.google.com/s2/favicons?domain=claromusica.com&sz=128",
  },
  {
    id: "yandex_music",
    name: "Yandex Music",
    domain: "music.yandex.ru",
    category: "Asian & Regional",
    badge: "CIS REGION",
    sub: "Eastern Europe & Central Asia",
    logoUrl: "https://www.google.com/s2/favicons?domain=yandex.ru&sz=128",
  },

  // 36-45: Electronic, Club, DJ & Specialist DSPs
  {
    id: "beatport",
    name: "Beatport",
    domain: "beatport.com",
    category: "Electronic & DJ",
    badge: "CLUB / DJ",
    sub: "Electronic Dance Music Industry Standard",
    logoUrl: "https://www.google.com/s2/favicons?domain=beatport.com&sz=128",
  },
  {
    id: "traxsource",
    name: "Traxsource",
    domain: "traxsource.com",
    category: "Electronic & DJ",
    badge: "HOUSE / TECH",
    sub: "Underground House & Club Specialist",
    logoUrl: "https://www.google.com/s2/favicons?domain=traxsource.com&sz=128",
  },
  {
    id: "juno_download",
    name: "Juno Download",
    domain: "junodownload.com",
    category: "Electronic & DJ",
    badge: "UK DANCE",
    sub: "Independent Dance & Club Releases",
    logoUrl: "https://www.google.com/s2/favicons?domain=junodownload.com&sz=128",
  },
  {
    id: "mixcloud",
    name: "Mixcloud",
    domain: "mixcloud.com",
    category: "Electronic & DJ",
    badge: "DJ SETS",
    sub: "Radio Shows & DJ Mix Monetization",
    logoUrl: "https://www.google.com/s2/favicons?domain=mixcloud.com&sz=128",
  },
  {
    id: "bandcamp",
    name: "Bandcamp",
    domain: "bandcamp.com",
    category: "Electronic & DJ",
    badge: "DIRECT SALE",
    sub: "Artist-Direct Digital & Merch",
    logoUrl: "https://www.google.com/s2/favicons?domain=bandcamp.com&sz=128",
  },

  // 46-55: Hi-Res, Recognition & Metadata DSPs
  {
    id: "qobuz",
    name: "Qobuz",
    domain: "qobuz.com",
    category: "Hi-Res & Audiophile",
    badge: "24-BIT 192KHZ",
    sub: "Audiophile Lossless Streaming & Download",
    logoUrl: "https://www.google.com/s2/favicons?domain=qobuz.com&sz=128",
  },
  {
    id: "shazam",
    name: "Shazam & Siri Audio ID",
    domain: "shazam.com",
    category: "Hi-Res & Audiophile",
    badge: "AUTO MATCH",
    sub: "Apple Acoustic Fingerprinting",
    logoUrl: "https://www.google.com/s2/favicons?domain=shazam.com&sz=128",
  },
  {
    id: "musixmatch",
    name: "Musixmatch",
    domain: "musixmatch.com",
    category: "Hi-Res & Audiophile",
    badge: "LYRICS SYNC",
    sub: "Spotify & Instagram Synced Lyrics",
    logoUrl: "https://www.google.com/s2/favicons?domain=musixmatch.com&sz=128",
  },
  {
    id: "genius",
    name: "Genius",
    domain: "genius.com",
    category: "Hi-Res & Audiophile",
    badge: "VERIFIED",
    sub: "Song Meaning & Lyrics Database",
    logoUrl: "https://www.google.com/s2/favicons?domain=genius.com&sz=128",
  },
  {
    id: "gracenote",
    name: "Gracenote",
    domain: "gracenote.com",
    category: "Hi-Res & Audiophile",
    badge: "AUTOMOTIVE",
    sub: "In-Car Entertainment & TV Metadata",
    logoUrl: "https://www.google.com/s2/favicons?domain=gracenote.com&sz=128",
  },
  {
    id: "7digital",
    name: "7digital",
    domain: "7digital.com",
    category: "Hi-Res & Audiophile",
    badge: "B2B GLOBAL",
    sub: "Global Commercial Music Catalog",
    logoUrl: "https://www.google.com/s2/favicons?domain=7digital.com&sz=128",
  },

  // 56-60: Radio, Commercial & Background DSPs
  {
    id: "iheart",
    name: "iHeartRadio",
    domain: "iheart.com",
    category: "Radio & Background",
    badge: "BROADCAST",
    sub: "America's Largest Radio Network",
    logoUrl: "https://www.google.com/s2/favicons?domain=iheart.com&sz=128",
  },
  {
    id: "tunein",
    name: "TuneIn Radio",
    domain: "tunein.com",
    category: "Radio & Background",
    badge: "LIVE RADIO",
    sub: "Global Broadcast Audio Network",
    logoUrl: "https://www.google.com/s2/favicons?domain=tunein.com&sz=128",
  },
  {
    id: "siriusxm",
    name: "SiriusXM",
    domain: "siriusxm.com",
    category: "Radio & Background",
    badge: "SATELLITE",
    sub: "North America Satellite Audio",
    logoUrl: "https://www.google.com/s2/favicons?domain=siriusxm.com&sz=128",
  },
  {
    id: "soundtrack_your_brand",
    name: "Soundtrack Your Brand",
    domain: "soundtrackyourbrand.com",
    category: "Radio & Background",
    badge: "B2B SYNC",
    sub: "Spotify for Retail, Hotels & Cafes",
    logoUrl: "https://www.google.com/s2/favicons?domain=soundtrackyourbrand.com&sz=128",
  },
  {
    id: "touchtunes",
    name: "TouchTunes",
    domain: "touchtunes.com",
    category: "Radio & Background",
    badge: "JUKEBOX",
    sub: "65,000+ Digital Bar Jukeboxes",
    logoUrl: "https://www.google.com/s2/favicons?domain=touchtunes.com&sz=128",
  },
  {
    id: "peloton",
    name: "Peloton Music",
    domain: "onepeloton.com",
    category: "Radio & Background",
    badge: "FITNESS",
    sub: "Interactive Workout Streaming",
    logoUrl: "https://www.google.com/s2/favicons?domain=onepeloton.com&sz=128",
  },
];

export function resolveDspPlatform(raw: string): {
  id: string;
  name: string;
  domain: string;
  badge?: string;
  sub?: string;
  logoUrl: string;
} {
  const query = (raw || "").trim().toLowerCase();
  if (!query) {
    return {
      id: "dsp",
      name: "DSP",
      domain: "spotify.com",
      badge: "VERIFIED",
      sub: "Digital Streaming Partner",
      logoUrl: "https://www.google.com/s2/favicons?domain=spotify.com&sz=128",
    };
  }

  // 1. Direct match with id or name
  const exact = ALL_DSP_PLATFORMS.find(
    (p) => p.id.toLowerCase() === query || p.name.toLowerCase() === query
  );
  if (exact) return exact;

  // 2. Priority key mapping
  if (query.includes("spotify")) return ALL_DSP_PLATFORMS.find((p) => p.id === "spotify")!;
  if (query.includes("apple") || query.includes("itunes")) return ALL_DSP_PLATFORMS.find((p) => p.id === "apple_music")!;
  if (query.includes("youtube") || query.includes("yt")) return ALL_DSP_PLATFORMS.find((p) => p.id === "youtube_music")!;
  if (query.includes("tiktok") || query.includes("tik tok")) return ALL_DSP_PLATFORMS.find((p) => p.id === "tiktok")!;
  if (query.includes("amazon")) return ALL_DSP_PLATFORMS.find((p) => p.id === "amazon_music")!;
  if (query.includes("deezer")) return ALL_DSP_PLATFORMS.find((p) => p.id === "deezer")!;
  if (query.includes("tidal")) return ALL_DSP_PLATFORMS.find((p) => p.id === "tidal")!;
  if (query.includes("soundcloud")) return ALL_DSP_PLATFORMS.find((p) => p.id === "soundcloud")!;
  if (query.includes("joox")) return ALL_DSP_PLATFORMS.find((p) => p.id === "joox") || {
    id: "joox",
    name: "JOOX",
    domain: "joox.com",
    badge: "ASIA",
    sub: "Hong Kong, Malaysia, Indonesia",
    logoUrl: "https://www.google.com/s2/favicons?domain=joox.com&sz=128",
  };
  if (query.includes("shazam")) return ALL_DSP_PLATFORMS.find((p) => p.id === "shazam") || {
    id: "shazam",
    name: "Shazam",
    domain: "shazam.com",
    badge: "DISCOVERY",
    sub: "Music Recognition App",
    logoUrl: "https://www.google.com/s2/favicons?domain=shazam.com&sz=128",
  };
  if (query.includes("beatport")) return ALL_DSP_PLATFORMS.find((p) => p.id === "beatport") || {
    id: "beatport",
    name: "Beatport",
    domain: "beatport.com",
    badge: "ELECTRONIC",
    sub: "EDM & Club Music DJ Store",
    logoUrl: "https://www.google.com/s2/favicons?domain=beatport.com&sz=128",
  };
  if (query.includes("instagram") || query.includes("reels")) return ALL_DSP_PLATFORMS.find((p) => p.id === "instagram") || {
    id: "instagram",
    name: "Instagram Music",
    domain: "instagram.com",
    badge: "META",
    sub: "Stories & Reels Audio",
    logoUrl: "https://www.google.com/s2/favicons?domain=instagram.com&sz=128",
  };

  // 3. Partial fallback match
  const partial = ALL_DSP_PLATFORMS.find((p) => {
    const pName = p.name.toLowerCase();
    const pId = p.id.toLowerCase();
    return query.includes(pId) || pId.includes(query) || query.includes(pName) || pName.includes(query);
  });
  if (partial) return partial;

  // 4. Fallback for custom names
  const cleanDomain = query.replace(/[^a-z0-9]/g, "");
  return {
    id: cleanDomain,
    name: raw,
    domain: `${cleanDomain}.com`,
    badge: "DSP",
    sub: "Official Streaming Distribution",
    logoUrl: `https://www.google.com/s2/favicons?domain=${cleanDomain}.com&sz=128`,
  };
}

