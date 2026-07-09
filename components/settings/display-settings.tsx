"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { type Theme, THEME_LABELS, getStoredTheme, setStoredTheme } from "@/lib/theme";
import { type Locale } from "@/lib/i18n";
import { useT, useLocale } from "@/components/i18n-provider";
import { setLocale } from "@/app/actions/locale";

const THEMES: Theme[] = ["light", "dark", "system"];

export function DisplaySettings() {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [theme, setTheme] = useState<Theme>("system");
  // 테마는 localStorage에만 있어 SSR 값을 알 수 없음 → 마운트 전엔 하이라이트를 그리지 않아
  // "시스템"이 선택됐다 실제 값으로 스냅되는 깜빡임을 방지(NON-161).
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(getStoredTheme());
    setMounted(true);
    const sync = () => setTheme(getStoredTheme()); // 헤더 토글에서 바꿔도 동기화
    window.addEventListener("themechange", sync);
    return () => window.removeEventListener("themechange", sync);
  }, []);

  const choose = (next: Theme) => {
    setStoredTheme(next);
    setTheme(next);
  };

  const chooseLocale = (next: Locale) => {
    if (next === locale) return;
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-10">
      {/* 테마 */}
      <section>
        <h3 className="mb-1 text-sm font-semibold text-zinc-900 dark:text-zinc-50">{t("테마")}</h3>
        <p className="mb-3 text-xs text-zinc-500">{t("화면 밝기 테마를 선택합니다. 시스템은 기기 설정을 따릅니다.")}</p>
        <div className="inline-flex rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-800">
          {THEMES.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => choose(opt)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                mounted && theme === opt
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
              }`}
            >
              {t(THEME_LABELS[opt])}
            </button>
          ))}
        </div>
      </section>

      {/* 언어 */}
      <section className="border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <h3 className="mb-1 text-sm font-semibold text-zinc-900 dark:text-zinc-50">{t("언어")}</h3>
        <p className="mb-3 text-xs text-zinc-500">{t("표시 언어입니다.")}</p>
        <select
          value={locale}
          disabled={pending}
          onChange={(e) => chooseLocale(e.target.value as Locale)}
          className="w-full max-w-xs rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 disabled:opacity-70 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        >
          {/* 언어 이름은 원문(네이티브) 유지 — 번역하지 않음 */}
          <option value="en">English</option>
          <option value="ko">한국어</option>
          <option value="ja">日本語</option>
          <option value="es">Español</option>
        </select>
      </section>
    </div>
  );
}
