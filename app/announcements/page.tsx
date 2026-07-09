import Link from "next/link";
import { getAnnouncements } from "@/lib/api";
import { getLocale, getT } from "@/lib/i18n-server";
import { dateLocale } from "@/lib/format";

// 공지사항 목록(NON-158). 게시된 것만. 본문 언어는 UI 로케일(en 폴백은 API 처리).
export default async function AnnouncementsPage() {
  const locale = await getLocale();
  const t = await getT();
  const items = await getAnnouncements(locale);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-50">{t("공지사항")}</h1>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">{t("등록된 공지가 없습니다.")}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
          {items.map((a) => (
            <li key={a.id}>
              <Link
                href={`/announcements/${a.id}`}
                className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
              >
                <span className="min-w-0 truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">{a.title}</span>
                {a.publishedAt && (
                  <span className="shrink-0 text-xs text-zinc-500">
                    {new Date(a.publishedAt).toLocaleDateString(dateLocale(locale))}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
