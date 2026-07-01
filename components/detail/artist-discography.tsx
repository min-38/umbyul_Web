"use client";

import { useState } from "react";
import Link from "next/link";
import type { ArtistAlbum } from "@/lib/api";
import { useT } from "@/components/i18n-provider";
import { ScoreBadge } from "./score-badge";

type Sort = "date" | "rating";

export function ArtistDiscography({ albums }: { albums: ArtistAlbum[] }) {
  const t = useT();
  const [sort, setSort] = useState<Sort>("date");

  const albumTypeLabel = (type: string) =>
    type === "single" ? t("싱글") : type === "compilation" ? t("컴필레이션") : t("앨범");

  // 평점순: 평가 없는 릴리스는 뒤로(-1). 발매일순: 최신 먼저.
  const sorted = [...albums].sort((a, b) =>
    sort === "rating"
      ? (b.rating?.average ?? -1) - (a.rating?.average ?? -1)
      : (b.releaseDate ?? "").localeCompare(a.releaseDate ?? ""),
  );

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{t("디스코그래피")}</h2>
        <div className="flex gap-1 text-xs">
          {(["date", "rating"] as Sort[]).map((s) => (
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
              {s === "date" ? t("발매일순") : t("평점순")}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {sorted.map((a) => (
          <Link key={a.spotifyId} href={`/album/${a.spotifyId}`} className="flex flex-col gap-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={a.imageUrl ?? "/placeholder.svg"}
              alt=""
              className="aspect-square w-full rounded-lg bg-zinc-100 object-cover dark:bg-zinc-800"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">{a.name}</p>
              <p className="truncate text-xs text-zinc-400">
                {a.releaseDate?.slice(0, 4)} · {albumTypeLabel(a.albumType)}
              </p>
              {a.rating && (
                <span className="mt-1 flex">
                  <ScoreBadge rating={a.rating} />
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
