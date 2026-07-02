"use client";

import { useState } from "react";
import { useT } from "@/components/i18n-provider";
import type { RisingWindows } from "@/lib/api";
import { toCover } from "@/lib/discover-cover";
import { CoverRow } from "./cover-row";

const WINDOWS = ["day", "week", "month", "year"] as const;
type Win = (typeof WINDOWS)[number];
// i18n 키(ko) → t()로 로케일 치환.
const LABEL_KEY: Record<Win, string> = { day: "일", week: "주", month: "월", year: "년" };

// Rising 섹션(NON-81): 기간(Day/Week/Month/Year) 선택 + 급상승 커버 가로 스크롤.
export function RisingSection({ rising }: { rising: RisingWindows }) {
  const t = useT();
  const [win, setWin] = useState<Win>("week");
  const items = rising[win].map(toCover);

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{t("급상승")}</h2>
        <div className="flex gap-1 rounded-lg bg-zinc-100 p-0.5 dark:bg-zinc-900">
          {WINDOWS.map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setWin(w)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                win === w
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              {t(LABEL_KEY[w])}
            </button>
          ))}
        </div>
      </div>

      <CoverRow items={items} empty={t("아직 없습니다.")} />
    </section>
  );
}
