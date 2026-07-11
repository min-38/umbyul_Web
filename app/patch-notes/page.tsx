import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getPatchNotes, type PatchNoteItem } from "@/lib/api";
import { getLocale, getT } from "@/lib/i18n-server";
import { dateLocale } from "@/lib/format";

// 패치노트 본문(admin 작성 마크다운, ### 기능/### UI 등 소제목). raw HTML 미렌더 = 안전.
const MD: Components = {
  h1: (p) => <h4 className="mt-4 text-sm font-bold text-zinc-900 dark:text-zinc-50" {...p} />,
  h2: (p) => <h4 className="mt-4 text-sm font-bold text-zinc-900 dark:text-zinc-50" {...p} />,
  h3: (p) => <h4 className="mt-3 text-xs font-semibold uppercase tracking-wide text-zinc-500" {...p} />,
  p: (p) => <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300" {...p} />,
  ul: (p) => <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-300" {...p} />,
  ol: (p) => <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-300" {...p} />,
  a: (p) => <a className="break-words text-indigo-600 hover:underline dark:text-indigo-400" {...p} />,
  strong: (p) => <strong className="font-semibold text-zinc-800 dark:text-zinc-100" {...p} />,
  // 긴 무공백 토큰(코드·GFM 테이블) 가로 오버플로 방지(QA11-3).
  pre: (p) => <pre className="mt-2 overflow-x-auto rounded-lg bg-zinc-100 p-3 text-xs dark:bg-zinc-900" {...p} />,
  code: (p) => <code className="break-words rounded bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-800" {...p} />,
  table: (p) => (
    <div className="mt-2 overflow-x-auto">
      <table className="w-full text-sm" {...p} />
    </div>
  ),
  hr: () => <hr className="my-4 border-zinc-200 dark:border-zinc-800" />,
};

// 패치노트(NON-159). 단일 체인지로그 — 작업 중 섹션 + 버전별 릴리스(최신순).
export default async function PatchNotesPage() {
  const locale = await getLocale();
  const t = await getT();
  const items = await getPatchNotes(locale);
  const inProgress = items.filter((x) => x.status === "in_progress");
  const released = items.filter((x) => x.status === "released");

  const Note = (note: PatchNoteItem) => (
    <article key={note.id} className="border-l-2 border-zinc-200 pl-4 dark:border-zinc-800">
      <div className="flex flex-wrap items-baseline gap-2">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{note.version || t("작업 중")}</h3>
        {note.status === "in_progress" ? (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">
            {t("작업 중")}
          </span>
        ) : (
          note.releasedAt && (
            <span className="text-xs text-zinc-500">{new Date(note.releasedAt).toLocaleDateString(dateLocale(locale))}</span>
          )
        )}
      </div>
      <div className="mt-1">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD}>
          {note.body}
        </ReactMarkdown>
      </div>
    </article>
  );

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <h1 className="mb-8 text-2xl font-bold text-zinc-900 dark:text-zinc-50">{t("패치노트")}</h1>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">{t("등록된 패치노트가 없습니다.")}</p>
      ) : (
        <div className="flex flex-col gap-10">
          {inProgress.length > 0 && (
            <section className="flex flex-col gap-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">{t("작업 중")}</h2>
              {inProgress.map(Note)}
            </section>
          )}
          {released.length > 0 && (
            <section className="flex flex-col gap-8">
              <h2 className="sr-only">{t("릴리스")}</h2>
              {released.map(Note)}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
