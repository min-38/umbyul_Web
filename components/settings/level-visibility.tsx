"use client";

import { useState } from "react";
import { setLevelVisibility } from "@/app/actions/account";
import { useT } from "@/components/i18n-provider";

// 리뷰어 레벨 공개 옵트아웃 토글(QA9-6). 켜면 공개 화면에서 내 레벨 뱃지가 숨겨진다.
export function LevelVisibility({ initialHidden }: { initialHidden: boolean }) {
  const t = useT();
  const [hidden, setHidden] = useState(initialHidden);

  const toggle = () => {
    const next = !hidden;
    setHidden(next); // 낙관 갱신
    setLevelVisibility(next).then((r) => {
      if (!r.ok) setHidden(!next); // 실패 시 롤백
    });
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{t("리뷰어 레벨 숨기기")}</p>
        <p className="text-xs text-zinc-500">{t("켜면 피드·리뷰·차트·프로필에서 내 레벨 뱃지가 표시되지 않습니다.")}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={hidden}
        aria-label={t("리뷰어 레벨 숨기기")}
        onClick={toggle}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          hidden ? "bg-indigo-600" : "bg-zinc-300 dark:bg-zinc-700"
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${hidden ? "translate-x-5" : ""}`}
        />
      </button>
    </div>
  );
}
