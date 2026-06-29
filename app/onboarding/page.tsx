import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/api";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 이미 프로필이 있으면 온보딩 불필요
  const profile = await getProfile();
  if (profile) redirect("/");

  // 이메일 가입은 user_metadata 에 username/country 가 있음 → 프리필 (OAuth 는 빈 값)
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const defaultUsername = typeof meta.username === "string" ? meta.username : "";
  const defaultCountry = typeof meta.country === "string" ? meta.country : "KR";

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 dark:bg-black">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
        <OnboardingForm
          defaultUsername={defaultUsername}
          defaultCountry={defaultCountry}
        />
      </div>
    </div>
  );
}
