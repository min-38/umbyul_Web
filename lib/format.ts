import type { Locale } from "@/lib/i18n";

/** ms → m:ss (예: 238000 → "3:58") */
export function formatDuration(ms: number): string {
  if (!ms || ms < 0) return "0:00";
  const total = Math.round(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** ms 합 → 총 길이 (예: "43:58", 1시간 넘으면 "1:02:30") */
export function formatTotalDuration(msList: number[]): string {
  const total = Math.round(msList.reduce((a, b) => a + b, 0) / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = h > 0 ? m.toString().padStart(2, "0") : m.toString();
  return (h > 0 ? `${h}:` : "") + `${mm}:${s.toString().padStart(2, "0")}`;
}

/** Spotify release_date("2023-07-07" | "2023-07" | "2023") → "2023.07.07" 식 */
export function formatReleaseDate(date: string | null): string {
  if (!date) return "-";
  return date.replaceAll("-", ".");
}

/** ISO 시각 → 상대시간 ("방금", "3시간 전" / "just now", "3h ago", …). 30일 넘으면 날짜. */
type RelUnits = {
  now: string;
  min: (n: number) => string;
  hour: (n: number) => string;
  day: (n: number) => string;
  week: (n: number) => string;
  dateLoc: string;
};
const REL: Record<Locale, RelUnits> = {
  ko: { now: "방금", min: (n) => `${n}분 전`, hour: (n) => `${n}시간 전`, day: (n) => `${n}일 전`, week: (n) => `${n}주 전`, dateLoc: "ko-KR" },
  en: { now: "just now", min: (n) => `${n}m ago`, hour: (n) => `${n}h ago`, day: (n) => `${n}d ago`, week: (n) => `${n}w ago`, dateLoc: "en-US" },
  ja: { now: "たった今", min: (n) => `${n}分前`, hour: (n) => `${n}時間前`, day: (n) => `${n}日前`, week: (n) => `${n}週間前`, dateLoc: "ja-JP" },
  es: { now: "ahora", min: (n) => `hace ${n} min`, hour: (n) => `hace ${n} h`, day: (n) => `hace ${n} d`, week: (n) => `hace ${n} sem`, dateLoc: "es-ES" },
};

// 로케일 → Intl 로케일 태그(날짜/숫자 포맷용). 미지원/미지 문자열은 en-US.
export function dateLocale(locale: string = "ko"): string {
  return (REL[locale as Locale] ?? REL.en).dateLoc;
}

export function formatRelativeTime(iso: string, locale: Locale = "ko"): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Date.now() - then;
  const sec = Math.floor(diff / 1000);
  const min = Math.floor(sec / 60);
  const hour = Math.floor(min / 60);
  const day = Math.floor(hour / 24);
  const u = REL[locale] ?? REL.en;
  if (day >= 30) return new Date(iso).toLocaleDateString(u.dateLoc);
  if (sec < 60) return u.now;
  if (min < 60) return u.min(min);
  if (hour < 24) return u.hour(hour);
  if (day < 7) return u.day(day);
  return u.week(Math.floor(day / 7));
}
