import Link from "next/link";
import { redirect } from "next/navigation";
import { getAnnouncements } from "@/lib/api";
import { getLocale, getT } from "@/lib/i18n-server";
import { dateLocale } from "@/lib/format";

const PAGE_SIZE = 10;

// 공지사항 목록(NON-158). 게시일 desc, 10개/페이지. 넘버링 + 조회 수 + 페이지네이션.
export default async function AnnouncementsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const locale = await getLocale();
  const t = await getT();
  const { items, total } = await getAnnouncements(locale, (page - 1) * PAGE_SIZE, PAGE_SIZE);
  // 범위 밖 페이지(?page=99)면 진짜 빈 목록과 혼동돼 복귀 UI가 사라짐 → 마지막 페이지로 리다이렉트(QA5-5).
  if (items.length === 0 && total > 0 && page > 1) redirect(`/announcements?page=${Math.max(1, Math.ceil(total / PAGE_SIZE))}`);
  // total이 없을 수도 있는 구버전 API에도 안전하게: 최소한 지금 화면에 보이는 만큼은 보장.
  const shownTotal = Math.max(total, (page - 1) * PAGE_SIZE + items.length);
  const totalPages = Math.max(1, Math.ceil(shownTotal / PAGE_SIZE));

  // 넘버링: 최신글이 가장 큰 번호(총 개수) → 아래로 감소.
  const numberAt = (i: number) => shownTotal - ((page - 1) * PAGE_SIZE + i);

  // 페이지 창(현재 ±2).
  const from = Math.max(1, page - 2);
  const to = Math.min(totalPages, from + 4);
  const pages = Array.from({ length: to - from + 1 }, (_, i) => from + i);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-50">{t("공지사항")}</h1>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">{t("등록된 공지가 없습니다.")}</p>
      ) : (
        <>
          <ul className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
            {items.map((a, i) => (
              <li key={a.id}>
                <Link
                  href={`/announcements/${a.id}`}
                  className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                >
                  <span className="w-8 shrink-0 text-right text-sm tabular-nums text-zinc-500">{numberAt(i)}</span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">{a.title}</span>
                  <span className="shrink-0 text-xs text-zinc-500">{t("조회 {count}", { count: (a.viewCount ?? 0).toLocaleString() })}</span>
                  {a.publishedAt && (
                    <span className="w-24 shrink-0 text-right text-xs text-zinc-500">
                      {new Date(a.publishedAt).toLocaleDateString(dateLocale(locale))}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <nav aria-label={t("페이지 이동")} className="mt-8 flex items-center justify-center gap-1 text-sm">
              {page > 1 && (
                <Link href={`/announcements?page=${page - 1}`} className="rounded-md px-3 py-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                  {t("이전")}
                </Link>
              )}
              {pages.map((p) => (
                <Link
                  key={p}
                  href={`/announcements?page=${p}`}
                  aria-current={p === page ? "page" : undefined}
                  className={`rounded-md px-3 py-1.5 tabular-nums ${
                    p === page
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black"
                      : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  }`}
                >
                  {p}
                </Link>
              ))}
              {page < totalPages && (
                <Link href={`/announcements?page=${page + 1}`} className="rounded-md px-3 py-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                  {t("다음")}
                </Link>
              )}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
