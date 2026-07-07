"use client";

import { useState } from "react";
import { useT } from "@/components/i18n-provider";

// 비밀번호 입력 + 표시/숨김 토글(UX-8). 나머지 input 속성은 그대로 전달.
export function PasswordInput({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  const t = useT();
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input {...props} type={show ? "text" : "password"} className={`${className} w-full pr-10`} />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? t("비밀번호 숨기기") : t("비밀번호 표시")}
        aria-pressed={show}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
      >
        {show ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19M6.61 6.61A18.5 18.5 0 0 0 2 12s3 8 10 8a9.12 9.12 0 0 0 5.06-1.52M1 1l22 22M9.9 9.9a3 3 0 0 0 4.2 4.2" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M1 12s3-8 11-8 11 8 11 8-3 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
}
