import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/api";
import { getT } from "@/lib/i18n-server";
import { BrandMark } from "@/components/ui/brand-mark";

const FEATURES = [
  { title: "0.5점 단위 별점", desc: "곡·앨범을 세밀하게 평가하고 나만의 기록을 남기세요." },
  { title: "리뷰 & 반응", desc: "리뷰를 쓰고 좋아요로 좋은 리뷰를 띄우세요." },
  { title: "취향 팔로우", desc: "취향이 맞는 유저를 팔로우하고 새 평가를 받아보세요." },
];

export default async function Home() {
  // 로그인했지만 프로필(users row)이 없는 신규 유저는 온보딩으로.
  // Api 불가 시엔 게이트를 건너뛰고 홈을 렌더(페이지가 통째로 죽지 않게).
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    let profile = null;
    let reachable = true;
    try {
      profile = await getProfile();
    } catch {
      reachable = false;
    }
    if (reachable && !profile) redirect("/onboarding");
  }

  const t = await getT();

  return (
    <div className="flex flex-1 flex-col">
      <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-6 py-24 text-center sm:py-32">
        <BrandMark />
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
          {t("음악을 듣고, 평가하고, 기록하세요.")}
        </h1>
        <p className="max-w-lg text-lg text-zinc-600 dark:text-zinc-400">
          {t(
            "좋아하는 앨범과 곡을 0.5점 단위로 평가하고, 리뷰를 남기고, 취향이 맞는 사람을 팔로우하세요.",
          )}
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/search"
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500"
          >
            {t("둘러보기")}
          </Link>
          {!user && (
            <Link
              href="/signup"
              className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
            >
              {t("시작하기")}
            </Link>
          )}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-4xl gap-4 px-6 pb-24 sm:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
            <h3 className="mb-1 font-semibold text-zinc-900 dark:text-zinc-50">{t(f.title)}</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{t(f.desc)}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
