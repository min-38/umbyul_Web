"use client";

import { useState } from "react";
import Link from "next/link";
import type { AlbumDetail } from "@/lib/api";
import { formatDuration, formatTotalDuration, formatReleaseDate } from "@/lib/format";

// 리뷰는 탭에서 빼서 페이지 하단 별도 섹션으로(트랙 페이지와 일관).
type Tab = "tracklist" | "info";

const TABS: { key: Tab; label: string }[] = [
  { key: "tracklist", label: "트랙리스트" },
  { key: "info", label: "정보" },
];

export function AlbumTabs({ album }: { album: AlbumDetail }) {
  const [tab, setTab] = useState<Tab>("tracklist");

  return (
    <div className="mt-8">
      <div className="flex gap-6 border-b border-zinc-200 dark:border-zinc-800">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`-mb-px border-b-2 pb-2.5 text-sm font-medium ${
              tab === t.key
                ? "border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100"
                : "border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="pt-5">
        {tab === "tracklist" && (
          <div>
            {/* 트랙이 많아도 리뷰가 멀리 밀리지 않게 자체 스크롤(최대 높이) */}
            <ol className="flex max-h-96 flex-col overflow-y-auto pr-1">
              {album.tracks.map((t) => (
                <li key={t.id} className="flex items-center gap-3 border-b border-zinc-100 py-2.5 last:border-0 dark:border-zinc-900">
                  <span className="w-6 text-right text-sm tabular-nums text-zinc-400">{t.trackNumber}</span>
                  <Link href={`/track/${t.id}`} className="flex-1 truncate text-sm text-zinc-800 hover:underline dark:text-zinc-100">
                    {t.name}
                  </Link>
                  <span className="text-xs tabular-nums text-zinc-400">{formatDuration(t.durationMs)}</span>
                </li>
              ))}
            </ol>
            <div className="mt-3 flex justify-between border-t border-zinc-200 pt-3 text-xs text-zinc-400 dark:border-zinc-800">
              <span>{album.totalTracks}곡</span>
              <span>{formatTotalDuration(album.tracks.map((t) => t.durationMs))}</span>
            </div>
          </div>
        )}

        {tab === "info" && (
          <dl className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <dt className="text-xs text-zinc-400">발매일</dt>
                <dd className="text-sm text-zinc-800 dark:text-zinc-200">{formatReleaseDate(album.releaseDate)}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-xs text-zinc-400">트랙 수</dt>
                <dd className="text-sm text-zinc-800 dark:text-zinc-200">{album.totalTracks}곡</dd>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-xs text-zinc-400">저작권</dt>
              <dd className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{album.copyright ?? "-"}</dd>
            </div>
          </dl>
        )}
      </div>
    </div>
  );
}
