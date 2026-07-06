import { LegalDoc } from "@/components/legal/legal-doc";

export default async function TermsPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const { lang } = await searchParams;
  return <LegalDoc type="terms" langParam={lang} />;
}
