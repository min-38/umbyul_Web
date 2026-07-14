#!/usr/bin/env node
// NON-118: t("한국어") 사용 인자 ↔ lib/i18n.ts EN 매핑 대조.
//  - MISSING(에러): 코드에서 t()로 쓰였지만 EN 맵에 없음 → 영어 로케일에서 한국어 노출.
//  - UNUSED(경고): EN 맵에 있지만 정적 t() 사용처가 없음(동적 사용은 감지 못하므로 경고만).
// 동적 인자(t(variable)·`${...}` 포함 템플릿)는 정적 리터럴이 아니라 자동 스킵(오탐 방지).
//
// 사용: node scripts/i18n-check.mjs   (누락 있으면 exit 1)

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SCAN_DIRS = ["app", "components"];
const EXT = /\.(tsx?|jsx?)$/;

// 예외 키: 동적 사용(t(변수) — 매핑 객체·배열 라벨)이라 정적 스캔에 안 잡히는 것들(QA7-5).
// 새 동적 키 추가 시 여기에 등재(진짜 dead 키는 삭제). 정적 스캔이 못 보는 매핑 소스:
//   about 피처(title/desc), THEME_LABELS, 정렬 라벨(SORTS/feed/mix/review), 차트 기간, 신고 사유,
//   설정 탭, PROVIDER_LABELS, notificationSuffix, footer 링크, 검색 카테고리 등.
const ALLOW = new Set([
  // 약관/개인정보 시행일 라벨 — t()가 아니라 translate(문서로케일, "시행일")로 사용(문서 언어 일치).
  "시행일",
  // /about feature 카드(동적 t(f.title)/t(f.desc), NON-272)
  "Spotify 카드",
  "방대한 Spotify 카탈로그에서 원하는 음악을 검색하세요.",
  "리뷰를 쓰고 댓글로 이야기 나누세요.\\n좋은 리뷰엔 좋아요를 눌러봐요.",
  "발견",
  "TODAY'S PICK·신규·추천 등 새로운 음악을 발견해보세요.",
  "차트",
  "가장 인기 있는 음악을 랭킹으로 확인하세요.",
  "나만의 플레이리스트를 공유하고, 다른 사람의 믹스도 둘러보세요.",
  "0.5점 단위 별점",
  "6자리 코드를 입력하세요.",
  "검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
  "검색어를 입력하세요.",
  "곡·앨범 평점이 시간에 따라 어떻게 움직이는지 그래프로 봐요.",
  "곡·앨범을 세밀하게 평가하고 나만의 기록을 남기세요.",
  "국가·성별",
  "님이 댓글에서 회원님을 언급했습니다",
  "님이 회원님을 팔로우했습니다",
  "님이 회원님의 리뷰를 좋아합니다",
  "다크",
  "더 보기",
  "라이트",
  "리뷰 & 댓글",
  "문의",
  "부적절한 이름·프로필 사진",
  "비공개",
  "시스템",
  "악플·욕설",
  "업적",
  "연동",
  "오늘의 음악",
  "유저",
  "유튜브 링크",
  "음악과 무관한 내용",
  "이 카테고리엔 결과가 없습니다.",
  "정보",
  "좋아요순",
  "주",
  "최근",
  "추이",
  "취향 팔로우",
  "취향이 맞는 유저를 팔로우하고 새 평가를 받아보세요.",
  "코드가 올바르지 않거나 만료되었습니다.",
  "트랙리스트",
  "평점순",
  "화면",
  "화제의 릴리스",
]);

// ── 1) 사전 키 추출 (lib/i18n.ts 의 EN/JA/ES 객체 블록) ──────────
const I18N_SRC = readFileSync(join(root, "lib/i18n.ts"), "utf8");
function extractDictKeys(marker) {
  const start = I18N_SRC.indexOf(marker);
  if (start === -1) return new Set();
  const open = I18N_SRC.indexOf("{", start);
  // 블록 끝: 최상위 닫는 중괄호(간단히 "\n};" 탐색).
  const end = I18N_SRC.indexOf("\n};", open);
  const block = I18N_SRC.slice(open + 1, end);

  const keys = new Set();
  for (let line of block.split("\n")) {
    line = line.trim();
    if (!line || line.startsWith("//")) continue;
    // 키 라인: "따옴표 키": ...  또는  바레워드키: ...  (값만 있는 연속 라인은 : 없음)
    const m = line.match(/^(?:"((?:\\.|[^"\\])*)"|([^\s:"'`{}]+))\s*:/);
    if (m) keys.add(m[1] !== undefined ? m[1].replace(/\\"/g, '"') : m[2]);
  }
  return keys;
}

// ── 2) t() 정적 문자열 인자 수집 ────────────────────────────────
function walk(dir, out) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (EXT.test(name)) out.push(p);
  }
}

// t( 로 시작하는 호출의 첫 인자가 문자열 리터럴이면 캡처. 템플릿은 ${ 없을 때만.
const CALL = /\bt\(\s*(?:"((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])*)'|`([^`]*)`)/g;

function collectUsages(files) {
  const used = new Set();
  for (const f of files) {
    const src = readFileSync(f, "utf8");
    let m;
    while ((m = CALL.exec(src)) !== null) {
      const raw = m[1] ?? m[2] ?? m[3];
      if (m[3] !== undefined && raw.includes("${")) continue; // 동적 템플릿 → 스킵
      used.add(raw.replace(/\\"/g, '"').replace(/\\'/g, "'"));
    }
  }
  return used;
}

// ── 실행 ────────────────────────────────────────────────────────
const enKeys = extractDictKeys("const EN:");
const jaKeys = extractDictKeys("const JA:");
const esKeys = extractDictKeys("const ES:");
const files = [];
for (const d of SCAN_DIRS) walk(join(root, d), files);
const used = collectUsages(files);

const missing = [...used].filter((k) => !enKeys.has(k) && !ALLOW.has(k)).sort();
const unused = [...enKeys].filter((k) => !used.has(k) && !ALLOW.has(k)).sort();
// 로케일 간 패리티: EN 키가 JA/ES에도 다 있어야(누락 시 해당 로케일에서 한국어 폴백 노출).
const missingJa = [...enKeys].filter((k) => !jaKeys.has(k)).sort();
const missingEs = [...enKeys].filter((k) => !esKeys.has(k)).sort();

console.log(`i18n-check · 파일 ${files.length}개 · t() 리터럴 ${used.size}개 · 키 EN ${enKeys.size} · JA ${jaKeys.size} · ES ${esKeys.size}`);

let failed = false;
// strict-unused(QA7-5): 미사용 키는 실패로 승격 — 삭제하거나 동적 사용이면 ALLOW에 등재해 재발 차단.
if (unused.length) {
  console.log(`\n❌ 미사용(dead) EN 키 ${unused.length}개 — 삭제하거나, 동적 사용이면 ALLOW에 등재하세요:`);
  for (const k of unused) console.log(`   · ${k}`);
  failed = true;
}
if (missing.length) {
  console.log(`\n❌ EN 매핑 누락 ${missing.length}개 (t()로 쓰였으나 EN 없음):`);
  for (const k of missing) console.log(`   · ${k}`);
  failed = true;
}
if (missingJa.length) {
  console.log(`\n❌ JA 번역 누락 ${missingJa.length}개 (EN엔 있으나 JA 없음):`);
  for (const k of missingJa) console.log(`   · ${k}`);
  failed = true;
}
if (missingEs.length) {
  console.log(`\n❌ ES 번역 누락 ${missingEs.length}개 (EN엔 있으나 ES 없음):`);
  for (const k of missingEs) console.log(`   · ${k}`);
  failed = true;
}
if (failed) process.exit(1);

console.log("\n✅ 누락 없음 — t() 키가 EN에 있고, EN 키가 JA·ES에도 모두 존재합니다.");
