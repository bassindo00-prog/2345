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

function formatListenUrl(url: any): string {
  if (typeof url !== "string" || !url.trim() || url === "/login") return "/login";
  const clean = url.trim();
  if (clean.startsWith("/")) return clean;
  if (clean.startsWith("http://") || clean.startsWith("https://")) return clean;
  return `https://${clean}`;
}

async function ensureTable() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "LandingContent" (
        "id" TEXT PRIMARY KEY,
        "platformsJson" TEXT,
        "releasesJson" TEXT,
        "featuresJson" TEXT,
        "faqsJson" TEXT,
        "testimonialsJson" TEXT,
        "artistsJson" TEXT,
        "contactJson" TEXT,
        "heroSubtitle" TEXT,
        "heroTitle1" TEXT,
        "heroTitle2" TEXT,
        "heroBgImage" TEXT,
        "heroBackImage" TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "LandingContent" ADD COLUMN IF NOT EXISTS "heroBackImage" TEXT;
    `).catch(() => {});
  } catch (e) {
    console.warn("ensureTable error:", e);
  }
}

export async function GET() {
  try {
    await ensureTable();
    let content: any = null;
    try {
      content = await prisma.landingContent.findUnique({
        where: { id: "default" },
      });
    } catch {
      const rows: any = await prisma.$queryRawUnsafe(`SELECT * FROM "LandingContent" WHERE "id" = 'default' LIMIT 1`).catch(() => []);
      if (Array.isArray(rows) && rows.length > 0) content = rows[0];
    }

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
            listenUrl: formatListenUrl(r.listenUrl),
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
            text: t.text || t.quote || "Platform musik terbaik.",
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
        heroSubtitle: content.heroSubtitle || "MUSIC DISTRIBUTION FOR EVERYONE",
        heroTitle1: content.heroTitle1 || "BREAKOUT.ID",
        heroTitle2: content.heroTitle2 || "ID",
        heroBgImage: cleanUrl(content.heroBgImage) || "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261103_152350_4fd91a2b-94c2-4b86-834f-3b7f9a716d5b.png",
        heroBackImage: cleanUrl(content.heroBackImage) || "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261103_152354_98c21034-6558-4210-a810-8232cf9d2557.png",
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
    await ensureTable();
    const body = await req.json();

    const platforms = Array.isArray(body.platforms) ? body.platforms : DEFAULT_PLATFORMS;

    const releases = (Array.isArray(body.releases) ? body.releases : DEFAULT_RELEASES).map(
      (r: any, idx: number) => ({
        id: r.id || idx + 1,
        title: r.title || "Release",
        artist: r.artist || "Artist",
        coverUrl: cleanUrl(r.coverUrl || DEFAULT_RELEASES[idx % DEFAULT_RELEASES.length].coverUrl),
        tag: r.tag || "Live di DSP",
        listenUrl: formatListenUrl(r.listenUrl),
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

    const heroSubtitle = body.heroSubtitle || undefined;
    const heroTitle1 = body.heroTitle1 || undefined;
    const heroTitle2 = body.heroTitle2 || undefined;
    const heroBgImage = body.heroBgImage ? cleanUrl(body.heroBgImage) : undefined;
    const heroBackImage = body.heroBackImage ? cleanUrl(body.heroBackImage) : undefined;

    let updated: any;
    try {
      updated = await prisma.landingContent.upsert({
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
          heroSubtitle: heroSubtitle || "MUSIC DISTRIBUTION FOR EVERYONE",
          heroTitle1: heroTitle1 || "BREAKOUT.ID",
          heroTitle2: heroTitle2 || "ID",
          heroBgImage: heroBgImage || "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261103_152350_4fd91a2b-94c2-4b86-834f-3b7f9a716d5b.png",
          heroBackImage: heroBackImage || "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261103_152354_98c21034-6558-4210-a810-8232cf9d2557.png",
        },
        update: {
          platformsJson: JSON.stringify(platforms),
          releasesJson: JSON.stringify(releases),
          featuresJson: JSON.stringify(features),
          faqsJson: JSON.stringify(faqs),
          testimonialsJson: JSON.stringify(testimonials),
          artistsJson: JSON.stringify(roster),
          contactJson: JSON.stringify(contact),
          ...(heroSubtitle !== undefined && { heroSubtitle }),
          ...(heroTitle1 !== undefined && { heroTitle1 }),
          ...(heroTitle2 !== undefined && { heroTitle2 }),
          ...(heroBgImage !== undefined && { heroBgImage }),
          ...(heroBackImage !== undefined && { heroBackImage }),
        },
      });
    } catch {
      await prisma.$executeRawUnsafe(
        `
        INSERT INTO "LandingContent" (
          "id", "platformsJson", "releasesJson", "featuresJson", "faqsJson",
          "testimonialsJson", "artistsJson", "contactJson",
          "heroSubtitle", "heroTitle1", "heroTitle2", "heroBgImage", "heroBackImage", "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
        ON CONFLICT ("id") DO UPDATE SET
          "platformsJson" = EXCLUDED."platformsJson",
          "releasesJson" = EXCLUDED."releasesJson",
          "featuresJson" = EXCLUDED."featuresJson",
          "faqsJson" = EXCLUDED."faqsJson",
          "testimonialsJson" = EXCLUDED."testimonialsJson",
          "artistsJson" = EXCLUDED."artistsJson",
          "contactJson" = EXCLUDED."contactJson",
          "heroSubtitle" = COALESCE(EXCLUDED."heroSubtitle", "LandingContent"."heroSubtitle"),
          "heroTitle1" = COALESCE(EXCLUDED."heroTitle1", "LandingContent"."heroTitle1"),
          "heroTitle2" = COALESCE(EXCLUDED."heroTitle2", "LandingContent"."heroTitle2"),
          "heroBgImage" = COALESCE(EXCLUDED."heroBgImage", "LandingContent"."heroBgImage"),
          "heroBackImage" = COALESCE(EXCLUDED."heroBackImage", "LandingContent"."heroBackImage"),
          "updatedAt" = NOW()
        `,
        "default",
        JSON.stringify(platforms),
        JSON.stringify(releases),
        JSON.stringify(features),
        JSON.stringify(faqs),
        JSON.stringify(testimonials),
        JSON.stringify(roster),
        JSON.stringify(contact),
        heroSubtitle || null,
        heroTitle1 || null,
        heroTitle2 || null,
        heroBgImage || null,
        heroBackImage || null
      );
      updated = { ok: true };
    }

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
