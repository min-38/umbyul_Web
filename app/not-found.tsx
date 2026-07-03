import Link from "next/link";
import { getT } from "@/lib/i18n-server";

export default async function NotFound() {
  const t = await getT();
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <span className="glitter-text text-5xl font-bold tracking-tight">404</span>
      <p className="text-zinc-600 dark:text-zinc-400">{t("페이지를 찾을 수 없습니다.")}</p>
      <Link
        href="/"
        className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500"
      >
        {t("홈으로")}
      </Link>
    </div>
  );
}
