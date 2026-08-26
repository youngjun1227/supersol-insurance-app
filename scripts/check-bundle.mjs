#!/usr/bin/env node
/* 번들 크기 상한 — 폰 브라우저로 링크를 열어 하는 테스트라 초기 로딩이 곧 체감이다.
   ⚠️ 이 검사가 생긴 이유: 아이콘을 `import * as`로 이름 조회했더니 Phosphor 전체가
   번들에 들어가 317KB → 5.2MB 가 됐다. 화면은 멀쩡해서 폰에서 열기 전엔 모른다.
   아이콘·라이브러리는 쓰는 것만 명시적으로 import 한다.

   실행 전 `npm run build` 가 필요하다 (dist 를 읽는다).
   ⚠️ dist 가 낡았으면 통과해도 의미가 없다 — 빌드보다 오래된 dist 는 거부한다. */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { join } from 'node:path'

/** gzip 기준 상한 (KB) — 현재 약 111KB. 여유를 두되 사고는 잡히게 */
const LIMIT_JS_GZIP_KB = 200
const LIMIT_CSS_GZIP_KB = 40

const dir = 'dist/assets'
let files
try {
  files = readdirSync(dir)
} catch {
  console.error('❌ dist 가 없습니다. 먼저 `npm run build` 를 실행하세요.')
  process.exit(1)
}

const gzipKb = (p) => gzipSync(readFileSync(p)).length / 1024

/* dist 가 소스보다 오래됐으면 낡은 결과를 보고 있는 것이다.
   빌드 실패 후 이 검사가 통과하는 일을 막는다 (실제로 겪음) */
const newest = (dir) => {
  let t = 0
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, f.name)
    t = Math.max(t, f.isDirectory() ? newest(p) : statSync(p).mtimeMs)
  }
  return t
}
if (newest('src') > newest(dir)) {
  console.error('❌ dist 가 src 보다 오래됐습니다. `npm run build` 가 성공했는지 확인하세요.')
  process.exit(1)
}

let js = 0
let css = 0
for (const f of files) {
  const p = join(dir, f)
  if (!statSync(p).isFile()) continue
  if (f.endsWith('.js')) js += gzipKb(p)
  else if (f.endsWith('.css')) css += gzipKb(p)
}

const rows = [
  ['JS', js, LIMIT_JS_GZIP_KB],
  ['CSS', css, LIMIT_CSS_GZIP_KB],
]
let failed = false
for (const [label, size, limit] of rows) {
  const over = size > limit
  if (over) failed = true
  console.log(`  ${over ? '❌' : '✓'} ${label} ${size.toFixed(1)}KB (gzip) / 상한 ${limit}KB`)
}

if (failed) {
  console.error(`
번들이 상한을 넘었습니다. 흔한 원인:
  · 아이콘/라이브러리를 \`import * as\` 로 가져와 트리 셰이킹이 안 되는 경우
    → 쓰는 것만 명시적으로 import (이름으로 동적 조회 금지)
  · 큰 의존성 추가 — 정말 필요한지 팀장과 상의
`)
  process.exit(1)
}
console.log('✓ 번들 크기 통과')
