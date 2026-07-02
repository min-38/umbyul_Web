// 서버는 머신리더블 code 만 보낸다. 표시 문구는 여기서 locale 별로 매핑한다.
// (지금은 ko 만. 추후 i18n 라이브러리로 승격하면서 en 등 추가.)
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
  PROFILE_REQUIRED: "프로필 설정이 필요합니다.",
  RATING_NOT_FOUND: "평가를 찾을 수 없습니다.",
  // 반응/신고 (NON-23)
  INVALID_REACTION: "반응 값이 올바르지 않습니다.",
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
  UNKNOWN: "문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
};

/** 서버 응답 code 를 표시 문구로. 미지의 code 는 UNKNOWN 으로 폴백. */
export function msg(code?: string | null): string {
  return (code && KO[code]) || KO.UNKNOWN;
}
