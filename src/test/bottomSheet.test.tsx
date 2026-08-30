/* BottomSheet 의 뒤 스크롤 잠금·Esc·포커스 (#104).

   공용 컴포넌트라 세 사람이 쓴다. 특히 잠금이 안 풀리면 body 가 'hidden' 인 채
   남아 앱 전체가 스크롤 불가가 되는데, 눈으로는 "왜 안 움직이지"로만 보인다. */

import { afterEach, expect, test } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/react'
import { useState } from 'react'
import { BottomSheet } from '@/components'

afterEach(() => {
  cleanup()
  document.body.style.overflow = ''
})

/** 시트 하나를 열고 닫을 수 있는 최소 화면 */
function Harness({ closeOnMount = false }: { closeOnMount?: boolean }) {
  const [open, setOpen] = useState(!closeOnMount)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>열기</button>
      <BottomSheet open={open} onClose={() => setOpen(false)} label="테스트 시트">
        <p>내용</p>
      </BottomSheet>
    </>
  )
}

test('열려 있는 동안 뒤 스크롤이 잠기고, 닫히면 풀린다', () => {
  const { getByRole, queryByRole } = render(<Harness />)
  expect(document.body.style.overflow).toBe('hidden')

  fireEvent.keyDown(document, { key: 'Escape' })
  expect(queryByRole('dialog')).toBeNull()
  expect(document.body.style.overflow).not.toBe('hidden')
  expect(getByRole('button', { name: '열기' })).toBeTruthy()
})

test('언마운트로 사라져도 잠금이 남지 않는다', () => {
  const { unmount } = render(<Harness />)
  expect(document.body.style.overflow).toBe('hidden')
  unmount()
  expect(document.body.style.overflow).not.toBe('hidden')
})

test('시트를 두 개 겹쳐 열었다 하나만 닫아도 잠금이 유지된다', () => {
  const first = render(
    <BottomSheet open onClose={() => {}} label="첫 시트">
      <p>1</p>
    </BottomSheet>,
  )
  const second = render(
    <BottomSheet open onClose={() => {}} label="둘째 시트">
      <p>2</p>
    </BottomSheet>,
  )
  expect(document.body.style.overflow).toBe('hidden')

  // 먼저 연 쪽을 먼저 닫아도(역순 아님) 남은 시트가 있으니 잠금은 유지돼야 한다
  first.unmount()
  expect(document.body.style.overflow).toBe('hidden')

  second.unmount()
  expect(document.body.style.overflow).not.toBe('hidden')
})

test('Esc 는 맨 위 시트만 닫는다', () => {
  let firstClosed = false
  let secondClosed = false
  render(
    <BottomSheet open onClose={() => { firstClosed = true }} label="첫 시트">
      <p>1</p>
    </BottomSheet>,
  )
  render(
    <BottomSheet open onClose={() => { secondClosed = true }} label="둘째 시트">
      <p>2</p>
    </BottomSheet>,
  )

  fireEvent.keyDown(document, { key: 'Escape' })
  expect(secondClosed).toBe(true)
  expect(firstClosed).toBe(false)
})

test('열리면 시트로 포커스가 옮겨간다', () => {
  const { getByRole } = render(<Harness />)
  const dialog = getByRole('dialog')
  // 포커스 대상은 시트 본체(딤이 아니라) — tabIndex=-1 로 받는다
  expect(dialog.contains(document.activeElement)).toBe(true)
})
