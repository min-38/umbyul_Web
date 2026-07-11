// Spotify 앨범 커버(i.scdn.co)는 URL의 사이즈 코드로 해상도가 정해진다.
//   ab67616d0000b273 = 640px(원본) · ab67616d00001e02 = 300px · ab67616d00004851 = 64px
// 작은 썸네일에 640px 원본을 쓰던 것을 표시 크기에 맞는 변형으로 낮춘다(전송량↓). 이미지 저장 금지 정책과 무관(URL만).
export function coverThumb(url: string | null | undefined, size: "sm" | "md" = "md"): string | null {
  if (!url) return null;
  const code = size === "sm" ? "ab67616d00004851" : "ab67616d00001e02";
  return url.replace("ab67616d0000b273", code);
}

export const PLACEHOLDER = "/placeholder.svg";

// non-null URL 로드 실패(i.scdn.co 장애·API 경유 R2 아바타 404)를 빈 회색 타일 대신 placeholder로(NON-224).
// 클라이언트 컴포넌트의 <img onError={onImageError}> 로 사용. 무한 루프 방지(이미 placeholder면 재설정 안 함).
export function onImageError(e: React.SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget;
  if (img.src.endsWith(PLACEHOLDER)) return;
  img.src = PLACEHOLDER;
}
