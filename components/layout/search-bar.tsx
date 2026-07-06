"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useT } from "@/components/i18n-provider";
import { useClickOutside } from "@/lib/use-click-outside";

// 최근 검색어(순수 localStorage). Spotify 호출 0 — 라이브 카탈로그 자동완성은 Extended Quota 후 별도(NON-130).
const RECENT_KEY = "glitter.recentSearches";
const MAX_RECENT = 8;

function readRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const arr = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}
function writeRecent(list: string[]) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  } catch {
    /* 무시 */
  }
}

export function SearchBar() {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [recent, setRecent] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const t = useT();
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false), open);

  useEffect(() => {
    setRecent(readRecent());
  }, []);

  const goSearch = (term: string) => {
    const query = term.trim();
    if (!query) return;
    const next = [query, ...readRecent().filter((r) => r !== query)].slice(0, MAX_RECENT);
    writeRecent(next);
    setRecent(next);
    setQ(query);
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const removeRecent = (term: string) => {
    const next = readRecent().filter((r) => r !== term);
    writeRecent(next);
    setRecent(next);
  };

  const typed = q.trim().toLowerCase();
  const suggestions = typed
    ? recent.filter((r) => r.toLowerCase().includes(typed) && r.toLowerCase() !== typed)
    : recent;

  return (
    <div ref={ref} className="relative max-w-xl flex-1">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          goSearch(q);
        }}
      >
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder={t("앨범, 곡, 아티스트, 유저 검색")}
          className="w-full rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm text-black outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </form>

      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 z-30 mt-1 overflow-hidden rounded-2xl border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
          {!typed && (
            <p className="px-4 py-1 text-xs font-semibold text-zinc-400">{t("최근 검색")}</p>
          )}
          {suggestions.map((s) => (
            <div key={s} className="flex items-center">
              <button
                type="button"
                onClick={() => goSearch(s)}
                className="flex flex-1 items-center gap-2 px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="shrink-0 text-zinc-400"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
                <span className="truncate">{s}</span>
              </button>
              <button
                type="button"
                onClick={() => removeRecent(s)}
                aria-label={t("삭제")}
                className="px-3 py-2 text-lg leading-none text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
