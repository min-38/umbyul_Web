"use client";

import { useEffect, useState } from "react";
import { useT } from "@/components/i18n-provider";

// 오늘의 픽 마감(KST 자정)까지 남은 시간 라이브 표시(NON-264) — 빠른 평가 유도.
// SSR/클라 시각 불일치(hydration) 방지: 마운트 후에만 계산·렌더. 만료(<=0)면 숨김.
export function PickCountdown({ expiresAt }: { expiresAt: string }) {
  const t = useT();
  const [remain, setRemain] = useState<number | null>(null);

  useEffect(() => {
    const target = new Date(expiresAt).getTime();
    if (Number.isNaN(target)) return; // expiresAt 없음/이상(구버전 Api 등) → 표시 안 함
    const tick = () => setRemain(target - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  if (remain === null || remain <= 0) return null;

  const s = Math.floor(remain / 1000);
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");

  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold tabular-nums text-indigo-600 dark:text-indigo-400">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
      {t("마감까지")} {hh}:{mm}:{ss}
    </span>
  );
}
