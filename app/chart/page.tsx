import { getT } from "@/lib/i18n-server";

// Chart(랭킹) — 스텁. 실제 내용은 NON-82에서.
export default async function ChartPage() {
  const t = await getT();
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-24 text-center">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Chart</h1>
      <p className="mt-3 text-sm text-zinc-500">{t("곧 제공됩니다.")}</p>
    </div>
  );
}
