import { cookies, headers } from "next/headers";
import { type Locale, translate } from "@/lib/i18n";

// locale 결정 우선순위:
//   1) locale 쿠키 — 수동 전환값(비로그인 포함) + 로그인 시 회원 저장값이 하이드레이트됨(auth/callback)
//   2) IP 지역(Vercel x-vercel-ip-country) — 한국이면 ko, 그 외 지역은 en
//   3) Accept-Language — 로컬/지역헤더 없음 폴백(한국어면 ko)
//   4) en(기본값)
export async function getLocale(): Promise<Locale> {
  const h = await headers();
  const fromCookie = (await cookies()).get("locale")?.value;
  if (fromCookie === "ko" || fromCookie === "en") return fromCookie;

  const country = (h.get("x-vercel-ip-country") ?? "").toUpperCase();
  if (country === "KR") return "ko";
  if (country) return "en"; // 지역이 확인됐고 한국이 아니면 영어

  const al = (h.get("accept-language") ?? "").toLowerCase();
  return al.startsWith("ko") ? "ko" : "en";
}

/** 서버 컴포넌트용 t. */
export async function getT() {
  const locale = await getLocale();
  return (ko: string, params?: Record<string, string | number>) => translate(locale, ko, params);
}
