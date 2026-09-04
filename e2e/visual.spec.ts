/* 시각 회귀 — figma-ref 가 있는 화면 전부 (docs/CI명세.md REQ-004).

   묻는 것은 하나다 — "이 화면이 승인된 기준선(__snapshots__)과 같은가."
   figma-ref 와 같은지는 기준선을 갱신할 때 사람이 본다 — 기준선 PNG 가 곧 승인된 화면이다.

   ⚠️ figma-ref 에 PNG 를 추가하면 여기 SCREENS 에도 추가할 것.
      마지막 검사가 docs/figma-ref 파일 수 ↔ SCREENS 수를 대조해 누락을 잡는다. */

import { expect, test, type Page } from '@playwright/test'
import { readdirSync } from 'node:fs'

/** 스플래시가 그리는 유일한 텍스트 (smoke.test 와 같은 기준) */
const SPLASH_TEXT = '앱을 여는 중이에요'

interface Screen {
  /** docs/figma-ref 파일명(확장자 제외) — 기준선 파일명으로도 쓴다 */
  ref: string
  path: string
  /** 화면 상태를 만드는 조작 — 시트 열기·펼치기·툴팁 */
  act?: (page: Page) => Promise<void>
}

const SCREENS: Screen[] = [
  { ref: '00-메인홈',              path: '/home' },
  { ref: '경로-09-금융-은행',       path: '/finance' },
  { ref: '경로-10-금융-카드',       path: '/finance/card' },
  { ref: '경로-11-금융-증권',       path: '/finance/stock' },
  { ref: '경로-12-상품-발견',       path: '/product' },
  { ref: 'S1-9-보험메인-2건',       path: '/finance/insurance' },
  { ref: 'S1-8-보험메인-0건',       path: '/finance/insurance?state=A' },
  { ref: 'S1-14-보험메인-맞춤OFF',  path: '/finance/insurance?custom=off' },
  { ref: 'S1-13-기준시트',          path: '/finance/insurance',
    act: (p) => p.getByRole('button', { name: /맞춤 설정/ }).click() },
  { ref: 'S1-7-내보험',             path: '/finance/insurance/my' },
  { ref: 'S2-A-상품찾기',           path: '/product/insurance/list' },
  { ref: 'S2-D-카테고리선택후',     path: '/product/insurance/list?cat=dental' },
  { ref: 'S3-D-브리핑',             path: '/diagnosis/briefing' },
  { ref: 'S3-C-진단결과-접힘',      path: '/diagnosis' },
  { ref: 'S3-C-1-진단결과-펼침',    path: '/diagnosis',
    act: async (p) => { for (const b of await p.getByRole('button', { name: /개 더 보기/ }).all()) await b.click() } },
  { ref: 'S3-E-항목상세-실손',      path: '/diagnosis/c-actual' },
  { ref: 'S3-F-대화-실손',          path: '/agent?ctx=c-actual' },
  { ref: 'S3-F-대화-사망',          path: '/agent?ctx=c-death' },
  { ref: 'S4-A-결제감지팝업',       path: '/home?popup=claim' },
  { ref: 'S4-D-청구절차',           path: '/claim/guide' },
  { ref: 'S5-A-알림설정',           path: '/claim/settings' },
  { ref: '청구완료',                path: '/claim/done' },
  { ref: 'S6-A-상품상세',           path: '/product/insurance/sp-cancer-care' },
  { ref: 'S6-A-1-툴팁열림-버블',    path: '/product/insurance/sp-cancer-care',
    act: (p) => p.getByRole('button', { name: '무배당' }).click() },
  { ref: 'S6-B-대화-상품문맥',      path: '/agent?ctx=product&id=sp-cancer-care' },
]

for (const s of SCREENS) {
  test(s.ref, async ({ page }) => {
    await page.goto(s.path)
    // 동적 요소 고정 (REQ-008): 스플래시 종료 · 웹폰트 로드. 폰트 실패는 실패다 — 시스템 폰트로 찍히면 기준선이 오염된다
    await expect(page.getByText(SPLASH_TEXT)).toHaveCount(0, { timeout: 10_000 })
    const fontOk = await page.evaluate(async () => {
      await document.fonts.ready
      return document.fonts.check('16px Pretendard')
    })
    expect(fontOk, 'Pretendard 웹폰트가 로드되지 않았다 (jsdelivr 네트워크?)').toBe(true)
    await s.act?.(page)
    await expect(page).toHaveScreenshot(`${s.ref}.png`, { fullPage: true })
  })
}

test('figma-ref ↔ 촬영 목록 대조', () => {
  const refs = readdirSync('docs/figma-ref').filter((f) => f.endsWith('.png')).map((f) => f.replace(/\.png$/, ''))
  const listed = new Set(SCREENS.map((s) => s.ref))
  const missing = refs.filter((r) => !listed.has(r))
  const extra = [...listed].filter((r) => !refs.includes(r))
  expect(missing, `figma-ref 에 있는데 촬영 목록에 없음: ${missing.join(', ')}`).toEqual([])
  expect(extra, `촬영 목록에 있는데 figma-ref 에 없음: ${extra.join(', ')}`).toEqual([])
})
