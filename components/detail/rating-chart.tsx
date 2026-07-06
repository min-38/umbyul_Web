import type { RatingPoint } from "@/lib/api";

// 평점 추이 차트 (NON-124). 일별 누적 평균 시계열을 직접 SVG로. 차트 라이브러리 없음.
// 게이팅: 점 2개 미만 or 총 평가 5개 미만이면 렌더 안 함(sparse면 숫자만). y축은 데이터 범위 오토스케일(작은 변동도 보이게).
export function RatingChart({ points, label }: { points: RatingPoint[]; label: string }) {
  const total = points.length ? points[points.length - 1].count : 0;
  if (points.length < 2 || total < 5) return null;

  const W = 320;
  const H = 72;
  const padX = 6;
  const padY = 10;

  const avgs = points.map((p) => p.avg);
  const times = points.map((p) => new Date(p.date).getTime());
  const tMin = times[0];
  const tMax = times[times.length - 1];
  const lo = Math.max(0.5, Math.min(...avgs) - 0.3);
  const hi = Math.min(5, Math.max(...avgs) + 0.3);
  const span = hi - lo || 1;

  const x = (t: number) => padX + ((t - tMin) / (tMax - tMin || 1)) * (W - padX * 2);
  const y = (v: number) => padY + (1 - (v - lo) / span) * (H - padY * 2);

  const line = points.map((p, i) => `${x(times[i]).toFixed(1)},${y(p.avg).toFixed(1)}`).join(" ");
  const area = `${x(tMin).toFixed(1)},${H - padY} ${line} ${x(tMax).toFixed(1)},${H - padY}`;
  const last = points[points.length - 1];
  const delta = last.avg - points[0].avg;
  const up = delta >= 0;

  return (
    <div className="mt-4 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
      <div className="mb-1 flex items-baseline gap-2">
        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{label}</span>
        <span className={`text-xs font-medium ${up ? "text-emerald-600 dark:text-emerald-500" : "text-rose-500"}`}>
          {up ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}
        </span>
        <span className="ml-auto text-xs text-zinc-400">{last.avg.toFixed(2)}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-hidden="true">
        <polygon points={area} fill="#6366f1" fillOpacity="0.1" />
        <polyline points={line} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={x(tMax)} cy={y(last.avg)} r="3" fill="#6366f1" />
      </svg>
    </div>
  );
}
