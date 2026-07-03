"use client";

import { useState } from "react";
import Link from "next/link";
import { Stars } from "@/components/detail/stars";
import { ReactionBar } from "@/components/detail/reaction-bar";
import { ReportDialog } from "@/components/detail/report-control";
import { MeatballMenu } from "@/components/ui/meatball-menu";
import { TargetBadge } from "@/components/ui/target-badge";
import { dismissReview, loadMoreFeed } from "@/app/actions/social";
import { useT } from "@/components/i18n-provider";
import { formatRelativeTime } from "@/lib/format";
import { coverThumb } from "@/lib/image";
import type { FeedItem, FeedSort, FeedScope } from "@/lib/api";
import type { Locale } from "@/lib/i18n";

const PAGE_SIZE = 50;

// 홈 피드(NON-88) 렌더. view=card 카드형 / compact 축약형.
// 카드마다 반응(ReactionBar) + ⋯메뉴(관심 없음·신고) — NON-114. 더 보기 페이지네이션 — NON-107.
export function FeedList({
  items: initialItems,
  view,
  locale,
  loggedIn,
  sort,
  scope,
  trackLabel,
  albumLabel,
}: {
  items: FeedItem[];
  view: "card" | "compact";
  locale: Locale;
  loggedIn: boolean;
  sort: FeedSort;
  scope: FeedScope;
  trackLabel: string;
  albumLabel: string;
}) {
  const t = useT();
  const [items, setItems] = useState<FeedItem[]>(initialItems);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [reportId, setReportId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(initialItems.length >= PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadMore = async () => {
    setLoadingMore(true);
    const more = await loadMoreFeed(sort, scope, items.length);
    setItems((prev) => [...prev, ...more]);
    setHasMore(more.length >= PAGE_SIZE);
    setLoadingMore(false);
  };

  const hide = (id: string) => setDismissed((s) => new Set(s).add(id));
  const unhide = (id: string) =>
    setDismissed((s) => {
      const n = new Set(s);
      n.delete(id);
      return n;
    });

  const onDismiss = async (id: string) => {
    hide(id); // 낙관적 제거
    const r = await dismissReview(id);
    if (!r.ok) unhide(id); // 실패 시 복원
  };

  const menuItems = (it: FeedItem) => [
    { label: t("관심 없음"), onSelect: () => onDismiss(it.id) },
    { label: t("신고"), onSelect: () => setReportId(it.id), danger: true },
  ];

  const actions = (it: FeedItem) => (
    <div className="flex items-center justify-between">
      <ReactionBar
        ratingId={it.id}
        loggedIn={loggedIn}
        initial={{ likeCount: it.likes, dislikeCount: it.dislikes, myReaction: it.myReaction }}
      />
      <MeatballMenu items={menuItems(it)} label={t("더보기")} />
    </div>
  );

  const visible = items.filter((it) => !dismissed.has(it.id));

  const reportDialog = (
    <ReportDialog
      targetType="rating"
      targetId={reportId ?? ""}
      open={reportId !== null}
      onClose={() => setReportId(null)}
    />
  );

  const moreButton = hasMore ? (
    <div className="mt-4 text-center">
      <button
        type="button"
        onClick={loadMore}
        disabled={loadingMore}
        className="rounded-full border border-zinc-300 px-5 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        {loadingMore ? t("불러오는 중…") : t("더 보기")}
      </button>
    </div>
  ) : null;

  if (view === "compact") {
    return (
      <>
        <ul className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
          {visible.map((it) => (
            <li key={it.id} className="flex gap-3 py-3">
              <Link
                href={targetHref(it)}
                className="shrink-0"
                aria-label={it.name ?? (it.targetType === "track" ? trackLabel : albumLabel)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverThumb(it.imageUrl, "sm") ?? "/placeholder.svg"} alt="" className="h-12 w-12 rounded bg-zinc-100 object-cover dark:bg-zinc-800" />
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <TargetBadge type={it.targetType} label={it.targetType === "track" ? trackLabel : albumLabel} />
                  <Link href={targetHref(it)} className="min-w-0 truncate text-sm font-medium text-zinc-900 hover:underline dark:text-zinc-50">
                    {it.name ?? ""}
                    {it.artist ? <span className="font-normal text-zinc-400"> · {it.artist}</span> : null}
                  </Link>
                  <span className="ml-auto flex shrink-0 items-center gap-1">
                    <Stars value={it.score} size={12} />
                    <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">{it.score.toFixed(1)}</span>
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  <Link href={`/u/${it.username}`} className="hover:underline">{it.username}</Link>
                  {" · "}
                  <span suppressHydrationWarning>{formatRelativeTime(it.createdAt, locale)}</span>
                </p>
                <p className="mt-0.5 line-clamp-2 whitespace-pre-wrap text-sm leading-snug text-zinc-600 dark:text-zinc-300">{it.body}</p>
                <div className="mt-1">{actions(it)}</div>
              </div>
            </li>
          ))}
        </ul>
        {moreButton}
        {reportDialog}
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {visible.map((it) => (
          <article key={it.id} className="flex flex-col gap-3 rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
            {/* 헤더: 유저 + 시간 */}
            <div className="flex items-center gap-2">
              <Link href={`/u/${it.username}`} className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-zinc-200 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  {it.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    it.username.charAt(0).toUpperCase()
                  )}
                </span>
                <span className="text-sm font-medium text-zinc-800 hover:underline dark:text-zinc-100">{it.username}</span>
              </Link>
              <span className="text-xs text-zinc-400">· <span suppressHydrationWarning>{formatRelativeTime(it.createdAt, locale)}</span></span>
            </div>

            {/* 대상: 커버 + 배지/이름/아티스트 + 별점 */}
            <div className="flex gap-3">
              <Link
                href={targetHref(it)}
                className="shrink-0"
                aria-label={it.name ?? (it.targetType === "track" ? trackLabel : albumLabel)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverThumb(it.imageUrl, "md") ?? "/placeholder.svg"} alt="" className="h-20 w-20 rounded-lg bg-zinc-100 object-cover dark:bg-zinc-800" />
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <TargetBadge type={it.targetType} label={it.targetType === "track" ? trackLabel : albumLabel} />
                  <Link href={targetHref(it)} className="truncate text-sm font-semibold text-zinc-900 hover:underline dark:text-zinc-50">
                    {it.name ?? ""}
                  </Link>
                </div>
                <p className="mt-0.5 truncate text-xs text-zinc-400">
                  <Artists item={it} />
                </p>
                <span className="mt-1 flex items-center gap-1.5">
                  <Stars value={it.score} size={14} />
                  <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{it.score.toFixed(1)}</span>
                </span>
              </div>
            </div>

            {/* 리뷰 본문 */}
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-200">{it.body}</p>

            {/* 반응 + ⋯메뉴 */}
            {actions(it)}
          </article>
        ))}
      </div>
      {moreButton}
      {reportDialog}
    </>
  );
}

function targetHref(it: FeedItem) {
  return `/${it.targetType}/${it.targetSpotifyId}`;
}

// 아티스트: artists 있으면 개별 링크(", " 조인), 없으면 조인 이름 텍스트.
function Artists({ item }: { item: FeedItem }) {
  const artists = (item.artists ?? []).filter((a) => a.name);
  if (artists.length === 0) return <>{item.artist ?? ""}</>;
  return (
    <>
      {artists.map((a, i) => (
        <span key={i}>
          {i > 0 ? ", " : ""}
          <Link href={`/artist/${a.id}`} className="hover:text-zinc-600 hover:underline dark:hover:text-zinc-300">
            {a.name}
          </Link>
        </span>
      ))}
    </>
  );
}
