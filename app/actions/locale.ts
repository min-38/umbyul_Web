"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { Locale } from "@/lib/i18n";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function setLocale(locale: Locale) {
  (await cookies()).set("locale", locale, { path: "/", maxAge: 60 * 60 * 24 * 365 });

  // 로그인 회원이면 DB에도 저장 → 기기·브라우저 무관하게 유지(다음 로그인 시 하이드레이트)
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) {
    try {
      await fetch(`${API_URL}/me/locale`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
        cache: "no-store",
      });
    } catch {
      // DB 저장 실패해도 쿠키는 적용됨 — UX 막지 않음
    }
  }
}
