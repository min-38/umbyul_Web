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
export function formatRelativeTime(iso: string, locale: "ko" | "en" = "ko"): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Date.now() - then;
  const sec = Math.floor(diff / 1000);
  const min = Math.floor(sec / 60);
  const hour = Math.floor(min / 60);
  const day = Math.floor(hour / 24);
  if (locale === "en") {
    if (sec < 60) return "just now";
    if (min < 60) return `${min}m ago`;
    if (hour < 24) return `${hour}h ago`;
    if (day < 7) return `${day}d ago`;
    if (day < 30) return `${Math.floor(day / 7)}w ago`;
    return new Date(iso).toLocaleDateString("en-US");
  }
  if (sec < 60) return "방금";
  if (min < 60) return `${min}분 전`;
  if (hour < 24) return `${hour}시간 전`;
  if (day < 7) return `${day}일 전`;
  if (day < 30) return `${Math.floor(day / 7)}주 전`;
  return new Date(iso).toLocaleDateString("ko-KR");
}
