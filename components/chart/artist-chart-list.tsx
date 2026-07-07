import Link from "next/link";
import { Stars } from "@/components/detail/stars";
import type { ArtistRankItem } from "@/lib/api";

// 아티스트 차트(NON-87) 순위 리스트. 순위·아티스트명(→아티스트 페이지)·평균별점+점수·평가 수. 커버 없음.
export function ArtistChartList({ items }: { items: ArtistRankItem[] }) {
  return (
    <ol className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
      {items.map((a, i) => (
        <li key={a.artistId} className="flex items-center gap-3 py-3">
          <span className="w-6 shrink-0 text-right text-sm font-semibold tabular-nums text-zinc-500">{i + 1}</span>
          <Link
            href={`/artist/${a.artistId}`}
            className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-900 hover:underline dark:text-zinc-50"
          >
            {a.artistName ?? ""}
          </Link>
          <div className="flex shrink-0 items-center gap-1.5">
            <Stars value={a.average} size={13} />
            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{a.average.toFixed(1)}</span>
            <span className="text-xs text-zinc-500">({a.count})</span>
          </div>
        </li>
      ))}
    </ol>
  );
}
