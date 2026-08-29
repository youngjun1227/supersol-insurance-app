/* 화면을 옮기면 맨 위에서 시작한다.

   ⚠️ SPA 는 페이지를 새로 부르지 않아서 스크롤 위치가 그대로 남는다.
      목록에서 1200px 내려가 상품을 누르면 상세 화면이 1200px 지점에서
      시작해 제목이 이미 지나간 상태로 도착한다 (#70).
      React Router 가 대신 해주지 않으므로 직접 올린다.

   ⚠️ 스크롤하는 것은 AppShell 의 <main> 이 아니라 창(window) 이다 —
      main 에 높이 제한이 없어 내용만큼 늘어나고 넘치는 건 문서 전체다.
      main.scrollTop = 0 으로는 안 움직인다.

   뒤로 가기도 예외 없이 맨 위로 올린다 (팀장 결정 2026-08-29) —
   9/11 참가자가 화면 중간에서 시작해 길을 잃는 쪽이 더 큰 문제다. */

import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

/* ⚠️ 브라우저는 뒤로 가기 때 스크롤을 자기가 되돌린다(기본 'auto').
      그 복원이 훅보다 나중에 일어나서, 끄지 않으면 뒤로 갈 때만 그대로 남는다.
      실제로 뒤로 가기에서 1000px 이 복원되는 걸 확인하고 넣었다. */
if (typeof history !== 'undefined' && 'scrollRestoration' in history) {
  history.scrollRestoration = 'manual'
}

export function useScrollTop(): void {
  const { pathname } = useLocation()

  /* useEffect 가 아니라 useLayoutEffect — 그려지기 전에 올려야
     내려간 화면이 한 프레임 비쳤다가 튀어 오르는 게 안 보인다.
     behavior 는 기본값(즉시). smooth 로 두면 새 화면이 스르륵 올라간다. */
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
}
