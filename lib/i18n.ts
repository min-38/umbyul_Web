// 경량 i18n. 한국어 문자열을 키로 쓰고, en 로케일이면 EN 매핑으로 치환.
// ko 로케일은 키(한국어)를 그대로 반환 → ko 사전 불필요.
export type Locale = "ko" | "en";

// {name} 형태 파라미터 치환 지원.
export function translate(locale: Locale, ko: string, params?: Record<string, string | number>): string {
  let s = locale === "en" ? (EN[ko] ?? ko) : ko;
  if (params) {
    for (const [k, v] of Object.entries(params)) s = s.replaceAll(`{${k}}`, String(v));
  }
  return s;
}

// 한국어 → 영어 매핑. 문구를 i18n 대상으로 옮길 때 여기에 추가.
export const EN: Record<string, string> = {
  // ── 메타 ──
  "음악 평가 서비스": "Music Rating",
  "음악을 듣고 평가하고 기록하세요.": "Listen, rate, and remember music you love.",

  // ── 헤더 ──
  신규: "New",
  급상승: "Rising",
  차트: "Charts",
  "로그인 / 가입": "Log in / Sign up",
  홈: "Home",
  "앨범, 곡, 아티스트, 유저 검색": "Search albums, tracks, artists, users",

  // ── 푸터 ──
  정책: "Policy",
  고객지원: "Support",
  이용약관: "Terms of Service",
  "개인정보 처리방침": "Privacy Policy",
  문의: "Contact",

  // ── 랜딩 ──
  "음악을 듣고, 평가하고, 기록하세요.": "Listen. Rate. Remember.",
  "좋아하는 앨범과 곡을 0.5점 단위로 평가하고, 리뷰를 남기고, 취향이 맞는 사람을 팔로우하세요.":
    "Rate albums and tracks in half-star steps, write reviews, and follow people who share your taste.",
  둘러보기: "Explore",
  시작하기: "Get started",
  "0.5점 단위 별점": "Half-star ratings",
  "곡·앨범을 세밀하게 평가하고 나만의 기록을 남기세요.":
    "Rate tracks and albums precisely and keep your own log.",
  "리뷰 & 반응": "Reviews & reactions",
  "리뷰를 쓰고 좋아요로 좋은 리뷰를 띄우세요.":
    "Write reviews and lift the best ones with likes.",
  "취향 팔로우": "Follow tastes",
  "취향이 맞는 유저를 팔로우하고 새 평가를 받아보세요.":
    "Follow tastemakers and get notified of their new ratings.",

  // ── 설정 탭 ──
  계정: "Account",
  알림: "Notifications",
  화면: "Display",
  연동: "Integrations",
  언어: "Language",
  한국어: "Korean",
  English: "English",
  테마: "Theme",
  라이트: "Light",
  다크: "Dark",
  시스템: "System",
  "화면 밝기 테마를 선택합니다. 시스템은 기기 설정을 따릅니다.":
    "Choose the display theme. System follows your device setting.",
  "표시 언어입니다.": "The language shown across the app.",
};
