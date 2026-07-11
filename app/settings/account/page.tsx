import { createClient } from "@/lib/supabase/server";
import { getProfile, getMyDemographics, getGenres, getMyGenrePreferences, getLevelVisibility } from "@/lib/api";
import { AccountSettings } from "@/components/settings/account-settings";
import { GenrePreferences } from "@/components/settings/genre-preferences";
import { LevelVisibility } from "@/components/settings/level-visibility";

export default async function AccountTabPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [profile, demographics, genres, genrePrefs, levelHidden] = await Promise.all([
    getProfile(),
    getMyDemographics(),
    getGenres(),
    getMyGenrePreferences(),
    getLevelVisibility(),
  ]);
  if (!user || !profile) return null; // 인증은 settings/layout 에서 게이트

  const identities = user.identities ?? [];
  const hasPassword = identities.some((i) => i.provider === "email");
  const providers = Array.from(new Set(identities.map((i) => i.provider ?? "").filter(Boolean)));

  return (
    <AccountSettings
      initialUsername={profile.username}
      initialEmail={user.email ?? ""}
      initialAvatarUrl={profile.avatarUrl}
      hasPassword={hasPassword}
      joinedAt={profile.createdAt}
      providers={providers}
      initialCountry={demographics?.country ?? profile.country ?? "KR"}
      initialGender={demographics?.gender ?? null}
      initialBirthDate={demographics?.birthDate ?? null}
      demographicsCanChangeAt={demographics?.canChangeAt ?? null}
      // 선호 장르는 기본 정보 바로 아래에 렌더되도록 슬롯으로 전달(NON-162).
      genreSection={genres.length > 0 ? <GenrePreferences genres={genres} initial={genrePrefs} /> : null}
      privacySection={<LevelVisibility initialHidden={levelHidden} />}
    />
  );
}
