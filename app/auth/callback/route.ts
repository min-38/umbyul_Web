import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// OAuth / 매직링크가 돌아오는 콜백. code를 세션으로 교환 후 next로 리다이렉트.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
