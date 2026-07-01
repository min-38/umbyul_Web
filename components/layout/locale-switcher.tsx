"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { type Locale } from "@/lib/i18n";
import { useT, useLocale } from "@/components/i18n-provider";
import { setLocale } from "@/app/actions/locale";

// 푸터에 두어 비로그인 사용자도 언어를 바꿀 수 있게 함(설정 탭은 로그인 전용).
export function LocaleSwitcher() {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const onChange = (next: Locale) => {
    if (next === locale) return;
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  };

  return (
    <select
      aria-label={t("언어")}
      value={locale}
      disabled={pending}
      onChange={(e) => onChange(e.target.value as Locale)}
      className="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-600 disabled:opacity-70 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
    >
      <option value="ko">{t("한국어")}</option>
      <option value="en">{t("English")}</option>
    </select>
  );
}
