import { getNotificationPrefs } from "@/lib/api";
import { NotificationSettings } from "@/components/settings/notification-settings";
import { getT } from "@/lib/i18n-server";

export default async function NotificationsTabPage() {
  const prefs = await getNotificationPrefs();
  // 조회 실패 시 기본값(전부 on)을 진짜 설정처럼 보여주지 않고 오류를 명시(NON-224).
  if (!prefs) {
    const t = await getT();
    return <p className="text-sm text-zinc-500">{t("일시적인 오류가 발생했습니다.")}</p>;
  }
  return <NotificationSettings initial={prefs} />;
}
