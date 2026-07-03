// Spotify 앨범 커버(i.scdn.co)는 URL의 사이즈 코드로 해상도가 정해진다.
//   ab67616d0000b273 = 640px(원본) · ab67616d00001e02 = 300px · ab67616d00004851 = 64px
// 작은 썸네일에 640px 원본을 쓰던 것을 표시 크기에 맞는 변형으로 낮춘다(전송량↓). 이미지 저장 금지 정책과 무관(URL만).
export function coverThumb(url: string | null | undefined, size: "sm" | "md" = "md"): string | null {
  if (!url) return null;
  const code = size === "sm" ? "ab67616d00004851" : "ab67616d00001e02";
  return url.replace("ab67616d0000b273", code);
}
