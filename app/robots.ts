import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// 크롤 허용 기본, 인증·개인 설정 경로만 차단. sitemap 위치 안내.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/login", "/signup", "/onboarding", "/settings", "/forgot-password", "/reset-password", "/auth/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
