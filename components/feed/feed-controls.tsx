"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/components/i18n-provider";
import { SortDropdown } from "./sort-dropdown";

const SORTS = ["hot", "newest", "likes", "ratio", "rising"] as const;
const KEY = "glitter.feedPrefs";

// 홈 피드 컨트롤(NON-90). 전체/팔로잉·보기 = select, 정렬 = 드롭다운.
// 상태를 localStorage에 저장하고, 빈 URL 진입 시 복원(새로고침·재방문 유지).
export function FeedControls({
  sort,
  scope,
  view,
  loggedIn,
}: {
  sort: string;
  scope: string;
  view: string;
  loggedIn: boolean;
}) {
  const t = useT();
  const router = useRouter();

  useEffect(() => {
    if (window.location.search !== "") return; // URL에 상태가 있으면 그대로 사용
    const raw = localStorage.getItem(KEY);
    if (!raw) return;
    try {
      const p = JSON.parse(raw) as { sort?: string; scope?: string; view?: string };
      const sc = p.scope === "following" && loggedIn ? "following" : "all";
      const qs = new URLSearchParams({ sort: p.sort ?? sort, scope: sc, view: p.view ?? view });
      router.replace(`/?${qs}`);
    } catch {
      /* 무시 */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const go = (patch: Partial<{ sort: string; scope: string; view: string }>) => {
    const next = { sort, scope, view, ...patch };
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* 무시 */
    }
    router.push(`/?${new URLSearchParams(next)}`);
  };

  const sortLabel: Record<string, string> = {
    hot: t("화제순"),
    newest: t("최신순"),
    likes: t("좋아요 많은 순"),
    ratio: t("좋아요 비율 높은 순"),
    rising: t("급상승"),
  };
  const selectCls =
    "cursor-pointer rounded-full bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200";

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <select value={scope} onChange={(e) => go({ scope: e.target.value })} className={selectCls} aria-label={t("전체")}>
        <option value="all">{t("전체")}</option>
        {loggedIn && <option value="following">{t("팔로잉")}</option>}
      </select>

      <div className="flex items-center gap-2">
        <SortDropdown
          current={sort}
          title={t("정렬 기준")}
          options={SORTS.map((s) => ({ value: s, label: sortLabel[s] }))}
          onSelect={(s) => go({ sort: s })}
        />
        <select value={view} onChange={(e) => go({ view: e.target.value })} className={selectCls} aria-label={t("보기")}>
          <option value="card">{t("카드형")}</option>
          <option value="compact">{t("축약형")}</option>
        </select>
      </div>
    </div>
  );
}
