"use client";

import { useState } from "react";
import Link from "next/link";
import { submitInquiry } from "@/app/actions/inquiry";
import { msg } from "@/lib/messages";
import { useT, useLocale } from "@/components/i18n-provider";

// 공개 문의 폼(NON-78). 카테고리·이메일·제목·내용 + honeypot. 답변은 관리자가 이메일로 직접.
export function ContactForm() {
  const t = useT();
  const locale = useLocale();
  const cats = [t("계정"), t("평가·리뷰"), t("신고"), t("버그"), t("기타")];

  const [category, setCategory] = useState(cats[0]);
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    if (busy) return;
    setErr(null);
    if (!email.includes("@")) return setErr(t("이메일 형식을 확인하세요."));
    if (!title.trim()) return setErr(t("제목을 입력하세요."));
    if (!content.trim()) return setErr(t("내용을 입력하세요."));
    setBusy(true);
    const r = await submitInquiry({ category, email: email.trim(), title: title.trim(), content: content.trim(), website });
    setBusy(false);
    if (r.ok) setDone(true);
    else setErr(msg(r.code, locale));
  };

  const inputCls =
    "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

  if (done) {
    return (
      <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-6 py-10 text-center dark:border-emerald-800 dark:bg-emerald-950/30">
        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">{t("문의가 접수되었습니다.")}</p>
        <p className="mt-1 text-xs text-emerald-700/80 dark:text-emerald-400/70">{t("답변은 입력하신 이메일로 보내드립니다.")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-xs text-zinc-500">
        {t("카테고리")}
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
          {cats.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs text-zinc-500">
        {t("이메일")}
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="you@example.com" />
      </label>
      <label className="flex flex-col gap-1 text-xs text-zinc-500">
        {t("제목")}
        <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} className={inputCls} />
      </label>
      <label className="flex flex-col gap-1 text-xs text-zinc-500">
        {t("내용")}
        <textarea value={content} onChange={(e) => setContent(e.target.value)} maxLength={5000} rows={8} className={`${inputCls} resize-y`} />
      </label>

      {/* honeypot — 사람은 비워둠 */}
      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      {err ? <p className="text-xs text-red-600 dark:text-red-400">{err}</p> : null}

      <button
        type="button"
        onClick={submit}
        disabled={busy}
        className="self-start rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
      >
        {busy ? t("보내는 중…") : t("보내기")}
      </button>

      {/* 수집 고지 (LEG-8) */}
      <p className="text-xs text-zinc-500">
        {t("입력하신 이메일·문의 내용은 답변 목적으로만 사용되며, 처리 후 파기됩니다.")}{" "}
        <Link href="/privacy" target="_blank" className="underline">
          {t("개인정보 처리방침")}
        </Link>
      </p>
    </div>
  );
}
