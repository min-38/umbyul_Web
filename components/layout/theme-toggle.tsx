"use client";

import { useEffect, useRef, useState } from "react";
import { useClickOutside } from "@/lib/use-click-outside";
import { type Theme, THEME_LABELS, applyTheme, getStoredTheme, setStoredTheme } from "@/lib/theme";
import { useT } from "@/components/i18n-provider";

// openUp: 푸터처럼 페이지 하단에 놓일 때 위로 열어 화면 밖으로 나가지 않게 한다.
export function ThemeToggle({ openUp = false }: { openUp?: boolean } = {}) {
  const t = useT();
  const [theme, setTheme] = useState<Theme>("system");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false), open);

  useEffect(() => {
    const sync = () => setTheme(getStoredTheme());
    sync();
    // 설정(Display 탭)에서 테마를 바꾸면 헤더 아이콘도 동기화
    window.addEventListener("themechange", sync);
    return () => window.removeEventListener("themechange", sync);
  }, []);

  // 시스템 모드일 때 OS 변경 반영(.dark 클래스 토글 → 아이콘은 CSS로 따라감)
  useEffect(() => {
    if (theme !== "system") return;
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const choose = (next: Theme) => {
    setStoredTheme(next);
    setTheme(next);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={t("테마")}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
      >
        {/* 해↔달을 CSS(.dark)로 전환 — pre-paint 스크립트가 붙인 클래스와 동기화되어 하이드레이션 깜빡임 없음 */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="dark:hidden">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="hidden dark:block">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </button>

      {open && (
        <div
          className={`absolute right-0 z-20 w-28 overflow-hidden rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-950 ${
            openUp ? "bottom-full mb-1" : "mt-1"
          }`}
        >
          {(["light", "dark", "system"] as Theme[]).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => choose(opt)}
              className={`block w-full px-3 py-1.5 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900 ${
                theme === opt ? "font-medium text-indigo-600 dark:text-indigo-400" : "text-zinc-700 dark:text-zinc-300"
              }`}
            >
              {t(THEME_LABELS[opt])}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
