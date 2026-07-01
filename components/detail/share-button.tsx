"use client";

import { useState } from "react";
import { useT } from "@/components/i18n-provider";

// 공유: 모바일 등 Web Share API 지원 시 네이티브 공유, 아니면 링크 복사(+"복사됨" 피드백).
export function ShareButton({
  path,
  title,
  label,
  size = 14,
}: {
  path: string;
  title: string;
  label?: boolean;
  size?: number;
}) {
  const t = useT();
  const [copied, setCopied] = useState(false);

  const onShare = async () => {
    const url = `${window.location.origin}${path}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // 취소/실패 시 복사로 폴백
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // 클립보드 불가 환경 — 조용히 무시
    }
  };

  return (
    <button
      type="button"
      onClick={onShare}
      aria-label={t("공유")}
      className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
      </svg>
      {(label || copied) && <span>{copied ? t("복사됨") : t("공유")}</span>}
    </button>
  );
}
