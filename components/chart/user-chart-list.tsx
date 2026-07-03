import Link from "next/link";
import type { UserRankItem } from "@/lib/api";

// 유저 차트(NON-86) 순위 리스트. 순위·아바타·username(→프로필)·수치(축 라벨).
export function UserChartList({ items, metricLabel }: { items: UserRankItem[]; metricLabel: string }) {
  return (
    <ol className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
      {items.map((u, i) => (
        <li key={u.userId} className="flex items-center gap-3 py-3">
          <span className="w-6 shrink-0 text-right text-sm font-semibold tabular-nums text-zinc-400">{i + 1}</span>
          <Link href={`/u/${u.username}`} className="shrink-0">
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-zinc-200 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              {u.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={u.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                u.username.charAt(0).toUpperCase()
              )}
            </span>
          </Link>
          <Link
            href={`/u/${u.username}`}
            className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-900 hover:underline dark:text-zinc-50"
          >
            {u.username}
          </Link>
          <span className="shrink-0 text-sm text-zinc-500">
            <span className="font-semibold text-zinc-700 dark:text-zinc-200">{u.count}</span> {metricLabel}
          </span>
        </li>
      ))}
    </ol>
  );
}
