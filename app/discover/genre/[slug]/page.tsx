import Link from "next/link";
import { notFound } from "next/navigation";
import { getGenreDiscover } from "@/lib/api";
import { toCover } from "@/lib/discover-cover";
import { getT } from "@/lib/i18n-server";
import { CoverRow } from "@/components/discover/cover-row";

// 부모 장르 페이지(NON-84): 상단 롤업 추천 + 서브장르별 목록. 데이터는 크라우드 태깅(genre_tags) 기반.
export default async function GenrePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [data, t] = await Promise.all([getGenreDiscover(slug), getT()]);
  if (!data) notFound();

  const empty = t("아직 없습니다.");
  const topCovers = data.top.map(toCover);
  const hasContent = topCovers.length > 0 || data.subs.length > 0;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-12 px-6 py-8">
      <div className="flex flex-col gap-2">
        <Link href="/discover" className="inline-flex w-fit items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
          {t("발견으로")}
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{data.genre.name}</h1>
      </div>

      {!hasContent ? (
        <p className="rounded-xl border border-dashed border-zinc-300 px-6 py-16 text-center text-sm text-zinc-500 dark:border-zinc-700">
          {t("아직 이 장르의 리뷰가 없어요.")}
        </p>
      ) : (
        <>
          {topCovers.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">{t("추천")}</h2>
              <CoverRow items={topCovers} empty={empty} />
            </section>
          )}
          {data.subs.map((s) => (
            <section key={s.genre.id}>
              <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">{s.genre.name}</h2>
              <CoverRow items={s.items.map(toCover)} empty={empty} />
            </section>
          ))}
        </>
      )}
    </div>
  );
}
