import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getT } from "@/lib/i18n-server";

const FEATURES = [
  { icon: "spotify", title: "Spotify 카드", desc: "방대한 Spotify 카탈로그에서 원하는 음악을 검색하세요." },
  { icon: "star", title: "0.5점 단위 별점", desc: "곡·앨범을 세밀하게 평가하고 나만의 기록을 남기세요." },
  { icon: "review", title: "리뷰 & 댓글", desc: "리뷰를 쓰고 댓글로 이야기 나누세요.\n좋은 리뷰엔 좋아요를 눌러봐요." },
  { icon: "trend", title: "평점 추이", desc: "곡·앨범 평점이 시간에 따라 어떻게 움직이는지 그래프로 봐요." },
  { icon: "discover", title: "발견", desc: "TODAY'S PICK·신규·추천 등 새로운 음악을 발견해보세요." },
  { icon: "chart", title: "차트", desc: "가장 인기 있는 음악을 랭킹으로 확인하세요." },
  { icon: "follow", title: "취향 팔로우", desc: "취향이 맞는 유저를 팔로우하고 새 평가를 받아보세요." },
  { icon: "mix", title: "믹스", desc: "나만의 플레이리스트를 공유하고, 다른 사람의 믹스도 둘러보세요." }
] as const;

// 서비스 소개(About). 공개 — 로그인 게이트 없음. 우주 배경 몰입형(항상 다크).
export default async function AboutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const t = await getT();

  return (
    <div className="cosmic-bg flex flex-1 flex-col">
      <div className="cosmic-stars" aria-hidden="true" />

      {/* Hero */}
      <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-6 pt-24 pb-16 text-center sm:pt-32">
        <span className="glitter-text text-6xl font-bold tracking-tight sm:text-7xl">Glitter</span>
        {/* 브랜드 고정 카피(전 언어 동일) — 별↔반짝(Glitter) 말장난이라 번역하지 않음. 워드마크처럼 t() 미경유. */}
        <h1 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
          별을 남길수록 반짝이는 나의 기록
        </h1>
        <p className="max-w-xl text-balance text-lg text-zinc-300">
          리뷰를 남기고 다른 사람과 취향을 나누며, 새로운 음악을 발견하세요.
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/discover"
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500"
          >
            {t("둘러보기")}
          </Link>
          {!user && (
            <Link
              href="/login"
              className="rounded-lg border border-white/25 px-5 py-2.5 text-sm font-medium text-zinc-100 transition hover:bg-white/10"
            >
              {t("시작하기")}
            </Link>
          )}
        </div>
      </section>

      {/* What is Glitter */}
      <section className="mx-auto w-full max-w-2xl px-6 py-16 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-indigo-300/80">{t("서비스 소개")}</p>
        <h2 className="mt-3 text-balance text-2xl font-semibold text-white sm:text-3xl">
          {t("들은 음악을, 나만의 기록으로.")}
        </h2>
        <p className="mt-4 text-balance text-base leading-relaxed text-zinc-300">
          {t(
            "Glitter는 음악 감상을 기록하고 나누는 서비스입니다.",
          )}
        </p>
        <p className="text-balance text-base leading-relaxed text-zinc-300">
          {t(
            "수많은 음악 중에서 남긴 별점과 리뷰가 쌓여, 당신만의 음악 취향이 뚜렷해집니다."
          )}
        </p>
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-5xl px-6 py-16">
        <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-indigo-300/80">
          {t("무엇을 할 수 있나요")}
        </p>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm transition hover:border-white/20 hover:bg-white/[0.07]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-200">
                <FeatureIcon name={f.icon} />
              </span>
              <h3 className="font-semibold text-white">{t(f.title)}</h3>
              <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-300">{t(f.desc)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto flex w-full max-w-2xl flex-col items-center gap-5 px-6 pt-16 pb-28 text-center">
        <h2 className="text-balance text-2xl font-semibold text-white sm:text-3xl">{t("지금 여러분이 좋아하는 음악에 별점을 남겨보세요.")}</h2>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/discover"
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500"
          >
            {t("둘러보기")}
          </Link>
          {!user && (
            <Link
              href="/login"
              className="rounded-lg border border-white/25 px-5 py-2.5 text-sm font-medium text-zinc-100 transition hover:bg-white/10"
            >
              {t("시작하기")}
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}

function FeatureIcon({ name }: { name: string }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (name === "star")
    return (
      <svg {...common}>
        <path d="M12 3l2.7 5.5 6 .9-4.35 4.2 1 6L12 17.8 6.65 19.6l1-6L3.3 9.4l6-.9z" />
      </svg>
    );
  if (name === "review")
    return (
      <svg {...common}>
        <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    );
  if (name === "mix")
    return (
      <svg {...common}>
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    );
  if (name === "discover")
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M15.5 8.5l-2 5-5 2 2-5z" />
      </svg>
    );
  if (name === "trend")
    return (
      <svg {...common}>
        <path d="M3 16l5-5 4 4 8-8" />
        <path d="M17 7h4v4" />
      </svg>
    );
  if (name === "spotify") // 스포티파이 카탈로그 검색 — 원형 + 음파 라인
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M8 10.4c2.6-.8 5.6-.5 7.7.8" />
        <path d="M8.6 13.3c2-.6 4.4-.4 6.1.6" />
        <path d="M9.2 15.9c1.4-.4 3-.3 4.2.4" />
      </svg>
    );
  if (name === "chart") // 인기 랭킹 — 막대 그래프
    return (
      <svg {...common}>
        <path d="M3 20h18" />
        <path d="M6.5 20v-6" />
        <path d="M12 20V8" />
        <path d="M17.5 20v-9" />
      </svg>
    );
  return (
    <svg {...common}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M16 5.4a3.2 3.2 0 0 1 0 6.2" />
      <path d="M18.5 20a6.5 6.5 0 0 0-3-5.6" />
    </svg>
  );
}
