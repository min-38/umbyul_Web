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

// 대상 토글 활성 색(비활성은 전부 회색 — INACTIVE). Track=인디고/Album=에메랄드/Artist=앰버/All=중립.
const TYPE_ON: Record<MusicType, string> = {
  all: "bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900",
  track: "bg-indigo-600 text-white",
  album: "bg-emerald-600 text-white",
  artist: "bg-amber-500 text-white",
};
const INACTIVE = "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700";

const PAGE = 50; // 더 보기 증가 단위(서버 기본·최대 50~200과 정합)
// 표시 개수 파싱: 50 단위, 최대 200(서버 clamp와 동일). 잘못된 값은 기본 50.
function toLimit(v?: string): number {
  const n = Number(v);
  return Number.isFinite(n) && n >= PAGE ? Math.min(n, 200) : PAGE;
}

// Chart(NON-82/86/87/117) — 좌:음악 / 우:유저 2단(모바일 스택). 기간(D/W/M/Y)은 컬럼별 독립.
export default async function ChartPage({
  searchParams,
}: {
  searchParams: Promise<{
    type?: string; sort?: string; usort?: string; period?: string; uperiod?: string;
    gender?: string; age?: string; mlimit?: string; ulimit?: string;
  }>;
}) {
  const sp = await searchParams;
  const type = TYPES.includes(sp.type as MusicType) ? (sp.type as MusicType) : "all";
  const isArtist = type === "artist";
  const musicSort = SORTS.includes(sp.sort as ChartSort) ? (sp.sort as ChartSort) : "most";
  const userSort = USER_SORTS.includes(sp.usort as ChartUserSort) ? (sp.usort as ChartUserSort) : "reviews";
  const period = PERIODS.includes(sp.period as ChartPeriod) ? (sp.period as ChartPeriod) : "week"; // 음악 기간
  const uperiod = PERIODS.includes(sp.uperiod as ChartPeriod) ? (sp.uperiod as ChartPeriod) : "week"; // 유저 기간
  const gender = GENDERS.includes(sp.gender as ChartGender) ? (sp.gender as ChartGender) : "all";
  const age = AGES.includes(sp.age as ChartAge) ? (sp.age as ChartAge) : "all";
  const mlimit = toLimit(sp.mlimit); // 음악 표시 개수(더 보기로 증가)
  const ulimit = toLimit(sp.ulimit); // 유저 표시 개수

  const t = await getT();
  // 두 컬럼(음악·유저) 동시 조회 — 각자 기간·개수 사용.
  const [items, artists, users] = await Promise.all([
    isArtist ? Promise.resolve([]) : getChart(type, musicSort, period, gender, age, mlimit),
    isArtist ? getArtistChart(musicSort, period, gender, age, mlimit) : Promise.resolve([]),
    getUserChart(userSort, uperiod, ulimit),
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

  const hrefFor = (o: Partial<Record<"type" | "sort" | "usort" | "period" | "uperiod" | "gender" | "age", string>>) =>
    `/chart?${new URLSearchParams({
      type: o.type ?? type,
      sort: o.sort ?? musicSort,
      usort: o.usort ?? userSort,
      period: o.period ?? period,
      uperiod: o.uperiod ?? uperiod,
      gender: o.gender ?? gender,
      age: o.age ?? age,
    })}`;

  // 더 보기: 현재 필터를 유지하며 해당 컬럼의 표시 개수만 +PAGE. 필터 변경 시엔 기본값으로 리셋(hrefFor가 limit 미포함).
  const moreHref = (which: "mlimit" | "ulimit", next: number) =>
    `/chart?${new URLSearchParams({
      type, sort: musicSort, usort: userSort, period, uperiod, gender, age,
      mlimit: String(which === "mlimit" ? next : mlimit),
      ulimit: String(which === "ulimit" ? next : ulimit),
    })}`;

  const moreLink = (href: string) => (
    <div className="mt-3 text-center">
      <Link href={href} scroll={false} className="inline-block rounded-full border border-zinc-300 px-5 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
        {t("더 보기")}
      </Link>
    </div>
  );

  const empty = (
    <p className="rounded-xl border border-dashed border-zinc-300 px-6 py-10 text-center text-sm text-zinc-500 dark:border-zinc-700">
      {t("아직 차트에 오른 항목이 없습니다.")}
    </p>
  );

  const periodSeg = (current: ChartPeriod, key: "period" | "uperiod") => (
    <div className="flex justify-end">
      <Seg options={PERIODS.map((v) => ({ label: periodLabel[v], href: hrefFor({ [key]: v }), active: v === current }))} />
    </div>
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-6 py-8">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{t("차트")}</h1>

      <div className="grid gap-8 md:grid-cols-2">
        {/* ── 좌: 음악 차트 ── */}
        <section className="flex flex-col gap-4">
          <ColumnHeader accent="text-indigo-500" title={t("음악 차트")} subtitle={t("곡·앨범·아티스트 랭킹")} icon={<MusicIcon />} />
          <div className="flex flex-col gap-2">
            <Row label={t("대상")}>
              <div className="flex flex-wrap gap-1">
                {TYPES.map((v) => (
                  <Link
                    key={v}
                    href={hrefFor({ type: v })}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${v === type ? TYPE_ON[v] : INACTIVE}`}
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
          <div className="border-b border-zinc-200 pb-2 dark:border-zinc-800">{periodSeg(period, "period")}</div>
          {isArtist ? (
            artists.length === 0 ? empty : (
              <>
                <ArtistChartList items={artists} />
                {artists.length >= mlimit && moreLink(moreHref("mlimit", mlimit + PAGE))}
              </>
            )
          ) : items.length === 0 ? empty : (
            <>
              <ChartList items={items} trackLabel={t("곡")} albumLabel={t("앨범")} />
              {items.length >= mlimit && moreLink(moreHref("mlimit", mlimit + PAGE))}
            </>
          )}
        </section>

        {/* ── 우: 유저 차트 ── */}
        <section className="flex flex-col gap-4">
          <ColumnHeader accent="text-rose-500" title={t("유저 차트")} subtitle={t("리뷰어 랭킹")} icon={<UserIcon />} />
          <div className="flex flex-col gap-2">
            <Row label={t("정렬")}>
              <Seg options={USER_SORTS.map((v) => ({ label: userSortLabel[v], href: hrefFor({ usort: v }), active: v === userSort }))} />
            </Row>
          </div>
          <div className="border-b border-zinc-200 pb-2 dark:border-zinc-800">{periodSeg(uperiod, "uperiod")}</div>
          {users.length === 0 ? empty : (
            <>
              <UserChartList items={users} metricLabel={userSortLabel[userSort]} />
              {users.length >= ulimit && moreLink(moreHref("ulimit", ulimit + PAGE))}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function ColumnHeader({
  title, subtitle, icon, accent,
}: {
  title: string; subtitle: string; icon: React.ReactNode; accent: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 ${accent}`}>
        {icon}
      </span>
      <div className="flex flex-col">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{title}</h2>
        <span className="text-xs text-zinc-400">{subtitle}</span>
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
            o.active ? "bg-indigo-600 text-white" : INACTIVE
          }`}
        >
          {o.label}
        </Link>
      ))}
    </div>
  );
}

function MusicIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
