"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

// Discover 커버 카드 한 줄(가로 스크롤). 스크롤바 숨김 + 넘길 게 있을 때만 좌우 화살표.
// 리뷰 텍스트 없이 커버만 — 클릭하면 상세로.
export type CoverItem = {
  key: string;
  href: string;
  imageUrl: string | null;
  name: string | null;
  artist: string | null;
};

export function CoverRow({ items, empty }: { items: CoverItem[]; empty: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 1);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update, items]);

  const scroll = (dir: -1 | 1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-300 px-6 py-10 text-center text-sm text-zinc-500 dark:border-zinc-700">
        {empty}
      </p>
    );
  }

  return (
    <div className="group relative">
      <div ref={ref} onScroll={update} className="no-scrollbar flex snap-x gap-4 overflow-x-auto pb-3">
        {items.map((x) => (
          <Link key={x.key} href={x.href} className="flex w-36 shrink-0 snap-start flex-col gap-1.5 sm:w-40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={x.imageUrl ?? "/placeholder.svg"}
              alt=""
              className="aspect-square w-full rounded-lg bg-zinc-100 object-cover dark:bg-zinc-800"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">{x.name ?? ""}</p>
              <p className="truncate text-xs text-zinc-400">{x.artist ?? ""}</p>
            </div>
          </Link>
        ))}
      </div>

      {canLeft && <Arrow dir="left" onClick={() => scroll(-1)} />}
      {canRight && <Arrow dir="right" onClick={() => scroll(1)} />}
    </div>
  );
}

function Arrow({ dir, onClick }: { dir: "left" | "right"; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={dir === "left" ? "previous" : "next"}
      onClick={onClick}
      className={`absolute top-[38%] flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white/90 text-zinc-700 shadow-md backdrop-blur transition hover:bg-white dark:border-zinc-700 dark:bg-zinc-800/90 dark:text-zinc-100 dark:hover:bg-zinc-800 ${
        dir === "left" ? "left-1" : "right-1"
      }`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {dir === "left" ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}
      </svg>
    </button>
  );
}
