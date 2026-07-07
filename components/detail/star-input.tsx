"use client";

import { useId, useState } from "react";
import { useT } from "@/components/i18n-provider";

const PATH = "M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.8 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z";

function Star({ fill, size, gradId }: { fill: number; size: number; gradId: string }) {
  return (
    <span className="relative block" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 24 24" className="absolute inset-0 fill-zinc-300 dark:fill-zinc-700">
        <path d={PATH} />
      </svg>
      <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
        {/* 우주(성운) 그라데이션 채움 (NON-91). id 는 인스턴스별 useId — 중복 DOM id 방지(LOG-W-5) */}
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#c084fc" />
              <stop offset="0.35" stopColor="#6366f1" />
              <stop offset="0.7" stopColor="#f472b6" />
              <stop offset="1" stopColor="#38bdf8" />
            </linearGradient>
          </defs>
          <path d={PATH} fill={`url(#${gradId})`} />
        </svg>
      </span>
    </span>
  );
}

// 0.5 단위 입력. 각 별을 좌/우 반으로 나눠 클릭·호버.
export function StarInput({
  value,
  onChange,
  size = 32,
}: {
  value: number;
  onChange: (v: number) => void;
  size?: number;
}) {
  const t = useT();
  const [hover, setHover] = useState(0);
  const gradId = useId();
  const shown = hover || value;

  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((i) => {
          const fill = Math.max(0, Math.min(1, shown - (i - 1)));
          return (
            <span key={i} className="relative" style={{ width: size, height: size }}>
              <Star fill={fill} size={size} gradId={gradId} />
              <button
                type="button"
                aria-label={t("{score}점", { score: i - 0.5 })}
                className="absolute left-0 top-0 z-10 h-full w-1/2 cursor-pointer"
                onMouseEnter={() => setHover(i - 0.5)}
                onClick={() => onChange(i - 0.5)}
              />
              <button
                type="button"
                aria-label={t("{score}점", { score: i })}
                className="absolute right-0 top-0 z-10 h-full w-1/2 cursor-pointer"
                onMouseEnter={() => setHover(i)}
                onClick={() => onChange(i)}
              />
            </span>
          );
        })}
      </div>
      <span className="text-lg font-semibold tabular-nums text-zinc-700 dark:text-zinc-200">
        {value > 0 ? value.toFixed(1) : "–"}
      </span>
    </div>
  );
}
