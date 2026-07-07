"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { useT } from "@/components/i18n-provider";

type ConfirmOptions = { message: string; confirmLabel?: string; danger?: boolean };
type ConfirmFn = (opts: string | ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn>(async () => false);

/** 파괴적 액션 확인용 공용 다이얼로그(UX-9). `const confirm = useConfirm(); if (await confirm(...)) {...}` */
export function useConfirm() {
  return useContext(ConfirmContext);
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const t = useT();
  const [state, setState] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((v: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((opts) => {
    setState(typeof opts === "string" ? { message: opts } : opts);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const settle = (v: boolean) => {
    setState(null);
    resolver.current?.(v);
    resolver.current = null;
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Dialog open={state !== null} onClose={() => settle(false)} labelledBy="confirm-dialog-message" panelClassName="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl outline-none dark:bg-zinc-950">
        <p id="confirm-dialog-message" className="whitespace-pre-line text-sm text-zinc-800 dark:text-zinc-100">
          {state?.message}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => settle(false)}
            className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            {t("취소")}
          </button>
          <button
            type="button"
            onClick={() => settle(true)}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
              state?.danger ? "bg-red-500 hover:bg-red-600" : "bg-zinc-900 hover:bg-zinc-700 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200"
            }`}
          >
            {state?.confirmLabel ?? t("확인")}
          </button>
        </div>
      </Dialog>
    </ConfirmContext.Provider>
  );
}
