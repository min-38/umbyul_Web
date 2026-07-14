// 사이트 정식 오리진 — canonical·sitemap·robots·OG 절대경로의 기준.
// env(NEXT_PUBLIC_SITE_URL) 미설정 시 프로덕션 도메인으로 폴백. 끝 슬래시 제거.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://umbyul.com").replace(/\/$/, "");
