import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getAnnouncement } from "@/lib/api";
import { getLocale, getT } from "@/lib/i18n-server";
import { dateLocale } from "@/lib/format";

// 공지 상세(NON-158). 게시된 것만, en 폴백은 API 처리. 본문은 admin 작성 마크다운(raw HTML 미렌더 = 안전).
export default async function AnnouncementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const locale = await getLocale();
  const t = await getT();
  const a = await getAnnouncement(id, locale);
  if (!a) notFound();

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <Link href="/announcements" className="text-sm text-zinc-500 hover:underline">
        ← {t("공지사항")}
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-zinc-900 dark:text-zinc-50">{a.title}</h1>
      {a.publishedAt && (
        <p className="mt-1 text-xs text-zinc-500">
          {new Date(a.publishedAt).toLocaleDateString(dateLocale(locale), { dateStyle: "long" })}
        </p>
      )}
      <article className="mt-6">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: (p) => <h2 className="mt-8 text-xl font-bold text-zinc-900 dark:text-zinc-50" {...p} />,
            h2: (p) => <h3 className="mt-6 text-lg font-semibold text-zinc-900 dark:text-zinc-100" {...p} />,
            h3: (p) => <h4 className="mt-5 text-base font-semibold text-zinc-800 dark:text-zinc-200" {...p} />,
            p: (p) => <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300" {...p} />,
            ul: (p) => <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-300" {...p} />,
            ol: (p) => <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-300" {...p} />,
            a: (p) => <a className="text-indigo-600 hover:underline dark:text-indigo-400" {...p} />,
            strong: (p) => <strong className="font-semibold text-zinc-800 dark:text-zinc-100" {...p} />,
            hr: () => <hr className="my-6 border-zinc-200 dark:border-zinc-800" />,
            // 공지 이미지(NON-168) — 반응형. admin 업로드(R2 프록시) 마크다운 이미지.
            // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
            img: (p) => <img className="my-4 h-auto max-w-full rounded-lg" {...p} />,
          }}
        >
          {a.body}
        </ReactMarkdown>
      </article>
    </div>
  );
}
