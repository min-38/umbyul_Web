import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeInternalPath } from "@/lib/validation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// OAuth / 매직링크가 돌아오는 콜백. code를 세션으로 교환 후 next로 리다이렉트.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeInternalPath(searchParams.get("next")); // 내부 경로만 — 오픈 리다이렉트 차단(SEC-W-3)

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const response = NextResponse.redirect(`${origin}${next}`);
      // 회원이 저장한 언어를 쿠키에 하이드레이트 → 새 기기에서도 계정 언어로 렌더
      const token = data.session?.access_token;
      if (token) {
        try {
          const res = await fetch(`${API_URL}/me/profile`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          });
          if (res.ok) {
            const loc = (await res.json())?.data?.locale;
            if (loc === "ko" || loc === "en") {
              response.cookies.set("locale", loc, { path: "/", maxAge: 60 * 60 * 24 * 365 });
            }
          }
        } catch {
          // 프로필 조회 실패 시 쿠키 미설정(기본 언어 로직으로 폴백) — 로그인 흐름은 막지 않음
        }
      }
      return response;
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
