/* 화면을 옮기면 맨 위에서 시작한다 — 단, 목록 화면으로 "뒤로" 올 때는 보던 자리로.

   ⚠️ SPA 는 페이지를 새로 부르지 않아서 스크롤 위치가 그대로 남는다.
      목록에서 1200px 내려가 상품을 누르면 상세 화면이 1200px 지점에서
      시작해 제목이 이미 지나간 상태로 도착한다 (#70).
      React Router 가 대신 해주지 않으므로 직접 올린다.

   ⚠️ 스크롤하는 것은 AppShell 의 <main> 이 아니라 창(window) 이다 —
      main 에 높이 제한이 없어 내용만큼 늘어나고 넘치는 건 문서 전체다.
      main.scrollTop = 0 으로는 안 움직인다.

   뒤로 가기 처리는 두 번 결정됐다:
   - 1차(#71): 예외 없이 전부 맨 위 — 화면 중간 시작으로 길 잃는 게 더 큰 문제
   - 2차(#82, 팀장 확정 2026-08-29): **목록 화면만 위치 복원**. 목록의 보던
     자리로 돌아가는 건 길을 잃는 게 아니라 길을 기억하는 것이고, 상품 A 보고
     돌아와 B 를 찾는 왕복이 실제 과제 동선이다. iOS·기존 슈퍼쏠도 복원한다 —
     우리만 안 하면 비교에서 우리에게 불리한 비대칭이다. */

import { useEffect, useLayoutEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

/* ⚠️ 브라우저는 뒤로 가기 때 스크롤을 자기가 되돌린다(기본 'auto').
      그 복원이 훅보다 나중에 일어나서, 끄지 않으면 뒤로 갈 때만 그대로 남는다.
      실제로 뒤로 가기에서 1000px 이 복원되는 걸 확인하고 넣었다.
      목록 복원도 브라우저에 맡기지 않고 우리가 한다 — 조건(목록만)이 다르다. */
if (typeof history !== 'undefined' && 'scrollRestoration' in history) {
  history.scrollRestoration = 'manual'
}

/** 뒤로 왔을 때 위치를 복원하는 화면 — "목록 성격" 만 (#82 팀장 확정).
    항목이 많아 왕복 탐색이 있는 화면이 기준이다. 여기 없는 화면은 뒤로여도 맨 위. */
const RESTORE_PATHS = new Set([
  '/product/insurance/list', // S2-D 상품 목록 26개 — 상품 비교 왕복
  '/diagnosis', // S3-C 진단 항목 10개 — 항목상세 왕복
])

/* 화면별 마지막 스크롤 위치. location.key 가 아니라 pathname 으로 저장한다 —
   목록 → 상세 → 뒤로의 "뒤로" 는 POP 이라 key 가 처음 방문 때 것으로 돌아오지만,
   목록 → 상세 → (상세에서 목록을 다시 push) 같은 변칙 경로에서도 pathname 이면
   같은 자리를 돌려줄 수 있다. 모듈 스코프라 화면을 오가도 살아남는다 (#38 과 같은 이유). */
const savedPositions = new Map<string, number>()

export function useScrollTop(): void {
  const { pathname } = useLocation()
  /* POP = 뒤로/앞으로 (브라우저 버튼·navigate(-1)) / PUSH·REPLACE = 앞으로 이동 */
  const navigationType = useNavigationType()

  /* 스크롤할 때마다 실시간으로 남긴다.
     ⚠️ "떠날 때(cleanup) 저장" 은 안 된다 — cleanup 이 도는 시점엔 이미 새 화면의
        DOM 으로 바뀌어서, 새 화면이 더 짧으면 브라우저가 scrollY 를 먼저 깎아버린다.
        실제로 목록 1000 이 상세 진입 순간 71 로 클램프된 채 저장되는 걸 확인했다. */
  useEffect(() => {
    const save = () => savedPositions.set(pathname, window.scrollY)
    window.addEventListener('scroll', save, { passive: true })
    return () => window.removeEventListener('scroll', save)
  }, [pathname])

  /* useEffect 가 아니라 useLayoutEffect — 그려지기 전에 움직여야
     내려간 화면이 한 프레임 비쳤다가 튀는 게 안 보인다.
     behavior 는 기본값(즉시). smooth 로 두면 새 화면이 스르륵 움직인다. */
  useLayoutEffect(() => {
    const saved = savedPositions.get(pathname)
    if (navigationType === 'POP' && RESTORE_PATHS.has(pathname) && saved !== undefined) {
      window.scrollTo(0, saved)
      return
    }
    window.scrollTo(0, 0)
  }, [pathname, navigationType])
}
