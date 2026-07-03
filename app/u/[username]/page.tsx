import { notFound } from "next/navigation";
import { getUserProfile, getProfile } from "@/lib/api";
import { getT } from "@/lib/i18n-server";
import { ProfileReviews } from "@/components/profile/profile-reviews";
import { ProfileSocial } from "@/components/profile/profile-social";
import { ReportControl } from "@/components/detail/report-control";

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const [profile, me, t] = await Promise.all([getUserProfile(username), getProfile(), getT()]);
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
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{profile.username}</h1>
          <ProfileSocial
            username={profile.username}
            isSelf={isSelf}
            loggedIn={loggedIn}
            myUsername={me?.username ?? null}
            followerCount={profile.followerCount}
            followingCount={profile.followingCount}
            isFollowing={profile.isFollowing}
          />
          {!isSelf && (
            <div>
              <ReportControl targetType="user" targetId={profile.id} loggedIn={loggedIn} />
            </div>
          )}
        </div>
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-baseline gap-3">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {t("작성한 리뷰")}<span className="text-zinc-400">({profile.reviewCount.toLocaleString()})</span>
          </h2>
          <span className="text-sm text-zinc-400">{t("받은 좋아요 {count}", { count: profile.totalLikes.toLocaleString() })}</span>
        </div>
        <ProfileReviews reviews={profile.reviews} />
      </section>
    </div>
  );
}
