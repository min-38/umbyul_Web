// 서버는 머신리더블 code 만 보낸다. 표시 문구는 여기서 locale 별로 매핑한다.
import type { Locale } from "./i18n";

const KO: Record<string, string> = {
  USERNAME_TAKEN: "이미 사용 중인 username입니다.",
  INVALID_USERNAME: "username 형식을 확인하세요.",
  INVALID_COUNTRY: "국가 값이 올바르지 않습니다.",
  PROFILE_NOT_FOUND: "프로필을 찾을 수 없습니다.",
  DB_NOT_CONFIGURED: "서버 설정 오류입니다. 잠시 후 다시 시도해주세요.",
  DB_UNAVAILABLE: "서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.",
  UNAUTHORIZED: "로그인이 필요합니다.",
  // 평점/리뷰 (NON-7)
  INVALID_SCORE: "별점은 0.5 단위로 0.5~5.0 사이여야 합니다.",
  INVALID_TARGET: "대상이 올바르지 않습니다.",
  INVALID_TARGET_TYPE: "대상 종류가 올바르지 않습니다.",
  REVIEW_TOO_LONG: "리뷰가 너무 깁니다.",
  REVIEW_TOO_SHORT: "리뷰는 최소 10자 이상이어야 합니다.",
  PROFILE_REQUIRED: "프로필 설정이 필요합니다.",
  RATING_NOT_FOUND: "평가를 찾을 수 없습니다.",
  // 반응/신고 (NON-23)
  INVALID_REACTION: "반응 값이 올바르지 않습니다.",
  // 차단 (NON-115)
  BLOCKED: "차단한 사용자입니다.",
  CANNOT_BLOCK_SELF: "자기 자신은 차단할 수 없습니다.",
  // 제재 집행 (NON-48)
  ACCOUNT_SUSPENDED: "이용이 일시 정지되어 작성할 수 없습니다.",
  ACCOUNT_BANNED: "계정이 영구 정지되어 작성할 수 없습니다.",
  // 계정 설정 (NON-30)
  NO_FILE: "파일을 선택해주세요.",
  FILE_TOO_LARGE: "파일이 너무 큽니다 (최대 5MB).",
  INVALID_FILE_TYPE: "jpg, png, webp 이미지만 가능합니다.",
  STORAGE_NOT_CONFIGURED: "이미지 업로드 설정 오류입니다.",
  UPLOAD_FAILED: "업로드에 실패했습니다. 잠시 후 다시 시도해주세요.",
  INVALID_REASON: "신고 사유를 선택해주세요.",
  DETAIL_TOO_LONG: "상세 내용이 너무 깁니다.",
  // 문의 (NON-78)
  INVALID_EMAIL: "이메일 형식을 확인하세요.",
  INVALID_TITLE: "제목을 입력하세요.",
  INVALID_CONTENT: "내용을 입력하세요.",
  RATE_LIMITED: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
  UNKNOWN: "문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
};

const EN: Record<string, string> = {
  USERNAME_TAKEN: "That username is already taken.",
  INVALID_USERNAME: "Check the username format.",
  INVALID_COUNTRY: "Invalid country value.",
  PROFILE_NOT_FOUND: "Profile not found.",
  DB_NOT_CONFIGURED: "Server configuration error. Please try again shortly.",
  DB_UNAVAILABLE: "Can't reach the server. Please try again shortly.",
  UNAUTHORIZED: "Please log in.",
  INVALID_SCORE: "Rating must be 0.5–5.0 in half-star steps.",
  INVALID_TARGET: "Invalid target.",
  INVALID_TARGET_TYPE: "Invalid target type.",
  REVIEW_TOO_LONG: "Your review is too long.",
  REVIEW_TOO_SHORT: "Reviews must be at least 10 characters.",
  PROFILE_REQUIRED: "You need to set up your profile first.",
  RATING_NOT_FOUND: "Rating not found.",
  INVALID_REACTION: "Invalid reaction value.",
  BLOCKED: "You've blocked this user.",
  CANNOT_BLOCK_SELF: "You can't block yourself.",
  ACCOUNT_SUSPENDED: "Your account is suspended; you can't post.",
  ACCOUNT_BANNED: "Your account is permanently suspended; you can't post.",
  NO_FILE: "Please choose a file.",
  FILE_TOO_LARGE: "File is too large (max 5MB).",
  INVALID_FILE_TYPE: "Only jpg, png, webp images are allowed.",
  STORAGE_NOT_CONFIGURED: "Image upload is misconfigured.",
  UPLOAD_FAILED: "Upload failed. Please try again shortly.",
  INVALID_REASON: "Please select a report reason.",
  DETAIL_TOO_LONG: "The details are too long.",
  INVALID_EMAIL: "Please check the email format.",
  INVALID_TITLE: "Please enter a title.",
  INVALID_CONTENT: "Please enter your message.",
  RATE_LIMITED: "Too many requests. Please try again shortly.",
  UNKNOWN: "Something went wrong. Please try again shortly.",
};

/** 서버 응답 code 를 로케일별 표시 문구로. 미지의 code 는 UNKNOWN 으로 폴백. */
export function msg(code?: string | null, locale: Locale = "ko"): string {
  const dict = locale === "en" ? EN : KO;
  return (code && dict[code]) || dict.UNKNOWN;
}
