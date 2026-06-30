// 읽기 전용 별점 표시. value(0~5)를 받아 5개 별을 채움(소수=부분 채움).
function StarShape({ size, className }: { size: number; className: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.8 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z" />
    </svg>
  );
}

export function Stars({ value, size = 16 }: { value: number; size?: number }) {
  const pct = Math.max(0, Math.min(1, value / 5)) * 100;
  const width = size * 5;
  return (
    <span
      className="relative inline-flex shrink-0"
      style={{ width, height: size }}
      role="img"
      aria-label={`${value} / 5`}
    >
      <span className="absolute inset-0 flex">
        {[0, 1, 2, 3, 4].map((i) => (
          <StarShape key={i} size={size} className="shrink-0 fill-zinc-300 dark:fill-zinc-700" />
        ))}
      </span>
      <span className="absolute inset-0 flex overflow-hidden" style={{ width: `${pct}%` }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <StarShape key={i} size={size} className="shrink-0 fill-amber-400" />
        ))}
      </span>
    </span>
  );
}
