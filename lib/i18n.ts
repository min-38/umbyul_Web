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
  "음악을 듣고 평가하고 기록하세요.": "Listen, rate, and remember music you love.",

  // ── 헤더 ──
  신규: "New",
  급상승: "Rising",
  차트: "Charts",
  "로그인 / 가입": "Log in / Sign up",
  홈: "Home",
  "앨범, 곡, 아티스트, 유저 검색": "Search albums, tracks, artists, users",

  // ── 유저 메뉴 ──
  프로필: "Profile",
  "포인트 내역": "Points",
  업적: "Achievements",
  설정: "Settings",
  로그아웃: "Log out",

  // ── 푸터 ──
  정책: "Policy",
  고객지원: "Support",
  "서비스 소개": "About Us",
  "별점을 매길수록 별이 쌓여 반짝입니다 — 그래서 Glitter.":
    "The more you rate, the more the stars pile up and glitter — that's Glitter.",
  이용약관: "Terms of Service",
  "개인정보 처리방침": "Privacy Policy",
  문의: "Contact",

  // ── 랜딩 ──
  "음악을 듣고, 평가하고, 기록하세요.": "Listen. Rate. Remember.",
  "좋아하는 앨범과 곡을 평가하고, 리뷰를 남기고, 취향이 맞는 사람을 팔로우하세요.":
    "Rate albums and tracks, write reviews, and follow people who share your taste.",
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
  테마: "Theme",
  라이트: "Light",
  다크: "Dark",
  시스템: "System",
  "화면 밝기 테마를 선택합니다. 시스템은 기기 설정을 따릅니다.":
    "Choose the display theme. System follows your device setting.",
  "표시 언어입니다.": "The language shown across the app.",

  // ── 프로필 ──
  팔로워: "Followers",
  팔로잉: "Following",
  팔로우: "Follow",
  "프로필 편집": "Edit profile",
  "작성한 리뷰": "Reviews",
  "받은 좋아요 {count}": "{count} likes received",
  "아직 작성한 리뷰가 없습니다.": "No reviews yet.",
  "(알 수 없는 항목)": "(Unknown item)",
  "관리자에 의해 삭제되었습니다.": "Removed by an administrator.",
  "계정이 영구 정지되어 작성이 제한됩니다.": "Your account is permanently suspended; posting is disabled.",
  "{until}까지 이용이 정지되어 작성이 제한됩니다.": "You are suspended until {until}; posting is disabled.",
  "사유": "Reason",
  "경고를 받았습니다.": "You have received a warning.",
  "일시 정지되어 평가할 수 없습니다.": "You are suspended and cannot rate.",
  "계정이 정지되어 평가할 수 없습니다.": "Your account is suspended and cannot rate.",
  "최종 수정일": "Last updated",
  "시행일": "Effective date",
  "문서를 준비 중입니다.": "This document is being prepared.",
  "자주 묻는 질문": "Frequently Asked Questions",
  검색: "Search",
  "검색 결과가 없습니다.": "No results found.",
  "등록된 질문이 없습니다.": "No questions yet.",
  "들은 음악을, 나만의 기록으로.": "Turn what you hear into your own record.",
  "Glitter는 음악 감상을 기록하고 나누는 서비스입니다. 방대한 음악 카탈로그 위에서, 당신의 별점과 리뷰가 쌓여 취향의 지도가 됩니다.":
    "Glitter is a place to log and share what you listen to. On top of a vast music catalog, your ratings and reviews build a map of your taste.",
  "무엇을 할 수 있나요": "What you can do",
  "곧 제공됩니다.": "Coming soon.",
  "Glitter에서 평가하고 리뷰하세요.": "Rate and review on Glitter.",
  "페이지를 찾을 수 없습니다.": "Page not found.",
  "홈으로": "Go home",
  "다시 시도": "Try again",
  "일시적인 오류가 발생했습니다.": "Something went wrong.",
  주: "Week",
  최근: "Recent",
  전체: "All",
  "최다 리뷰": "Most rated",
  "최고 평가": "Top rated",
  대상: "Type",
  정렬: "Sort",
  좋아요: "Likes",
  성별: "Gender",
  나이대: "Age",
  "10대": "10s",
  "20대": "20s",
  "30대": "30s",
  "40대": "40s",
  "50대+": "50+",
  "아직 차트에 오른 항목이 없습니다.": "Nothing on the chart yet.",
  화제순: "Hot",
  "좋아요 많은 순": "Most likes",
  "좋아요 비율 높은 순": "Best ratio",
  보기: "View",
  카드형: "Card",
  축약형: "Compact",
  "정렬 기준": "Sort by",
  "피드가 비어 있습니다.": "Your feed is empty.",
  "이름의 의미": "Behind the name",
  "지금 첫 별점을 남겨보세요.": "Leave your first rating.",
  "문의하기": "Contact us",
  카테고리: "Category",
  제목: "Title",
  내용: "Message",
  "평가·리뷰": "Ratings & Reviews",
  버그: "Bug",
  보내기: "Send",
  "보내는 중…": "Sending…",
  "문의가 접수되었습니다.": "Your inquiry has been received.",
  "답변은 입력하신 이메일로 보내드립니다.": "We'll reply to the email you provided.",
  "이메일 형식을 확인하세요.": "Please check the email format.",
  "제목을 입력하세요.": "Please enter a title.",
  "내용을 입력하세요.": "Please enter your message.",
  "불러오는 중…": "Loading…",
  "아직 없습니다.": "None yet.",
  평점순: "By rating",
  좋아요순: "Most liked",

  // ── 상세 (앨범/곡) ──
  곡: "Track",
  앨범: "Album",
  리뷰: "Reviews",
  "{count}개 평가": "{count} ratings",
  "Spotify에서 듣기": "Listen on Spotify",
  트랙리스트: "Tracklist",
  정보: "Info",
  "{count}곡": "{count} tracks",
  발매일: "Release date",
  "트랙 수": "Tracks",
  저작권: "Copyright",
  길이: "Length",
  "아직 리뷰가 없습니다. 첫 평가를 남겨보세요.": "No reviews yet. Be the first to rate.",
  인기순: "Popular",
  최신순: "Newest",
  평가하기: "Rate",
  "내 평가 수정": "Edit my rating",

  // ── 검색 ──
  "검색어를 입력하세요.": "Enter a search term.",
  "검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.":
    "Something went wrong. Please try again shortly.",
  '"{q}"에 대한 검색 결과가 없습니다.': 'No results for "{q}".',
  "이 카테고리엔 결과가 없습니다.": "No results in this category.",
  "더 보기": "Show more",
  "검색 중…": "Searching…",
  아티스트: "Artist",
  유저: "User",

  // ── 평가 모달 ──
  "별점을 선택해주세요.": "Please select a rating.",
  "평가를 삭제할까요?": "Delete this rating?",
  "리뷰를 남겨보세요 (선택)": "Write a review (optional)",
  "리뷰를 남겨주세요 (최소 10자)": "Write a review (min 10 characters)",
  "리뷰는 최소 10자 이상 작성해주세요.": "Reviews must be at least 10 characters.",
  "최소 10자 이상 작성해주세요.": "Write at least 10 characters.",
  "욕설·비방은 금지됩니다. 비판은 좋지만 비난은 안 됩니다.":
    "No profanity or slander. Criticism is welcome, personal attacks are not.",
  "부적절한 리뷰는 신고 없이도 관리자가 삭제하고 제재할 수 있습니다.":
    "Inappropriate reviews may be removed and sanctioned by an admin without a report.",
  삭제: "Delete",
  취소: "Cancel",
  "저장 중…": "Saving…",
  수정: "Update",
  등록: "Submit",

  // ── 신고 ──
  "음악과 무관한 내용": "Not about music",
  "악플·욕설": "Abuse or insults",
  "부적절한 이름·프로필 사진": "Inappropriate name or profile picture",
  기타: "Other",
  "사유를 선택해주세요.": "Please select a reason.",
  신고: "Report",
  "신고가 접수되었습니다.": "Your report has been submitted.",
  닫기: "Close",
  "리뷰 신고": "Report review",
  "유저 신고": "Report user",
  "신고 내용은 운영자가 검토합니다.": "Reports are reviewed by our moderators.",
  "상세 내용 (선택)": "Details (optional)",
  "접수 중…": "Submitting…",
  "관심 없음": "Not interested",
  더보기: "More",
  차단: "Block",
  "차단 해제": "Unblock",
  "차단한 사용자입니다. 리뷰를 보려면 차단을 해제하세요.": "You've blocked this user. Unblock to see their reviews.",

  // ── 알림 ──
  "님이 회원님을 팔로우했습니다": " followed you",
  "님이 회원님의 리뷰를 좋아합니다": " liked your review",
  "알림이 없습니다.": "No notifications.",
  "알림 설정": "Notification settings",
  "모두 지우기": "Clear all",
  "알림 삭제": "Delete notification",

  // ── 로그인 ──
  환영합니다: "Welcome",
  이메일: "Email",
  비밀번호: "Password",
  로그인: "Log in",
  "비밀번호를 잊으셨나요?": "Forgot your password?",
  또는: "or",
  "처음이신가요?": "New here?",
  회원가입: "Sign up",
  로그인됨: "Logged in",

  // ── OAuth ──
  "Google로 계속하기": "Continue with Google",
  "Discord로 계속하기": "Continue with Discord",

  // ── 회원가입 ──
  "6자리 코드를 입력하세요.": "Enter the 6-digit code.",
  "코드가 올바르지 않거나 만료되었습니다.": "The code is incorrect or has expired.",
  "인증 메일을 보냈습니다": "We sent a verification email",
  "받은 편지함에서 6자리 코드를 입력하세요.": "Enter the 6-digit code from your inbox.",
  "6자리 코드": "6-digit code",
  확인: "Confirm",
  "메일이 안 보이면 스팸함을 확인하세요.": "If you don't see it, check your spam folder.",
  "가입을 환영합니다": "Create your account",
  "확인 중…": "Checking…",
  "사용 가능": "Available",
  "올바른 이메일 형식이 아닙니다.": "Not a valid email address.",
  "이미 가입된 이메일입니다.": "This email is already registered.",
  "8자 이상": "At least 8 characters",
  "대소문자 포함": "Upper and lowercase letters",
  "숫자 포함": "A number",
  "특수문자 포함": "A special character",
  "비밀번호 확인": "Confirm password",
  "비밀번호가 일치하지 않습니다.": "Passwords do not match.",
  "{link}에 동의합니다.": "I agree to the {link}.",
  가입하기: "Sign up",
  "이미 계정이 있으신가요?": "Already have an account?",

  // ── 온보딩 ──
  "거의 다 됐어요": "Almost there",
  "프로필을 완성해주세요.": "Complete your profile.",
  "영문·숫자·하이픈, 2–30자.": "Letters, numbers, hyphens. 2–30 chars.",
  "이미 사용 중": "Already taken",
  "사용할 수 없는 형식": "Invalid format",
  년: "Year",
  월: "Month",
  일: "Day",
  "만 14세 이상만 가입할 수 있습니다.": "You must be at least 14 years old.",
  "올바른 날짜를 선택하세요.": "Please select a valid date.",
  생년월일: "Date of birth",
  "성별 (선택)": "Gender (optional)",
  남성: "Male",
  여성: "Female",
  비공개: "Undisclosed",
  완료: "Done",

  // ── 비밀번호 찾기/재설정 ──
  "재설정 링크를 보냈습니다": "Reset link sent",
  "{email}의 메일함을 확인해주세요.": "Check the inbox for {email}.",
  로그인으로: "To login",
  "비밀번호 재설정": "Reset password",
  "가입한 이메일로 재설정 링크를 보내드립니다.": "We'll send a reset link to your email.",
  "재설정 링크 보내기": "Send reset link",
  "로그인으로 돌아가기": "Back to login",
  "비밀번호는 8자 이상이어야 합니다.": "Password must be at least 8 characters.",
  "비밀번호가 변경되었습니다": "Password changed",
  "새 비밀번호로 다시 로그인해주세요.": "Please sign in again with your new password.",
  로그인하기: "Log in",
  "유효하지 않은 접근입니다": "Invalid access",
  "재설정 링크가 만료되었거나 잘못되었습니다.": "The reset link has expired or is invalid.",
  "재설정 링크 다시 받기": "Get a new reset link",
  "새 비밀번호 설정": "Set a new password",
  "새 비밀번호 (8자 이상)": "New password (8+ characters)",
  "새 비밀번호 확인": "Confirm new password",
  "비밀번호 변경": "Change password",

  // ── 설정: 계정 ──
  "변경되었습니다.": "Updated.",
  "username 형식(2~30자, 영문/숫자/하이픈)을 확인하세요.":
    "Check the username format (2–30 chars, letters/numbers/hyphens).",
  "설정되었습니다.": "Set.",
  "정말 탈퇴하시겠어요?\n모든 데이터가 삭제되며 되돌릴 수 없습니다.":
    "Are you sure you want to delete your account?\nAll data will be removed and cannot be undone.",
  "계정 정보": "Account info",
  가입일: "Joined",
  "연동 계정": "Linked accounts",
  아바타: "Avatar",
  "업로드 중…": "Uploading…",
  "이미지 변경": "Change image",
  "jpg, png, webp · 최대 5MB": "jpg, png, webp · up to 5MB",
  닉네임: "Nickname",
  변경: "Save",
  "비밀번호 설정": "Set password",
  "소셜 로그인 계정입니다. 비밀번호를 설정하면 이메일로도 로그인할 수 있습니다.":
    "This is a social login account. Set a password to also sign in with email.",
  "새 비밀번호": "New password",
  "회원 탈퇴": "Delete account",
  "계정과 모든 데이터가 영구 삭제됩니다.": "Your account and all data will be permanently deleted.",
  "처리 중…": "Processing…",

  // ── 설정: 알림 ──
  "전체 알림": "All notifications",
  "모든 알림을 받습니다. 끄면 아래 항목과 무관하게 알림이 오지 않습니다.":
    "Receive all notifications. When off, nothing is sent regardless of the items below.",
  "팔로우 알림": "Follow notifications",
  "다른 유저가 회원님을 팔로우할 때": "When another user follows you",
  "리뷰 좋아요 알림": "Review like notifications",
  "회원님의 리뷰에 좋아요가 달릴 때": "When someone likes your review",

  // ── 설정: 연동 ──
  "준비 중입니다.": "Coming soon.",

  // ── 별점 입력(접근성) ──
  "{score}점": "{score} stars",

  // ── 리뷰 댓글 & 공유 (NON-36) ──
  댓글: "Comments",
  "댓글 {count}": "{count} comments",
  "첫 댓글을 남겨보세요.": "Be the first to comment.",
  "댓글 달기…": "Add a comment…",
  "로그인하고 댓글 달기": "Log in to comment",
  공유: "Share",
  복사됨: "Copied",
  "{username}님의 리뷰": "{username}'s review",

  // ── 아티스트 상세 (NON-13) ──
  "Spotify에서 열기": "Open on Spotify",
  디스코그래피: "Discography",
  싱글: "Single",
  컴필레이션: "Compilation",
  "평가 좋은 트랙": "Top-rated tracks",
  "평가 좋은 앨범": "Top-rated albums",
  "아직 평가된 곡이 없습니다.": "No rated tracks yet.",
  "아직 평가된 앨범이 없습니다.": "No rated albums yet.",
  "평가된 릴리스 {rated} · 총 평가 {total}": "{rated} releases rated · {total} ratings",
  "커뮤니티 최근 리뷰": "Recent community reviews",
  "음악 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.":
    "Couldn't load music info. Please try again shortly.",
  "화제의 릴리스": "Trending releases",
  "팔로우 피드": "From people you follow",
};
