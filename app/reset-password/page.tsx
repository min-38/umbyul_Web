"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BrandMark } from "@/components/ui/brand-mark";
import { Spinner } from "@/components/ui/spinner";

const inputBase =
  "w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm text-black outline-none focus:ring-1 focus:ring-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState<boolean | null>(null); // 복구 세션 존재 여부
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => setReady(!!data.user));
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 8) return setError("비밀번호는 8자 이상이어야 합니다.");
    if (pw !== pw2) return setError("비밀번호가 일치하지 않습니다.");
    setError(null);
    setLoading(true);
    const { error } = await createClient().auth.updateUser({ password: pw });
    setLoading(false);
    if (error) setError(error.message);
    else setDone(true);
  };

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 dark:bg-black">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
        {ready === null ? (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        ) : !ready ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <BrandMark />
            <p className="font-medium text-black dark:text-zinc-50">유효하지 않은 접근입니다</p>
            <p className="text-sm text-zinc-500">재설정 링크가 만료되었거나 잘못되었습니다.</p>
            <Link href="/forgot-password" className="mt-2 text-sm font-medium text-black underline dark:text-zinc-50">
              재설정 링크 다시 받기
            </Link>
          </div>
        ) : done ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <BrandMark />
            <p className="font-medium text-black dark:text-zinc-50">비밀번호가 변경되었습니다</p>
            <button
              type="button"
              onClick={() => {
                router.push("/");
                router.refresh();
              }}
              className="mt-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              홈으로
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col items-center gap-3">
              <BrandMark />
              <h1 className="text-lg font-medium text-black dark:text-zinc-50">새 비밀번호 설정</h1>
            </div>
            <form noValidate onSubmit={onSubmit} className="flex flex-col gap-2">
              <input
                type="password"
                value={pw}
                onChange={(e) => {
                  setPw(e.target.value);
                  setError(null);
                }}
                placeholder="새 비밀번호 (8자 이상)"
                className={inputBase}
              />
              <input
                type="password"
                value={pw2}
                onChange={(e) => {
                  setPw2(e.target.value);
                  setError(null);
                }}
                placeholder="새 비밀번호 확인"
                className={inputBase}
              />
              <button
                type="submit"
                disabled={loading || !pw || !pw2}
                className="mt-1 flex h-10 w-full items-center justify-center rounded-lg bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
              >
                {loading ? <Spinner /> : "비밀번호 변경"}
              </button>
              {error && <p className="text-center text-sm text-red-600 dark:text-red-400">{error}</p>}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
