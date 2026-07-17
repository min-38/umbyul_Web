"use client";

import { useRouter } from "next/navigation";
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
  const router = useRouter();

  const go = (patch: Partial<{ sort: string; scope: string; view: string; genre: string | null }>) => {
    const next = { sort, scope, view, genre, ...patch };
    // 빈 값(장르 필터 해제 등)은 URL·쿠키에서 제외. 서버(page.tsx)가 빈 URL 진입 시 읽는 선호 쿠키. 1년 유지.
    const clean = Object.fromEntries(Object.entries(next).filter(([, v]) => v != null && v !== "")) as Record<string, string>;
    document.cookie = `${KEY}=${encodeURIComponent(JSON.stringify(clean))}; path=/; max-age=31536000; samesite=lax`;
    router.push(`/?${new URLSearchParams(clean)}`);
  };

  // 피드 컨트롤은 영어 UI chrome로 고정(i18n 제외) — 정렬은 Reddit 관습(Hot/New/Top/Best/Rising)에 맞춤.
  const sortLabel: Record<string, string> = {
    hot: "Hot",
    newest: "New",
    likes: "Top",
    ratio: "Best",
    rising: "Rising",
  };

  const scopeOptions = [
    { value: "all", label: "All" },
    ...(loggedIn ? [{ value: "following", label: "Following" }] : []),
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <SortDropdown
        current={scope}
        title="Feed"
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
            My genres
          </button>
        )}
        <SortDropdown
          current={sort}
          title="Sort"
          options={SORTS.map((s) => ({ value: s, label: sortLabel[s] }))}
          onSelect={(s) => go({ sort: s })}
        />
        <SortDropdown
          current={view}
          title="View"
          options={[
            { value: "card", label: "Card" },
            { value: "compact", label: "Compact" },
          ]}
          onSelect={(v) => go({ view: v })}
        />
      </div>
    </div>
  );
}
