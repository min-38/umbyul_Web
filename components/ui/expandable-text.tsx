"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "@/components/i18n-provider";

// 긴 본문을 기본으로 접고(clamp) '자세히'/'간략히'로 토글(NON-261).
// 접힘 상태에서 실제로 넘칠 때만 토글을 노출 — 짧은 글엔 버튼이 안 뜬다.
export function ExpandableText({
  text,
  className = "",
  clampLines = 6,
}: {
  text: string;
  className?: string;
  clampLines?: number;
}) {
  const t = useT();
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // 접힘(clamp) 기준으로 넘치는지 측정. 확장 상태는 deps에서 제외 — 최초/텍스트 변경 시에만 판정.
    setOverflowing(el.scrollHeight > el.clientHeight + 1);
  }, [text, clampLines]);

  return (
    <div>
      <p
        ref={ref}
        className={`whitespace-pre-wrap break-words ${className}`}
        style={
          expanded
            ? undefined
            : { display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: clampLines, overflow: "hidden" }
        }
      >
        {text}
      </p>
      {(overflowing || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-0.5 text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          {expanded ? t("간략히") : t("자세히")}
        </button>
      )}
    </div>
  );
}
