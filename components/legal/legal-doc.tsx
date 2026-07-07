import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getLegalDoc } from "@/lib/api";
import { getLocale, getT } from "@/lib/i18n-server";
import { LegalLangSelect } from "@/components/legal/legal-lang-select";
import { dateLocale } from "@/lib/format";

const DOC_LOCALES = ["ko", "en", "ja", "es"];

// 공개 약관/개인정보 문서 렌더(NON-66). 게시본을 마크다운으로, en 폴백은 서버(API)가 처리.
// react-markdown 은 raw HTML 을 렌더하지 않아 안전(admin 작성 마크다운만).
// 글 자체 언어는 ?lang= 로 선택(UI 로케일과 별개, BUG-5).
export async function LegalDoc({ type, langParam }: { type: "terms" | "privacy"; langParam?: string }) {
  const uiLocale = await getLocale();
  const locale = langParam && DOC_LOCALES.includes(langParam) ? langParam : uiLocale;
  const t = await getT();
  const doc = await getLegalDoc(type, locale);
  const title = type === "terms" ? t("이용약관") : t("개인정보 처리방침");

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{title}</h1>
        <LegalLangSelect current={locale} />
      </div>
      {doc ? (
        <>
          <p className="mt-1 text-xs text-zinc-400">
            {doc.version ? <span className="font-mono">{doc.version}</span> : null}
            {doc.version ? " · " : ""}
            {t("시행일")}: {new Date(doc.effectiveDate ?? doc.updatedAt).toLocaleDateString(dateLocale(locale), { dateStyle: "long" })}
          </p>
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
              }}
            >
              {doc.content}
            </ReactMarkdown>
          </article>
        </>
      ) : (
        <p className="mt-4 text-sm text-zinc-500">{t("문서를 준비 중입니다.")}</p>
      )}
    </div>
  );
}
