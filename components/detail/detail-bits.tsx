// 상세 페이지 공용 조각: 메타 행, 저작권(copyrights), Spotify 링크백(컴플라이언스).

export function Copyright({ text }: { text: string | null }) {
  if (!text) return null;
  return <p className="mt-3 text-xs leading-relaxed text-zinc-400">{text}</p>;
}

export function MetaRow({ items }: { items: { label: string; value: string }[] }) {
  return (
    <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-zinc-200 pt-6 sm:grid-cols-3 dark:border-zinc-800">
      {items.map((it) => (
        <div key={it.label} className="flex flex-col gap-1">
          <dt className="text-xs text-zinc-400">{it.label}</dt>
          <dd className="text-sm text-zinc-800 dark:text-zinc-200">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}

// Spotify Developer Policy: 콘텐츠 출처를 Spotify로 링크백.
export function SpotifyLink({ url, label }: { url: string; label: string }) {
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="inline-flex text-[#1DB954] hover:opacity-80"
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.561.3z" />
      </svg>
    </a>
  );
}
