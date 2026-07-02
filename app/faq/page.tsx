import { getFaq } from "@/lib/api";
import { getLocale, getT } from "@/lib/i18n-server";
import { FaqView } from "@/components/faq/faq-view";

export default async function FaqPage() {
  const locale = await getLocale();
  const t = await getT();
  const items = await getFaq(locale);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-50">{t("자주 묻는 질문")}</h1>
      <FaqView items={items} />
    </div>
  );
}
