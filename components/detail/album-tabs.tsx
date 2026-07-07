"use client";

import { useState } from "react";
import Link from "next/link";
import type { AlbumDetail, RatingPoint } from "@/lib/api";
import { formatDuration, formatTotalDuration, formatReleaseDate } from "@/lib/format";
import { useT } from "@/components/i18n-provider";
import { Stars } from "./stars";
import { GenreTags } from "./genre-tags";
import { RatingChart } from "./rating-chart";
import { ExplicitBadge } from "./explicit-badge";

// 리뷰는 탭에서 빼서 페이지 하단 별도 섹션으로(트랙 페이지와 일관). 추이 탭 추가(BUG-8/16).
type Tab = "tracklist" | "info" | "chart";

const TABS: { key: Tab; label: string }[] = [
  { key: "tracklist", label: "트랙리스트" },
  { key: "info", label: "정보" },
  { key: "chart", label: "추이" },
];

export function AlbumTabs({ album, loggedIn, points }: { album: AlbumDetail; loggedIn: boolean; points: RatingPoint[] }) {
  const [tab, setTab] = useState<Tab>("tracklist");
  const t = useT();
  const enoughChart = points.length >= 2 && (points[points.length - 1]?.count ?? 0) >= 5;

  return (
    <div className="mt-8">
      <div role="tablist" className="flex gap-6 border-b border-zinc-200 dark:border-zinc-800">
        {TABS.map((tb) => (
          <button
            key={tb.key}
            type="button"
            role="tab"
            aria-selected={tab === tb.key}
            onClick={() => setTab(tb.key)}
            className={`-mb-px border-b-2 pb-2.5 text-sm font-medium ${
              tab === tb.key
                ? "border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100"
                : "border-transparent text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
            }`}
          >
            {t(tb.label)}
            {tb.key === "tracklist" && <span className="ml-1 text-zinc-500">({album.totalTracks})</span>}
          </button>
        ))}
      </div>

      <div className="pt-5">
        {tab === "tracklist" && (
          <div>
            {/* 트랙이 많아도 리뷰가 멀리 밀리지 않게 자체 스크롤(최대 높이) */}
            <ol className="flex max-h-96 flex-col overflow-y-auto pr-1">
              {album.tracks.map((tr) => (
                <li key={tr.id} className="flex items-center gap-3 border-b border-zinc-100 py-2.5 last:border-0 dark:border-zinc-900">
                  <span className="w-6 text-right text-sm tabular-nums text-zinc-500">{tr.trackNumber}</span>
                  <Link href={`/track/${tr.id}`} className="flex min-w-0 flex-1 items-center gap-1.5 text-sm text-zinc-800 hover:underline dark:text-zinc-100">
                    <span className="truncate">{tr.name}</span>
                    {tr.explicit && <ExplicitBadge />}
                  </Link>
                  {tr.rating?.average != null && (
                    <span className="flex items-center gap-1">
                      <Stars value={tr.rating.average} size={12} />
                      <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                        {tr.rating.average.toFixed(1)}
                      </span>
                    </span>
                  )}
                  <span className="w-10 text-right text-xs tabular-nums text-zinc-500">{formatDuration(tr.durationMs)}</span>
                </li>
              ))}
            </ol>
            <div className="mt-3 flex justify-between border-t border-zinc-200 pt-3 text-xs text-zinc-500 dark:border-zinc-800">
              <span>{t("{count}곡", { count: album.totalTracks })}</span>
              <span>{formatTotalDuration(album.tracks.map((tr) => tr.durationMs))}</span>
            </div>
          </div>
        )}

        {tab === "info" && (
          <dl className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <dt className="text-xs text-zinc-500">{t("발매일")}</dt>
                <dd className="text-sm text-zinc-800 dark:text-zinc-200">{formatReleaseDate(album.releaseDate)}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-xs text-zinc-500">{t("트랙 수")}</dt>
                <dd className="text-sm text-zinc-800 dark:text-zinc-200">{t("{count}곡", { count: album.totalTracks })}</dd>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-xs text-zinc-500">{t("저작권")}</dt>
              <dd className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{album.copyright ?? "-"}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-xs text-zinc-500">{t("장르")}</dt>
              <dd><GenreTags targetType="album" id={album.spotifyId} loggedIn={loggedIn} /></dd>
            </div>
          </dl>
        )}

        {tab === "chart" &&
          (enoughChart ? (
            <RatingChart points={points} label={t("평점 추이")} />
          ) : (
            <p className="rounded-lg border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
              {t("평가가 더 쌓이면 추이가 표시됩니다.")}
            </p>
          ))}
      </div>
    </div>
  );
}
