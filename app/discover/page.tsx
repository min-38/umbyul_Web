import { getDiscover, type HomeReview } from "@/lib/api";
import { getT } from "@/lib/i18n-server";
import { RisingSection } from "@/components/discover/rising-section";
import { CoverRow, type CoverItem } from "@/components/discover/cover-row";

// 리뷰 목록 → 대상 커버(중복 제거, 최대 15). 후기는 상세로 들어가서 확인.
function toCovers(reviews: HomeReview[]): CoverItem[] {
  const seen = new Set<string>();
  const out: CoverItem[] = [];
  for (const rv of reviews) {
    const href = `/${rv.targetType}/${rv.targetSpotifyId}`;
    if (seen.has(href)) continue;
    seen.add(href);
    out.push({ key: href, href, imageUrl: rv.imageUrl, name: rv.name, artist: rv.artist });
    if (out.length >= 15) break;
  }
  return out;
}

// Discover(NON-81) — 앨범 커버 가로 스크롤 섹션: Rising · New · Recent.
// Recommend(NON-83)·Genre(NON-84)는 데이터·설계 확보 후.
export default async function DiscoverPage() {
  const [{ rising, newReviews, myRecent }, t] = await Promise.all([getDiscover(), getT()]);
  const newCovers = toCovers(newReviews);
  const myCovers = toCovers(myRecent);
  const empty = t("아직 없습니다.");

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-12 px-6 py-8">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Discover</h1>

      <RisingSection rising={rising} />

      <section>
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">{t("신규")}</h2>
        <CoverRow items={newCovers} empty={empty} />
      </section>

      {myCovers.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">{t("최근")}</h2>
          <CoverRow items={myCovers} empty={empty} />
        </section>
      )}
    </div>
  );
}
