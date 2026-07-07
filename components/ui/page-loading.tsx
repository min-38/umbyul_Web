import { Spinner } from "@/components/ui/spinner";
import { getT } from "@/lib/i18n-server";

// 라우트 세그먼트 로딩 표시(UX-2). Suspense 폴백으로 loading.tsx 에서 사용.
export async function PageLoading() {
  const t = await getT();
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 items-center justify-center px-4 py-24">
      <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400" role="status">
        <Spinner /> {t("불러오는 중…")}
      </div>
    </div>
  );
}
