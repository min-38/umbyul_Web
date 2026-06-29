"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Spinner } from "@/components/ui/spinner";
import { BrandMark } from "@/components/ui/brand-mark";
import { COUNTRY_CODES } from "@/lib/countries";
import { isUsername, borderClass, type FieldStatus } from "@/lib/validation";
import { msg } from "@/lib/messages";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const inputBase =
  "w-full rounded-lg border px-3 py-2.5 text-sm text-black outline-none focus:ring-1 focus:ring-zinc-300 dark:bg-zinc-900 dark:text-zinc-50";

const COUNTRIES = (() => {
  const dn = new Intl.DisplayNames(["ko"], { type: "region" });
  return COUNTRY_CODES.map((code) => ({ code, name: dn.of(code) ?? code })).sort(
    (a, b) => a.name.localeCompare(b.name, "ko"),
  );
})();

const GENDERS = [
  { v: "male", l: "남성" },
  { v: "female", l: "여성" },
  { v: "other", l: "기타" },
  { v: "undisclosed", l: "비공개" },
];

const NOW = new Date();
// 만 14세 이상만 — 선택 가능한 연도 상한을 올해-14로 둔다(경계는 서버·클라가 재검증)
const YEARS = Array.from({ length: 100 }, (_, i) => NOW.getFullYear() - 14 - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

function buildBirth(y: string, m: string, d: string): string | null {
  if (!y || !m || !d) return null;
  const dt = new Date(Number(y), Number(m) - 1, Number(d));
  if (dt.getFullYear() !== Number(y) || dt.getMonth() !== Number(m) - 1 || dt.getDate() !== Number(d))
    return null;
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

function ageOf(birth: string): number {
  const b = new Date(birth);
  let a = NOW.getFullYear() - b.getFullYear();
  const mo = NOW.getMonth() - b.getMonth();
  if (mo < 0 || (mo === 0 && NOW.getDate() < b.getDate())) a--;
  return a;
}

type Availability = "idle" | "checking" | "available" | "taken" | "invalid";

export function OnboardingForm({ needsConsent }: { needsConsent: boolean }) {
  const [username, setUsername] = useState("");
  const [avail, setAvail] = useState<Availability>("idle");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [country, setCountry] = useState("KR");
  const [gender, setGender] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const localValid = isUsername(username);
  const birth = buildBirth(year, month, day);
  const birthAge = birth ? ageOf(birth) : null;
  const birthValid = birth !== null && birthAge !== null && birthAge >= 14;
  const birthStatus: FieldStatus =
    !year || !month || !day ? "idle" : birthValid ? "valid" : "invalid";
  const consentOk = needsConsent ? agreedTerms && agreedPrivacy : true;

  const uStatus: FieldStatus =
    avail === "available" ? "valid" : avail === "taken" || avail === "invalid" ? "invalid" : "idle";

  // username 실시간 중복검사 (공개 엔드포인트)
  useEffect(() => {
    if (username === "") {
      setAvail("idle");
      return;
    }
    if (!localValid) {
      setAvail("invalid");
      return;
    }
    setAvail("checking");
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `${API_URL}/username-available?username=${encodeURIComponent(username)}`,
        );
        const { data } = await res.json();
        setAvail(data.available ? "available" : data.reason === "INVALID" ? "invalid" : "taken");
      } catch {
        setAvail("idle");
      }
    }, 400);
    return () => clearTimeout(t);
  }, [username, localValid]);

  const canSubmit = avail === "available" && birthValid && consentOk && !loading;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!canSubmit) {
      if (!birthValid && year && month && day) setError("만 14세 이상만 가입할 수 있습니다.");
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
      body: JSON.stringify({
        username,
        country,
        birthDate: birth,
        gender: gender || null,
        termsAccepted: consentOk,
      }),
    });
    setLoading(false);

    if (res.ok) {
      router.push("/");
      router.refresh();
      return;
    }
    const json = await res.json().catch(() => null);
    const code = json?.code as string | undefined;
    if (code === "USERNAME_TAKEN") setAvail("taken");
    if (code === "UNDERAGE") {
      setError("만 14세 이상만 가입할 수 있습니다.");
      return;
    }
    setError(msg(code));
  };

  const selectClass = `${inputBase} ${borderClass("idle")}`;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-3 text-center">
        <BrandMark />
        <h1 className="text-lg font-medium text-black dark:text-zinc-50">거의 다 됐어요</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">프로필을 완성해주세요.</p>
      </div>

      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <input
            type="text"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
            className={`${inputBase} ${borderClass(uStatus)}`}
          />
          <div className="flex justify-between text-xs">
            <span className="text-zinc-500">영문·숫자·하이픈, 2–30자.</span>
            {avail === "checking" && <span className="text-zinc-500">확인 중…</span>}
            {avail === "available" && (
              <span className="text-green-600 dark:text-green-400">사용 가능</span>
            )}
            {avail === "taken" && <span className="text-red-600 dark:text-red-400">이미 사용 중</span>}
            {avail === "invalid" && (
              <span className="text-red-600 dark:text-red-400">사용할 수 없는 형식</span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="grid grid-cols-3 gap-2">
            <select value={year} onChange={(e) => setYear(e.target.value)} className={selectClass}>
              <option value="">년</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <select value={month} onChange={(e) => setMonth(e.target.value)} className={selectClass}>
              <option value="">월</option>
              {MONTHS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <select value={day} onChange={(e) => setDay(e.target.value)} className={selectClass}>
              <option value="">일</option>
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          {birthStatus === "invalid" ? (
            <p className="text-xs text-red-600 dark:text-red-400">
              {birth ? "만 14세 이상만 가입할 수 있습니다." : "올바른 날짜를 선택하세요."}
            </p>
          ) : (
            <p className="text-xs text-zinc-500">생년월일</p>
          )}
        </div>

        <select value={country} onChange={(e) => setCountry(e.target.value)} className={selectClass}>
          {COUNTRIES.map(({ code, name }) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </select>

        <div className="flex flex-col gap-1">
          <select value={gender} onChange={(e) => setGender(e.target.value)} className={selectClass}>
            <option value="">성별 (선택)</option>
            {GENDERS.map(({ v, l }) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>

        {needsConsent && (
          <div className="flex flex-col gap-2 pt-1">
            <label className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400">
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                <Link href="#" className="underline">
                  이용약관
                </Link>
                에 동의합니다. <span className="text-red-500">*</span>
              </span>
            </label>
            <label className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400">
              <input
                type="checkbox"
                checked={agreedPrivacy}
                onChange={(e) => setAgreedPrivacy(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                <Link href="#" className="underline">
                  개인정보 처리방침
                </Link>
                에 동의합니다. <span className="text-red-500">*</span>
              </span>
            </label>
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="flex h-10 w-full items-center justify-center rounded-lg bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {loading ? <Spinner /> : "완료"}
        </button>
      </form>

      {error && <p className="text-center text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
