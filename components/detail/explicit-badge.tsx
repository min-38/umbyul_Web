// 19금 배지 (Spotify explicit 플래그 기반, BUG-14). 흔한 빨간 원형 "19" 표시.
// 훅 없음 → 서버/클라이언트 어디서든 사용 가능. 숫자라 i18n 불필요.
export function ExplicitBadge({ size = "sm" }: { size?: "sm" | "lg" }) {
  const cls = size === "lg" ? "h-6 w-6 text-xs" : "h-4 w-4 text-[9px]";
  return (
    <span
      title="청소년 이용불가 · Explicit"
      aria-label="19세 이용가"
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-red-600 font-bold leading-none text-white align-middle ${cls}`}
    >
      19
    </span>
  );
}
