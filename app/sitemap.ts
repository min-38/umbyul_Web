import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getSitemapTargets } from "@/lib/api";

// 구글 sitemap 규격 상한(URL 5만/파일). 근접하면 generateSitemaps로 분할(sitemap index) 필요 — 별도 과제.
const MAX_URLS = 50000;

// 정적 공개 라우트 + 상세(track/album/artist) 동적 라우트. 동적 목록은 API가 죽으면 빈 배열 → 정적만 남음.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const paths = [
    "",
    "/about",
    "/discover",
    "/chart",
    "/mixes",
    "/announcements",
    "/patch-notes",
    "/faq",
    "/support",
    "/contact",
    "/terms",
    "/privacy",
  ];
  const staticEntries: MetadataRoute.Sitemap = paths.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  const targets = await getSitemapTargets();
  const dynamicEntries: MetadataRoute.Sitemap = targets.map((t) => ({
    url: `${SITE_URL}/${t.type}/${t.id}`,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  return [...staticEntries, ...dynamicEntries].slice(0, MAX_URLS);
}
