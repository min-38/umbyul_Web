import type { NextConfig } from "next";

// 전 응답 공통 보안 헤더(NON-255). script/style-src CSP 는 Next 하이드레이션 인라인 스크립트 nonce 연동이
// 필요해 별도 과제로 분리 — 여기서는 클릭재킹(frame-ancestors)·HSTS·MIME 스니핑·리퍼러·권한만 우선.
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
];

const nextConfig: NextConfig = {
  // 상위 디렉토리의 떠도는 package-lock.json 때문에 Next가 워크스페이스 루트를
  // 잘못 추론하는 것을 방지 — 이 web 폴더를 루트로 고정한다.
  turbopack: {
    root: __dirname,
  },
  // OG 이미지 라우트가 fs로 읽는 폰트 파일을 프로덕션 번들(Vercel/standalone)에 포함.
  outputFileTracingIncludes: {
    "/opengraph-image": ["./app/_fonts/**"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
