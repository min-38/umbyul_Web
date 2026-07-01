import { Spinner } from "@/components/ui/spinner";
import { getT } from "@/lib/i18n-server";

export default async function Loading() {
  const t = await getT();
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-4 py-24">
      <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        <Spinner /> {t("검색 중…")}
      </div>
    </div>
  );
}
