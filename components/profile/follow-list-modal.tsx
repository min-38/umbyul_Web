"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FollowUser } from "@/lib/api";
import { loadFollowers, loadFollowing, followUser, unfollowUser } from "@/app/actions/social";
import { Dialog } from "@/components/ui/dialog";
import { useT } from "@/components/i18n-provider";

export function FollowListModal({
  username,
  kind,
  loggedIn,
  myUsername,
  onFollowChange,
  onClose,
}: {
  username: string;
  kind: "followers" | "following";
  loggedIn: boolean;
  myUsername: string | null;
  onFollowChange?: (delta: number) => void; // 내가 목록에서 팔로우/언팔 → 내 팔로잉 수 변화
  onClose: () => void;
}) {
  const [users, setUsers] = useState<FollowUser[] | null>(null);
  const t = useT();

  useEffect(() => {
    (kind === "followers" ? loadFollowers : loadFollowing)(username).then(setUsers);
  }, [username, kind]);

  return (
    <Dialog open onClose={onClose} labelledBy="follow-list-title" panelClassName="flex max-h-[70vh] w-full max-w-sm flex-col rounded-2xl bg-white p-5 shadow-xl outline-none dark:bg-zinc-950">
      <h2 id="follow-list-title" className="mb-3 text-base font-semibold text-zinc-900 dark:text-zinc-50">
        {kind === "followers" ? t("팔로워") : t("팔로잉")}
      </h2>
      {users === null ? (
        <p className="py-8 text-center text-sm text-zinc-400">{t("불러오는 중…")}</p>
      ) : users.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-400">{t("아직 없습니다.")}</p>
      ) : (
        <ul className="flex flex-col gap-1 overflow-y-auto">
          {users.map((u) => (
            <FollowRow key={u.username} user={u} loggedIn={loggedIn} myUsername={myUsername} onFollowChange={onFollowChange} onNavigate={onClose} />
          ))}
        </ul>
      )}
    </Dialog>
  );
}

function FollowRow({
  user,
  loggedIn,
  myUsername,
  onFollowChange,
  onNavigate,
}: {
  user: FollowUser;
  loggedIn: boolean;
  myUsername: string | null;
  onFollowChange?: (delta: number) => void;
  onNavigate: () => void;
}) {
  const router = useRouter();
  const t = useT();
  const [following, setFollowing] = useState(user.isFollowing);
  const [busy, setBusy] = useState(false);
  const isMe = myUsername !== null && user.username.toLowerCase() === myUsername.toLowerCase();

  const toggle = async () => {
    if (!loggedIn) {
      router.push("/login");
      return;
    }
    setBusy(true);
    const r = following ? await unfollowUser(user.username) : await followUser(user.username);
    setBusy(false);
    if (r.ok) {
      onFollowChange?.(following ? -1 : 1);
      setFollowing(!following);
    }
  };

  return (
    <li className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-900">
      <Link href={`/u/${user.username}`} onClick={onNavigate} className="flex min-w-0 flex-1 items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-zinc-200 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            user.username.charAt(0).toUpperCase()
          )}
        </span>
        <span className="truncate text-sm text-zinc-800 dark:text-zinc-100">{user.username}</span>
      </Link>
      {!isMe && (
        <button
          type="button"
          onClick={toggle}
          disabled={busy}
          className={`shrink-0 rounded-lg px-3 py-1 text-xs font-medium disabled:opacity-50 ${
            following
              ? "border border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"
              : "bg-indigo-600 text-white hover:bg-indigo-500"
          }`}
        >
          {following ? t("팔로잉") : t("팔로우")}
        </button>
      )}
    </li>
  );
}
