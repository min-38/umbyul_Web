import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/api";
import { SettingsView } from "@/components/settings/settings-view";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getProfile();
  if (!profile) redirect("/onboarding");

  const identities = user.identities ?? [];
  // email(비밀번호) 로그인 보유 여부 → 비밀번호 "변경" vs "설정"
  const hasPassword = identities.some((i) => i.provider === "email");
  // 연동된 계정(복수 가능): email / google / discord ...
  const providers = Array.from(new Set(identities.map((i) => i.provider ?? "").filter(Boolean)));

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8">
      <h1 className="mb-8 text-2xl font-bold text-zinc-900 dark:text-zinc-50">설정</h1>
      <SettingsView
        username={profile.username}
        avatarUrl={profile.avatarUrl}
        hasPassword={hasPassword}
        joinedAt={profile.createdAt}
        providers={providers}
        initialTab={tab}
      />
    </div>
  );
}
