/* 전 라우트 렌더 스모크 (#81).

   묻는 것은 하나다 — "이 화면이 throw 없이, 콘솔 에러 없이 뜨는가."
   지금까지 손으로 하던 전 라우트 훑기를 CI 가 커밋마다 한다.

   ⚠️ 라우트를 추가하면 여기 목록에도 추가할 것 (계측 누락 규칙과 같은 이유).
      와일드카드(*→/)가 있어서 빠뜨려도 "홈이 두 번 통과"로 조용히 지나간다 —
      마지막 검사가 목록↔App.tsx 라우트 수를 대조해 그걸 잡는다. */

import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { readFileSync } from 'node:fs'
import { App } from '@/app/App'

/** 라우트 31벌 + 쿼리 상태 변형. 데이터 상태가 갈리는 화면은 변형까지 돈다 */
const ROUTES = [
  '/',
  '/finance', '/finance/card', '/finance/stock',
  '/finance/insurance', '/finance/insurance?state=A', '/finance/insurance?custom=off',
  '/finance/insurance/my',
  '/diagnosis', '/diagnosis/briefing', '/diagnosis/c-actual', '/diagnosis/c-death',
  '/agent', '/agent?ctx=c-actual', '/agent?ctx=product&id=sp-cancer-care',
  '/?popup=claim', '/?popup=claim&state=A',
  '/claim/settings', '/claim/guide', '/claim/done',
  '/product', '/product/insurance',
  '/product/insurance/list', '/product/insurance/list?cat=dental',
  '/product/insurance/sp-cancer-care', '/product/insurance/op-b-variable',
  '/benefit', '/stock', '/export',
  '/demo', '/demo/push',
]

let consoleErrors: string[]

beforeEach(() => {
  consoleErrors = []
  localStorage.clear()
  vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
    consoleErrors.push(args.map(String).join(' '))
  })
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

test.each(ROUTES)('%s 가 에러 없이 뜬다', (route) => {
  const { container } = render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>,
  )

  // 뭔가 그려졌다 (빈 트리 = 라우트 미매칭이 조용히 지나가는 걸 막는다)
  expect(container.textContent?.length ?? 0).toBeGreaterThan(0)

  // 콘솔 에러 0 — React 경고(key 누락 등)도 여기 걸린다. 걸리면 고치는 게 맞다
  expect(consoleErrors).toEqual([])
})

test('라우트 목록이 App.tsx 와 같은 수다 (화면 추가 시 스모크 누락 방지)', () => {
  const src = readFileSync('src/app/App.tsx', 'utf-8')
  const appRoutes = [...src.matchAll(/<Route path="([^"*]+)"/g)].map((m) => m[1])
  // 쿼리 변형을 제거한 순수 경로 수와 비교
  const covered = new Set(
    ROUTES.map((r) => r.split('?')[0].replace(/\/(sp|op)-[\w-]+$/, '/:productId').replace(/\/(c-)[\w-]+$/, '/:itemId')),
  )
  const missing = appRoutes.filter((r) => !covered.has(r))
  expect(missing).toEqual([])
})
