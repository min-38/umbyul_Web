"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Stars } from "@/components/detail/stars";
import { ReactionBar } from "@/components/detail/reaction-bar";
import { ReportDialog } from "@/components/detail/report-control";
import { ShareButton } from "@/components/detail/share-button";
import { FeedCommentsModal } from "@/components/feed/feed-comments-modal";
import { MeatballMenu } from "@/components/ui/meatball-menu";
import { InfiniteScroll } from "@/components/ui/infinite-scroll";
import { TargetBadge } from "@/components/ui/target-badge";
import { ExplicitBadge } from "@/components/detail/explicit-badge";
import { LevelBadge } from "@/components/ui/level-badge";
import { dismissReview, loadMoreFeed } from "@/app/actions/social";
import { useT } from "@/components/i18n-provider";
import { ExpandableText } from "@/components/ui/expandable-text";
import { formatRelativeTime } from "@/lib/format";
import { coverThumb, onImageError } from "@/lib/image";
import type { FeedItem, FeedSort, FeedScope } from "@/lib/api";
import type { Locale } from "@/lib/i18n";

const PAGE_SIZE = 20;

// 홈 피드(NON-88) 렌더. view=card 카드형 / compact 축약형.
// 카드마다 반응(ReactionBar) + ⋯메뉴(관심 없음·신고) — NON-114. 더 보기 페이지네이션 — NON-107.
export function FeedList({
  items: initialItems,
  view,
  locale,
  loggedIn,
  currentUserId,
  sort,
  scope,
  genre,
  trackLabel,
  albumLabel,
}: {
  items: FeedItem[];
  view: "card" | "compact";
  locale: Locale;
  loggedIn: boolean;
  currentUserId: string | null;
  sort: FeedSort;
  scope: FeedScope;
  genre: string | null;
  trackLabel: string;
  albumLabel: string;
}) {
  const t = useT();
  const [items, setItems] = useState<FeedItem[]>(initialItems);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [reportId, setReportId] = useState<string | null>(null);
  const [commentsFor, setCommentsFor] = useState<FeedItem | null>(null);
  const [hasMore, setHasMore] = useState(initialItems.length >= PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  // 실행 취소 대기 중인 항목들(UX-10). 항목당 토스트 1개, 최신이 맨 위, 최대 4개.
  const [pending, setPending] = useState<string[]>([]);
  const [leaving, setLeaving] = useState<Set<string>>(new Set()); // 퇴장 애니메이션 중인 토스트
  const pendingRef = useRef<string[]>([]); // 동기적 소스(빠른 연속 dismiss·오버플로 계산용)
  const dismissTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const MAX_TOASTS = 4;
  const TOAST_EXIT_MS = 200; // globals.css toast-out 길이와 일치

  const loadMore = async () => {
    setLoadingMore(true);
    const more = await loadMoreFeed(sort, scope, items.length, genre);
    setLoadingMore(false);
    // 실패(null)는 "피드 끝"으로 오인하지 않고 버튼을 유지 → 재시도 가능(NON-224).
    if (!more) return;
    // 라이브 정렬(hot/rising)로 창이 밀려 이미 표시된 항목이 다시 올 수 있음 → id 디듑(중복 키·중복 카드 방지, LOG-W-2)
    setItems((prev) => {
      const seen = new Set(prev.map((x) => x.id));
      return [...prev, ...more.filter((x) => !seen.has(x.id))];
    });
    setHasMore(more.length >= PAGE_SIZE);
  };

  const hide = (id: string) => setDismissed((s) => new Set(s).add(id));
  const unhide = (id: string) =>
    setDismissed((s) => {
      const n = new Set(s);
      n.delete(id);
      return n;
    });

  const commitDismiss = async (id: string) => {
    const r = await dismissReview(id);
    if (!r.ok) unhide(id); // 실패 시 복원
  };

  const stopTimer = (id: string) => {
    const timer = dismissTimers.current.get(id);
    if (timer) clearTimeout(timer);
    dismissTimers.current.delete(id);
  };

  const clearLeaving = (id: string) =>
    setLeaving((s) => {
      if (!s.has(id)) return s;
      const n = new Set(s);
      n.delete(id);
      return n;
    });

  // 스택에서 즉시 제거(퇴장 애니메이션 없이) — 오버플로 축출용
  const dropToast = (id: string) => {
    pendingRef.current = pendingRef.current.filter((x) => x !== id);
    setPending([...pendingRef.current]);
    clearLeaving(id);
  };

  // 퇴장 애니메이션 후 제거 — 타이머 만료·실행취소용
  const removeToast = (id: string) => {
    setLeaving((s) => new Set(s).add(id));
    setTimeout(() => dropToast(id), TOAST_EXIT_MS);
  };

  // 관심 없음: 즉시 숨기되 항목마다 5초 실행 취소 토스트 노출 — 유예 후 서버 반영(UX-10)
  const onDismiss = (id: string) => {
    hide(id); // 낙관적 제거
    pendingRef.current = [...pendingRef.current.filter((x) => x !== id), id]; // 최신을 끝에
    // 4개 초과 시 가장 오래된 것부터 즉시 서버 확정하고 스택에서 제거
    while (pendingRef.current.length > MAX_TOASTS) {
      const oldest = pendingRef.current.shift()!;
      stopTimer(oldest);
      commitDismiss(oldest);
      clearLeaving(oldest);
    }
    setPending([...pendingRef.current]);
    dismissTimers.current.set(
      id,
      setTimeout(() => {
        stopTimer(id);
        commitDismiss(id);
        removeToast(id); // 유예 만료 → 페이드아웃
      }, 5000),
    );
  };

  const undoDismiss = (id: string) => {
    stopTimer(id);
    unhide(id);
    removeToast(id); // 즉시 복원 + 토스트 페이드아웃
  };

  const menuItems = (it: FeedItem) => [
    { label: t("관심 없음"), onSelect: () => onDismiss(it.id) },
    { label: t("신고"), onSelect: () => setReportId(it.id), danger: true },
  ];

  const actions = (it: FeedItem) => (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <ReactionBar
          ratingId={it.id}
          loggedIn={loggedIn}
          initial={{ likeCount: it.likes, dislikeCount: it.dislikes, myReaction: it.myReaction }}
        />
        <button
          type="button"
          onClick={() => setCommentsFor(it)}
          aria-label={t("댓글")}
          className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span className="tabular-nums">{it.commentCount}</span>
        </button>
        <ShareButton
          path={`/${it.targetType}/${it.targetSpotifyId}#review-${it.id}`}
          title={t("{username}님의 리뷰", { username: it.username })}
          text={`★ ${it.score.toFixed(1)} · ${it.name ?? ""}${it.artist ? ` — ${it.artist}` : ""}${it.body ? `\n@${it.username}: ${it.body}` : ""}`}
        />
      </div>
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

  const commentsModal = commentsFor ? (
    <FeedCommentsModal
      ratingId={commentsFor.id}
      commentCount={commentsFor.commentCount}
      currentUserId={currentUserId}
      onClose={() => setCommentsFor(null)}
    />
  ) : null;

  // 항목당 토스트 1개를 하단 중앙에 세로 스택. flex-col-reverse로 최신(배열 끝)이 맨 위
  const undoToasts = pending.length > 0 ? (
    <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-col-reverse items-center gap-2">
      {pending.map((id) => (
        <div
          key={id}
          role="status"
          aria-live="polite"
          className={`flex items-center gap-3 rounded-full bg-zinc-900 px-4 py-2.5 text-sm text-white shadow-lg dark:bg-zinc-100 dark:text-zinc-900 ${leaving.has(id) ? "animate-toast-out" : "animate-toast-in"}`}
        >
          <span>{t("피드에서 숨겼어요")}</span>
          <button type="button" onClick={() => undoDismiss(id)} className="font-semibold text-indigo-300 hover:text-indigo-200 dark:text-indigo-600 dark:hover:text-indigo-500">
            {t("실행 취소")}
          </button>
        </div>
      ))}
    </div>
  ) : null;

  const moreArea = (
    <InfiniteScroll
      hasMore={hasMore}
      loading={loadingMore}
      onLoadMore={loadMore}
      endLabel={visible.length > 0 ? t("모두 확인했어요") : null}
    />
  );

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
                <img onError={onImageError} src={coverThumb(it.imageUrl, "md") ?? "/placeholder.svg"} alt="" loading="lazy" className="h-16 w-16 rounded bg-zinc-100 object-cover dark:bg-zinc-800" />
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <TargetBadge type={it.targetType} label={it.targetType === "track" ? trackLabel : albumLabel} />
                  <Link href={targetHref(it)} className="min-w-0 truncate text-sm font-medium text-zinc-900 hover:underline dark:text-zinc-50">
                    {it.name ?? ""}
                    {it.artist ? <span className="font-normal text-zinc-500"> · {it.artist}</span> : null}
                  </Link>
                  {it.explicit && <ExplicitBadge />}
                  <span className="ml-auto flex shrink-0 items-center gap-1">
                    <Stars value={it.score} size={12} />
                    <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">{it.score.toFixed(1)}</span>
                  </span>
                </div>
                <p className="text-xs text-zinc-500">
                  <Link href={`/u/${it.username}`} className="hover:underline">{it.username}</Link>
                  {" "}
                  <LevelBadge level={it.level} />
                  {" · "}
                  <span suppressHydrationWarning>{formatRelativeTime(it.createdAt, locale)}</span>
                </p>
                {it.genres.length > 0 && (
                  <div className="mt-0.5 flex flex-wrap gap-1">
                    {it.genres.slice(0, 2).map((g) => (
                      <span key={g} className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">{g}</span>
                    ))}
                  </div>
                )}
                <p className="mt-0.5 line-clamp-2 whitespace-pre-wrap break-words text-sm leading-snug text-zinc-600 dark:text-zinc-300">{it.body}</p>
                <div className="mt-1">{actions(it)}</div>
              </div>
            </li>
          ))}
        </ul>
        {moreArea}
        {reportDialog}
        {commentsModal}
        {undoToasts}
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
              <Link href={`/u/${it.username}`} className="flex min-w-0 items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-zinc-200 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  {it.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img onError={onImageError} src={it.avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    it.username.charAt(0).toUpperCase()
                  )}
                </span>
                <span className="min-w-0 truncate text-sm font-medium text-zinc-800 hover:underline dark:text-zinc-100">{it.username}</span>
              </Link>
              <LevelBadge level={it.level} />
              <span className="text-xs text-zinc-500">· <span suppressHydrationWarning>{formatRelativeTime(it.createdAt, locale)}</span></span>
            </div>

            {/* 대상: 커버 + 배지/이름/아티스트 + 별점 */}
            <div className="flex gap-3">
              <Link
                href={targetHref(it)}
                className="shrink-0"
                aria-label={it.name ?? (it.targetType === "track" ? trackLabel : albumLabel)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img onError={onImageError} src={coverThumb(it.imageUrl, "md") ?? "/placeholder.svg"} alt="" loading="lazy" className="h-28 w-28 rounded-lg bg-zinc-100 object-cover dark:bg-zinc-800" />
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <TargetBadge type={it.targetType} label={it.targetType === "track" ? trackLabel : albumLabel} />
                  <Link href={targetHref(it)} className="truncate text-sm font-semibold text-zinc-900 hover:underline dark:text-zinc-50">
                    {it.name ?? ""}
                  </Link>
                  {it.explicit && <ExplicitBadge />}
                </div>
                <p className="mt-0.5 truncate text-xs text-zinc-500">
                  <Artists item={it} />
                </p>
                <span className="mt-1 flex items-center gap-1.5">
                  <Stars value={it.score} size={14} />
                  <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{it.score.toFixed(1)}</span>
                </span>
                {it.genres.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {it.genres.slice(0, 2).map((g) => (
                      <span key={g} className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">{g}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 리뷰 본문 — 길면 자세히/간략히 토글(NON-261) */}
            {it.body && <ExpandableText text={it.body} className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-200" />}

            {/* 반응 + ⋯메뉴 */}
            {actions(it)}
          </article>
        ))}
      </div>
      {moreArea}
      {reportDialog}
      {commentsModal}
      {undoToasts}
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
