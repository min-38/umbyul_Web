import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, getGenres } from "@/lib/api";
import { safeInternalPath } from "@/lib/validation";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ returnUrl?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 평가·믹스 등에서 온보딩으로 보낼 때 복귀 경로. 오픈 리다이렉트 차단(내부 경로만).
  const returnUrl = safeInternalPath((await searchParams).returnUrl);

  // 이미 프로필이 있으면 온보딩 불필요 → 복귀 경로로(없으면 "/")
  const profile = await getProfile();
  if (profile) redirect(returnUrl);

  // 이메일 가입은 user_metadata 에 username/country 가 있음 → 프리필 (OAuth 는 빈 값)
  // 이메일 가입 유저는 회원가입에서 이미 동의(metadata) → 온보딩 동의 UI 불필요. OAuth 유저만 필요.
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const needsConsent = meta.terms_accepted !== true;
  const genres = await getGenres(); // 선호 장르 선택용(NON-150). 실패 시 빈 목록 → 단계 생략.

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 dark:bg-black">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
        <OnboardingForm needsConsent={needsConsent} genres={genres} returnUrl={returnUrl} />
      </div>
    </div>
  );
}
