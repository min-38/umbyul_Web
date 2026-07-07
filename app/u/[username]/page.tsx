import { notFound } from "next/navigation";
import { getUserProfile, getProfile, getUserSets } from "@/lib/api";
import { getT } from "@/lib/i18n-server";
import { ProfileReviews } from "@/components/profile/profile-reviews";
import { ProfileSets } from "@/components/profile/profile-sets";
import { ProfileSocial } from "@/components/profile/profile-social";
import { ProfileMenu } from "@/components/profile/profile-menu";

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const [profile, me, sets, t] = await Promise.all([getUserProfile(username), getProfile(), getUserSets(username), getT()]);
  if (!profile) notFound();

  const loggedIn = me !== null;
  const isSelf = me !== null && me.username.toLowerCase() === profile.username.toLowerCase();

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8">
      <div className="flex items-start gap-5">
        <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-200 text-2xl font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            profile.username.charAt(0).toUpperCase()
          )}
        </span>
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{profile.username}</h1>
            {!isSelf && (
              <ProfileMenu username={profile.username} targetId={profile.id} loggedIn={loggedIn} blocked={profile.blocked} />
            )}
          </div>
          <ProfileSocial
            username={profile.username}
            isSelf={isSelf}
            loggedIn={loggedIn}
            myUsername={me?.username ?? null}
            followerCount={profile.followerCount}
            followingCount={profile.followingCount}
            isFollowing={profile.isFollowing}
          />
        </div>
      </div>

      {profile.blocked ? (
        <p className="mt-10 rounded-xl border border-dashed border-zinc-300 px-6 py-16 text-center text-sm text-zinc-500 dark:border-zinc-700">
          {t("차단한 사용자입니다. 리뷰를 보려면 차단을 해제하세요.")}
        </p>
      ) : (
        <>
          <ProfileSets sets={sets} isSelf={isSelf} />
          <section className="mt-10">
            <div className="mb-4 flex items-baseline gap-3">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {t("작성한 리뷰")}<span className="text-zinc-500">({profile.reviewCount.toLocaleString()})</span>
              </h2>
              <span className="text-sm text-zinc-500">{t("받은 좋아요 {count}", { count: profile.totalLikes.toLocaleString() })}</span>
            </div>
            <ProfileReviews reviews={profile.reviews} />
          </section>
        </>
      )}
    </div>
  );
}
