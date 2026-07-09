import Link from "next/link";
import { Stars } from "@/components/detail/stars";
import { ExplicitBadge } from "@/components/detail/explicit-badge";
import { SpotifyLink } from "@/components/detail/detail-bits";
import { MusicBrainzLink } from "@/components/detail/musicbrainz-link";
import { YouTubeLink } from "@/components/detail/youtube-link";
import { coverThumb } from "@/lib/image";
import type { DailyPick } from "@/lib/api";

type Labels = {
  today: string;
  review: string;
  ratings: string;
  empty: string;
  spotify: string;
  youtube: string;
  musicbrainz: string;
};

// Discover 상단 "오늘의 음악"(NON-154) 히어로 카드. 반짝이는 우주 배경(cosmic-bg/stars, About 히어로와 동일).
// 별점 강조 + 외부 링크 아이콘(아티스트 밑, 상세 페이지 참고) + 리뷰 CTA. 운영자 코멘트(note)는 미표시.
export function DailyPickCard({ pick, labels }: { pick: DailyPick; labels: Labels }) {
  const href = `/${pick.targetType}/${pick.spotifyId}`;
  const artists = (pick.artists ?? []).filter((a) => a.name);
  const spotifyUrl = pick.spotifyUrl ?? `https://open.spotify.com/${pick.targetType}/${pick.spotifyId}`;

  return (
    <section className="cosmic-bg relative overflow-hidden rounded-2xl border border-white/10 p-4 sm:p-5">
      <div className="cosmic-stars" aria-hidden="true" />
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-indigo-300">{labels.today}</p>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* 커버 + 제목/아티스트/외부 링크/장르 */}
        <Link href={href} className="shrink-0 self-start sm:self-center" aria-label={pick.name ?? undefined}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverThumb(pick.imageUrl, "md") ?? "/placeholder.svg"}
            alt=""
            className="h-28 w-28 rounded-lg bg-white/5 object-cover shadow-lg"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Link href={href} className="truncate text-lg font-bold text-white hover:underline">
              {pick.name ?? ""}
            </Link>
            {pick.explicit && <ExplicitBadge />}
          </div>
          <p className="mt-0.5 truncate text-sm text-zinc-300">
            {artists.length > 0
              ? artists.map((a, i) => (
                  <span key={a.id || i}>
                    {i > 0 ? ", " : ""}
                    {a.id ? (
                      <Link href={`/artist/${a.id}`} className="hover:text-white hover:underline">
                        {a.name}
                      </Link>
                    ) : (
                      a.name
                    )}
                  </span>
                ))
              : pick.artist}
          </p>
          {/* 외부 링크 아이콘 — 아티스트 밑(상세 페이지 참고) */}
          <div className="mt-2 flex items-center gap-3">
            <SpotifyLink url={spotifyUrl} label={labels.spotify} />
            <YouTubeLink url={pick.youtubeUrl} label={labels.youtube} />
            <MusicBrainzLink isrc={pick.isrc} upc={pick.upc} label={labels.musicbrainz} />
          </div>
          {pick.genres.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {pick.genres.map((g) => (
                <span key={g} className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-zinc-200">
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 평점 + 리뷰 CTA */}
        <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
          <div className="flex items-center gap-2">
            <Stars value={pick.average ?? 0} size={18} />
            {pick.average != null && <span className="text-sm font-semibold text-white">{pick.average.toFixed(1)}</span>}
          </div>
          <p className="text-xs text-zinc-400">{pick.count > 0 ? labels.ratings : labels.empty}</p>
          <Link
            href={href}
            className="mt-1 inline-flex items-center gap-1 rounded-full bg-indigo-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-400"
          >
            {labels.review}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
