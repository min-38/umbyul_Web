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
  UNKNOWN: "문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
};

/** 서버 응답 code 를 표시 문구로. 미지의 code 는 UNKNOWN 으로 폴백. */
export function msg(code?: string | null): string {
  return (code && KO[code]) || KO.UNKNOWN;
}
