import { notFound } from "next/navigation";
import { getUserProfile } from "@/lib/api";
import { ProfileReviews } from "@/components/profile/profile-reviews";

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const profile = await getUserProfile(username);
  if (!profile) notFound();

  const joined = new Date(profile.joinedAt).toLocaleDateString("ko-KR");

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8">
      <div className="flex items-center gap-5">
        <span className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-zinc-200 text-2xl font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            profile.username.charAt(0).toUpperCase()
          )}
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{profile.username}</h1>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-500">
            <span>
              <b className="text-zinc-800 dark:text-zinc-200">{profile.reviewCount}</b> 리뷰
            </span>
            <span>
              <b className="text-zinc-800 dark:text-zinc-200">{profile.totalLikes}</b> 받은 좋아요
            </span>
            <span>가입 {joined}</span>
          </div>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">작성한 리뷰</h2>
        <ProfileReviews reviews={profile.reviews} />
      </section>
    </div>
  );
}
