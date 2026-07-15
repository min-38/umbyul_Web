import type { ReactElement, ReactNode } from "react";

// 헤더 인라인 네비(lg+)와 하단 탭바(<lg)가 공유하는 단일 정의.
// 피드=홈 리뷰 타임라인(로고로도 진입). 발견=신규·급상승 허브, 차트=랭킹, 믹스=DJ 세트.

type IconProps = { className?: string };
type Icon = (props: IconProps) => ReactElement;

const icon = (children: ReactNode): Icon =>
  function NavIcon({ className }: IconProps) {
    return (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={className}
      >
        {children}
      </svg>
    );
  };

const HomeIcon = icon(<path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />);
const CompassIcon = icon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="m15.5 8.5-2.1 5-5 2.1 2.1-5z" />
  </>,
);
const ChartIcon = icon(<path d="M18 20V10M12 20V4M6 20v-6" />);
const MixIcon = icon(
  <>
    <path d="M21 15V6M16 6H3M12 12H3M12 18H3" />
    <circle cx="18.5" cy="15.5" r="2.5" />
  </>,
);

export type NavItem = { label: string; href: string; Icon: Icon };

export const NAV: NavItem[] = [
  { label: "피드", href: "/", Icon: HomeIcon },
  { label: "발견", href: "/discover", Icon: CompassIcon },
  { label: "차트", href: "/chart", Icon: ChartIcon },
  { label: "믹스", href: "/mixes", Icon: MixIcon },
];

export const isActive = (pathname: string, href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
