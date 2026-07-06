"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { searchUsers, type UserHit } from "@/app/actions/mention";

// 커서 바로 앞의 @핸들 토큰(공백/줄머리 뒤 @영숫자). 없으면 null.
function activeMention(before: string): { start: number; query: string } | null {
  const m = before.match(/(?:^|\s)@([A-Za-z0-9-]*)$/);
  if (!m) return null;
  return { start: before.length - m[1].length - 1, query: m[1] };
}

/** @입력 시 유저 자동완성 드롭다운이 붙는 textarea (NON-131). */
export function MentionTextarea({
  value,
  onChange,
  placeholder,
  autoFocus,
  className,
  wrapperClassName,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
  wrapperClassName?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [hits, setHits] = useState<UserHit[]>([]);
  const [query, setQuery] = useState<string | null>(null); // null = 드롭다운 닫힘
  const [active, setActive] = useState(0);
  const tokenStart = useRef(0);
  const pendingCaret = useRef<number | null>(null);

  // 커서 위치 반영(치환 후).
  useLayoutEffect(() => {
    if (pendingCaret.current !== null && ref.current) {
      ref.current.selectionStart = ref.current.selectionEnd = pendingCaret.current;
      pendingCaret.current = null;
    }
  });

  // query 변경 시 디바운스 검색.
  useEffect(() => {
    if (query === null) return;
    if (query === "") {
      setHits([]);
      return;
    }
    let alive = true;
    const t = setTimeout(async () => {
      const r = await searchUsers(query);
      if (alive) {
        setHits(r);
        setActive(0);
      }
    }, 150);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [query]);

  const sync = (text: string, caret: number) => {
    const mention = activeMention(text.slice(0, caret));
    if (mention) {
      tokenStart.current = mention.start;
      setQuery(mention.query);
    } else {
      setQuery(null);
      setHits([]);
    }
  };

  const pick = (u: UserHit) => {
    const caret = ref.current?.selectionStart ?? value.length;
    const newBefore = value.slice(0, tokenStart.current) + `@${u.username} `;
    onChange(newBefore + value.slice(caret));
    pendingCaret.current = newBefore.length;
    setQuery(null);
    setHits([]);
  };

  const open = query !== null && hits.length > 0;

  return (
    <div className={`relative ${wrapperClassName ?? ""}`}>
      <textarea
        ref={ref}
        value={value}
        autoFocus={autoFocus}
        placeholder={placeholder}
        rows={1}
        maxLength={1000}
        onChange={(e) => {
          onChange(e.target.value);
          sync(e.target.value, e.target.selectionStart);
        }}
        onKeyDown={(e) => {
          if (!open) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((i) => (i + 1) % hits.length);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((i) => (i - 1 + hits.length) % hits.length);
          } else if (e.key === "Enter" || e.key === "Tab") {
            e.preventDefault();
            pick(hits[active]);
          } else if (e.key === "Escape") {
            setQuery(null);
          }
        }}
        onBlur={() => setTimeout(() => setQuery(null), 120)}
        className={className}
      />
      {open && (
        <ul className="absolute left-0 top-full z-20 mt-1 max-h-56 w-56 overflow-auto rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          {hits.map((u, i) => (
            <li key={u.id}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(u);
                }}
                className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm ${
                  i === active ? "bg-zinc-100 dark:bg-zinc-800" : ""
                }`}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-200 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">
                  {u.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={u.avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    u.username.charAt(0).toUpperCase()
                  )}
                </span>
                <span className="truncate text-zinc-800 dark:text-zinc-100">{u.username}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
