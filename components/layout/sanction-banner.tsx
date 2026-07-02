import { getMySanction } from "@/lib/api";
import { getT, getLocale } from "@/lib/i18n-server";

// 정지/영구정지 상태를 상단 배너로 노출(NON-55). 경고는 알림으로 전달(NON-58).
// 제재 없으면 아무것도 렌더하지 않음.
export async function SanctionBanner() {
  const s = await getMySanction();
  if (!s || (!s.banned && !s.suspendedUntil)) return null;

  const t = await getT();
  const locale = await getLocale();

  let text: string;
  if (s.banned) {
    text = t("계정이 영구 정지되어 작성이 제한됩니다.");
  } else {
    const until = new Date(s.suspendedUntil!).toLocaleString(locale === "ko" ? "ko-KR" : "en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
    text = t("{until}까지 이용이 정지되어 작성이 제한됩니다.", { until });
  }

  return (
    <div
      className={`w-full px-4 py-2 text-center text-sm ${
        s.banned ? "bg-red-600 text-white" : "bg-amber-500 text-black"
      }`}
    >
      <span className="font-medium">{text}</span>
      {s.reason ? <span className="opacity-80"> · {t("사유")}: {s.reason}</span> : null}
    </div>
  );
}
