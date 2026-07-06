import { notFound, redirect } from "next/navigation";
import { getSet } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
import { MixEditor } from "@/components/sets/mix-editor";

export default async function MixEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getSet(id);
  if (!detail) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.id !== detail.set.ownerId) redirect(`/mixes/${id}`);

  return <MixEditor detail={detail} />;
}
