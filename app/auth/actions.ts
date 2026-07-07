"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeInternalPath } from "@/lib/validation";

// 로그아웃 후엔 redirectTo(보통 현재 페이지)로. 로그인 필요한 페이지면 그 페이지의 가드가 /login 으로 보낸다.
export async function signOut(redirectTo: string) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(safeInternalPath(redirectTo)); // 내부 경로만 — 오픈 리다이렉트 차단(SEC-W-4)
}
