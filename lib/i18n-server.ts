import { cookies, headers } from "next/headers";
import { type Locale, translate } from "@/lib/i18n";

// locale = 쿠키 우선, 없으면 Accept-Language(한국어면 ko, 그 외 en). Reddit(영어권) → en 기본.
export async function getLocale(): Promise<Locale> {
  const fromCookie = (await cookies()).get("locale")?.value;
  if (fromCookie === "ko" || fromCookie === "en") return fromCookie;
  const al = ((await headers()).get("accept-language") ?? "").toLowerCase();
  return al.startsWith("ko") ? "ko" : "en";
}

/** 서버 컴포넌트용 t. */
export async function getT() {
  const locale = await getLocale();
  return (ko: string, params?: Record<string, string | number>) => translate(locale, ko, params);
}
