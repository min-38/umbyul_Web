"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MeatballMenu } from "@/components/ui/meatball-menu";
import { ReportDialog } from "@/components/detail/report-control";
import { blockUser, unblockUser } from "@/app/actions/social";
import { useT } from "@/components/i18n-provider";

// 프로필 ⋯메뉴(NON-116): 차단/차단 해제 + 신고. 본인/비로그인엔 렌더 안 함(호출부 게이팅).
export function ProfileMenu({
  username,
  targetId,
  loggedIn,
  blocked,
}: {
  username: string;
  targetId: string;
  loggedIn: boolean;
  blocked: boolean;
}) {
  const t = useT();
  const router = useRouter();
  const [reportOpen, setReportOpen] = useState(false);

  const toggleBlock = async () => {
    if (!loggedIn) {
      router.push("/login");
      return;
    }
    if (!blocked && !window.confirm(t("이 사용자를 차단할까요?"))) return; // 차단은 확인 후(UX-3)
    const r = blocked ? await unblockUser(username) : await blockUser(username);
    if (r.ok) router.refresh();
  };

  const openReport = () => {
    if (!loggedIn) {
      router.push("/login");
      return;
    }
    setReportOpen(true);
  };

  const items = [
    { label: blocked ? t("차단 해제") : t("차단"), onSelect: toggleBlock, danger: !blocked },
    { label: t("신고"), onSelect: openReport, danger: true },
  ];

  return (
    <>
      <MeatballMenu items={items} label={t("더보기")} />
      <ReportDialog targetType="user" targetId={targetId} open={reportOpen} onClose={() => setReportOpen(false)} />
    </>
  );
}
