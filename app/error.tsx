"use client";

import { useT } from "@/components/i18n-provider";

// 라우트 세그먼트 오류 경계. 레이아웃(i18n provider)은 유지되므로 useT 사용 가능.
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useT();
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <span className="glitter-text text-5xl font-bold tracking-tight">!</span>
      <p className="text-zinc-600 dark:text-zinc-400">{t("일시적인 오류가 발생했습니다.")}</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500"
      >
        {t("다시 시도")}
      </button>
    </div>
  );
}
