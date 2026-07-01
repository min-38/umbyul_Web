"use client";

import { useEffect, useState } from "react";
import { type Theme, THEME_LABELS, getStoredTheme, setStoredTheme } from "@/lib/theme";

const THEMES: Theme[] = ["light", "dark", "system"];

export function DisplaySettings() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    setTheme(getStoredTheme());
    const sync = () => setTheme(getStoredTheme()); // 헤더 토글에서 바꿔도 동기화
    window.addEventListener("themechange", sync);
    return () => window.removeEventListener("themechange", sync);
  }, []);

  const choose = (t: Theme) => {
    setStoredTheme(t);
    setTheme(t);
  };

  return (
    <div className="flex flex-col gap-10">
      {/* 테마 */}
      <section>
        <h3 className="mb-1 text-sm font-semibold text-zinc-900 dark:text-zinc-50">테마</h3>
        <p className="mb-3 text-xs text-zinc-500">화면 밝기 테마를 선택합니다. 시스템은 기기 설정을 따릅니다.</p>
        <div className="inline-flex rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-800">
          {THEMES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => choose(t)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                theme === t
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
              }`}
            >
              {THEME_LABELS[t]}
            </button>
          ))}
        </div>
      </section>

      {/* 언어 */}
      <section className="border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <h3 className="mb-1 text-sm font-semibold text-zinc-900 dark:text-zinc-50">언어</h3>
        <p className="mb-3 text-xs text-zinc-500">표시 언어입니다.</p>
        <select
          value="ko"
          disabled
          className="w-full max-w-xs rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 disabled:opacity-70 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        >
          <option value="ko">한국어</option>
        </select>
        <p className="mt-2 text-xs text-zinc-400">다른 언어는 추후 지원 예정입니다.</p>
      </section>
    </div>
  );
}
