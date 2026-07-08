"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import type { DjSetSummary } from "@/lib/api";
import { loadMixes } from "@/app/actions/sets";
import { MixCovers } from "@/components/sets/mix-covers";
import { SortDropdown } from "@/components/feed/sort-dropdown";
import { InfiniteScroll } from "@/components/ui/infinite-scroll";
import { useT } from "@/components/i18n-provider";

const PAGE = 30;

export function MixList({ initial }: { initial: DjSetSummary[] }) {
  const t = useT();
  const [items, setItems] = useState<DjSetSummary[]>(initial);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("newest");
  const [hasMore, setHasMore] = useState(initial.length >= PAGE);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const seq = useRef(0);

  const refetch = async (nq: string, ns: string) => {
    const my = ++seq.current; // 최신 요청만 반영 — out-of-order 응답이 덮어쓰는 것 방지(LOG-W-3)
    setLoading(true);
    const r = await loadMixes(nq, ns, 0);
    if (my !== seq.current) return;
    setItems(r);
    setHasMore(r.length >= PAGE);
    setLoading(false);
  };

  const onSearch = (v: string) => {
    setQ(v);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => refetch(v, sort), 300);
  };

  const onSort = (s: string) => {
    setSort(s);
    clearTimeout(timer.current); // 대기 중인 검색 디바운스 취소(LOG-W-3)
    refetch(q, s);
  };

  const loadMore = async () => {
    setLoading(true);
    const more = await loadMixes(q, sort, items.length);
    // 중간에 새 믹스가 생기면 창이 밀려 중복될 수 있음 → id 디듑(LOG-W-2)
    setItems((prev) => {
      const seen = new Set(prev.map((x) => x.id));
      return [...prev, ...more.filter((x) => !seen.has(x.id))];
    });
    setHasMore(more.length >= PAGE);
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            value={q}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={t("믹스 검색")}
            className="w-full rounded-full border border-zinc-300 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>
        <SortDropdown
          title={t("정렬 기준")}
          options={[
            { value: "newest", label: t("최신순") },
            { value: "popular", label: t("인기순") },
          ]}
          current={sort}
          onSelect={onSort}
        />
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 px-6 py-16 text-center text-sm text-zinc-500 dark:border-zinc-700">
          {q.trim() ? t("검색 결과가 없습니다.") : t("아직 믹스가 없습니다.")}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((s) => (
            <li key={s.id}>
              <Link
                href={`/mixes/${s.id}`}
                className="flex items-center gap-3 rounded-xl border border-zinc-200 p-3 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-zinc-900 dark:text-zinc-50">{s.title}</span>
                  <span className="block truncate text-xs text-zinc-500">
                    {s.ownerUsername}
                    {s.note ? ` · ${s.note}` : ""}
                  </span>
                  {s.likeCount > 0 && (
                    <span className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M7 10v11M2 13v6a2 2 0 002 2h13.5a2 2 0 001.97-1.64l1.3-7A2 2 0 0019.8 10H14V4a2 2 0 00-2-2l-3 7v11" />
                      </svg>
                      {s.likeCount}
                    </span>
                  )}
                </span>
                <MixCovers covers={s.covers} trackCount={s.trackCount} />
              </Link>
            </li>
          ))}
        </ul>
      )}

      <InfiniteScroll
        hasMore={hasMore}
        loading={loading}
        onLoadMore={loadMore}
        endLabel={items.length > 0 ? t("모두 확인했어요") : null}
      />
    </div>
  );
}
