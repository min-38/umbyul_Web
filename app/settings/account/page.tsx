import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/api";
import { AccountSettings } from "@/components/settings/account-settings";

export default async function AccountTabPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const profile = await getProfile();
  if (!user || !profile) return null; // 인증은 settings/layout 에서 게이트

  const identities = user.identities ?? [];
  const hasPassword = identities.some((i) => i.provider === "email");
  const providers = Array.from(new Set(identities.map((i) => i.provider ?? "").filter(Boolean)));

  return (
    <AccountSettings
      initialUsername={profile.username}
      initialAvatarUrl={profile.avatarUrl}
      hasPassword={hasPassword}
      joinedAt={profile.createdAt}
      providers={providers}
    />
  );
}
