"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Spinner } from "@/components/ui/spinner";
import { BrandMark } from "@/components/ui/brand-mark";
import { isEmail, passwordChecks, borderClass, type FieldStatus } from "@/lib/validation";
import { useT } from "@/components/i18n-provider";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const inputBase =
  "w-full rounded-lg border px-3 py-2.5 text-sm text-black outline-none focus:ring-1 focus:ring-zinc-300 dark:bg-zinc-900 dark:text-zinc-50";

function Req({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <span className={ok ? "text-green-600 dark:text-green-400" : "text-zinc-500"}>
      {ok ? "✓" : "·"} {children}
    </span>
  );
}

type EmailState = "idle" | "checking" | "available" | "taken" | "invalid";

export function SignupForm() {
  const t = useT();
  const [step, setStep] = useState<"form" | "verify">("form");
  const [email, setEmail] = useState("");
  const [emailState, setEmailState] = useState<EmailState>("idle");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const pw = passwordChecks(password);
  const emailStatus: FieldStatus =
    emailState === "available"
      ? "valid"
      : emailState === "taken" || emailState === "invalid"
        ? "invalid"
        : "idle";
  const pwStatus: FieldStatus = password === "" ? "idle" : pw.all ? "valid" : "invalid";
  const confirmStatus: FieldStatus =
    confirm === "" ? "idle" : confirm === password ? "valid" : "invalid";
  const agreed = agreedTerms && agreedPrivacy;
  const canSubmit =
    emailState === "available" && pw.all && confirm === password && agreed && !loading;
  // "{link}에 동의합니다." → 링크(약관/방침)를 문장 중간에 넣기 위해 앞/뒤로 분리(어순은 로케일별로 다름)
  const [agreeBefore, agreeAfter] = t("{link}에 동의합니다.").split("{link}");

  // 이메일 실시간 형식 + 중복 확인 (디바운스 400ms)
  useEffect(() => {
    if (email === "") {
      setEmailState("idle");
      return;
    }
    if (!isEmail(email)) {
      setEmailState("invalid");
      return;
    }
    setEmailState("checking");
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/email-available?email=${encodeURIComponent(email)}`);
        const { data } = await res.json();
        setEmailState(
          data.available ? "available" : data.reason === "INVALID" ? "invalid" : "taken",
        );
      } catch {
        // Api 불가 시 막지 않음 — 형식은 통과했으니 낙관적 통과, 중복은 제출 시 재확인
        setEmailState("available");
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [email]);

  const onSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!canSubmit) return;

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { terms_accepted: true } },
    });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    // 제출 시 재확인: 이미 가입된 이메일이면 identities 가 빈 배열(열거 방지)
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setEmailState("taken");
      return;
    }
    setStep("verify");
  };

  const onVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (code.length !== 6) {
      setError(t("6자리 코드를 입력하세요."));
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: "signup" });
    setLoading(false);
    if (error) {
      setError(t("코드가 올바르지 않거나 만료되었습니다."));
      return;
    }
    // 인증 완료 → 세션 생성됨 → 프로필 설정(온보딩)으로
    router.push("/onboarding");
    router.refresh();
  };

  if (step === "verify") {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col items-center gap-3 text-center">
          <BrandMark />
          <h1 className="text-lg font-medium text-black dark:text-zinc-50">{t("인증 메일을 보냈습니다")}</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {t("받은 편지함에서 6자리 코드를 입력하세요.")}
          </p>
        </div>

        <form noValidate onSubmit={onVerify} className="flex flex-col gap-2">
          <input
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder={t("6자리 코드")}
            className={`${inputBase} border-zinc-300 text-center tracking-[0.4em] dark:border-zinc-700`}
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-1 flex h-10 w-full items-center justify-center rounded-lg bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
          >
            {loading ? <><Spinner /><span className="sr-only">{t("확인")}</span></> : t("확인")}
          </button>
        </form>

        {error && <p role="alert" className="text-center text-sm text-red-600 dark:text-red-400">{error}</p>}

        <p className="text-center text-xs text-zinc-500">{t("메일이 안 보이면 스팸함을 확인하세요.")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-3">
        <BrandMark />
        <h1 className="text-center text-lg font-medium text-black dark:text-zinc-50">
          {t("가입을 환영합니다")}
        </h1>
      </div>

      <form noValidate onSubmit={onSignUp} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("이메일")}
            className={`${inputBase} ${borderClass(emailStatus)}`}
          />
          {emailState === "checking" && <p className="text-xs text-zinc-500">{t("확인 중…")}</p>}
          {emailState === "available" && (
            <p className="text-xs text-green-600 dark:text-green-400">{t("사용 가능")}</p>
          )}
          {emailState === "invalid" && (
            <p className="text-xs text-red-600 dark:text-red-400">{t("올바른 이메일 형식이 아닙니다.")}</p>
          )}
          {emailState === "taken" && (
            <p className="text-xs text-red-600 dark:text-red-400">{t("이미 가입된 이메일입니다.")}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("비밀번호")}
            className={`${inputBase} ${borderClass(pwStatus)}`}
          />
          <div className="flex flex-col gap-0.5 text-xs">
            <Req ok={pw.length}>{t("8자 이상")}</Req>
            <Req ok={pw.upper && pw.lower}>{t("대소문자 포함")}</Req>
            <Req ok={pw.digit}>{t("숫자 포함")}</Req>
            <Req ok={pw.special}>{t("특수문자 포함")}</Req>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder={t("비밀번호 확인")}
            className={`${inputBase} ${borderClass(confirmStatus)}`}
          />
          {confirmStatus === "invalid" && (
            <p className="text-xs text-red-600 dark:text-red-400">{t("비밀번호가 일치하지 않습니다.")}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <label className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400">
            <input
              type="checkbox"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              {agreeBefore}
              <Link href="/terms" target="_blank" className="underline">
                {t("이용약관")}
              </Link>
              {agreeAfter} <span className="text-red-500">*</span>
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
              {agreeBefore}
              <Link href="/privacy" target="_blank" className="underline">
                {t("개인정보 처리방침")}
              </Link>
              {agreeAfter} <span className="text-red-500">*</span>
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="flex h-10 w-full items-center justify-center rounded-lg bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {loading ? <><Spinner /><span className="sr-only">{t("가입하기")}</span></> : t("가입하기")}
        </button>
      </form>

      {error && <p role="alert" className="text-center text-sm text-red-600 dark:text-red-400">{error}</p>}

      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        {t("이미 계정이 있으신가요?")}{" "}
        <Link href="/login" className="font-medium text-black underline dark:text-zinc-50">
          {t("로그인")}
        </Link>
      </p>
    </div>
  );
}
