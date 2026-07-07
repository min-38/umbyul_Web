import { getT } from "@/lib/i18n-server";

export default async function IntegrationsTabPage() {
  const t = await getT();
  return <p className="text-sm text-zinc-500">{t("준비 중입니다.")}</p>;
}
