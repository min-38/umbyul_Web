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

// 의도적으로 EN 매핑 없이 t()에 넣는 키(예외). 필요 시 여기에 추가.
const ALLOW = new Set([]);

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

if (unused.length) {
  console.log(`\n⚠️  미사용(dead) EN 키 ${unused.length}개 (동적 사용이면 무시):`);
  for (const k of unused) console.log(`   · ${k}`);
}

let failed = false;
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
