import { getBlockedUsers } from "@/lib/api";
import { BlockedList } from "@/components/settings/blocked-list";

export default async function BlocksTabPage() {
  const blocked = await getBlockedUsers();
  return <BlockedList initial={blocked} />;
}
