"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ConsentDoc } from "@/lib/api";
import { submitConsent } from "@/app/actions/consent";
import { signOut } from "@/app/auth/actions";
import { dateLocale } from "@/lib/format";
import { useT } from "@/components/i18n-provider";

const MD_COMPONENTS = {
  h1: (p: object) => <h2 className="mt-6 text-lg font-bold text-zinc-900 dark:text-zinc-50" {...p} />,
  h2: (p: object) => <h3 className="mt-5 text-base font-semibold text-zinc-900 dark:text-zinc-100" {...p} />,
  h3: (p: object) => <h4 className="mt-4 text-sm font-semibold text-zinc-800 dark:text-zinc-200" {...p} />,
  p: (p: object) => <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300" {...p} />,
  ul: (p: object) => <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-300" {...p} />,
  ol: (p: object) => <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-300" {...p} />,
  a: (p: object) => <a className="text-indigo-600 hover:underline dark:text-indigo-400" {...p} />,
  strong: (p: object) => <strong className="font-semibold text-zinc-800 dark:text-zinc-100" {...p} />,
  hr: () => <hr className="my-4 border-zinc-200 dark:border-zinc-800" />,
};

// 재동의 게이트(LEG-2/5, NON-148). 약관/방침이 새로 게시되면 로그인 유저에게 노출 —
// 본문 인라인(외부 링크는 게이트에 다시 걸려 트랩됨) + 항목별 동의 후 계속.
export function ReconsentGate({ docs }: { docs: ConsentDoc[] }) {
  const t = useT();
  const router = useRouter();
  const [agreed, setAgreed] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  const title = (type: string) => (type === "terms" ? t("이용약관") : t("개인정보 처리방침"));
  const allAgreed = docs.every((d) => agreed[d.type]);

  const onSubmit = async () => {
    if (!allAgreed) return;
    setBusy(true);
    setError(false);
    const r = await submitConsent(docs.map((d) => d.type));
    if (r.ok) {
      router.refresh();
    } else {
      setBusy(false);
      setError(true);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-5 py-10">
      <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{t("약관이 업데이트되었습니다")}</h1>
      <p className="mt-1 text-sm text-zinc-500">{t("계속하려면 변경된 내용을 확인하고 동의해주세요.")}</p>

      <div className="mt-6 flex flex-col gap-6">
        {docs.map((d) => (
          <section key={d.type} className="rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{title(d.type)}</h2>
              {(d.version || d.effectiveDate) && (
                <p className="mt-0.5 text-xs text-zinc-500">
                  {d.version ? <span className="font-mono">{d.version}</span> : null}
                  {d.version && d.effectiveDate ? " · " : ""}
                  {d.effectiveDate
                    ? `${t("시행일")}: ${new Date(d.effectiveDate).toLocaleDateString(dateLocale(d.locale ?? "en"), { dateStyle: "long" })}`
                    : ""}
                </p>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto px-4 py-3">
              {d.content ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD_COMPONENTS}>
                  {d.content}
                </ReactMarkdown>
              ) : (
                <p className="text-sm text-zinc-500">{t("문서를 준비 중입니다.")}</p>
              )}
            </div>
            <label className="flex cursor-pointer items-center gap-2 border-t border-zinc-200 px-4 py-3 text-sm text-zinc-800 dark:border-zinc-800 dark:text-zinc-100">
              <input
                type="checkbox"
                checked={!!agreed[d.type]}
                onChange={(e) => setAgreed((a) => ({ ...a, [d.type]: e.target.checked }))}
                className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 dark:border-zinc-600"
              />
              {t("위 내용을 확인했으며 동의합니다")}
            </label>
          </section>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-red-500" role="alert">{t("동의 처리 중 문제가 발생했습니다. 다시 시도해주세요.")}</p>}

      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => signOut("/")}
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          {t("로그아웃")}
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!allAgreed || busy}
          className="rounded-lg bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? t("저장 중…") : t("동의하고 계속")}
        </button>
      </div>
    </div>
  );
}
