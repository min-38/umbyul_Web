// 19금 배지 (Spotify explicit 플래그 기반, BUG-14). 한국 19금 표지판처럼 빨간 링 + 흰 바탕 + 검정 "19".
// 훅 없음 → 서버/클라이언트 어디서든. 숫자라 i18n 불필요.
export function ExplicitBadge({ size = "sm" }: { size?: "sm" | "lg" }) {
  const cls =
    size === "lg"
      ? "h-6 w-6 border-2 text-[11px]"
      : "h-[17px] w-[17px] border-[1.5px] text-[8px]";
  return (
    <span
      title="청소년 이용불가 · Explicit"
      aria-label="19세 이용가"
      className={`inline-flex shrink-0 items-center justify-center rounded-full border-red-600 bg-white font-bold leading-none tracking-tighter text-black align-middle ${cls}`}
    >
      19
    </span>
  );
}
