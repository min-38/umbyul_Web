"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { followUser, unfollowUser } from "@/app/actions/social";
import { FollowListModal } from "./follow-list-modal";

export function ProfileSocial({
  username,
  isSelf,
  loggedIn,
  myUsername,
  followerCount,
  followingCount: initialFollowingCount,
  isFollowing,
}: {
  username: string;
  isSelf: boolean;
  loggedIn: boolean;
  myUsername: string | null;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
}) {
  const router = useRouter();
  const [following, setFollowing] = useState(isFollowing);
  const [followers, setFollowers] = useState(followerCount);
  const [followingCount, setFollowingCount] = useState(initialFollowingCount);
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState<null | "followers" | "following">(null);

  const toggle = async () => {
    if (!loggedIn) {
      router.push("/login");
      return;
    }
    setBusy(true);
    const r = following ? await unfollowUser(username) : await followUser(username);
    setBusy(false);
    if (r.ok) {
      setFollowing(!following);
      setFollowers((c) => c + (following ? -1 : 1));
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-500">
        <button type="button" onClick={() => setModal("followers")} className="hover:text-zinc-800 dark:hover:text-zinc-200">
          <b className="text-zinc-800 dark:text-zinc-200">{followers}</b> 팔로워
        </button>
        <button type="button" onClick={() => setModal("following")} className="hover:text-zinc-800 dark:hover:text-zinc-200">
          <b className="text-zinc-800 dark:text-zinc-200">{followingCount}</b> 팔로잉
        </button>
      </div>

      {isSelf ? (
        <Link
          href="/settings/account"
          className="w-fit rounded-lg border border-zinc-300 px-4 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          프로필 편집
        </Link>
      ) : (
        <button
          type="button"
          onClick={toggle}
          disabled={busy}
          className={`w-fit rounded-lg px-4 py-1.5 text-sm font-medium disabled:opacity-50 ${
            following
              ? "border border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
              : "bg-indigo-600 text-white hover:bg-indigo-500"
          }`}
        >
          {following ? "팔로잉" : "팔로우"}
        </button>
      )}

      {modal && (
        <FollowListModal
          username={username}
          kind={modal}
          loggedIn={loggedIn}
          myUsername={myUsername}
          onFollowChange={isSelf ? (d) => setFollowingCount((c) => c + d) : undefined}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
