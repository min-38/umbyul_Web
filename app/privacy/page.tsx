import { LegalDoc } from "@/components/legal/legal-doc";

export default async function PrivacyPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const { lang } = await searchParams;
  return <LegalDoc type="privacy" langParam={lang} />;
}
