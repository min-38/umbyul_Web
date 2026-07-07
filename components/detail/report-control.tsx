"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitReport } from "@/app/actions/social";
import { msg } from "@/lib/messages";
import { Dialog } from "@/components/ui/dialog";
import { useT, useLocale } from "@/components/i18n-provider";

const REASONS = [
  { value: "not_music", label: "음악과 무관한 내용", for: ["rating", "comment", "set_comment", "set"] },
  { value: "inappropriate_profile", label: "부적절한 이름·프로필 사진", for: ["rating", "user"] },
  { value: "abuse", label: "악플·욕설", for: ["rating", "user", "comment", "set_comment", "set"] },
  { value: "other", label: "기타", for: ["rating", "user", "comment", "set_comment", "set"] },
] as const;

type ReportTarget = "rating" | "user" | "comment" | "set_comment" | "set";

export function ReportControl({
  targetType = "rating",
  targetId,
  loggedIn,
}: {
  targetType?: ReportTarget;
  targetId: string;
  loggedIn: boolean;
}) {
  const router = useRouter();
  const t = useT();
  const [open, setOpen] = useState(false);

  const openModal = () => {
    if (!loggedIn) {
      router.push("/login");
      return;
    }
    setOpen(true);
  };

  return (
    <>
      <button type="button" onClick={openModal} className="text-xs text-zinc-500 hover:text-red-500">
        {t("신고")}
      </button>
      <ReportDialog targetType={targetType} targetId={targetId} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

// 신고 모달(제어형). 메뉴(⋯) 등에서 열림 상태를 직접 관리해 재사용한다.
export function ReportDialog({
  targetType = "rating",
  targetId,
  open,
  onClose,
}: {
  targetType?: ReportTarget;
  targetId: string;
  open: boolean;
  onClose: () => void;
}) {
  const t = useT();
  const locale = useLocale();
  const [reason, setReason] = useState("");
  const [detail, setDetail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const close = () => {
    setError(null);
    onClose();
  };

  const submit = async () => {
    if (!reason) {
      setError(t("사유를 선택해주세요."));
      return;
    }
    setBusy(true);
    setError(null);
    const r = await submitReport({ targetType, targetId, reason, detail: detail.trim() || null });
    setBusy(false);
    if (r.ok) setDone(true);
    else setError(msg(r.code, locale));
  };

  return (
    <Dialog open={open} onClose={close} labelledBy="report-dialog-title" panelClassName="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl outline-none dark:bg-zinc-950">
      {done ? (
        <div className="flex flex-col gap-4 text-center">
          <p className="text-sm text-zinc-700 dark:text-zinc-200">{t("신고가 접수되었습니다.")}</p>
          <button
            type="button"
            onClick={close}
            className="self-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-black"
          >
            {t("닫기")}
          </button>
        </div>
      ) : (
        <>
          <h2 id="report-dialog-title" className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {targetType === "user"
              ? t("유저 신고")
              : targetType === "comment" || targetType === "set_comment"
                ? t("댓글 신고")
                : targetType === "set"
                  ? t("믹스 신고")
                  : t("리뷰 신고")}
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">{t("신고 내용은 운영자가 검토합니다.")}</p>

          <fieldset className="mt-4 flex flex-col gap-2">
                  {REASONS.filter((r) => (r.for as readonly string[]).includes(targetType)).map((r) => (
                    <label key={r.value} className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
                      <input
                        type="radio"
                        name="reason"
                        value={r.value}
                        checked={reason === r.value}
                        onChange={() => setReason(r.value)}
                        className="accent-indigo-600"
                      />
                      {t(r.label)}
                    </label>
                  ))}
                </fieldset>

                <textarea
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  placeholder={t("상세 내용 (선택)")}
                  rows={3}
                  maxLength={1000}
                  className="mt-3 w-full resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                />

                {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={close}
                    disabled={busy}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
                  >
                    {t("취소")}
                  </button>
                  <button
                    type="button"
                    onClick={submit}
                    disabled={busy}
                    className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
                  >
                    {busy ? t("접수 중…") : t("신고")}
                  </button>
          </div>
        </>
      )}
    </Dialog>
  );
}
