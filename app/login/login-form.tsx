"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { Spinner } from "@/components/ui/spinner";
import { BrandMark } from "@/components/ui/brand-mark";
import { PasswordInput } from "@/components/ui/password-input";
import { useT } from "@/components/i18n-provider";

const inputBase =
  "w-full rounded-lg border px-3 py-2.5 text-sm text-black outline-none focus:ring-1 focus:ring-zinc-300 dark:bg-zinc-900 dark:text-zinc-50";

export function LoginForm() {
  const t = useT();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/");
    router.refresh();
  };

  const border = error
    ? "border-red-500 dark:border-red-500"
    : "border-zinc-300 dark:border-zinc-700";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-3">
        <BrandMark />
        <h1 className="text-center text-lg font-medium text-black dark:text-zinc-50">
          {t("환영합니다")}
        </h1>
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
          className={`${inputBase} ${border}`}
        />
        <PasswordInput
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(null);
          }}
          placeholder={t("비밀번호")}
          className={`${inputBase} ${border}`}
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-1 flex h-10 w-full items-center justify-center rounded-lg bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
        >
          {loading ? <><Spinner /><span className="sr-only">{t("로그인")}</span></> : t("로그인")}
        </button>
        {error && (
          <p role="alert" className="text-center text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </form>

      <Link
        href="/forgot-password"
        className="text-center text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        {t("비밀번호를 잊으셨나요?")}
      </Link>

      <div className="flex items-center gap-3 text-xs text-zinc-500">
        <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
        {t("또는")}
        <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
      </div>

      <OAuthButtons />

      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        {t("처음이신가요?")}{" "}
        <Link href="/signup" className="font-medium text-black underline dark:text-zinc-50">
          {t("회원가입")}
        </Link>
      </p>
    </div>
  );
}
