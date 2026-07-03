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

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <PillSelect value={scope} onChange={(e) => go({ scope: e.target.value })} ariaLabel={t("전체")}>
        <option value="all">{t("전체")}</option>
        {loggedIn && <option value="following">{t("팔로잉")}</option>}
      </PillSelect>

      <div className="flex items-center gap-2">
        <SortDropdown
          current={sort}
          title={t("정렬 기준")}
          options={SORTS.map((s) => ({ value: s, label: sortLabel[s] }))}
          onSelect={(s) => go({ sort: s })}
        />
        <PillSelect value={view} onChange={(e) => go({ view: e.target.value })} ariaLabel={t("보기")}>
          <option value="card">{t("카드형")}</option>
          <option value="compact">{t("축약형")}</option>
        </PillSelect>
      </div>
    </div>
  );
}

// 정렬 드롭다운과 톤을 맞춘 알약형 select(네이티브 화살표 제거 + 커스텀 셰브런).
function PillSelect({
  value,
  onChange,
  ariaLabel,
  children,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  ariaLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        aria-label={ariaLabel}
        className="cursor-pointer appearance-none rounded-full bg-zinc-100 py-1.5 pl-3 pr-8 text-sm font-medium text-zinc-700 focus:outline-none dark:bg-zinc-800 dark:text-zinc-200"
      >
        {children}
      </select>
      <svg
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}
