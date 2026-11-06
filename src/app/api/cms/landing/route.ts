import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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
} from "@/lib/landingDefaults";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function cleanUrl(url: any): string {
  if (typeof url !== "string") return url || "";
  return url.replace(/https?:\/\/storage\.vpsmurah\.co\.id/g, "/api/storage");
}

export async function GET() {
  try {
    const content = await prisma.landingContent.findUnique({
      where: { id: "default" },
    });

    if (!content) {
      return NextResponse.json({
        ok: true,
        data: DEFAULT_LANDING_DATA,
      });
    }

    let platforms = DEFAULT_PLATFORMS;
    try {
      if (content.platformsJson) {
        const arr = JSON.parse(content.platformsJson);
        if (Array.isArray(arr) && arr.length > 0) platforms = arr;
      }
    } catch (e) {
      console.warn("Failed to parse platformsJson:", e);
    }

    let releases = DEFAULT_RELEASES;
    try {
      if (content.releasesJson) {
        const arr = JSON.parse(content.releasesJson);
        if (Array.isArray(arr) && arr.length > 0) {
          releases = arr.map((r: any, idx: number) => ({
            id: r.id || idx + 1,
            title: r.title || "Release",
            artist: r.artist || "Artist",
            coverUrl: cleanUrl(r.coverUrl || DEFAULT_RELEASES[idx % DEFAULT_RELEASES.length].coverUrl),
            tag: r.tag || "Live di DSP",
            listenUrl: r.listenUrl || "/login",
          }));
        }
      }
    } catch (e) {
      console.warn("Failed to parse releasesJson:", e);
    }

    let features = DEFAULT_FEATURES;
    try {
      if (content.featuresJson) {
        const arr = JSON.parse(content.featuresJson);
        if (Array.isArray(arr) && arr.length > 0) features = arr;
      }
    } catch (e) {
      console.warn("Failed to parse featuresJson:", e);
    }

    let faqs = DEFAULT_FAQS;
    try {
      if (content.faqsJson) {
        const arr = JSON.parse(content.faqsJson);
        if (Array.isArray(arr) && arr.length > 0) faqs = arr;
      }
    } catch (e) {
      console.warn("Failed to parse faqsJson:", e);
    }

    let testimonials = DEFAULT_TESTIMONIALS_LIST;
    try {
      if (content.testimonialsJson) {
        const arr = JSON.parse(content.testimonialsJson);
        if (Array.isArray(arr) && arr.length > 0) {
          testimonials = arr.map((t: any, idx: number) => ({
            id: t.id || idx + 1,
            text: t.text || t.quote || "Great service!",
            author: t.author || t.name || "Artist",
            avatar: cleanUrl(t.avatar || t.imageUrl || t.photo || DEFAULT_TESTIMONIALS_LIST[idx % DEFAULT_TESTIMONIALS_LIST.length].avatar),
          }));
        }
      }
    } catch (e) {
      console.warn("Failed to parse testimonialsJson:", e);
    }

    let roster = DEFAULT_ROSTER;
    try {
      if (content.artistsJson) {
        const arr = JSON.parse(content.artistsJson);
        if (Array.isArray(arr) && arr.length > 0) {
          roster = arr.map((a: any, idx: number) => ({
            id: a.id || idx + 1,
            name: a.name || "Artist",
            imageUrl: cleanUrl(a.imageUrl || a.photo || a.avatar || DEFAULT_ROSTER[idx % DEFAULT_ROSTER.length].imageUrl),
          }));
        }
      }
    } catch (e) {
      console.warn("Failed to parse artistsJson for roster:", e);
    }

    let contact = DEFAULT_CONTACT_DATA;
    try {
      if (content.contactJson) {
        const obj = JSON.parse(content.contactJson);
        if (obj && typeof obj === "object" && obj.headline) {
          contact = { ...DEFAULT_CONTACT_DATA, ...obj };
        }
      }
    } catch (e) {
      console.warn("Failed to parse contactJson:", e);
    }

    return NextResponse.json({
      ok: true,
      data: {
        id: content.id,
        platforms,
        releases,
        features,
        faqs,
        testimonials,
        roster,
        contact,
        // Legacy fields preserved
        heroSubtitle: content.heroSubtitle,
        heroTitle1: content.heroTitle1,
        heroTitle2: content.heroTitle2,
        heroBgImage: cleanUrl(content.heroBgImage),
      },
    });
  } catch (error) {
    console.error("GET Landing Content error:", error);
    return NextResponse.json({
      ok: true,
      data: DEFAULT_LANDING_DATA,
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const platforms = Array.isArray(body.platforms) ? body.platforms : DEFAULT_PLATFORMS;

    const releases = (Array.isArray(body.releases) ? body.releases : DEFAULT_RELEASES).map(
      (r: any, idx: number) => ({
        id: r.id || idx + 1,
        title: r.title || "Release",
        artist: r.artist || "Artist",
        coverUrl: cleanUrl(r.coverUrl || DEFAULT_RELEASES[idx % DEFAULT_RELEASES.length].coverUrl),
        tag: r.tag || "Live di DSP",
        listenUrl: r.listenUrl || "/login",
      })
    );

    const features = Array.isArray(body.features) ? body.features : DEFAULT_FEATURES;

    const faqs = Array.isArray(body.faqs) ? body.faqs : DEFAULT_FAQS;

    const testimonials = (
      Array.isArray(body.testimonials) ? body.testimonials : DEFAULT_TESTIMONIALS_LIST
    ).map((t: any, idx: number) => ({
      id: t.id || idx + 1,
      text: t.text || t.quote || "Platform musik terbaik.",
      author: t.author || t.name || "Artist",
      avatar: cleanUrl(
        t.avatar || t.imageUrl || t.photo || DEFAULT_TESTIMONIALS_LIST[idx % DEFAULT_TESTIMONIALS_LIST.length].avatar
      ),
    }));

    const roster = (Array.isArray(body.roster) ? body.roster : DEFAULT_ROSTER).map(
      (a: any, idx: number) => ({
        id: a.id || idx + 1,
        name: a.name || "Artist",
        imageUrl: cleanUrl(
          a.imageUrl || a.photo || a.avatar || DEFAULT_ROSTER[idx % DEFAULT_ROSTER.length].imageUrl
        ),
      })
    );

    const contact = {
      headline: body.contact?.headline || DEFAULT_CONTACT_DATA.headline,
      subtitle: body.contact?.subtitle || DEFAULT_CONTACT_DATA.subtitle,
      buttonText: body.contact?.buttonText || DEFAULT_CONTACT_DATA.buttonText,
      placeholder: body.contact?.placeholder || DEFAULT_CONTACT_DATA.placeholder,
    };

    const updated = await prisma.landingContent.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        platformsJson: JSON.stringify(platforms),
        releasesJson: JSON.stringify(releases),
        featuresJson: JSON.stringify(features),
        faqsJson: JSON.stringify(faqs),
        testimonialsJson: JSON.stringify(testimonials),
        artistsJson: JSON.stringify(roster),
        contactJson: JSON.stringify(contact),
        heroSubtitle: body.heroSubtitle || "Global Reach By BREAKOUT.ID",
        heroTitle1: body.heroTitle1 || "BREAKOUT",
        heroTitle2: body.heroTitle2 || "ID",
        heroBgImage: cleanUrl(body.heroBgImage || "/6293920186406475229_121.jpg"),
      },
      update: {
        platformsJson: JSON.stringify(platforms),
        releasesJson: JSON.stringify(releases),
        featuresJson: JSON.stringify(features),
        faqsJson: JSON.stringify(faqs),
        testimonialsJson: JSON.stringify(testimonials),
        artistsJson: JSON.stringify(roster),
        contactJson: JSON.stringify(contact),
        heroSubtitle: body.heroSubtitle,
        heroTitle1: body.heroTitle1,
        heroTitle2: body.heroTitle2,
        heroBgImage: cleanUrl(body.heroBgImage),
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Konten landing page berhasil disimpan ke database!",
      data: updated,
    });
  } catch (error: any) {
    console.error("POST Landing Content error:", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "Gagal menyimpan konten ke database" },
      { status: 500 }
    );
  }
}
