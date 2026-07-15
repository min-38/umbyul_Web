import { notFound } from "next/navigation";
import { getUserProfile, getProfile, getUserSets } from "@/lib/api";
import { getT } from "@/lib/i18n-server";
import { ProfileReviews } from "@/components/profile/profile-reviews";
import { ProfileSets } from "@/components/profile/profile-sets";
import { ProfileSocial } from "@/components/profile/profile-social";
import { ProfileMenu } from "@/components/profile/profile-menu";
import { LevelBadge } from "@/components/ui/level-badge";

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const [profile, me, sets, t] = await Promise.all([getUserProfile(username), getProfile(), getUserSets(username), getT()]);
  if (!profile) notFound();

  const loggedIn = me !== null;
  const isSelf = me !== null && me.username.toLowerCase() === profile.username.toLowerCase();

  // 리뷰어 레벨(NON-153) — 진행바(레벨업 시 0부터) + 가입 연·월.
  const pct = profile.xpForLevel > 0 ? Math.min(100, Math.round((profile.xpIntoLevel / profile.xpForLevel) * 100)) : 0;
  const xpToNext = Math.max(0, profile.xpForLevel - profile.xpIntoLevel);
  const joined = new Date(profile.joinedAt);
  const joinedFmt = `${joined.getFullYear()}.${String(joined.getMonth() + 1).padStart(2, "0")}`;

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
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <h1 className="truncate text-2xl font-bold text-zinc-900 dark:text-zinc-50">{profile.username}</h1>
              {/* 본인은 아래 경험치 카드가 레벨을 크게 보여줘 배지가 중복 → 타인에게만 노출. */}
              {!profile.blocked && !isSelf && <LevelBadge level={profile.level} size="md" />}
            </div>
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
          {/* 본인만: 경험치 강조(크게) — Edit Profile 위(req7). 남에겐 XP 숨기고 레벨만(req1). */}
          {isSelf && !profile.blocked && (
            <div className="flex flex-col gap-2 rounded-xl border border-zinc-200 p-3.5 dark:border-zinc-800">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Lv {profile.level}</span>
                <span className="text-sm text-zinc-500">{profile.xp.toLocaleString()} XP</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                <div className="h-full rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs text-zinc-500">{t("다음 레벨까지 {xp} XP", { xp: xpToNext.toLocaleString() })}</span>
            </div>
          )}
          {/* 공개 이력(모두 볼 수 있음, XP 아님): 리뷰·받은 좋아요·가입 */}
          {!profile.blocked && (
            <p className="text-xs text-zinc-500">
              {t("리뷰 {count}", { count: profile.reviewCount.toLocaleString() })}
              {" · "}
              {t("받은 좋아요 {count}", { count: profile.totalLikes.toLocaleString() })}
              {" · "}
              {t("가입일")} {joinedFmt}
            </p>
          )}
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
            </div>
            <ProfileReviews reviews={profile.reviews} />
          </section>
        </>
      )}
    </div>
  );
}
