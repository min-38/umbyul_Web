import Link from "next/link";
import { Stars } from "@/components/detail/stars";
import { formatRelativeTime } from "@/lib/format";
import type { FeedItem } from "@/lib/api";
import type { Locale } from "@/lib/i18n";

// 홈 피드(NON-88) 렌더. view=card 카드형 / compact 축약형.
export function FeedList({
  items,
  view,
  locale,
  trackLabel,
  albumLabel,
}: {
  items: FeedItem[];
  view: "card" | "compact";
  locale: Locale;
  trackLabel: string;
  albumLabel: string;
}) {
  if (view === "compact") {
    return (
      <ul className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
        {items.map((it) => (
          <li key={it.id} className="flex gap-3 py-3">
            <Link
              href={targetHref(it)}
              className="shrink-0"
              aria-label={it.name ?? (it.targetType === "track" ? trackLabel : albumLabel)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.imageUrl ?? "/placeholder.svg"} alt="" className="h-12 w-12 rounded bg-zinc-100 object-cover dark:bg-zinc-800" />
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span
                  className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${
                    it.targetType === "track"
                      ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                  }`}
                >
                  {it.targetType === "track" ? trackLabel : albumLabel}
                </span>
                <Link href={targetHref(it)} className="min-w-0 truncate text-sm font-medium text-zinc-900 hover:underline dark:text-zinc-50">
                  {it.name ?? ""}
                  {it.artist ? <span className="font-normal text-zinc-400"> · {it.artist}</span> : null}
                </Link>
                <span className="ml-auto flex shrink-0 items-center gap-1">
                  <Stars value={it.score} size={12} />
                  <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">{it.score.toFixed(1)}</span>
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                <Link href={`/u/${it.username}`} className="hover:underline">{it.username}</Link>
                {" · "}
                <span suppressHydrationWarning>{formatRelativeTime(it.createdAt, locale)}</span>
              </p>
              <p className="mt-0.5 line-clamp-2 whitespace-pre-wrap text-sm leading-snug text-zinc-600 dark:text-zinc-300">{it.body}</p>
              <div className="mt-1">
                <Likes likes={it.likes} dislikes={it.dislikes} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map((it) => (
        <article key={it.id} className="flex flex-col gap-3 rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
          {/* 헤더: 유저 + 시간 */}
          <div className="flex items-center gap-2">
            <Link href={`/u/${it.username}`} className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-zinc-200 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                {it.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  it.username.charAt(0).toUpperCase()
                )}
              </span>
              <span className="text-sm font-medium text-zinc-800 hover:underline dark:text-zinc-100">{it.username}</span>
            </Link>
            <span className="text-xs text-zinc-400">· <span suppressHydrationWarning>{formatRelativeTime(it.createdAt, locale)}</span></span>
          </div>

          {/* 대상: 커버 + 배지/이름/아티스트 + 별점 */}
          <div className="flex gap-3">
            <Link
              href={targetHref(it)}
              className="shrink-0"
              aria-label={it.name ?? (it.targetType === "track" ? trackLabel : albumLabel)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.imageUrl ?? "/placeholder.svg"} alt="" className="h-20 w-20 rounded-lg bg-zinc-100 object-cover dark:bg-zinc-800" />
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span
                  className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${
                    it.targetType === "track"
                      ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                  }`}
                >
                  {it.targetType === "track" ? trackLabel : albumLabel}
                </span>
                <Link href={targetHref(it)} className="truncate text-sm font-semibold text-zinc-900 hover:underline dark:text-zinc-50">
                  {it.name ?? ""}
                </Link>
              </div>
              <p className="mt-0.5 truncate text-xs text-zinc-400">
                <Artists item={it} />
              </p>
              <span className="mt-1 flex items-center gap-1.5">
                <Stars value={it.score} size={14} />
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{it.score.toFixed(1)}</span>
              </span>
            </div>
          </div>

          {/* 리뷰 본문 */}
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-200">{it.body}</p>

          {/* 반응 */}
          <Likes likes={it.likes} dislikes={it.dislikes} />
        </article>
      ))}
    </div>
  );
}

function targetHref(it: FeedItem) {
  return `/${it.targetType}/${it.targetSpotifyId}`;
}

// 아티스트: artists 있으면 개별 링크(", " 조인), 없으면 조인 이름 텍스트.
function Artists({ item }: { item: FeedItem }) {
  const artists = (item.artists ?? []).filter((a) => a.name);
  if (artists.length === 0) return <>{item.artist ?? ""}</>;
  return (
    <>
      {artists.map((a, i) => (
        <span key={i}>
          {i > 0 ? ", " : ""}
          <Link href={`/artist/${a.id}`} className="hover:text-zinc-600 hover:underline dark:hover:text-zinc-300">
            {a.name}
          </Link>
        </span>
      ))}
    </>
  );
}

function Likes({ likes, dislikes }: { likes: number; dislikes: number }) {
  return (
    <span className="flex items-center gap-3 text-xs text-zinc-400">
      <span className="flex items-center gap-1">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M7 10v12" />
          <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
        </svg>
        {likes}
      </span>
      {dislikes > 0 && (
        <span className="flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M17 14V2" />
            <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" />
          </svg>
          {dislikes}
        </span>
      )}
    </span>
  );
}
