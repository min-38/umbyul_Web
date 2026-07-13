"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { useLocale } from "@/components/i18n-provider";

// Cloudflare Turnstile 봇 방어(가입·로그인·비번재설정). Supabase Auth가 captchaToken을 서버측 검증.
// NEXT_PUBLIC_TURNSTILE_SITE_KEY 미설정(개발) 시 렌더 안 하고, 폼은 captchaEnabled=false로 게이팅을 면제한다.
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
export const captchaEnabled = !!SITE_KEY;

const SCRIPT_SRC = "https://challenge.cloudflare.com/turnstile/v0/api.js?render=explicit";

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

// 스크립트는 페이지당 한 번만 로드(폼 간 이동에도 재사용).
let scriptPromise: Promise<void> | null = null;
function loadScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("turnstile load failed"));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export type TurnstileHandle = { reset: () => void };

// 토큰은 1회용 — 제출 실패 시 부모가 ref.reset()으로 새 챌린지를 받는다.
export const Turnstile = forwardRef<TurnstileHandle, { onToken: (token: string | null) => void }>(
  function Turnstile({ onToken }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const onTokenRef = useRef(onToken);
    onTokenRef.current = onToken;
    const locale = useLocale();

    useImperativeHandle(
      ref,
      () => ({
        reset: () => {
          if (widgetIdRef.current && window.turnstile) {
            window.turnstile.reset(widgetIdRef.current);
            onTokenRef.current(null);
          }
        },
      }),
      [],
    );

    useEffect(() => {
      if (!SITE_KEY) return;
      let cancelled = false;
      loadScript()
        .then(() => {
          if (cancelled || !containerRef.current || !window.turnstile) return;
          // 앱의 수동 다크 토글(html.dark)에 맞춤 — Turnstile 기본 auto는 OS 설정을 따라 불일치할 수 있음.
          const dark = document.documentElement.classList.contains("dark");
          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: SITE_KEY,
            callback: (token: string) => onTokenRef.current(token),
            "expired-callback": () => onTokenRef.current(null),
            "error-callback": () => onTokenRef.current(null),
            theme: dark ? "dark" : "light",
            size: "flexible", // 컨테이너(폼) 너비에 맞춤 — 고정폭 오버플로 방지
            language: locale,
          });
        })
        .catch(() => {
          // 스크립트 로드 실패 시 조용히 — 부모는 captchaEnabled=true라 제출이 막히니, 이때만 열어줄지는 정책에 따름.
        });
      return () => {
        cancelled = true;
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        }
      };
      // locale 변경 시 위젯 언어 갱신 위해 재마운트
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [locale]);

    if (!SITE_KEY) return null;
    // 로드 전 높이 예약(flexible 위젯 ≈ 65px) → 레이아웃 시프트 방지
    return <div ref={containerRef} className="min-h-[65px]" />;
  },
);
