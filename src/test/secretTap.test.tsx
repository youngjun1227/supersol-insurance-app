/* 숨은 진입점 — 홈 헤더 이름을 5번 연속 탭하면 진행자 화면으로.

   ⚠️ 참가자가 실수로 여는 일이 없어야 한다. 그래서 "연속"이 조건이다 —
      과제 중 우연히 눌린 탭이 쌓여서 열리면 안 된다. */

import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { App } from '@/app/App'
import { SPLASH_MS } from '@/lib/timing'

beforeEach(() => {
  vi.useFakeTimers()
  localStorage.clear()
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

/** 앱을 홈에서 띄우고 스플래시를 넘긴다 */
function renderHome() {
  const view = render(
    <MemoryRouter initialEntries={['/home']}>
      <App />
    </MemoryRouter>,
  )
  act(() => {
    vi.advanceTimersByTime(SPLASH_MS + 100)
  })
  return view
}

const greeting = () => screen.getByText(/님$/)

test('이름을 5번 연속 누르면 진행자 화면이 열린다', () => {
  const { container } = renderHome()
  for (let i = 0; i < 5; i += 1) fireEvent.click(greeting())
  act(() => {
    vi.advanceTimersByTime(SPLASH_MS + 100)
  })
  expect(container.textContent).toContain('시연 시나리오')
})

test('4번만 누르면 열리지 않는다', () => {
  const { container } = renderHome()
  for (let i = 0; i < 4; i += 1) fireEvent.click(greeting())
  expect(container.textContent).not.toContain('시연 시나리오')
})

test('사이가 벌어지면 처음부터 다시 센다 — 우연히 쌓여서 열리지 않는다', () => {
  const { container } = renderHome()
  // 4번 누르고 창(1.5초)을 넘긴 뒤 한 번 더 → 합계 5번이지만 연속이 아니다
  for (let i = 0; i < 4; i += 1) fireEvent.click(greeting())
  act(() => {
    vi.advanceTimersByTime(2000)
  })
  fireEvent.click(greeting())
  expect(container.textContent).not.toContain('시연 시나리오')
})
