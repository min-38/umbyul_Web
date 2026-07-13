import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getAnnouncement } from "@/lib/api";
import { getLocale, getT } from "@/lib/i18n-server";
import { dateLocale } from "@/lib/format";
import { AnnouncementViewPing } from "@/components/announcements/view-ping";

// generateMetadata 와 페이지가 같은 요청에서 한 번만 fetch 하도록 dedupe(album 패턴).
const getCachedAnnouncement = cache(getAnnouncement);

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const locale = await getLocale();
  const a = await getCachedAnnouncement(id, locale);
  if (!a) return {};
  const title = `${a.title} | UmByul`;
  return { title, openGraph: { title } };
}

// 공지 상세(NON-158). 게시된 것만, en 폴백은 API 처리. 본문은 admin 작성 마크다운(raw HTML 미렌더 = 안전).
export default async function AnnouncementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const locale = await getLocale();
  const t = await getT();
  const a = await getCachedAnnouncement(id, locale);
  if (!a) notFound();

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      {/* 조회수 집계 — 브라우저에서 /view 핑(부수효과 전용, 렌더 없음). */}
      <AnnouncementViewPing id={a.id} />
      <Link href="/announcements" className="inline-flex w-fit items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
        {t("공지사항")}
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-zinc-900 dark:text-zinc-50">{a.title}</h1>
      <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-zinc-500">
        <span>{t("운영자")}</span>
        {a.publishedAt && (
          <>
            <span aria-hidden="true">·</span>
            <span>{new Date(a.publishedAt).toLocaleDateString(dateLocale(locale), { dateStyle: "long" })}</span>
          </>
        )}
        <span aria-hidden="true">·</span>
        <span>{t("조회 {count}", { count: (a.viewCount ?? 0).toLocaleString() })}</span>
      </p>
      <article className="mt-6 break-words">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: (p) => <h2 className="mt-8 text-xl font-bold text-zinc-900 dark:text-zinc-50" {...p} />,
            h2: (p) => <h3 className="mt-6 text-lg font-semibold text-zinc-900 dark:text-zinc-100" {...p} />,
            h3: (p) => <h4 className="mt-5 text-base font-semibold text-zinc-800 dark:text-zinc-200" {...p} />,
            p: (p) => <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300" {...p} />,
            ul: (p) => <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-300" {...p} />,
            ol: (p) => <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-300" {...p} />,
            a: (p) => <a className="break-words text-indigo-600 hover:underline dark:text-indigo-400" {...p} />,
            strong: (p) => <strong className="font-semibold text-zinc-800 dark:text-zinc-100" {...p} />,
            // 긴 무공백 토큰(코드·GFM 테이블)이 375px 가로 오버플로 내지 않게(QA11-3).
            pre: (p) => <pre className="mt-3 overflow-x-auto rounded-lg bg-zinc-100 p-3 text-xs dark:bg-zinc-900" {...p} />,
            code: (p) => <code className="break-words rounded bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-800" {...p} />,
            table: (p) => (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm" {...p} />
              </div>
            ),
            hr: () => <hr className="my-6 border-zinc-200 dark:border-zinc-800" />,
            // 공지 이미지(NON-168) — 반응형. admin 업로드(R2 프록시) 마크다운 이미지.
            // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
            img: (p) => <img loading="lazy" className="my-4 h-auto max-w-full rounded-lg" {...p} />,
          }}
        >
          {a.body}
        </ReactMarkdown>
      </article>
    </div>
  );
}
