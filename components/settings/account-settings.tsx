"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateUsername, uploadAvatar, deleteAccount } from "@/app/actions/account";
import { msg } from "@/lib/messages";
import { isUsername } from "@/lib/validation";

type Note = { ok: boolean; text: string } | null;

const PROVIDER_LABELS: Record<string, string> = {
  email: "이메일",
  google: "Google",
  discord: "Discord",
};

export function AccountSettings({
  initialUsername,
  initialAvatarUrl,
  hasPassword,
  joinedAt,
  providers,
}: {
  initialUsername: string;
  initialAvatarUrl: string | null;
  hasPassword: boolean;
  joinedAt: string;
  providers: string[];
}) {
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
    const fd = new FormData();
    fd.append("file", f);
    const r = await uploadAvatar(fd);
    setAvatarBusy(false);
    if (r.ok && r.avatarUrl) {
      setAvatarUrl(r.avatarUrl);
      setAvatarNote({ ok: true, text: "변경되었습니다." });
    } else {
      setAvatarNote({ ok: false, text: msg(r.code) });
    }
  };

  // 닉네임
  const [username, setUsername] = useState(initialUsername);
  const [nickBusy, setNickBusy] = useState(false);
  const [nickNote, setNickNote] = useState<Note>(null);

  const saveNick = async () => {
    if (!isUsername(username)) {
      setNickNote({ ok: false, text: "username 형식(2~30자, 영문/숫자/하이픈)을 확인하세요." });
      return;
    }
    setNickBusy(true);
    setNickNote(null);
    const r = await updateUsername(username);
    setNickBusy(false);
    setNickNote(r.ok ? { ok: true, text: "변경되었습니다." } : { ok: false, text: msg(r.code) });
  };

  // 비밀번호
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [pwBusy, setPwBusy] = useState(false);
  const [pwNote, setPwNote] = useState<Note>(null);

  const savePw = async () => {
    if (pw.length < 8) return setPwNote({ ok: false, text: "비밀번호는 8자 이상이어야 합니다." });
    if (pw !== pw2) return setPwNote({ ok: false, text: "비밀번호가 일치하지 않습니다." });
    setPwBusy(true);
    setPwNote(null);
    const { error } = await createClient().auth.updateUser({ password: pw });
    setPwBusy(false);
    if (error) return setPwNote({ ok: false, text: error.message });
    setPw("");
    setPw2("");
    setPwNote({ ok: true, text: hasPassword ? "변경되었습니다." : "설정되었습니다." });
  };

  // 탈퇴
  const [delBusy, setDelBusy] = useState(false);
  const doDelete = async () => {
    if (!window.confirm("정말 탈퇴하시겠어요?\n모든 데이터가 삭제되며 되돌릴 수 없습니다.")) return;
    setDelBusy(true);
    const r = await deleteAccount();
    if (r.ok) window.location.href = "/";
    else {
      setDelBusy(false);
      alert(msg(r.code));
    }
  };

  return (
    <div className="flex flex-col gap-10">
      {/* 계정 정보: 가입일 + 연동 계정 */}
      <Section title="계정 정보">
        <dl className="flex flex-col gap-3 text-sm">
          <div className="flex gap-3">
            <dt className="w-20 shrink-0 text-zinc-400">가입일</dt>
            <dd className="text-zinc-800 dark:text-zinc-200">{new Date(joinedAt).toLocaleDateString("ko-KR")}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-20 shrink-0 text-zinc-400">연동 계정</dt>
            <dd className="flex flex-wrap gap-1.5">
              {providers.length === 0 ? (
                <span className="text-zinc-500">-</span>
              ) : (
                providers.map((p) => (
                  <span
                    key={p}
                    className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                  >
                    {PROVIDER_LABELS[p] ?? p}
                  </span>
                ))
              )}
            </dd>
          </div>
        </dl>
      </Section>

      {/* 아바타 */}
      <Section title="아바타">
        <div className="flex items-center gap-4">
          <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-200 text-2xl font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
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
              {avatarBusy ? "업로드 중…" : "이미지 변경"}
            </button>
            <p className="text-xs text-zinc-400">jpg, png, webp · 최대 5MB</p>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onFile} className="hidden" />
          </div>
        </div>
        <NoteText note={avatarNote} />
      </Section>

      {/* 닉네임 */}
      <Section title="닉네임">
        <div className="flex gap-2">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full max-w-xs rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
          <button
            type="button"
            onClick={saveNick}
            disabled={nickBusy || username === initialUsername}
            className="shrink-0 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200"
          >
            변경
          </button>
        </div>
        <NoteText note={nickNote} />
      </Section>

      {/* 비밀번호 */}
      <Section title={hasPassword ? "비밀번호 변경" : "비밀번호 설정"}>
        {!hasPassword && (
          <p className="mb-2 text-xs text-zinc-400">
            소셜 로그인 계정입니다. 비밀번호를 설정하면 이메일로도 로그인할 수 있습니다.
          </p>
        )}
        <div className="flex max-w-xs flex-col gap-2">
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="새 비밀번호"
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
          <input
            type="password"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            placeholder="새 비밀번호 확인"
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
          <button
            type="button"
            onClick={savePw}
            disabled={pwBusy || !pw || !pw2}
            className="w-fit rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200"
          >
            {hasPassword ? "변경" : "설정"}
          </button>
        </div>
        <NoteText note={pwNote} />
      </Section>

      {/* 탈퇴 */}
      <Section title="회원 탈퇴">
        <p className="mb-2 text-xs text-zinc-400">계정과 모든 데이터가 영구 삭제됩니다.</p>
        <button
          type="button"
          onClick={doDelete}
          disabled={delBusy}
          className="w-fit rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
        >
          {delBusy ? "처리 중…" : "회원 탈퇴"}
        </button>
      </Section>
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
  return <p className={`mt-2 text-sm ${note.ok ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>{note.text}</p>;
}
