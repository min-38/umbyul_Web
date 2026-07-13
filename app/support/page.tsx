import { getT } from "@/lib/i18n-server";

// 후원 페이지(NON-156). 직접 결제 X → 외부 플랫폼(Ko-fi) 링크아웃. 계좌 비노출.
// URL은 env(NEXT_PUBLIC_KOFI_URL) — 설정 전엔 버튼 대신 "곧 열립니다".
export default async function SupportPage() {
  const t = await getT();
  const kofi = process.env.NEXT_PUBLIC_KOFI_URL;

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{t("후원하기")}</h1>
      <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
        {t("음별은 한 사람이 운영하는 서비스입니다. 서버비(호스팅·스토리지)에 커피 한 잔이 큰 힘이 됩니다.")}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-zinc-500">
        {t("순수 후원이라 어떤 대가나 혜택도 없어요. 부담 갖지 마시고, 마음이 있으실 때만.")}
      </p>

      <div className="mt-8">
        {kofi ? (
          <a
            href={kofi}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200"
          >
            <span aria-hidden="true">☕</span>
            {t("Ko-fi에서 후원하기")}
          </a>
        ) : (
          <p className="text-sm text-zinc-500">{t("후원 창구는 곧 열립니다.")}</p>
        )}
      </div>

      <p className="mt-10 text-xs text-zinc-500">{t("결제·환불은 외부 후원 플랫폼에서 안전하게 처리됩니다.")}</p>
    </div>
  );
}
