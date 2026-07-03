import Link from "next/link";
import { coverThumb } from "@/lib/image";
import { Stars } from "@/components/detail/stars";
import { TargetBadge } from "@/components/ui/target-badge";
import { toCover } from "@/lib/discover-cover";
import type { DiscoverItem } from "@/lib/api";

// Chart(NON-82) 순위 리스트. 순위·커버·앨범/곡 배지·제목(→상세)·아티스트(→아티스트)·평균별점+점수·평가 수.
export function ChartList({
  items,
  trackLabel,
  albumLabel,
}: {
  items: DiscoverItem[];
  trackLabel: string;
  albumLabel: string;
}) {
  return (
    <ol className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
      {items.map((x, i) => {
        const c = toCover(x);
        return (
          <li key={c.key} className="flex items-center gap-3 py-3">
            <span className="w-6 shrink-0 text-right text-sm font-semibold tabular-nums text-zinc-400">{i + 1}</span>
            <Link href={c.href} className="shrink-0" aria-label={c.name ?? ""}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverThumb(c.imageUrl, "sm") ?? "/placeholder.svg"}
                alt=""
                className="h-12 w-12 rounded-md bg-zinc-100 object-cover dark:bg-zinc-800"
              />
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <TargetBadge type={x.targetType} label={x.targetType === "track" ? trackLabel : albumLabel} />
                <Link
                  href={c.href}
                  className="truncate text-sm font-medium text-zinc-900 hover:underline dark:text-zinc-50"
                >
                  {c.name ?? ""}
                </Link>
              </div>
              <p className="truncate text-xs text-zinc-400">
                {c.artists.length > 0
                  ? c.artists.map((a, j) => (
                      <span key={j}>
                        {j > 0 ? ", " : ""}
                        {a.href ? (
                          <Link href={a.href} className="hover:text-zinc-600 hover:underline dark:hover:text-zinc-300">
                            {a.name}
                          </Link>
                        ) : (
                          a.name
                        )}
                      </span>
                    ))
                  : (c.artist ?? "")}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <Stars value={x.average} size={13} />
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{x.average.toFixed(1)}</span>
              <span className="text-xs text-zinc-400">({x.count})</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
