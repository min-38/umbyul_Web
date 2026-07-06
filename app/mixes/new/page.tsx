import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NewSetForm } from "@/components/sets/new-set-form";

export default async function NewSetPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <NewSetForm />
    </div>
  );
}
