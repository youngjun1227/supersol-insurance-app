/* 앱 실행 스플래시 (2026-08-31 팀장 — "항상 보여준다").

   ⚠️ 이 테스트가 필요한 이유: 브라우저로 눈으로 확인하려 했더니 Playwright 의
      navigate 가 로드 완료를 기다리는 사이 1.2초가 지나가 스플래시가 안 보였다.
      "안 뜬다"고 오판할 뻔했다 — 타이머를 직접 넘기는 테스트가 정확하다. */

import { expect, test, vi, beforeEach, afterEach } from 'vitest'
import { act, cleanup, render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { App } from '@/app/App'
import { SPLASH_MS } from '@/lib/timing'

beforeEach(() => { vi.useFakeTimers(); localStorage.clear() })
afterEach(() => { cleanup(); vi.useRealTimers() })

test('앱 진입(/)은 스플래시를 먼저 보여준다', () => {
  const { container } = render(<MemoryRouter initialEntries={['/']}><App /></MemoryRouter>)
  expect(container.textContent).toBe('앱을 여는 중이에요')
  act(() => { vi.advanceTimersByTime(SPLASH_MS + 100) })
  expect(container.textContent).not.toBe('앱을 여는 중이에요')
})

test('진행자 화면(/export)은 스플래시를 건너뛴다', () => {
  const { container } = render(<MemoryRouter initialEntries={['/export']}><App /></MemoryRouter>)
  expect(container.textContent).not.toBe('앱을 여는 중이에요')
})
