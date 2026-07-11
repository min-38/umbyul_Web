"use client";
import { onImageError } from "@/lib/image";

import { useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateUsername, uploadAvatar, deleteAccount, exportMyData, updateDemographics } from "@/app/actions/account";
import { msg, authMessage } from "@/lib/messages";
import { isUsername } from "@/lib/validation";
import { dateLocale } from "@/lib/format";
import { COUNTRY_CODES } from "@/lib/countries";
import { GENDERS } from "@/lib/demographics";
import { resizeAvatar } from "@/lib/avatar-resize";
import { PasswordInput } from "@/components/ui/password-input";
import { Dialog } from "@/components/ui/dialog";
import { useT, useLocale } from "@/components/i18n-provider";

type Note = { ok: boolean; text: string } | null;

const PROVIDER_LABELS: Record<string, string> = {
  email: "이메일",
  google: "Google",
  discord: "Discord",
};

// 생년월일 선택 옵션(만 14세 이상). 온보딩과 동일 규칙.
const BIRTH_YEARS = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - 14 - i);
const BIRTH_MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const BIRTH_DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

function parseBirth(s: string | null): { y: string; m: string; d: string } {
  if (!s) return { y: "", m: "", d: "" };
  const [y, m, d] = s.split("-");
  return { y: y ?? "", m: m ? String(Number(m)) : "", d: d ? String(Number(d)) : "" };
}

// 유효한 날짜면 yyyy-MM-dd, 아니면 null (온보딩 buildBirth와 동일).
function buildBirth(y: string, m: string, d: string): string | null {
  if (!y || !m || !d) return null;
  const dt = new Date(Number(y), Number(m) - 1, Number(d));
  if (dt.getFullYear() !== Number(y) || dt.getMonth() !== Number(m) - 1 || dt.getDate() !== Number(d)) return null;
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

export function AccountSettings({
  initialUsername,
  initialEmail,
  initialAvatarUrl,
  hasPassword,
  joinedAt,
  providers,
  initialCountry,
  initialGender,
  initialBirthDate,
  demographicsCanChangeAt,
  genreSection,
}: {
  initialUsername: string;
  initialEmail: string;
  initialAvatarUrl: string | null;
  hasPassword: boolean;
  joinedAt: string;
  providers: string[];
  initialCountry: string;
  initialGender: string | null;
  initialBirthDate: string | null;
  demographicsCanChangeAt: string | null;
  // 선호 장르 섹션 — 기본 정보 바로 아래에 렌더(NON-162).
  genreSection?: React.ReactNode;
}) {
  const t = useT();
  const locale = useLocale();
  // 아바타
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarNote, setAvatarNote] = useState<Note>(null);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setAvatarBusy(true);
    setAvatarNote(null);
    const resized = await resizeAvatar(f); // 업로드 전 256px webp로 축소(NON-106)
    const fd = new FormData();
    fd.append("file", resized, resized.type === "image/webp" ? "avatar.webp" : f.name);
    const r = await uploadAvatar(fd);
    setAvatarBusy(false);
    if (r.ok && r.avatarUrl) {
      setAvatarUrl(r.avatarUrl);
      setAvatarNote({ ok: true, text: t("변경되었습니다.") });
    } else {
      setAvatarNote({ ok: false, text: msg(r.code, locale) });
    }
  };

  // 닉네임
  const [username, setUsername] = useState(initialUsername);
  const [nickBusy, setNickBusy] = useState(false);
  const [nickNote, setNickNote] = useState<Note>(null);

  const saveNick = async () => {
    if (!isUsername(username)) {
      setNickNote({ ok: false, text: t("username 형식(2~30자, 영문/숫자/하이픈)을 확인하세요.") });
      return;
    }
    setNickBusy(true);
    setNickNote(null);
    const r = await updateUsername(username);
    setNickBusy(false);
    setNickNote(r.ok ? { ok: true, text: t("변경되었습니다.") } : { ok: false, text: msg(r.code, locale) });
  };

  // 비밀번호
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [pwBusy, setPwBusy] = useState(false);
  const [pwNote, setPwNote] = useState<Note>(null);

  const savePw = async () => {
    if (pw.length < 8) return setPwNote({ ok: false, text: t("비밀번호는 8자 이상이어야 합니다.") });
    if (pw !== pw2) return setPwNote({ ok: false, text: t("비밀번호가 일치하지 않습니다.") });
    setPwBusy(true);
    setPwNote(null);
    const { error } = await createClient().auth.updateUser({ password: pw });
    setPwBusy(false);
    if (error) return setPwNote({ ok: false, text: authMessage(error, locale) });
    setPw("");
    setPw2("");
    setPwNote({ ok: true, text: hasPassword ? t("변경되었습니다.") : t("설정되었습니다.") });
  };

  // 이메일 변경 — Supabase가 새 주소로 확인 메일 발송(링크 눌러야 확정)
  const [email, setEmail] = useState(initialEmail);
  const [emailBusy, setEmailBusy] = useState(false);
  const [emailNote, setEmailNote] = useState<Note>(null);

  const saveEmail = async () => {
    const next = email.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(next)) return setEmailNote({ ok: false, text: t("이메일 형식을 확인하세요.") });
    if (next === initialEmail) return;
    setEmailBusy(true);
    setEmailNote(null);
    const { error } = await createClient().auth.updateUser({ email: next });
    setEmailBusy(false);
    if (error) return setEmailNote({ ok: false, text: authMessage(error, locale) });
    setEmailNote({ ok: true, text: t("새 이메일로 확인 메일을 보냈습니다. 링크를 눌러야 변경이 완료됩니다.") });
  };

  // 국가·성별·생년월일 정정(LEG-11) — 잦은 변경 방지 쿨다운(셋을 한 번에 저장)
  const initBirth = parseBirth(initialBirthDate);
  const [country, setCountry] = useState(initialCountry);
  const [gender, setGender] = useState(initialGender ?? "");
  const [birthY, setBirthY] = useState(initBirth.y);
  const [birthM, setBirthM] = useState(initBirth.m);
  const [birthD, setBirthD] = useState(initBirth.d);
  const [demoBusy, setDemoBusy] = useState(false);
  const [demoNote, setDemoNote] = useState<Note>(null);
  const countries = useMemo(() => {
    const dn = new Intl.DisplayNames([locale], { type: "region" });
    return COUNTRY_CODES.map((code) => ({ code, name: dn.of(code) ?? code })).sort((a, b) => a.name.localeCompare(b.name, locale));
  }, [locale]);
  const cooldownUntil = demographicsCanChangeAt ? new Date(demographicsCanChangeAt) : null;
  const inCooldown = cooldownUntil ? cooldownUntil.getTime() > Date.now() : false;
  const builtBirth = buildBirth(birthY, birthM, birthD);
  const demoChanged =
    country !== initialCountry || (gender || null) !== (initialGender ?? null) || builtBirth !== initialBirthDate;

  const saveDemo = async () => {
    if (!builtBirth) return setDemoNote({ ok: false, text: t("생년월일을 확인하세요.") });
    setDemoBusy(true);
    setDemoNote(null);
    const r = await updateDemographics(country, gender || null, builtBirth);
    setDemoBusy(false);
    setDemoNote(r.ok ? { ok: true, text: t("변경되었습니다.") } : { ok: false, text: msg(r.code, locale) });
  };
  const selectClass =
    "rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

  // 데이터 내보내기 — JSON 다운로드
  const [exportBusy, setExportBusy] = useState(false);
  const [exportNote, setExportNote] = useState<Note>(null);

  const doExport = async () => {
    setExportBusy(true);
    setExportNote(null);
    const r = await exportMyData();
    setExportBusy(false);
    if (!r.ok || !r.data) return setExportNote({ ok: false, text: msg(r.code, locale) });
    const blob = new Blob([JSON.stringify(r.data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `glitter-${initialUsername}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportNote({ ok: true, text: t("내보내기 파일을 저장했습니다.") });
  };

  // 탈퇴 — 버튼 → 모달(NON-162). 사용자명 타입-투-컨펌(OAuth·이메일 공통, 실수 방지) (LEG-15)
  const [delOpen, setDelOpen] = useState(false);
  const [delBusy, setDelBusy] = useState(false);
  const [delConfirm, setDelConfirm] = useState("");
  const delReady = delConfirm.trim() === initialUsername;
  const closeDel = () => {
    if (delBusy) return;
    setDelOpen(false);
    setDelConfirm("");
  };
  const doDelete = async () => {
    if (!delReady) return;
    setDelBusy(true);
    const r = await deleteAccount();
    if (r.ok) window.location.href = "/";
    else {
      setDelBusy(false);
      alert(msg(r.code, locale));
    }
  };

  return (
    <div className="flex flex-col gap-10">
      {/* 계정 정보: 가입일 + 연동 계정 */}
      <Section title={t("계정 정보")}>
        <dl className="flex flex-col gap-3 text-sm">
          <div className="flex gap-3">
            <dt className="w-20 shrink-0 text-zinc-500">{t("가입일")}</dt>
            <dd className="text-zinc-800 dark:text-zinc-200">{new Date(joinedAt).toLocaleDateString(dateLocale(locale))}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-20 shrink-0 text-zinc-500">{t("연동 계정")}</dt>
            <dd className="flex flex-wrap items-start gap-1.5">
              {providers.length === 0 ? (
                <span className="text-zinc-500">-</span>
              ) : (
                providers.map((p) => (
                  <span
                    key={p}
                    className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                  >
                    {PROVIDER_LABELS[p] ? t(PROVIDER_LABELS[p]) : p}
                  </span>
                ))
              )}
            </dd>
          </div>
        </dl>
      </Section>

      {/* 아바타 */}
      <Section title={t("아바타")}>
        <div className="flex items-center gap-4">
          <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-200 text-2xl font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img onError={onImageError} src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              initialUsername.charAt(0).toUpperCase()
            )}
          </span>
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={avatarBusy}
              className="w-fit rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
            >
              {avatarBusy ? t("업로드 중…") : t("이미지 변경")}
            </button>
            <p className="text-xs text-zinc-500">{t("jpg, png, webp · 최대 5MB")}</p>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onFile} className="hidden" />
          </div>
        </div>
        <NoteText note={avatarNote} />
      </Section>

      {/* 닉네임 */}
      <Section title={t("닉네임")}>
        <div className="flex gap-2">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            aria-label={t("닉네임")}
            className="w-full max-w-xs rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
          <button
            type="button"
            onClick={saveNick}
            disabled={nickBusy || username === initialUsername}
            className="shrink-0 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200"
          >
            {t("변경")}
          </button>
        </div>
        <NoteText note={nickNote} />
      </Section>

      {/* 비밀번호 */}
      <Section title={hasPassword ? t("비밀번호 변경") : t("비밀번호 설정")}>
        {!hasPassword && (
          <p className="mb-2 text-xs text-zinc-500">
            {t("소셜 로그인 계정입니다. 비밀번호를 설정하면 이메일로도 로그인할 수 있습니다.")}
          </p>
        )}
        <div className="flex max-w-xs flex-col gap-2">
          <PasswordInput
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder={t("새 비밀번호")}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
          <PasswordInput
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            placeholder={t("새 비밀번호 확인")}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
          <button
            type="button"
            onClick={savePw}
            disabled={pwBusy || !pw || !pw2}
            className="w-fit rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200"
          >
            {hasPassword ? t("비밀번호 변경") : t("비밀번호 설정")}
          </button>
        </div>
        <NoteText note={pwNote} />
      </Section>

      {/* 이메일 변경 */}
      <Section title={t("이메일 변경")}>
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label={t("이메일 변경")}
            className="w-full max-w-xs rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
          <button
            type="button"
            onClick={saveEmail}
            disabled={emailBusy || email.trim() === initialEmail}
            className="shrink-0 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200"
          >
            {emailBusy ? t("처리 중…") : t("변경")}
          </button>
        </div>
        <p className="mt-1 text-xs text-zinc-500">{t("변경하려면 새 이메일로 온 확인 링크를 눌러야 합니다.")}</p>
        <NoteText note={emailNote} />
      </Section>

      {/* 국가·성별·생년월일 정정 (LEG-11) */}
      <Section title={t("기본 정보")}>
        <div className="flex max-w-xs flex-col gap-2">
          {/* 생년월일 */}
          <div className="flex gap-2">
            <select value={birthY} onChange={(e) => setBirthY(e.target.value)} disabled={inCooldown} aria-label={t("년")} className={`${selectClass} flex-1`}>
              <option value="">{t("년")}</option>
              {BIRTH_YEARS.map((y) => (<option key={y} value={y}>{y}</option>))}
            </select>
            <select value={birthM} onChange={(e) => setBirthM(e.target.value)} disabled={inCooldown} aria-label={t("월")} className={`${selectClass} flex-1`}>
              <option value="">{t("월")}</option>
              {BIRTH_MONTHS.map((m) => (<option key={m} value={m}>{m}</option>))}
            </select>
            <select value={birthD} onChange={(e) => setBirthD(e.target.value)} disabled={inCooldown} aria-label={t("일")} className={`${selectClass} flex-1`}>
              <option value="">{t("일")}</option>
              {BIRTH_DAYS.map((d) => (<option key={d} value={d}>{d}</option>))}
            </select>
          </div>
          <select value={country} onChange={(e) => setCountry(e.target.value)} disabled={inCooldown} aria-label={t("국가")} className={selectClass}>
            {countries.map(({ code, name }) => (
              <option key={code} value={code}>{name}</option>
            ))}
          </select>
          <select value={gender} onChange={(e) => setGender(e.target.value)} disabled={inCooldown} aria-label={t("성별")} className={selectClass}>
            <option value="">{t("성별 (선택)")}</option>
            {GENDERS.map((g) => (
              <option key={g.v} value={g.v}>{t(g.l)}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={saveDemo}
            disabled={demoBusy || inCooldown || !demoChanged}
            className="w-fit rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200"
          >
            {demoBusy ? t("처리 중…") : t("변경")}
          </button>
        </div>
        {inCooldown && cooldownUntil && (
          <p className="mt-2 text-xs text-zinc-500">
            {t("이 정보는 다음 날짜 이후 다시 변경할 수 있습니다.")} {cooldownUntil.toLocaleDateString(dateLocale(locale))}
          </p>
        )}
        <NoteText note={demoNote} />
      </Section>

      {/* 선호 장르 — 기본 정보 바로 아래(NON-162) */}
      {genreSection}

      {/* 데이터 내보내기 */}
      <Section title={t("데이터 내보내기")}>
        <p className="mb-2 text-xs text-zinc-500">{t("내 프로필·평가·팔로우·댓글을 JSON 파일로 내려받습니다.")}</p>
        <button
          type="button"
          onClick={doExport}
          disabled={exportBusy}
          className="w-fit rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          {exportBusy ? t("내보내는 중…") : t("JSON 내보내기")}
        </button>
        <NoteText note={exportNote} />
      </Section>

      {/* 탈퇴 — 제일 하단. 버튼 1개 → 모달(NON-162) */}
      <Section title={t("회원 탈퇴")}>
        <button
          type="button"
          onClick={() => setDelOpen(true)}
          className="w-fit rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
        >
          {t("회원 탈퇴")}
        </button>
      </Section>

      <Dialog open={delOpen} onClose={closeDel} labelledBy="del-account-title">
        <h2 id="del-account-title" className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          {t("회원 탈퇴")}
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{t("계정과 모든 데이터가 영구 삭제됩니다.")}</p>
        <p className="mb-1.5 mt-3 text-xs text-zinc-500">
          {t("확인을 위해 사용자명을 입력하세요")}: <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">{initialUsername}</code>
        </p>
        <input
          value={delConfirm}
          onChange={(e) => setDelConfirm(e.target.value)}
          autoComplete="off"
          aria-label={t("확인을 위해 사용자명을 입력하세요")}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-red-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={closeDel}
            disabled={delBusy}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            {t("취소")}
          </button>
          <button
            type="button"
            onClick={doDelete}
            disabled={delBusy || !delReady}
            className="shrink-0 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {delBusy ? t("처리 중…") : t("회원 탈퇴")}
          </button>
        </div>
      </Dialog>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</h3>
      {children}
    </section>
  );
}

function NoteText({ note }: { note: Note }) {
  if (!note) return null;
  return <p role={note.ok ? "status" : "alert"} className={`mt-2 text-sm ${note.ok ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>{note.text}</p>;
}
