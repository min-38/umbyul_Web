import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// 정적 공개 라우트만 포함. 트랙/앨범/아티스트 등 동적 상세는 전체 ID를 나열해줄
// 백엔드 엔드포인트가 생기면 추가한다(별도 이슈) — 그전엔 내부 링크로 크롤됨.
export default function sitemap(): MetadataRoute.Sitemap {
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
  return paths.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}
