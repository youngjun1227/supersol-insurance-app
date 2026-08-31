/* 숨은 진입점 — 정해진 횟수를 연속으로 탭하면 발동한다.

   왜 있나: 진행자가 참가자 폰에서 /demo 나 /export 주소를 직접 타이핑하는 건
   번거롭고, 그 과정을 참가자가 본다. 앱 안에 입구를 두되 참가자가 실수로
   누르지는 않을 자리여야 한다.

     const onTap = useSecretTap(() => navigate('/demo'))
     <span onClick={onTap}>김신한님</span>

   ⚠️ 연속 탭이어야 한다 — 사이가 벌어지면 처음부터 다시 센다.
      안 그러면 과제 중 우연히 눌린 것들이 쌓여 발동한다. */

import { useCallback, useEffect, useRef } from 'react'

/** 몇 번 눌러야 열리나 */
const TAP_COUNT = 5
/** 탭 사이 최대 간격 — 이보다 벌어지면 처음부터 */
const TAP_WINDOW_MS = 1500

export function useSecretTap(onUnlock: () => void, count: number = TAP_COUNT) {
  const taps = useRef(0)
  const lastAt = useRef(0)
  const timer = useRef<number | null>(null)

  /** onUnlock 을 매 렌더 새로 만드는 호출부가 있어도 콜백이 안 바뀌게 */
  const unlockRef = useRef(onUnlock)
  unlockRef.current = onUnlock

  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current)
    },
    [],
  )

  return useCallback(
    () => {
      const now = Date.now()
      taps.current = now - lastAt.current > TAP_WINDOW_MS ? 1 : taps.current + 1
      lastAt.current = now

      if (timer.current !== null) clearTimeout(timer.current)
      // 창이 지나면 조용히 리셋 — 다음 탭이 1번째가 된다
      timer.current = window.setTimeout(() => {
        taps.current = 0
      }, TAP_WINDOW_MS)

      if (taps.current >= count) {
        taps.current = 0
        unlockRef.current()
      }
    },
    [count],
  )
}
