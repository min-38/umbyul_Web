"use client";

import { useRouter } from "next/navigation";
import { useT } from "@/components/i18n-provider";
import { SortDropdown } from "./sort-dropdown";

const SORTS = ["hot", "newest", "likes", "ratio", "rising"] as const;
const KEY = "glitter.feedPrefs";

// 홈 피드 컨트롤(NON-90). 범위(피드)·정렬·보기 모두 SortDropdown으로 통일(NON-127).
// 선호를 쿠키에 저장 → page.tsx가 서버에서 읽어 첫 렌더부터 일치(하이드레이션 깜빡임 제거, NON-151).
export function FeedControls({
  sort,
  scope,
  view,
  genre,
  hasPreferredGenres,
  loggedIn,
}: {
  sort: string;
  scope: string;
  view: string;
  genre: string | null;
  hasPreferredGenres: boolean;
  loggedIn: boolean;
}) {
  const t = useT();
  const router = useRouter();

  const go = (patch: Partial<{ sort: string; scope: string; view: string; genre: string | null }>) => {
    const next = { sort, scope, view, genre, ...patch };
    // 빈 값(장르 필터 해제 등)은 URL·쿠키에서 제외. 서버(page.tsx)가 빈 URL 진입 시 읽는 선호 쿠키. 1년 유지.
    const clean = Object.fromEntries(Object.entries(next).filter(([, v]) => v != null && v !== "")) as Record<string, string>;
    document.cookie = `${KEY}=${encodeURIComponent(JSON.stringify(clean))}; path=/; max-age=31536000; samesite=lax`;
    router.push(`/?${new URLSearchParams(clean)}`);
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
        {hasPreferredGenres && (
          <button
            type="button"
            onClick={() => go({ genre: genre === "preferred" ? null : "preferred" })}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              genre === "preferred"
                ? "bg-indigo-600 text-white hover:bg-indigo-500"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            {t("내 선호 장르")}
          </button>
        )}
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
