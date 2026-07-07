// 회원가입·온보딩·재설정에서 공용으로 쓰는 클라이언트 검증 규칙.

export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

// 고유 핸들: 영문/숫자, 하이픈은 중간에만, 2–30자
export const USERNAME_RE = /^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$/;
export const isUsername = (s: string) =>
  s.length >= 2 && s.length <= 30 && USERNAME_RE.test(s);

// 8자 이상 + 대문자·소문자·숫자·특수문자 각 1개 이상
export type PasswordChecks = {
  length: boolean;
  upper: boolean;
  lower: boolean;
  digit: boolean;
  special: boolean;
  all: boolean;
};
export function passwordChecks(pw: string): PasswordChecks {
  const length = pw.length >= 8;
  const upper = /[A-Z]/.test(pw);
  const lower = /[a-z]/.test(pw);
  const digit = /\d/.test(pw);
  const special = /[^A-Za-z0-9]/.test(pw);
  return { length, upper, lower, digit, special, all: length && upper && lower && digit && special };
}

// 사용자 입력 URL을 href로 렌더하기 전 스킴 검증. http(s)만 통과, javascript:/data: 등은 차단.
// 통과하면 정규화된 URL, 아니면 null. (믹스 listenUrl 저장형 XSS 방어 — SEC-W-1)
export function safeHttpUrl(s: string | null | undefined): string | null {
  if (!s) return null;
  try {
    const u = new URL(s.trim());
    return u.protocol === "http:" || u.protocol === "https:" ? u.href : null;
  } catch {
    return null;
  }
}

// 클라이언트가 보낸 표시용 이미지 URL은 Spotify CDN(https)만 신뢰. 그 외는 null로 떨궈 placeholder로 폴백.
// (피드·차트에 렌더되는 이미지로 열람자 IP 수집·요청 강제하는 스푸핑 방어 — SEC-W-2)
export function safeSpotifyImageUrl(s: string | null | undefined): string | null {
  if (!s) return null;
  try {
    const u = new URL(s.trim());
    const ok = u.protocol === "https:" && (u.hostname.endsWith(".scdn.co") || u.hostname.endsWith(".spotifycdn.com"));
    return ok ? u.href : null;
  } catch {
    return null;
  }
}

// 리다이렉트 대상은 내부 경로만 허용(오픈 리다이렉트 차단). "/"로 시작하고 "//"·"/\"가 아니어야 함.
export function safeInternalPath(path: string | null | undefined, fallback = "/"): string {
  if (!path || path[0] !== "/" || path[1] === "/" || path[1] === "\\") return fallback;
  return path;
}

// 입력란 테두리 색 (idle/valid/invalid)
export type FieldStatus = "idle" | "valid" | "invalid";
export const borderClass = (s: FieldStatus) =>
  s === "valid"
    ? "border-green-500 dark:border-green-500"
    : s === "invalid"
      ? "border-red-500 dark:border-red-500"
      : "border-zinc-300 dark:border-zinc-700";
