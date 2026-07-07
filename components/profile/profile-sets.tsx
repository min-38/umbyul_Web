import Link from "next/link";
import type { DjSetSummary } from "@/lib/api";
import { getT } from "@/lib/i18n-server";
import { MixCovers } from "@/components/sets/mix-covers";

// 프로필의 DJ 믹스 목록 (NON-133).
export async function ProfileSets({ sets, isSelf }: { sets: DjSetSummary[]; isSelf: boolean }) {
  const t = await getT();
  if (sets.length === 0 && !isSelf) return null;

  return (
    <section className="mt-10">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          {t("믹스")}
          <span className="text-zinc-500"> ({sets.length})</span>
        </h2>
        {isSelf && (
          <Link href="/mixes/new" className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
            {t("믹스 만들기")}
          </Link>
        )}
      </div>
      {sets.length === 0 ? (
        <p className="text-sm text-zinc-500">{t("아직 믹스가 없습니다.")}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {sets.map((s) => (
            <li key={s.id}>
              <Link
                href={`/mixes/${s.id}`}
                className="flex items-center gap-3 rounded-xl border border-zinc-200 p-3 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-zinc-900 dark:text-zinc-50">{s.title}</span>
                  {s.note && <span className="block truncate text-xs text-zinc-500">{s.note}</span>}
                </span>
                <MixCovers covers={s.covers} trackCount={s.trackCount} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
