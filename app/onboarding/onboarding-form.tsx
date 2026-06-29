"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { COUNTRY_CODES } from "@/lib/countries";

// 회원가입 폼과 동일한 핸들 규칙
const USERNAME_RE = /^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$/;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// 국가 코드 → 한글 표시명, 이름순 정렬 (1회 계산)
const COUNTRIES = (() => {
  const dn = new Intl.DisplayNames(["ko"], { type: "region" });
  return COUNTRY_CODES.map((code) => ({ code, name: dn.of(code) ?? code })).sort(
    (a, b) => a.name.localeCompare(b.name, "ko"),
  );
})();

type Availability = "idle" | "checking" | "available" | "taken" | "invalid";

export function OnboardingForm({
  defaultUsername,
  defaultCountry,
}: {
  defaultUsername: string;
  defaultCountry: string;
}) {
  const [username, setUsername] = useState(defaultUsername);
  const [country, setCountry] = useState(defaultCountry || "KR");
  const [avail, setAvail] = useState<Availability>("idle");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const localValid =
    username.length >= 2 && username.length <= 30 && USERNAME_RE.test(username);

  // 실시간 중복검사 (디바운스 400ms)
  useEffect(() => {
    if (!localValid) {
      setAvail(username ? "invalid" : "idle");
      return;
    }
    setAvail("checking");
    const t = setTimeout(async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      try {
        const res = await fetch(
          `${API_URL}/me/username-available?username=${encodeURIComponent(username)}`,
          { headers: { Authorization: `Bearer ${session.access_token}` } },
        );
        const json = await res.json();
        setAvail(
          json.available ? "available" : json.reason === "invalid" ? "invalid" : "taken",
        );
      } catch {
        // 네트워크 오류는 제출 시 재확인
        setAvail("idle");
      }
    }, 400);
    return () => clearTimeout(t);
  }, [username, localValid, supabase]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!localValid) {
      setError("username 형식을 확인하세요.");
      return;
    }
    if (avail === "taken") {
      setError("이미 사용 중인 username입니다.");
      return;
    }

    setLoading(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      router.push("/login");
      return;
    }
    const res = await fetch(`${API_URL}/me/profile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ username, country }),
    });
    setLoading(false);

    if (res.ok) {
      router.push("/");
      router.refresh();
      return;
    }
    if (res.status === 409) {
      setAvail("taken");
      setError("이미 사용 중인 username입니다.");
      return;
    }
    setError("프로필 생성에 실패했습니다. 잠시 후 다시 시도해주세요.");
  };

  const hint = {
    idle: null,
    checking: <span className="text-zinc-500">확인 중…</span>,
    available: <span className="text-green-600 dark:text-green-400">사용 가능</span>,
    taken: <span className="text-red-600 dark:text-red-400">이미 사용 중</span>,
    invalid: (
      <span className="text-red-600 dark:text-red-400">사용할 수 없는 형식</span>
    ),
  }[avail];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-lg font-semibold text-black dark:text-zinc-50">
          프로필 설정
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          시작하려면 username을 정해주세요.
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <input
            type="text"
            required
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm text-black outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
          <div className="flex justify-between text-xs">
            <span className="text-zinc-500">
              영문·숫자·하이픈, 2–30자. 하이픈으로 시작·끝 불가.
            </span>
            {hint}
          </div>
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
          disabled={loading || avail === "taken" || avail === "checking" || !localValid}
          className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
        >
          시작하기
        </button>
      </form>

      {error && (
        <p className="text-center text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
