// 읽기 전용 별점 표시. value(0~5)를 받아 5개 별을 채움(소수=부분 채움).
// 채움색 = 우주(코스믹) 그라데이션 — Glitter 워드마크·About 배경 팔레트(퍼플→인디고→블루). NON-89
const STAR = "M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.8 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z";

function StarsRow({ size, fillClass, gradient }: { size: number; fillClass?: string; gradient?: boolean }) {
  return (
    <svg width={size * 5} height={size} viewBox="0 0 120 24" className={fillClass} aria-hidden="true">
      {gradient && (
        <defs>
          <linearGradient id="glitterStarFill" x1="0" y1="0" x2="120" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>
      )}
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} transform={`translate(${i * 24},0)`} d={STAR} fill={gradient ? "url(#glitterStarFill)" : undefined} />
      ))}
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
      <span className="absolute inset-0">
        <StarsRow size={size} fillClass="fill-zinc-300 dark:fill-zinc-700" />
      </span>
      <span className="absolute inset-0 overflow-hidden" style={{ width: `${pct}%` }}>
        <StarsRow size={size} gradient />
      </span>
    </span>
  );
}
