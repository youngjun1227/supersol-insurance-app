/* 화면에서 쓰는 계측 훅.
   화면 이름·과제는 컨텍스트가 채우므로 호출부는 targetId만 넘기면 된다.

     const track = useTrack()
     <button onClick={() => { track('청구하기'); goClaim() }}>
*/

import { useCallback, useEffect } from 'react'
import { useScreenName } from '@/app/AnalyticsProvider'
import { track as rawTrack } from '@/lib/analytics'

/** 탭 1회 기록. 클릭 수 지표의 원자료.
    targetId 는 lib/targetId.ts 의 tid() 로 만든다 — 이름이 갈리면 집계가 안 된다.
    context 는 경로가 갈리는 화면에서 필터 상태 등을 같이 남길 때 (S2-A). */
export function useTrack() {
  const screen = useScreenName()
  return useCallback(
    (targetId: string, context?: Record<string, string>) => {
      rawTrack({ type: 'tap', targetId, screen, context })
    },
    [screen],
  )
}

/* 마지막으로 진입 기록을 남긴 화면.
   ref로 막으면 StrictMode 재마운트 때 ref가 초기화돼 두 번 남는다
   (실제로 한 번 겪음) — 모듈 스코프에 둬야 살아남는다. */
let lastLoggedScreen: string | null = null

/** 화면 진입 1회 기록. 화면 컴포넌트 맨 위에서 부른다 */
export function useScreenView(): void {
  const screen = useScreenName()

  useEffect(() => {
    if (lastLoggedScreen === screen) return
    lastLoggedScreen = screen
    rawTrack({ type: 'screen_view', targetId: screen, screen })
  }, [screen])
}
