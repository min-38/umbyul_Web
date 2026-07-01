import Link from "next/link";

// 실제 페이지는 추후 → 플레이스홀더(#)
const POLICY = [
  { label: "이용약관", href: "#" },
  { label: "개인정보 처리방침", href: "#" },
];
const INFO = [
  { label: "FAQ", href: "#" },
  { label: "문의", href: "#" },
];

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:flex-row sm:justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-zinc-500">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">서비스명</span> v1.0
          </p>
          <a
            href="https://www.spotify.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            <SpotifyLogo />
            Powered by Spotify
          </a>
        </div>
        <div className="flex gap-12">
          <FooterCol title="정책" links={POLICY} />
          <FooterCol title="고객지원" links={INFO} />
        </div>
      </div>
    </footer>
  );
}

function SpotifyLogo() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#1DB954" aria-hidden="true">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.561.3z" />
    </svg>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      <h4 className="text-xs font-medium text-zinc-500">{title}</h4>
      {links.map((l) => (
        <Link key={l.label} href={l.href} className="text-sm text-zinc-600 hover:underline dark:text-zinc-400">
          {l.label}
        </Link>
      ))}
    </div>
  );
}
