import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/api";
import { NewSetForm } from "@/components/sets/new-set-form";

export default async function NewSetPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 온보딩(프로필) 미완료면 작성 폼까지 오기 전에 막는다 — 직접 URL 진입 포함.
  // 폼 서버 가드라 버튼 클릭·직접 진입 모두 여기서 잡힌다. 완료 후 여기로 복귀.
  const profile = await getProfile();
  if (!profile) redirect("/onboarding?returnUrl=/mixes/new");

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <NewSetForm />
    </div>
  );
}
