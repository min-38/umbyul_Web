"use client";
import { onImageError } from "@/lib/image";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ReviewItem } from "@/lib/api";
import { Stars } from "./stars";
import { ReactionBar } from "./reaction-bar";
import { ReportControl } from "./report-control";
import { ReviewComments } from "./review-comments";
import { ShareButton } from "./share-button";
import { LevelBadge } from "@/components/ui/level-badge";
import { formatRelativeTime } from "@/lib/format";
import { useT, useLocale } from "@/components/i18n-provider";

// 인기순 = 좋아요 내림차순. 최신순 = 작성시간.
type Sort = "latest" | "popular";

// 리뷰 댓글·대댓글(NON-40). 코드·API는 보존, 렌더만 게이팅.
const COMMENTS_ENABLED = true;

export function ReviewList({
  reviews,
  currentUserId,
  shareBasePath,
}: {
  reviews: ReviewItem[];
  currentUserId: string | null;
  shareBasePath: string;
}) {
  const [sort, setSort] = useState<Sort>("popular");
  const [highlightId, setHighlightId] = useState<string | null>(null);
  // 멘션 알림 딥링크(?c=<댓글id>): 해당 리뷰의 댓글을 펼쳐 그 댓글로 스크롤(BUG-3).
  const [focus, setFocus] = useState<{ reviewId: string; commentId: string } | null>(null);
  const t = useT();
  const locale = useLocale();

  // 알림 딥링크(#review-<id>)로 진입 시 해당 리뷰로 스크롤 + 잠깐 하이라이트(NON-60).
  // ?c=<댓글id> 가 함께 오면 그 리뷰의 댓글로 포커스 전달(BUG-3).
  useEffect(() => {
    if (!window.location.hash.startsWith("#review-")) return;
    const id = window.location.hash.slice("#review-".length);
    const commentId = new URLSearchParams(window.location.search).get("c");
    if (commentId) setFocus({ reviewId: id, commentId });
    const el = document.getElementById(`review-${id}`);
    if (!el) return;
    el.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
    setHighlightId(id);
    const timer = setTimeout(() => setHighlightId(null), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (reviews.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-300 px-6 py-10 text-center text-sm text-zinc-500 dark:border-zinc-700">
        {t("아직 리뷰가 없습니다. 첫 평가를 남겨보세요.")}
      </p>
    );
  }

  const sorted = [...reviews].sort((a, b) =>
    sort === "latest"
      ? +new Date(b.createdAt) - +new Date(a.createdAt)
      : b.likeCount - a.likeCount,
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
            {s === "popular" ? t("인기순") : t("최신순")}
          </button>
        ))}
      </div>

      <ul className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
        {sorted.map((r) => (
          <li
            key={r.id}
            id={`review-${r.id}`}
            className={`flex flex-col gap-2 py-4 scroll-mt-20 -mx-2 rounded-lg px-2 transition-colors duration-500 ${
              highlightId === r.id ? "bg-amber-100 dark:bg-amber-950/40" : ""
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-zinc-200 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                {r.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img onError={onImageError} src={r.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  r.username.charAt(0).toUpperCase()
                )}
              </span>
              <Link href={`/u/${r.username}`} className="text-sm font-medium text-zinc-800 hover:underline dark:text-zinc-100">
                {r.username}
              </Link>
              <LevelBadge level={r.level} />
              <span className="text-xs text-zinc-500">{formatRelativeTime(r.createdAt, locale)}</span>
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
              <ShareButton
                path={`${shareBasePath}#review-${r.id}`}
                title={t("{username}님의 리뷰", { username: r.username })}
                text={`★ ${r.score.toFixed(1)} · @${r.username}${r.body ? `\n${r.body}` : ""}`}
              />
              {r.userId !== currentUserId && <ReportControl targetId={r.id} loggedIn={currentUserId !== null} />}
            </div>
            {COMMENTS_ENABLED && (
              <ReviewComments
                ratingId={r.id}
                initialCount={r.commentCount}
                currentUserId={currentUserId}
                focusCommentId={focus?.reviewId === r.id ? focus.commentId : undefined}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
