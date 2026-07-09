import { getDiscover, getGenres } from "@/lib/api";
import { toCover } from "@/lib/discover-cover";
import { getT } from "@/lib/i18n-server";
import { RisingSection } from "@/components/discover/rising-section";
import { CoverRow } from "@/components/discover/cover-row";
import { DailyPickCard } from "@/components/discover/daily-pick";
import { GenreSection } from "@/components/discover/genre-section";

// Discover(NON-81/85) — 앨범 커버 가로 스크롤 섹션: Recommend · Rising · New · Recent.
// Recommend(NON-155): 취향 장르 기반 콘텐츠 추천, 신호 없으면 전체 인기. Genre(NON-84)는 데이터·설계 확보 후.
export default async function DiscoverPage() {
  const [{ rising, new: newItems, myRecent, recommend, dailyPick }, genres, t] = await Promise.all([getDiscover(), getGenres(), getT()]);
  const newCovers = newItems.map(toCover);
  const myCovers = myRecent.map(toCover);
  const recommendCovers = recommend.map(toCover);
  const empty = t("아직 없습니다.");

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-12 px-6 py-8">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{t("발견")}</h1>

      {dailyPick && (
        <DailyPickCard
          pick={dailyPick}
          labels={{
            review: t("리뷰하기"),
            spotify: t("Spotify에서 듣기"),
            youtube: t("YouTube에서 보기"),
            musicbrainz: t("MusicBrainz에서 보기"),
          }}
        />
      )}

      {recommendCovers.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">{t("추천")}</h2>
          <CoverRow items={recommendCovers} empty={empty} />
        </section>
      )}

      <RisingSection rising={rising} />

      <section>
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">{t("신규")}</h2>
        <CoverRow items={newCovers} empty={empty} />
      </section>

      {myCovers.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">{t("내 최근 리뷰")}</h2>
          <CoverRow items={myCovers} empty={empty} />
        </section>
      )}

      {/* Genre는 맨 아래(NON-84) */}
      <GenreSection genres={genres} label={t("장르")} />
    </div>
  );
}
