"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Reaction } from "@/lib/api";
import { toggleReaction, type ReactionState } from "@/app/actions/social";

function ThumbUp({ filled }: { filled: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <path d="M7 10v11M2 13v6a2 2 0 002 2h13.5a2 2 0 001.97-1.64l1.3-7A2 2 0 0019.8 10H14V4a2 2 0 00-2-2l-3 7v11" />
    </svg>
  );
}

export function ReactionBar({
  ratingId,
  loggedIn,
  initial,
}: {
  ratingId: string;
  loggedIn: boolean;
  initial: ReactionState;
}) {
  const router = useRouter();
  const [state, setState] = useState<ReactionState>(initial);
  const [pending, start] = useTransition();

  const react = (value: Reaction) => {
    if (!loggedIn) {
      router.push("/login");
      return;
    }
    start(async () => {
      const r = await toggleReaction({ ratingId, value });
      if (r.ok && r.data) setState(r.data);
    });
  };

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => react("like")}
        disabled={pending}
        aria-pressed={state.myReaction === "like"}
        className={`flex items-center gap-1 text-xs disabled:opacity-50 ${
          state.myReaction === "like"
            ? "text-indigo-600 dark:text-indigo-400"
            : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
        }`}
      >
        <ThumbUp filled={state.myReaction === "like"} />
        <span className="tabular-nums">{state.likeCount}</span>
      </button>
    </div>
  );
}
