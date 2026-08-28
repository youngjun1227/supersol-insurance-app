#!/usr/bin/env node
/* 목데이터 정합성 검사 — 원본 문서와 어긋나면 커밋·CI 가 막힌다.
   ⚠️ 이 검사가 생긴 이유: 목데이터를 옮길 때 카테고리를 AS-IS 분류(mock-data.md §3의
   '암·건강')에서 그대로 가져와 TO-BE 9분류와 섞였다. 화면에 "건강 7"이 뜨고서야 발견했다.
   개수는 문서에 명시된 값이라 기계로 지킬 수 있다.

   근거: 디자인 레포 02_to-be/notes/S2_카테고리체계.md §S2-5
         디자인 레포 02_to-be/mock-data.md §1·§2·§2-2·§5 */
import { readFileSync } from 'node:fs'

const src = readFileSync('src/data/mock.ts', 'utf8')
const problems = []
const ok = (label, cond, hint = '') => {
  if (!cond) problems.push(`${label}${hint ? ` — ${hint}` : ''}`)
}

/* ── 1. 카테고리별 상품 수 (S2_카테고리체계 §S2-5) ────────── */
const EXPECTED_CATEGORY = {
  cancer: 3, health: 6, dementia: 3, dental: 4, injury: 3,
  travel: 2, etc: 1, pension: 3, variable: 1,
}
const counts = {}
for (const m of src.matchAll(/category: '(\w+)'/g)) {
  counts[m[1]] = (counts[m[1]] ?? 0) + 1
}
for (const [cat, want] of Object.entries(EXPECTED_CATEGORY)) {
  ok(`카테고리 ${cat}: ${counts[cat] ?? 0}개 (문서 ${want}개)`, counts[cat] === want)
}
const total = Object.values(counts).reduce((a, b) => a + b, 0)
ok(`상품 합계 ${total}개 (문서 26개)`, total === 26)

/* ── 2. 고정 값 (mock-data.md §1·§2·§2-1) ────────────────── */
const FIXED = [
  ['이름 김신한', "name: '김신한'"],
  ['전화 010-0000-0000', '010-0000-0000'],
  ['나이 만 26세', 'age: 26'],
  ['계좌 잔액 9,250,000원', '9_250_000'],
  ['카드 8월 122,400원', '122_400'],
  ['통합건강 월 32,000원', '32_000'],
  ['대중교통 mini 월 3,000원', '3_000'],
  ['이번 달 합계 35,000원 (과제 정답값)', '35_000'],
]
for (const [label, needle] of FIXED) ok(label, src.includes(needle))

/* ── 3. 보장 10항목·배터리 단계 (§2-2) ───────────────────── */
const EXPECTED_BATTERY = {
  실손의료비: 0, 입원: 30, 수술: 0, 치과치료: 0, '암 진단': 100,
  심혈관질환진단: 0, 뇌혈관질환진단: 0, 치매진단: 0, 후유장해: 30, 사망: 0,
}
for (const [label, want] of Object.entries(EXPECTED_BATTERY)) {
  const m = src.match(
    new RegExp(`label: '${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}',[\\s\\S]*?batteryLevel: (\\d+)`),
  )
  ok(`${label} 배터리 ${m?.[1] ?? '?'} (문서 ${want})`, m && Number(m[1]) === want)
}
const coverageCount = (src.match(/isRadarAxis:/g) ?? []).length
ok(`보장 항목 10개 (현재 ${coverageCount})`, coverageCount === 10)

/* ── 4. 티어 배분 (변경로그 §2 / mock-data §2-3) ─────────── */
const EXPECTED_TIER = { now: 2, later: 6, covered: 1, notyet: 1 }
const tiers = {}
for (const m of src.matchAll(/tier: '(\w+)'/g)) tiers[m[1]] = (tiers[m[1]] ?? 0) + 1
for (const [t, want] of Object.entries(EXPECTED_TIER)) {
  ok(`티어 ${t}: ${tiers[t] ?? 0}개 (문서 ${want}개)`, tiers[t] === want)
}

/* ── 4-1. shortName (mock-data.md §3-0) ──────────────────────
   목록은 shortName, 상세는 전체 name 을 쓴다. 새 상품에 shortName 을 빠뜨리면
   목록에서 빈 칸이 되므로 개수와 중복을 지킨다. */
const shortNames = [...src.matchAll(/shortName: '([^']+)'/g)].map((m) => m[1])
ok(`shortName ${shortNames.length}개 (상품 ${total}개 전부)`, shortNames.length === total)
const dupShort = shortNames.filter((v, i) => shortNames.indexOf(v) !== i)
ok(`shortName 중복 없음${dupShort.length ? ` — ${[...new Set(dupShort)].join(', ')}` : ''}`, dupShort.length === 0)
// 괄호로 시작하면 규칙 적용이 잘못된 것 ((무)안심케어보험 → 빈 문자열이 되는 사고)
ok('shortName 이 비거나 괄호로 시작하지 않음', shortNames.every((n) => n.trim() && !n.startsWith('(')))

/* ── 4-2. 상품 상세 가상값 (mock-data.md §3-1) ───────────────
   26개 전부 있어야 한다 — 빠지면 그 상품 상세가 빈 화면이 된다.
   발표에서 심사위원이 아무 상품이나 열어보므로 하나도 비면 안 된다. */
const details = [...src.matchAll(/'([\w-]+)': \{ pay: '([^']*)', age: '([^']*)', term: '([^']*)', kind: '([^']*)' \}/g)]
ok(`상품 상세 ${details.length}개 (상품 ${total}개 전부)`, details.length === total)
ok('상세 값에 빈 칸 없음', details.every((m) => m[2] && m[3] && m[4] && m[5]))

/* ── 4-3. 상품 월 보험료 (mock-data.md §3-2) ─────────────────
   26개 전부 있어야 하고, 보유 계약과 같은 상품은 금액이 같아야 한다 —
   S1-7 에서 본 금액과 상품 목록 금액이 다르면 참가자가 혼란스럽다. */
const prodPremiums = [...src.matchAll(/monthlyPremium: ([\d_]+)/g)].map((m) => Number(m[1].replace(/_/g, '')))
// 계약 2건 + 상품 26개
ok(`월 보험료 ${prodPremiums.length}개 (계약 2 + 상품 ${total})`, prodPremiums.length === total + 2)
const pair = (id) => {
  const m = src.match(new RegExp(`id: '${id}'[\\s\\S]{0,400}?monthlyPremium: ([\\d_]+)`))
  return m ? Number(m[1].replace(/_/g, '')) : null
}
ok('대중교통 mini 상품·계약 보험료 일치 (3,000)', pair('sp-transit-mini') === 3000)
ok('통합건강 원(ONE)Core 상품·계약 보험료 일치 (32,000)', pair('sp-one-core') === 32000)

/* ── 5. 금지 규칙 (실명·실번호·타사 실제 상품명) ─────────── */
ok('타사는 가명만 (A~F생명·손해보험)', !/(삼성생명|한화생명|교보생명|KB손해|DB손해|메리츠)/.test(src))
const phones = src.match(/010-\d{4}-\d{4}/g) ?? []
ok('전화번호는 010-0000-0000 만', phones.every((p) => p === '010-0000-0000'))

/* ── 결과 ────────────────────────────────────────────────── */
if (problems.length) {
  console.error(`\n❌ 목데이터가 원본 문서와 어긋납니다 (${problems.length}건):\n`)
  for (const p of problems) console.error(`  ${p}`)
  console.error(`
원본: 디자인 레포 02_to-be/mock-data.md · notes/S2_카테고리체계.md
값을 바꿔야 하면 원본 문서를 먼저 고치고 이 스크립트의 기대값도 함께 갱신하세요.
⚠️ 임의로 목데이터를 만들지 않습니다.
`)
  process.exit(1)
}
console.log('✓ 목데이터 정합성 통과 (상품 26 · shortName 26 · 상세 26 · 보험료 26 · 보장 10 · 티어 4 · 고정값 8)')
