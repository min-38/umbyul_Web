"use client";

import { useState } from "react";
import type { MyWarning } from "@/lib/api";
import { acknowledgeWarnings } from "@/app/actions/sanctions";
import { useT } from "@/components/i18n-provider";

// 관리자 경고(warning)를 상단 배너로 통보. "확인" 시 전체 확인 처리 후 숨김(NON-57).
export function WarningNotice({ warnings }: { warnings: MyWarning[] }) {
  const t = useT();
  const [hidden, setHidden] = useState(false);
  const [busy, setBusy] = useState(false);

  if (hidden || warnings.length === 0) return null;

  const confirm = async () => {
    setBusy(true);
    const r = await acknowledgeWarnings();
    setBusy(false);
    if (r.ok) setHidden(true);
  };

  return (
    <div className="w-full bg-amber-100 px-4 py-2 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3">
        <div className="min-w-0">
          {warnings.map((w) => (
            <p key={w.id} className="truncate">
              <span className="font-semibold">{t("경고를 받았습니다.")}</span>
              {w.reason ? <span className="opacity-90"> {t("사유")}: {w.reason}</span> : null}
            </p>
          ))}
        </div>
        <button
          type="button"
          onClick={confirm}
          disabled={busy}
          className="shrink-0 rounded-md border border-amber-400 px-3 py-1 text-xs font-medium hover:bg-amber-200 disabled:opacity-50 dark:border-amber-700 dark:hover:bg-amber-900"
        >
          {t("확인")}
        </button>
      </div>
    </div>
  );
}
