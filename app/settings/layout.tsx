import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/api";
import { getT } from "@/lib/i18n-server";
import { SettingsNav } from "@/components/settings/settings-nav";

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getProfile();
  if (!profile) redirect("/onboarding");

  const t = await getT();

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8">
      <h1 className="mb-8 text-2xl font-bold text-zinc-900 dark:text-zinc-50">{t("설정")}</h1>
      <div className="flex flex-col gap-6 sm:flex-row sm:gap-10">
        <SettingsNav />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
