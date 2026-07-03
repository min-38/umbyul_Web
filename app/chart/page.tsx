import Link from "next/link";
import {
  getChart,
  getUserChart,
  getArtistChart,
  type ChartSort,
  type ChartPeriod,
  type ChartGender,
  type ChartAge,
  type ChartUserSort,
} from "@/lib/api";
import { getT } from "@/lib/i18n-server";
import { ChartList } from "@/components/chart/chart-list";
import { UserChartList } from "@/components/chart/user-chart-list";
import { ArtistChartList } from "@/components/chart/artist-chart-list";

// 음악 대상(User 는 우측 컬럼 고정 → 토글에서 제외). Artist 는 별도 리스트.
type MusicType = "all" | "track" | "album" | "artist";
const TYPES: MusicType[] = ["all", "track", "album", "artist"];
const SORTS: ChartSort[] = ["most", "top"];
const USER_SORTS: ChartUserSort[] = ["reviews", "likes", "followers"];
const PERIODS: ChartPeriod[] = ["day", "week", "month", "year"];
const GENDERS: ChartGender[] = ["all", "male", "female"];
const AGES: ChartAge[] = ["all", "10", "20", "30", "40", "50"];

// 대상 토글 색상(피드/차트 배지와 통일) — 활성 진한 톤 / 비활성 연한 톤.
const TYPE_STYLE: Record<MusicType, { on: string; off: string }> = {
  all: {
    on: "bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900",
    off: "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700",
  },
  track: {
    on: "bg-indigo-600 text-white",
    off: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 dark:hover:bg-indigo-900",
  },
  album: {
    on: "bg-emerald-600 text-white",
    off: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900",
  },
  artist: {
    on: "bg-amber-500 text-white",
    off: "bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300 dark:hover:bg-amber-900",
  },
};

// Chart(NON-82/86/87/117) — 좌:음악 / 우:유저 2단(모바일 스택). 컨트롤은 링크(searchParams)로 SSR. 기간 공유.
export default async function ChartPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; sort?: string; usort?: string; period?: string; gender?: string; age?: string }>;
}) {
  const sp = await searchParams;
  const type = TYPES.includes(sp.type as MusicType) ? (sp.type as MusicType) : "all";
  const isArtist = type === "artist";
  const musicSort = SORTS.includes(sp.sort as ChartSort) ? (sp.sort as ChartSort) : "most";
  const userSort = USER_SORTS.includes(sp.usort as ChartUserSort) ? (sp.usort as ChartUserSort) : "reviews";
  const period = PERIODS.includes(sp.period as ChartPeriod) ? (sp.period as ChartPeriod) : "week"; // 기본 주별
  const gender = GENDERS.includes(sp.gender as ChartGender) ? (sp.gender as ChartGender) : "all";
  const age = AGES.includes(sp.age as ChartAge) ? (sp.age as ChartAge) : "all";

  const t = await getT();
  // 두 컬럼(음악·유저) 동시 조회.
  const [items, artists, users] = await Promise.all([
    isArtist ? Promise.resolve([]) : getChart(type, musicSort, period, gender, age),
    isArtist ? getArtistChart(musicSort, period, gender, age) : Promise.resolve([]),
    getUserChart(userSort, period),
  ]);

  const typeLabel: Record<MusicType, string> = {
    all: t("전체"), track: t("곡"), album: t("앨범"), artist: t("아티스트"),
  };
  const sortLabel: Record<ChartSort, string> = { most: t("최다 리뷰"), top: t("최고 평가") };
  const userSortLabel: Record<ChartUserSort, string> = { reviews: t("리뷰"), likes: t("좋아요"), followers: t("팔로워") };
  const periodLabel: Record<ChartPeriod, string> = { day: "D", week: "W", month: "M", year: "Y" };
  const genderLabel: Record<ChartGender, string> = { all: t("전체"), male: t("남성"), female: t("여성") };
  const ageLabel: Record<ChartAge, string> = {
    all: t("전체"), "10": t("10대"), "20": t("20대"), "30": t("30대"), "40": t("40대"), "50": t("50대+"),
  };

  const hrefFor = (o: Partial<Record<"type" | "sort" | "usort" | "period" | "gender" | "age", string>>) =>
    `/chart?${new URLSearchParams({
      type: o.type ?? type,
      sort: o.sort ?? musicSort,
      usort: o.usort ?? userSort,
      period: o.period ?? period,
      gender: o.gender ?? gender,
      age: o.age ?? age,
    })}`;

  const empty = (
    <p className="rounded-xl border border-dashed border-zinc-300 px-6 py-10 text-center text-sm text-zinc-500 dark:border-zinc-700">
      {t("아직 차트에 오른 항목이 없습니다.")}
    </p>
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-6 py-8">
      {/* 헤더 + 공유 기간(D/W/M/Y) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Chart</h1>
        <Seg options={PERIODS.map((v) => ({ label: periodLabel[v], href: hrefFor({ period: v }), active: v === period }))} />
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* ── 좌: 음악 ── */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Row label={t("대상")}>
              <div className="flex flex-wrap gap-1">
                {TYPES.map((v) => (
                  <Link
                    key={v}
                    href={hrefFor({ type: v })}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                      v === type ? TYPE_STYLE[v].on : TYPE_STYLE[v].off
                    }`}
                  >
                    {typeLabel[v]}
                  </Link>
                ))}
              </div>
            </Row>
            <Row label={t("정렬")}>
              <Seg options={SORTS.map((v) => ({ label: sortLabel[v], href: hrefFor({ sort: v }), active: v === musicSort }))} />
            </Row>
            <Row label={t("성별")}>
              <Seg options={GENDERS.map((v) => ({ label: genderLabel[v], href: hrefFor({ gender: v }), active: v === gender }))} />
            </Row>
            <Row label={t("나이대")}>
              <Seg options={AGES.map((v) => ({ label: ageLabel[v], href: hrefFor({ age: v }), active: v === age }))} />
            </Row>
          </div>
          <div className="border-b border-zinc-200 dark:border-zinc-800" />
          {isArtist
            ? artists.length === 0
              ? empty
              : <ArtistChartList items={artists} />
            : items.length === 0
              ? empty
              : <ChartList items={items} trackLabel={t("곡")} albumLabel={t("앨범")} />}
        </section>

        {/* ── 우: 유저 ── */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Row label={t("대상")}>
              <span className="rounded-lg bg-rose-500 px-3 py-1.5 text-sm font-medium text-white">{t("유저")}</span>
            </Row>
            <Row label={t("정렬")}>
              <Seg options={USER_SORTS.map((v) => ({ label: userSortLabel[v], href: hrefFor({ usort: v }), active: v === userSort }))} />
            </Row>
          </div>
          <div className="border-b border-zinc-200 dark:border-zinc-800" />
          {users.length === 0 ? empty : <UserChartList items={users} metricLabel={userSortLabel[userSort]} />}
        </section>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-14 shrink-0 text-xs text-zinc-500">{label}</span>
      {children}
    </div>
  );
}

function Seg({ options }: { options: { label: string; href: string; active: boolean }[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((o) => (
        <Link
          key={o.label}
          href={o.href}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
            o.active
              ? "bg-indigo-600 text-white"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          }`}
        >
          {o.label}
        </Link>
      ))}
    </div>
  );
}
