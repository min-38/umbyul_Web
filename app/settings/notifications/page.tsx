import { getNotificationPrefs } from "@/lib/api";
import { NotificationSettings } from "@/components/settings/notification-settings";

export default async function NotificationsTabPage() {
  const prefs = await getNotificationPrefs();
  return <NotificationSettings initial={prefs} />;
}
