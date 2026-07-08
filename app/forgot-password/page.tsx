"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { BrandMark } from "@/components/ui/brand-mark";
import { Spinner } from "@/components/ui/spinner";
import { authMessage } from "@/lib/messages";
import { useT, useLocale } from "@/components/i18n-provider";

const inputBase =
  "w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm text-black outline-none focus:ring-1 focus:ring-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";

export default function ForgotPasswordPage() {
  const t = useT();
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await createClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    setLoading(false);
    if (error) setError(authMessage(error, locale));
    else setSent(true);
  };

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 dark:bg-black">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
        {sent ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <BrandMark />
            <p className="font-medium text-black dark:text-zinc-50">{t("재설정 링크를 보냈습니다")}</p>
            <p className="text-sm text-zinc-500">
              {(() => {
                const [b, a] = t("{email}의 메일함을 확인해주세요.").split("{email}");
                return (
                  <>
                    {b}
                    <span className="text-zinc-700 dark:text-zinc-300">{email}</span>
                    {a}
                  </>
                );
              })()}
            </p>
            <Link href="/login" className="mt-2 text-sm font-medium text-black underline dark:text-zinc-50">
              {t("로그인으로")}
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col items-center gap-3">
              <BrandMark />
              <h1 className="text-lg font-medium text-black dark:text-zinc-50">{t("비밀번호 재설정")}</h1>
              <p className="text-center text-sm text-zinc-500">{t("가입한 이메일로 재설정 링크를 보내드립니다.")}</p>
            </div>

            <form noValidate onSubmit={onSubmit} className="flex flex-col gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                placeholder={t("이메일")}
                className={inputBase}
              />
              <button
                type="submit"
                disabled={loading || !email}
                className="mt-1 flex h-10 w-full items-center justify-center rounded-lg bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
              >
                {loading ? <><Spinner /><span className="sr-only">{t("재설정 링크 보내기")}</span></> : t("재설정 링크 보내기")}
              </button>
              {error && <p role="alert" className="text-center text-sm text-red-600 dark:text-red-400">{error}</p>}
            </form>

            <Link href="/login" className="text-center text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
              {t("로그인으로 돌아가기")}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
