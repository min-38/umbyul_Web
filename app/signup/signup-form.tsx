"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { COUNTRY_CODES } from "@/lib/countries";

// 고유 핸들: 영문/숫자, 하이픈은 중간에만
const USERNAME_RE = /^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$/;

// 국가 코드 → 한글 표시명, 이름순 정렬 (1회 계산)
const COUNTRIES = (() => {
  const dn = new Intl.DisplayNames(["ko"], { type: "region" });
  return COUNTRY_CODES.map((code) => ({ code, name: dn.of(code) ?? code })).sort(
    (a, b) => a.name.localeCompare(b.name, "ko"),
  );
})();

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [username, setUsername] = useState("");
  const [country, setCountry] = useState("KR");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    if (password !== confirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (username.length < 2 || username.length > 30 || !USERNAME_RE.test(username)) {
      setError("username은 영문/숫자/하이픈만 가능하며, 하이픈으로 시작·끝날 수 없습니다 (2–30자).");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        // username·country는 우선 user_metadata에 보관 → 서버(NON-16)가 users 테이블로 이전
        data: { username, country },
      },
    });
    setLoading(false);

    if (error) setError(error.message);
    else setSent(true);
  };

  if (sent) {
    return (
      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        <span className="font-medium text-black dark:text-zinc-50">{email}</span>
        로 인증 메일을 보냈습니다. 메일의 링크를 눌러 가입을 완료하세요.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-center text-lg font-semibold text-black dark:text-zinc-50">
        회원가입
      </h1>

      <OAuthButtons />

      <div className="flex items-center gap-3 text-xs text-zinc-400">
        <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
        또는
        <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm text-black outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />

        <div className="flex flex-col gap-1">
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm text-black outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
          <p className="text-xs text-zinc-500">8자 이상</p>
        </div>

        <input
          type="password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="비밀번호 확인"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm text-black outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />

        <div className="flex flex-col gap-1">
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm text-black outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
          <p className="text-xs text-zinc-500">
            영문·숫자·하이픈만 가능. 하이픈으로 시작하거나 끝날 수 없습니다.
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <select
            required
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm text-black outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          >
            {COUNTRIES.map(({ code, name }) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
          <p className="text-xs text-zinc-500">국가 (통계 목적으로 수집)</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
        >
          가입하기
        </button>
      </form>

      {error && (
        <p className="text-center text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        가입 시 서비스 약관과 개인정보 처리방침에 동의하게 됩니다.
      </p>

      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        이미 계정이 있으신가요?{" "}
        <Link
          href="/login"
          className="font-medium text-black underline dark:text-zinc-50"
        >
          로그인
        </Link>
      </p>
    </div>
  );
}
