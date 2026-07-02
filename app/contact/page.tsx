import { getT } from "@/lib/i18n-server";
import { ContactForm } from "@/components/contact/contact-form";

export default async function ContactPage() {
  const t = await getT();
  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{t("문의하기")}</h1>
      <p className="mb-6 mt-1 text-sm text-zinc-500">{t("답변은 입력하신 이메일로 보내드립니다.")}</p>
      <ContactForm />
    </div>
  );
}
