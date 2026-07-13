import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { safeInternalPath } from "@/lib/validation";

// 이메일 링크(TokenHash 방식) 확인 라우트. supabase.co 노출 없이 앱 도메인에서 검증한다.
// 재설정/확인 메일의 {{ .SiteURL }}/auth/confirm?token_hash=...&type=...&next=... 링크가 여기로 온다.
// verifyOtp는 서버-서버 호출이라 브라우저는 supabase.co를 거치지 않는다.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeInternalPath(searchParams.get("next")); // 내부 경로만 — 오픈 리다이렉트 차단(SEC-W-3)

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
