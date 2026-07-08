// 아바타를 업로드 전에 정사각 256px로 리사이즈(클라이언트, NON-106).
// 아바타는 원형 object-cover로 최대 ~80px 렌더되므로 256px면 레티나까지 충분.
// 표시와 동일하게 중앙 정사각 크롭 → webp(미지원 시 jpeg) 재인코딩. 실패 시 원본 반환(서버가 5MB·타입 검증).
const AVATAR_SIZE = 256;

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

export async function resizeAvatar(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const side = Math.min(bitmap.width, bitmap.height);
    const sx = (bitmap.width - side) / 2;
    const sy = (bitmap.height - side) / 2;

    const canvas = document.createElement("canvas");
    canvas.width = AVATAR_SIZE;
    canvas.height = AVATAR_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, AVATAR_SIZE, AVATAR_SIZE);
    bitmap.close?.();

    const blob = (await toBlob(canvas, "image/webp", 0.85)) ?? (await toBlob(canvas, "image/jpeg", 0.85));
    return blob ?? file;
  } catch {
    return file;
  }
}
