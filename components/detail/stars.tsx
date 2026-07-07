"use client";

// 읽기 전용 별점 표시. value(0~5)를 받아 5개 별을 채움(소수=부분 채움).
// 채움 = 우주(성운) 그라데이션 + 흰색 별점(dots). About us 배경 팔레트(라일락·인디고·핑크·시안). NON-89
// SVG id 는 인스턴스별 useId — 한 페이지 다수 렌더 시 중복 DOM id 방지(LOG-W-5).
import { useId } from "react";

const STAR = "M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.8 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z";
const IDX = [0, 1, 2, 3, 4];

// 별 안에 뿌릴 흰 점(글리터). 좌표는 5칸(0~120) x 24 기준.
const DOTS: [number, number, number, number][] = [
  [10, 6, 0.9, 1], [21, 15, 0.6, 0.8], [34, 9, 1, 0.95], [45, 17, 0.7, 0.7],
  [58, 7, 0.9, 1], [67, 14, 0.6, 0.85], [80, 10, 1, 0.95], [91, 16, 0.7, 0.7],
  [104, 8, 0.9, 1], [113, 15, 0.6, 0.85], [16, 19, 0.5, 0.7], [73, 5, 0.8, 0.9],
];

function FilledStars({ size, gradId, clipId }: { size: number; gradId: string; clipId: string }) {
  return (
    <svg width={size * 5} height={size} viewBox="0 0 120 24" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="120" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#c084fc" />
          <stop offset="0.35" stopColor="#6366f1" />
          <stop offset="0.7" stopColor="#f472b6" />
          <stop offset="1" stopColor="#38bdf8" />
        </linearGradient>
        <clipPath id={clipId}>
          {IDX.map((i) => (
            <path key={i} transform={`translate(${i * 24},0)`} d={STAR} />
          ))}
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect x="0" y="0" width="120" height="24" fill={`url(#${gradId})`} />
        {DOTS.map(([x, y, r, o], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity={o} />
        ))}
      </g>
    </svg>
  );
}

function EmptyStars({ size }: { size: number }) {
  return (
    <svg width={size * 5} height={size} viewBox="0 0 120 24" className="fill-zinc-300 dark:fill-zinc-700" aria-hidden="true">
      {IDX.map((i) => (
        <path key={i} transform={`translate(${i * 24},0)`} d={STAR} />
      ))}
    </svg>
  );
}

export function Stars({ value, size = 16 }: { value: number; size?: number }) {
  const uid = useId();
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
        <EmptyStars size={size} />
      </span>
      <span className="absolute inset-0 overflow-hidden" style={{ width: `${pct}%` }}>
        <FilledStars size={size} gradId={`sg-${uid}`} clipId={`sc-${uid}`} />
      </span>
    </span>
  );
}
