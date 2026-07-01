import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getT } from "@/lib/i18n-server";

const FEATURES = [
  { title: "0.5점 단위 별점", desc: "곡·앨범을 세밀하게 평가하고 나만의 기록을 남기세요." },
  { title: "리뷰 & 반응", desc: "리뷰를 쓰고 좋아요로 좋은 리뷰를 띄우세요." },
  { title: "취향 팔로우", desc: "취향이 맞는 유저를 팔로우하고 새 평가를 받아보세요." },
];

// 서비스 소개(About). 공개 — 로그인 게이트 없음.
export default async function AboutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const t = await getT();

  return (
    <div className="flex flex-1 flex-col">
      <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-6 py-24 text-center sm:py-32">
        <span className="glitter-text text-5xl font-bold tracking-tight sm:text-6xl">Glitter</span>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
          {t("음악을 듣고, 평가하고, 기록하세요.")}
        </h1>
        <p className="max-w-lg text-lg text-zinc-600 dark:text-zinc-400">
          {t("좋아하는 앨범과 곡을 0.5점 단위로 평가하고, 리뷰를 남기고, 취향이 맞는 사람을 팔로우하세요.")}
        </p>
        <p className="max-w-lg text-sm text-zinc-500">
          {t("별점을 매길수록 별이 쌓여 반짝입니다 — 그래서 Glitter.")}
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
