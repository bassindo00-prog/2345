import React from "react";
import LandingPage from "@/components/LandingPage";
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
  type LandingPageData,
} from "@/lib/landingDefaults";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page() {
  let initialData: LandingPageData = DEFAULT_LANDING_DATA;

  try {
    let content: any = null;
    try {
      content = await prisma.landingContent.findUnique({
        where: { id: "default" },
      });
    } catch {
      const rows: any = await prisma.$queryRawUnsafe(`SELECT * FROM "LandingContent" WHERE "id" = 'default' LIMIT 1`).catch(() => []);
      if (Array.isArray(rows) && rows.length > 0) content = rows[0];
    }

    if (content) {
      let platforms = DEFAULT_PLATFORMS;
      if (content.platformsJson) {
        try {
          const arr = JSON.parse(content.platformsJson);
          if (Array.isArray(arr) && arr.length > 0) platforms = arr;
        } catch (e) {}
      }

      let releases = DEFAULT_RELEASES;
      if (content.releasesJson) {
        try {
          const arr = JSON.parse(content.releasesJson);
          if (Array.isArray(arr) && arr.length > 0) releases = arr;
        } catch (e) {}
      }

      let features = DEFAULT_FEATURES;
      if (content.featuresJson) {
        try {
          const arr = JSON.parse(content.featuresJson);
          if (Array.isArray(arr) && arr.length > 0) features = arr;
        } catch (e) {}
      }

      let faqs = DEFAULT_FAQS;
      if (content.faqsJson) {
        try {
          const arr = JSON.parse(content.faqsJson);
          if (Array.isArray(arr) && arr.length > 0) faqs = arr;
        } catch (e) {}
      }

      let testimonials = DEFAULT_TESTIMONIALS_LIST;
      if (content.testimonialsJson) {
        try {
          const arr = JSON.parse(content.testimonialsJson);
          if (Array.isArray(arr) && arr.length > 0) testimonials = arr;
        } catch (e) {}
      }

      let roster = DEFAULT_ROSTER;
      if (content.artistsJson) {
        try {
          const arr = JSON.parse(content.artistsJson);
          if (Array.isArray(arr) && arr.length > 0) roster = arr;
        } catch (e) {}
      }

      let contact = DEFAULT_CONTACT_DATA;
      if (content.contactJson) {
        try {
          const obj = JSON.parse(content.contactJson);
          if (obj && typeof obj === "object" && obj.headline) {
            contact = { ...DEFAULT_CONTACT_DATA, ...obj };
          }
        } catch (e) {}
      }

      initialData = {
        platforms,
        releases,
        features,
        faqs,
        testimonials,
        roster,
        contact,
        heroSubtitle: content.heroSubtitle || undefined,
        heroTitle1: content.heroTitle1 || undefined,
        heroTitle2: content.heroTitle2 || undefined,
        heroBgImage: content.heroBgImage || undefined,
        heroBackImage: content.heroBackImage || undefined,
      };
    }
  } catch (err) {
    console.error("SSR landing fetch error:", err);
  }

  return <LandingPage initialData={initialData} />;
}
