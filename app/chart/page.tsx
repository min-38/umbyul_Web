import Link from "next/link";
import {
  getChart,
  type ChartType,
  type ChartSort,
  type ChartPeriod,
  type ChartGender,
  type ChartAge,
} from "@/lib/api";
import { getT } from "@/lib/i18n-server";
import { ChartList } from "@/components/chart/chart-list";

const TYPES: ChartType[] = ["all", "album", "track"];
const SORTS: ChartSort[] = ["most", "top"];
const PERIODS: ChartPeriod[] = ["day", "week", "month", "year"];
const GENDERS: ChartGender[] = ["all", "male", "female"];
const AGES: ChartAge[] = ["all", "10", "20", "30", "40", "50"];

// Chart(NON-82) — 랭킹 리더보드. 컨트롤은 링크(searchParams)로 SSR.
export default async function ChartPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; sort?: string; period?: string; gender?: string; age?: string }>;
}) {
  const sp = await searchParams;
  const type = TYPES.includes(sp.type as ChartType) ? (sp.type as ChartType) : "all";
  const sort = SORTS.includes(sp.sort as ChartSort) ? (sp.sort as ChartSort) : "top";
  const period = PERIODS.includes(sp.period as ChartPeriod) ? (sp.period as ChartPeriod) : "year";
  const gender = GENDERS.includes(sp.gender as ChartGender) ? (sp.gender as ChartGender) : "all";
  const age = AGES.includes(sp.age as ChartAge) ? (sp.age as ChartAge) : "all";

  const [items, t] = await Promise.all([getChart(type, sort, period, gender, age), getT()]);

  const typeLabel: Record<ChartType, string> = { all: t("전체"), album: t("앨범"), track: t("곡") };
  const sortLabel: Record<ChartSort, string> = { most: t("최다 리뷰"), top: t("최고 평가") };
  const periodLabel: Record<ChartPeriod, string> = { day: "D", week: "W", month: "M", year: "Y" };
  const genderLabel: Record<ChartGender, string> = { all: t("전체"), male: t("남성"), female: t("여성") };
  const ageLabel: Record<ChartAge, string> = {
    all: t("전체"), "10": t("10대"), "20": t("20대"), "30": t("30대"), "40": t("40대"), "50": t("50대+"),
  };

  const hrefFor = (o: Partial<Record<"type" | "sort" | "period" | "gender" | "age", string>>) =>
    `/chart?${new URLSearchParams({
      type: o.type ?? type,
      sort: o.sort ?? sort,
      period: o.period ?? period,
      gender: o.gender ?? gender,
      age: o.age ?? age,
    })}`;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-6 py-8">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Chart</h1>

      <div className="flex flex-col gap-2">
        <Row label={t("대상")}>
          <Seg options={TYPES.map((v) => ({ label: typeLabel[v], href: hrefFor({ type: v }), active: v === type }))} />
        </Row>
        <Row label={t("정렬")}>
          <Seg options={SORTS.map((v) => ({ label: sortLabel[v], href: hrefFor({ sort: v }), active: v === sort }))} />
        </Row>
        <Row label={t("성별")}>
          <Seg options={GENDERS.map((v) => ({ label: genderLabel[v], href: hrefFor({ gender: v }), active: v === gender }))} />
        </Row>
        <Row label={t("나이대")}>
          <Seg options={AGES.map((v) => ({ label: ageLabel[v], href: hrefFor({ age: v }), active: v === age }))} />
        </Row>
      </div>

      {/* 기간(D/W/M/Y): 차트 리스트 바로 위, 우측 정렬 */}
      <div className="flex justify-end border-b border-zinc-200 pb-2 dark:border-zinc-800">
        <Seg options={PERIODS.map((v) => ({ label: periodLabel[v], href: hrefFor({ period: v }), active: v === period }))} />
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 px-6 py-10 text-center text-sm text-zinc-500 dark:border-zinc-700">
          {t("아직 차트에 오른 항목이 없습니다.")}
        </p>
      ) : (
        <ChartList items={items} trackLabel={t("곡")} albumLabel={t("앨범")} />
      )}
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
