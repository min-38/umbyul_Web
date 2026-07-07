"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import type { RatingPoint } from "@/lib/api";
import { useT } from "@/components/i18n-provider";
import { RatingChart } from "./rating-chart";

// 곡 상세를 정보/추이 탭으로(BUG-8/16). 기본 정보 탭(장르 선택 포함). 추이 탭은 평점 시계열.
export function DetailInfoTabs({
  info,
  points,
  chartLabel,
}: {
  info: ReactNode;
  points: RatingPoint[];
  chartLabel: string;
}) {
  const [tab, setTab] = useState<"info" | "chart">("info");
  const t = useT();
  const enough = points.length >= 2 && (points[points.length - 1]?.count ?? 0) >= 5;

  const TABS: { key: "info" | "chart"; label: string }[] = [
    { key: "info", label: "정보" },
    { key: "chart", label: "추이" },
  ];

  return (
    <div className="mt-8">
      <div role="tablist" className="flex gap-6 border-b border-zinc-200 dark:border-zinc-800">
        {TABS.map((tb) => (
          <button
            key={tb.key}
            type="button"
            role="tab"
            aria-selected={tab === tb.key}
            onClick={() => setTab(tb.key)}
            className={`-mb-px border-b-2 pb-2.5 text-sm font-medium ${
              tab === tb.key
                ? "border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100"
                : "border-transparent text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
            }`}
          >
            {t(tb.label)}
          </button>
        ))}
      </div>

      <div className="pt-5">
        {tab === "info" ? (
          info
        ) : enough ? (
          <RatingChart points={points} label={chartLabel} />
        ) : (
          <p className="rounded-lg border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
            {t("평가가 더 쌓이면 추이가 표시됩니다.")}
          </p>
        )}
      </div>
    </div>
  );
}
