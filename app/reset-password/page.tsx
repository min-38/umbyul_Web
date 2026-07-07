"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BrandMark } from "@/components/ui/brand-mark";
import { Spinner } from "@/components/ui/spinner";
import { PasswordInput } from "@/components/ui/password-input";
import { useT } from "@/components/i18n-provider";

const inputBase =
  "w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm text-black outline-none focus:ring-1 focus:ring-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";

export default function ResetPasswordPage() {
  const router = useRouter();
  const t = useT();
  const [ready, setReady] = useState<boolean | null>(null); // 복구 세션 존재 여부
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const completed = useRef(false); // 재설정 완료 여부 (이탈 시 정리 판단)

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => setReady(!!data.user));

    // 재설정을 완료하지 않고 페이지를 떠나면(탭 닫기·이동) 복구 세션 제거.
    // → 재설정 링크가 그대로 로그인 세션으로 남는 보안 문제 방지.
    const cleanup = () => {
      if (!completed.current) createClient().auth.signOut();
    };
    window.addEventListener("pagehide", cleanup);
    return () => {
      window.removeEventListener("pagehide", cleanup);
      cleanup();
    };
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 8) return setError(t("비밀번호는 8자 이상이어야 합니다."));
    if (pw !== pw2) return setError(t("비밀번호가 일치하지 않습니다."));
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }
    // 변경 성공 → 복구 세션 로그아웃(재로그인 강제)
    completed.current = true;
    await supabase.auth.signOut();
    setLoading(false);
    setDone(true);
    router.refresh();
  };

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 dark:bg-black">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
        {ready === null ? (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        ) : done ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <BrandMark />
            <p className="font-medium text-black dark:text-zinc-50">{t("비밀번호가 변경되었습니다")}</p>
            <p className="text-sm text-zinc-500">{t("새 비밀번호로 다시 로그인해주세요.")}</p>
            <Link
              href="/login"
              className="mt-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              {t("로그인하기")}
            </Link>
          </div>
        ) : !ready ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <BrandMark />
            <p className="font-medium text-black dark:text-zinc-50">{t("유효하지 않은 접근입니다")}</p>
            <p className="text-sm text-zinc-500">{t("재설정 링크가 만료되었거나 잘못되었습니다.")}</p>
            <Link href="/forgot-password" className="mt-2 text-sm font-medium text-black underline dark:text-zinc-50">
              {t("재설정 링크 다시 받기")}
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col items-center gap-3">
              <BrandMark />
              <h1 className="text-lg font-medium text-black dark:text-zinc-50">{t("새 비밀번호 설정")}</h1>
            </div>
            <form noValidate onSubmit={onSubmit} className="flex flex-col gap-2">
              <PasswordInput
                value={pw}
                onChange={(e) => {
                  setPw(e.target.value);
                  setError(null);
                }}
                placeholder={t("새 비밀번호 (8자 이상)")}
                className={inputBase}
              />
              <PasswordInput
                value={pw2}
                onChange={(e) => {
                  setPw2(e.target.value);
                  setError(null);
                }}
                placeholder={t("새 비밀번호 확인")}
                className={inputBase}
              />
              <button
                type="submit"
                disabled={loading || !pw || !pw2}
                className="mt-1 flex h-10 w-full items-center justify-center rounded-lg bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
              >
                {loading ? <><Spinner /><span className="sr-only">{t("비밀번호 변경")}</span></> : t("비밀번호 변경")}
              </button>
              {error && <p role="alert" className="text-center text-sm text-red-600 dark:text-red-400">{error}</p>}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
