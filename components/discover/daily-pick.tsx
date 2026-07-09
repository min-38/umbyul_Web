import Link from "next/link";
import { Stars } from "@/components/detail/stars";
import { ExplicitBadge } from "@/components/detail/explicit-badge";
import { coverThumb } from "@/lib/image";
import type { DailyPick } from "@/lib/api";

// Discover 상단 "오늘의 음악"(NON-154) 히어로 카드. 별점 강조 + 장르 칩 + 외부 링크 + 리뷰 CTA.
// 라벨은 서버(page)에서 번역해 전달. 운영자 코멘트(note)는 표시하지 않음(내부 메모).
export function DailyPickCard({
  pick,
  label,
  reviewLabel,
  ratingsLabel,
  emptyLabel,
}: {
  pick: DailyPick;
  label: string;
  reviewLabel: string;
  ratingsLabel: string;
  emptyLabel: string;
}) {
  const href = `/${pick.targetType}/${pick.spotifyId}`;
  const artists = (pick.artists ?? []).filter((a) => a.name);
  const query = encodeURIComponent(`${pick.artist ?? ""} ${pick.name ?? ""}`.trim());
  const links = [
    { label: "Spotify", href: `https://open.spotify.com/${pick.targetType}/${pick.spotifyId}` },
    { label: "YouTube", href: `https://www.youtube.com/results?search_query=${query}` },
    { label: "MusicBrainz", href: `https://musicbrainz.org/search?query=${query}&type=${pick.targetType === "album" ? "release" : "recording"}` },
  ];

  return (
    <section className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">{label}</p>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* 커버 + 제목/아티스트/장르 */}
        <Link href={href} className="shrink-0 self-start sm:self-center" aria-label={pick.name ?? undefined}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverThumb(pick.imageUrl, "md") ?? "/placeholder.svg"}
            alt=""
            className="h-28 w-28 rounded-lg bg-zinc-100 object-cover dark:bg-zinc-800"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Link href={href} className="truncate text-lg font-bold text-zinc-900 hover:underline dark:text-zinc-50">
              {pick.name ?? ""}
            </Link>
            {pick.explicit && <ExplicitBadge />}
          </div>
          <p className="mt-0.5 truncate text-sm text-zinc-500">
            {artists.length > 0
              ? artists.map((a, i) => (
                  <span key={a.id || i}>
                    {i > 0 ? ", " : ""}
                    {a.id ? (
                      <Link href={`/artist/${a.id}`} className="hover:text-zinc-700 hover:underline dark:hover:text-zinc-300">
                        {a.name}
                      </Link>
                    ) : (
                      a.name
                    )}
                  </span>
                ))
              : pick.artist}
          </p>
          {pick.genres.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {pick.genres.map((g) => (
                <span key={g} className="rounded-full bg-zinc-200/70 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 평점 + 외부 링크 + 리뷰 CTA */}
        <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
          <div className="flex items-center gap-2">
            <Stars value={pick.average ?? 0} size={18} />
            {pick.average != null && (
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{pick.average.toFixed(1)}</span>
            )}
          </div>
          <p className="text-xs text-zinc-500">{pick.count > 0 ? ratingsLabel : emptyLabel}</p>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            {links.map((l, i) => (
              <span key={l.label} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden="true">·</span>}
                <a href={l.href} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-600 hover:underline dark:hover:text-zinc-300">
                  {l.label}
                </a>
              </span>
            ))}
          </div>
          <Link
            href={href}
            className="mt-1 inline-flex items-center gap-1 rounded-full bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
          >
            {reviewLabel}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
