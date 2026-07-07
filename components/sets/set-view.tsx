"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { DjSetDetail, DjSetTrack } from "@/lib/api";
import { deleteSet, toggleSetLike } from "@/app/actions/sets";
import { YoutubeIcon, SpotifyIcon } from "@/components/sets/track-picker";
import { MeatballMenu } from "@/components/ui/meatball-menu";
import { Stars } from "@/components/detail/stars";
import { ReviewModal } from "@/components/detail/review-modal";
import { ReportDialog } from "@/components/detail/report-control";
import { MusicBrainzLink } from "@/components/detail/musicbrainz-link";
import { ExplicitBadge } from "@/components/detail/explicit-badge";
import { coverThumb } from "@/lib/image";
import { formatRelativeTime } from "@/lib/format";
import { safeHttpUrl } from "@/lib/validation";
import { useT, useLocale } from "@/components/i18n-provider";

// 믹스 상세(읽기 전용). 소유자 편집은 미트볼 → 수정 페이지(/mixes/[id]/edit).
export function SetView({
  detail,
  isOwner,
  loggedIn,
}: {
  detail: DjSetDetail;
  isOwner: boolean;
  loggedIn: boolean;
}) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const { set } = detail;
  const [tracks, setTracks] = useState<DjSetTrack[]>(detail.tracks);
  const [rateFor, setRateFor] = useState<DjSetTrack | null>(null);
  const [liked, setLiked] = useState(set.likedByMe);
  const [likeCount, setLikeCount] = useState(set.likeCount);
  const [reportOpen, setReportOpen] = useState(false);
  const path = `/mixes/${set.id}`;
  const listenUrl = safeHttpUrl(set.listenUrl); // http(s)만 렌더 — 저장된 javascript: 등 차단(SEC-W-1)

  const toggleLike = async () => {
    if (!loggedIn) {
      router.push("/login");
      return;
    }
    const wasLiked = liked; // 클릭 시점 값 고정 — 델타 계산·롤백에 stale 클로저 방지(LOG-W-1)
    setLiked(!wasLiked);
    setLikeCount((c) => c + (wasLiked ? -1 : 1));
    const r = await toggleSetLike(set.id);
    if (r.ok && r.data) {
      setLiked(r.data.liked);
      setLikeCount(r.data.likeCount);
    } else {
      setLiked(wasLiked); // 실패 시 낙관적 업데이트 롤백
      setLikeCount((c) => c + (wasLiked ? 1 : -1));
    }
  };

  const onRated = (spotifyId: string, score: number, review: string) =>
    setTracks((ts) => ts.map((x) => (x.spotifyId === spotifyId ? { ...x, myScore: score > 0 ? score : null, myReview: review || null } : x)));

  const removeSet = async () => {
    if (!window.confirm(t("이 믹스를 삭제할까요?"))) return;
    await deleteSet(set.id);
    router.push("/mixes");
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <Link href="/mixes" className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
        {t("목록으로")}
      </Link>
      <header className="flex flex-col gap-3 border-b border-zinc-200 pb-5 dark:border-zinc-800">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{set.title}</h1>
        <div className="flex items-center justify-between gap-3 text-xs text-zinc-400">
          <Link href={`/u/${set.ownerUsername}`} className="flex items-center gap-1.5 hover:underline">
            <span className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-full bg-zinc-200 text-[9px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">
              {set.ownerAvatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={set.ownerAvatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                set.ownerUsername.charAt(0).toUpperCase()
              )}
            </span>
            {set.ownerUsername}
          </Link>
          <span suppressHydrationWarning>{formatRelativeTime(set.updatedAt, locale)}</span>
        </div>
        {set.note && <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{set.note}</p>}
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={toggleLike}
            aria-label={t("좋아요")}
            aria-pressed={liked}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition ${
              liked
                ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                : "border-zinc-300 text-zinc-500 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-400"
            }`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M7 10v11M2 13v6a2 2 0 002 2h13.5a2 2 0 001.97-1.64l1.3-7A2 2 0 0019.8 10H14V4a2 2 0 00-2-2l-3 7v11" />
            </svg>
            <span className="tabular-nums">{likeCount}</span>
          </button>
          {isOwner ? (
            <MeatballMenu
              label={t("더보기")}
              items={[
                { label: t("수정"), onSelect: () => router.push(`/mixes/${set.id}/edit`) },
                { label: t("삭제"), onSelect: removeSet, danger: true },
              ]}
            />
          ) : (
            loggedIn && (
              <MeatballMenu label={t("더보기")} items={[{ label: t("신고"), onSelect: () => setReportOpen(true), danger: true }]} />
            )
          )}
        </div>
      </header>

      {/* 곡 수 (리스트 우측 상단) */}
      <div className="mt-5 mb-1 flex justify-end">
        <span className="text-xs font-medium text-zinc-400">{t("{count}곡", { count: tracks.length })}</span>
      </div>

      <ul className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800/70">
        {tracks.map((tr) => (
          <li key={tr.spotifyId} className="flex items-center gap-2.5 py-3">
            <Link href={`/track/${tr.spotifyId}`} className="shrink-0" aria-label={tr.name}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverThumb(tr.imageUrl, "sm") ?? "/placeholder.svg"} alt="" className="h-14 w-14 rounded bg-zinc-100 object-cover dark:bg-zinc-800" />
            </Link>
            <div className="min-w-0 flex-1">
              <Link href={`/track/${tr.spotifyId}`} className="flex items-center gap-1.5 text-sm font-medium text-zinc-900 hover:underline dark:text-zinc-50">
                <span className="truncate">{tr.name}</span>
                {tr.explicit && <ExplicitBadge />}
              </Link>
              <p className="truncate text-xs text-zinc-400">
                {tr.artists.length > 0
                  ? tr.artists.map((a, k) => (
                      <span key={a.id}>
                        {k > 0 ? ", " : ""}
                        <Link href={`/artist/${a.id}`} className="hover:text-zinc-600 hover:underline dark:hover:text-zinc-300">{a.name}</Link>
                      </span>
                    ))
                  : tr.artist}
                {tr.albumId && tr.albumName && (
                  <>
                    {" · "}
                    <Link href={`/album/${tr.albumId}`} className="hover:text-zinc-600 hover:underline dark:hover:text-zinc-300">{tr.albumName}</Link>
                  </>
                )}
              </p>
              {/* 듣기 아이콘: 스포티파이 · MusicBrainz · 유튜브 (아티스트·앨범 하단) */}
              <div className="mt-1.5 flex items-center gap-3">
                <a href={`https://open.spotify.com/track/${tr.spotifyId}`} target="_blank" rel="noopener noreferrer" aria-label={t("Spotify에서 듣기")} className="text-[#1DB954] hover:opacity-80">
                  <SpotifyIcon size={16} />
                </a>
                <MusicBrainzLink isrc={tr.isrc} size={16} label={t("MusicBrainz에서 보기")} />
                {tr.youtubeUrl && (
                  <a href={tr.youtubeUrl} target="_blank" rel="noopener noreferrer" aria-label={t("유튜브에서 보기")} className="text-red-600 hover:text-red-500">
                    <YoutubeIcon size={16} />
                  </a>
                )}
              </div>
            </div>

            {tr.isrc &&
              (tr.myScore ? (
                <button type="button" onClick={() => (loggedIn ? setRateFor(tr) : router.push("/login"))} title={t("평가하기")} className="flex shrink-0 items-center gap-1">
                  <Stars value={tr.myScore} size={12} />
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{tr.myScore.toFixed(1)}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => (loggedIn ? setRateFor(tr) : router.push("/login"))}
                  className="shrink-0 rounded-full bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:brightness-110"
                >
                  {t("평가하기")}
                </button>
              ))}
          </li>
        ))}
      </ul>

      {tracks.length === 0 && <p className="py-8 text-center text-sm text-zinc-400">{t("아직 담긴 곡이 없습니다.")}</p>}

      {/* 플레이리스트 링크 (하단) */}
      {listenUrl && (
        <div className="mt-6 flex flex-col gap-2 border-t border-zinc-200 pt-5 dark:border-zinc-800">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("플레이리스트 링크")}</span>
          <a
            href={listenUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 px-4 py-2 text-sm font-medium text-white hover:brightness-110"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 3l14 9-14 9V3z" />
            </svg>
            {t("듣기")}
          </a>
        </div>
      )}

      {rateFor && rateFor.isrc && (
        <ReviewModal
          targetType="track"
          targetId={rateFor.isrc}
          spotifyId={rateFor.spotifyId}
          name={rateFor.name}
          artist={rateFor.artist}
          artists={rateFor.artists}
          imageUrl={rateFor.imageUrl}
          explicit={rateFor.explicit}
          initialScore={rateFor.myScore ?? 0}
          initialReview={rateFor.myReview ?? ""}
          path={path}
          onClose={() => setRateFor(null)}
          onSaved={(score, review) => onRated(rateFor.spotifyId, score, review)}
        />
      )}

      <ReportDialog targetType="set" targetId={set.id} open={reportOpen} onClose={() => setReportOpen(false)} />
    </div>
  );
}
