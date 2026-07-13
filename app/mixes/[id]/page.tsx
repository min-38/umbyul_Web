import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSet } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
import { SetView } from "@/components/sets/set-view";
import { MixComments } from "@/components/sets/mix-comments";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const detail = await getSet(id);
  if (!detail) return {};
  return { title: `${detail.set.title} · ${detail.set.ownerUsername} | UmByul` };
}

export default async function SetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getSet(id);
  if (!detail) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <SetView detail={detail} isOwner={user?.id === detail.set.ownerId} loggedIn={!!user} />
      <MixComments setId={detail.set.id} currentUserId={user?.id ?? null} />
    </>
  );
}
