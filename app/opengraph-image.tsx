import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// 전 페이지 기본 OG 이미지(각 상세 페이지가 자체 이미지로 override). 1200x630.
// About 히어로 시그니처: cosmic 우주 배경 + 그라디언트 워드마크 + 영문 태그라인.
// 앱 body 폰트가 Arial/Helvetica라(globals.css) 메트릭 호환 Arimo(700)로 맞춘다.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "UmByul — The more you rate, the brighter your record shines.";

// 워드마크 그라디언트 — /about 히어로 .glitter-text가 실제로 칠하는 색을 픽셀 샘플링해 그대로 재현.
// Satori는 radial+background-clip:text 합성을 제대로 못 해 매번 어긋났으므로, 샘플한 가로 색 진행
// (보라→페리윙클→하늘(가운데)→모브→핑크→보라)을 단일 linear 스톱으로 옮겨 안정적으로 렌더.
const WORDMARK_GRADIENT =
  "linear-gradient(100deg, #a276f4 0%, #b892f8 15%, #ba9df9 27%, #a0a7f9 40%, #a5c4f5 52%, #bba1e1 65%, #dc9dd8 78%, #bc90db 90%, #9985df 100%)";

// cosmic-bg(globals.css)와 동일 — 심연 남보라 + 성운.
const COSMIC =
  "radial-gradient(60% 45% at 20% 18%, rgba(168,85,247,0.28), transparent 70%), radial-gradient(55% 45% at 82% 30%, rgba(236,72,153,0.2), transparent 70%), radial-gradient(70% 55% at 55% 88%, rgba(56,189,248,0.2), transparent 70%), linear-gradient(180deg, #0a0620 0%, #0a0518 55%, #05030f 100%)";

// 별밭 — 결정적 좌표(1200x630 위에 흩뿌림).
const STARS: Array<[number, number, number, number]> = [
  [90, 70, 2, 0.9], [220, 140, 1.5, 0.7], [360, 60, 2, 1], [480, 180, 1.5, 0.6],
  [140, 300, 1.5, 0.8], [70, 470, 2, 0.85], [300, 420, 1.5, 0.7], [200, 540, 2, 0.9],
  [560, 340, 1.5, 0.6], [420, 500, 1.5, 0.75], [760, 90, 2, 0.9], [880, 200, 1.5, 0.7],
  [980, 120, 2, 1], [1120, 70, 1.5, 0.8], [1050, 260, 1.5, 0.65], [700, 220, 1.5, 0.7],
  [1140, 360, 2, 0.9], [820, 470, 1.5, 0.7], [960, 520, 2, 0.85], [1080, 470, 1.5, 0.75],
  [640, 560, 1.5, 0.7], [1180, 200, 1.5, 0.6], [520, 90, 1.5, 0.7], [340, 250, 1.5, 0.65],
];

export default async function OpengraphImage() {
  // Arimo(Arial 메트릭 호환) 700 번들 로드. Node 런타임이라 fetch(file://) 대신 fs로 읽는다.
  const arimo = await readFile(join(process.cwd(), "app", "_fonts", "Arimo-Bold.ttf"));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Arimo",
          backgroundColor: "#05030f",
          backgroundImage: COSMIC,
        }}
      >
        {STARS.map(([left, top, r, opacity], i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left,
              top,
              width: r * 2,
              height: r * 2,
              borderRadius: r,
              backgroundColor: "#ffffff",
              opacity,
            }}
          />
        ))}
        <div
          style={{
            fontSize: 168,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            backgroundImage: WORDMARK_GRADIENT,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          UmByul
        </div>
        <div
          style={{
            marginTop: 24,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            fontSize: 52,
            fontWeight: 700,
            lineHeight: 1.25,
            color: "#ffffff",
            textAlign: "center",
          }}
        >
          <div>The more you rate,</div>
          <div>the brighter your record shines.</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Arimo", data: arimo, weight: 700, style: "normal" }],
    },
  );
}
