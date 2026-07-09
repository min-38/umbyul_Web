import Link from "next/link";
import { ExplicitBadge } from "@/components/detail/explicit-badge";
import { coverThumb } from "@/lib/image";
import type { DailyPick } from "@/lib/api";

// Discover 상단 "오늘의 음악"(NON-154) — 운영자 큐레이션 히어로 카드. label은 서버(page)에서 번역해 전달.
export function DailyPickCard({ pick, label }: { pick: DailyPick; label: string }) {
  const href = `/${pick.targetType}/${pick.spotifyId}`;
  const artists = (pick.artists ?? []).filter((a) => a.name);

  return (
    <section className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">{label}</p>
      <div className="flex gap-4">
        <Link href={href} className="shrink-0" aria-label={pick.name ?? undefined}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverThumb(pick.imageUrl, "md") ?? "/placeholder.svg"}
            alt=""
            className="h-24 w-24 rounded-lg bg-zinc-100 object-cover dark:bg-zinc-800 sm:h-28 sm:w-28"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Link href={href} className="truncate text-base font-bold text-zinc-900 hover:underline dark:text-zinc-50">
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
          {pick.note && (
            <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-200">{pick.note}</p>
          )}
        </div>
      </div>
    </section>
  );
}
