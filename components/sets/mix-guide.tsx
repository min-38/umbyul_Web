"use client";

import { useRef, useState } from "react";
import { useClickOutside } from "@/lib/use-click-outside";
import { MAX_TRACKS } from "@/components/sets/track-picker";
import { useT } from "@/components/i18n-provider";

// 믹스 작성 안내(ⓘ) — 클릭 시 안내사항 팝오버.
export function MixGuide() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  useClickOutside(ref, () => setOpen(false), open);

  return (
    <span ref={ref} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={t("안내")}
        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 w-64 rounded-lg border border-zinc-200 bg-white p-3 text-xs leading-relaxed text-zinc-600 shadow-lg dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          <ul className="flex flex-col gap-1.5">
            <li>· {t("최대 {count}곡까지 담을 수 있어요.", { count: MAX_TRACKS })}</li>
            <li>· {t("곡을 검색해 담고, 유튜브 링크를 붙이면 스포티파이 없이도 들을 수 있어요.")}</li>
            <li>· {t("순서는 화살표로 바꿀 수 있어요.")}</li>
          </ul>
        </div>
      )}
    </span>
  );
}
