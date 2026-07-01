"use client";

import { useState } from "react";
import Link from "next/link";
import type { ProfileReview } from "@/lib/api";
import { Stars } from "@/components/detail/stars";
import { formatRelativeTime } from "@/lib/format";
import { useT, useLocale } from "@/components/i18n-provider";

type Sort = "newest" | "rated" | "liked";
const SORTS: { key: Sort; label: string }[] = [
  { key: "newest", label: "최신순" },
  { key: "rated", label: "평점순" },
  { key: "liked", label: "좋아요순" },
];

export function ProfileReviews({ reviews }: { reviews: ProfileReview[] }) {
  const [sort, setSort] = useState<Sort>("newest");
  const t = useT();
  const locale = useLocale();

  if (reviews.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-300 px-6 py-10 text-center text-sm text-zinc-500 dark:border-zinc-700">
        {t("아직 작성한 리뷰가 없습니다.")}
      </p>
    );
  }

  const sorted = [...reviews].sort((a, b) =>
    sort === "newest"
      ? +new Date(b.createdAt) - +new Date(a.createdAt)
      : sort === "rated"
        ? b.score - a.score
        : b.likeCount - a.likeCount,
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1 text-sm">
        {SORTS.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setSort(s.key)}
            className={`rounded-full px-3 py-1 ${
              sort === s.key
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            {t(s.label)}
          </button>
        ))}
      </div>

      <ul className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
        {sorted.map((r) => {
          const href = r.spotifyId ? `/${r.targetType}/${r.spotifyId}` : null;
          const row = (
            <div className="flex items-center gap-3 py-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={r.imageUrl ?? "/placeholder.svg"}
                alt=""
                className="h-12 w-12 shrink-0 rounded-md bg-zinc-100 object-cover dark:bg-zinc-900"
              />
              <span
                className={`flex w-11 shrink-0 items-center justify-center rounded-md py-1 text-xs font-medium ${
                  r.targetType === "track"
                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                }`}
              >
                {r.targetType === "track" ? t("곡") : t("앨범")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {r.name ?? t("(알 수 없는 항목)")}
                </p>
                <p className="truncate text-xs text-zinc-500">{r.artist ?? ""}</p>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <span className="flex items-center gap-1">
                  <Stars value={r.score} size={12} />
                  <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{r.score.toFixed(1)}</span>
                </span>
                <span className="text-xs text-zinc-400">
                  ♥ {r.likeCount} · {formatRelativeTime(r.createdAt, locale)}
                </span>
              </div>
            </div>
          );
          return (
            <li key={r.id}>
              {href ? (
                <Link href={href} className="block hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                  {row}
                </Link>
              ) : (
                row
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
