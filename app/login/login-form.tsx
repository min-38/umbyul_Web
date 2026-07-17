"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { Spinner } from "@/components/ui/spinner";
import { BrandMark } from "@/components/ui/brand-mark";
import { PasswordInput } from "@/components/ui/password-input";
import { Turnstile, captchaEnabled, type TurnstileHandle } from "@/components/auth/turnstile";
import { errText, type ErrText } from "@/lib/messages";
import { useT, useLocale } from "@/components/i18n-provider";

const inputBase =
  "w-full rounded-lg border px-3 py-2.5 text-sm text-black outline-none focus:ring-1 focus:ring-zinc-300 dark:bg-zinc-900 dark:text-zinc-50";

export function LoginForm({ initialError = null }: { initialError?: ErrText }) {
  const t = useT();
  const locale = useLocale();
  const [step, setStep] = useState<"login" | "verify">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [cooldown, setCooldown] = useState(0); // 재전송 쿨다운 남은 초. 진입 시 0(즉시 활성) — 로그인은 자동 재전송 안 하므로 받을 코드가 없다.
  // OAuth 콜백이 /login?error=auth 로 되돌려보낸 실패를 표시(예전엔 아무도 안 읽어 조용히 폼으로 복귀, NON-223).
  const [err, setErr] = useState<ErrText>(initialError);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<TurnstileHandle>(null);

  const router = useRouter();
  const supabase = createClient();
  const captchaOk = !captchaEnabled || !!captchaToken;

  // 쿨다운 카운트다운. setTimeout 재생성으로 1초씩 감소 — 간단·정확.
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: { captchaToken: captchaToken ?? undefined },
    });
    setLoading(false);
    if (error) {
      // 비번이 맞고 인증만 안 된 경우 GoTrue 는 email_not_confirmed 로만 거부 → 인증 단계로.
      // (비번 틀리면 invalid_credentials 라 이 분기에 안 걸린다.)
      if (error.code === "email_not_confirmed") {
        captchaRef.current?.reset();
        setStep("verify");
        return;
      }
      setErr({ code: error.code ?? "" });
      captchaRef.current?.reset(); // 토큰 1회용 — 재시도 위해 새 챌린지
      return;
    }
    router.push("/");
    router.refresh();
  };

  const onVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (code.length !== 6) {
      setErr({ key: "6자리 코드를 입력하세요." });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: "signup" });
    setLoading(false);
    if (error) {
      setErr({ key: "코드가 올바르지 않거나 만료되었습니다." });
      return;
    }
    router.push("/");
    router.refresh();
  };

  const onResend = async () => {
    if (cooldown > 0 || loading) return;
    setErr(null);
    setLoading(true);
    const { error } = await supabase.auth.resend({ type: "signup", email });
    setLoading(false);
    if (error) {
      // 서버 email_sent=2/시간 한도(over_email_send_rate_limit) 등은 기존 문구로 안내.
      setErr({ code: error.code ?? "" });
      return;
    }
    setCooldown(60);
  };

  const errorText = errText(err, locale, t);

  if (step === "verify") {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col items-center gap-3 text-center">
          <BrandMark />
          <h1 className="text-lg font-medium text-black dark:text-zinc-50">{t("이메일 인증이 필요합니다")}</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("코드를 받아 6자리를 입력하면 로그인됩니다.")}</p>
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

        <button
          type="button"
          onClick={onResend}
          disabled={cooldown > 0 || loading}
          className="text-center text-sm text-zinc-500 hover:text-zinc-700 disabled:opacity-60 disabled:hover:text-zinc-500 dark:hover:text-zinc-300"
        >
          {cooldown > 0 ? t("{seconds}초 후 재전송", { seconds: cooldown }) : t("인증 코드 재전송")}
        </button>

        {errorText && <p role="alert" className="text-center text-sm text-red-600 dark:text-red-400">{errorText}</p>}
      </div>
    );
  }
  const border = errorText
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
            setErr(null);
          }}
          placeholder={t("이메일")}
          className={`${inputBase} ${border}`}
        />
        <PasswordInput
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setErr(null);
          }}
          placeholder={t("비밀번호")}
          className={`${inputBase} ${border}`}
        />
        <Turnstile ref={captchaRef} onToken={setCaptchaToken} />
        <button
          type="submit"
          disabled={loading || !captchaOk}
          className="mt-1 flex h-10 w-full items-center justify-center rounded-lg bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
        >
          {loading ? <><Spinner /><span className="sr-only">{t("로그인")}</span></> : t("로그인")}
        </button>
        {errorText && (
          <p role="alert" className="text-center text-sm text-red-600 dark:text-red-400">{errorText}</p>
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
