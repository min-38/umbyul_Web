"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { FaqItem } from "@/lib/api";
import { useT } from "@/components/i18n-provider";

// 공개 FAQ: 카테고리별 그룹 + 아코디언(접기) + 키워드 검색(NON-75).
export function FaqView({ items }: { items: FaqItem[] }) {
  const t = useT();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const query = q.trim().toLowerCase();
  const filtered = query
    ? items.filter((i) => `${i.question} ${i.answer} ${i.category}`.toLowerCase().includes(query))
    : items;

  // 카테고리별 그룹(순서 보존).
  const groups: { category: string; items: FaqItem[] }[] = [];
  for (const item of filtered) {
    const cat = item.category || "";
    let g = groups.find((x) => x.category === cat);
    if (!g) {
      g = { category: cat, items: [] };
      groups.push(g);
    }
    g.items.push(item);
  }

  return (
    <div className="flex flex-col gap-6">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t("검색")}
        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      />

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 px-6 py-10 text-center text-sm text-zinc-500 dark:border-zinc-700">
          {query ? t("검색 결과가 없습니다.") : t("등록된 질문이 없습니다.")}
        </p>
      ) : (
        groups.map((g) => (
          <section key={g.category || "_"} className="flex flex-col gap-2">
            {g.category ? (
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">{g.category}</h2>
            ) : null}
            <ul className="flex flex-col divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
              {g.items.map((item) => {
                const isOpen = open === item.question;
                return (
                  <li key={item.question}>
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : item.question)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:text-zinc-100 dark:hover:bg-zinc-900/50"
                    >
                      <span>{item.question}</span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className={`shrink-0 text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
                        aria-hidden="true"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </button>
                    {isOpen ? (
                      <div className="px-4 pb-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: (p) => <p className="mt-2 first:mt-0" {...p} />,
                            ul: (p) => <ul className="mt-2 list-disc space-y-1 pl-5" {...p} />,
                            ol: (p) => <ol className="mt-2 list-decimal space-y-1 pl-5" {...p} />,
                            a: (p) => <a className="text-indigo-600 hover:underline dark:text-indigo-400" {...p} />,
                            strong: (p) => <strong className="font-semibold text-zinc-800 dark:text-zinc-100" {...p} />,
                          }}
                        >
                          {item.answer}
                        </ReactMarkdown>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
