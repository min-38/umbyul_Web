"use client";

import { useState } from "react";
import Link from "next/link";
import type { ReviewItem } from "@/lib/api";
import { Stars } from "./stars";
import { ReactionBar } from "./reaction-bar";
import { ReportControl } from "./report-control";
import { formatRelativeTime } from "@/lib/format";

// 인기순 = 순좋아요(좋아요-싫어요) 내림차순. 최신순 = 작성시간.
type Sort = "latest" | "popular";

export function ReviewList({
  reviews,
  currentUserId,
}: {
  reviews: ReviewItem[];
  currentUserId: string | null;
}) {
  const [sort, setSort] = useState<Sort>("latest");

  if (reviews.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-300 px-6 py-10 text-center text-sm text-zinc-500 dark:border-zinc-700">
        아직 리뷰가 없습니다. 첫 평가를 남겨보세요.
      </p>
    );
  }

  const sorted = [...reviews].sort((a, b) =>
    sort === "latest"
      ? +new Date(b.createdAt) - +new Date(a.createdAt)
      : b.likeCount - b.dislikeCount - (a.likeCount - a.dislikeCount),
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1 text-sm">
        {(["popular", "latest"] as Sort[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSort(s)}
            className={`rounded-full px-3 py-1 ${
              sort === s
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            {s === "popular" ? "인기순" : "최신순"}
          </button>
        ))}
      </div>

      <ul className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
        {sorted.map((r) => (
          <li key={r.id} className="flex flex-col gap-2 py-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-zinc-200 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                {r.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  r.username.charAt(0).toUpperCase()
                )}
              </span>
              <Link href={`/u/${r.username}`} className="text-sm font-medium text-zinc-800 hover:underline dark:text-zinc-100">
                {r.username}
              </Link>
              <span className="text-xs text-zinc-400">{formatRelativeTime(r.createdAt)}</span>
              <span className="ml-auto flex items-center gap-1.5">
                <Stars value={r.score} size={14} />
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{r.score.toFixed(1)}</span>
              </span>
            </div>
            {r.body && <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{r.body}</p>}
            <div className="flex items-center gap-4 pt-0.5">
              <ReactionBar
                ratingId={r.id}
                loggedIn={currentUserId !== null}
                initial={{ likeCount: r.likeCount, dislikeCount: r.dislikeCount, myReaction: r.myReaction }}
              />
              {r.userId !== currentUserId && <ReportControl ratingId={r.id} loggedIn={currentUserId !== null} />}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
