import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 상위 디렉토리의 떠도는 package-lock.json 때문에 Next가 워크스페이스 루트를
  // 잘못 추론하는 것을 방지 — 이 web 폴더를 루트로 고정한다.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
