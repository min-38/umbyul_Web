"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/components/i18n-provider";
import { SortDropdown } from "./sort-dropdown";

const SORTS = ["hot", "newest", "likes", "ratio", "rising"] as const;
const KEY = "glitter.feedPrefs";

// 홈 피드 컨트롤(NON-90). 범위(피드)·정렬·보기 모두 SortDropdown으로 통일(NON-127).
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

  const scopeOptions = [
    { value: "all", label: t("전체") },
    ...(loggedIn ? [{ value: "following", label: t("팔로잉") }] : []),
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <SortDropdown
        current={scope}
        title={t("피드")}
        options={scopeOptions}
        onSelect={(s) => go({ scope: s })}
        align="left"
      />

      <div className="flex items-center gap-2">
        <SortDropdown
          current={sort}
          title={t("정렬 기준")}
          options={SORTS.map((s) => ({ value: s, label: sortLabel[s] }))}
          onSelect={(s) => go({ sort: s })}
        />
        <SortDropdown
          current={view}
          title={t("보기")}
          options={[
            { value: "card", label: t("카드형") },
            { value: "compact", label: t("축약형") },
          ]}
          onSelect={(v) => go({ view: v })}
        />
      </div>
    </div>
  );
}
