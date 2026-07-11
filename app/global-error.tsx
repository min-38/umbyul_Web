"use client";

// 루트 레이아웃/i18n 프로바이더에서 throw 시 최후 방어(app/error.tsx가 못 덮는 범위, NON-224).
// 이 경계는 레이아웃을 대체하므로 자체 <html>/<body>가 필요하고, i18n·Tailwind에 의존할 수 없어 인라인 스타일로.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          fontFamily: "system-ui, sans-serif",
          background: "#000",
          color: "#e4e4e7",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <p style={{ fontSize: "0.95rem", color: "#a1a1aa" }}>
          일시적인 오류가 발생했습니다.
          <br />
          Something went wrong. Please try again.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            border: "none",
            borderRadius: "0.5rem",
            background: "#4f46e5",
            color: "#fff",
            padding: "0.625rem 1.25rem",
            fontSize: "0.875rem",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          다시 시도 / Retry
        </button>
      </body>
    </html>
  );
}
