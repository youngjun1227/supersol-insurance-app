/* 화면 전환 — 스펙 §5 "화면 이동 = 오른쪽에서 밀려 들어옴 (PUSH LEFT 0.3s) · 뒤로 = 역방향" (2026-09-06).

   View Transitions API 로 옛 화면과 새 화면을 통째로 찍어 밀어낸다 (Safari 18+ · Chrome 111+).
   지원하지 않는 브라우저(iOS 17 이하)와 prefers-reduced-motion 에서는 지금처럼 즉시 바뀐다.

   ⚠️ 라우터가 선언형 <BrowserRouter> 라 React Router 의 viewTransition 옵션(데이터 라우터 전용)은 못 쓴다.
      대신 location 이 바뀌는 걸 보고 직접 건다 — 버튼·헤더 뒤로·브라우저 뒤로 제스처 어느 경로로 옮겨도 다 잡힌다.
   ⚠️ 화면이 실제로 바뀌는 것은 startViewTransition 콜백 안(flushSync)이다. App 은 이 훅이 돌려주는
      location 으로 <Routes location> 을 그린다 — 라우터 location 은 이미 다음 화면인데 화면은 아직 이전 것인
      0.3초가 여기서 생긴다. 스크롤 올리기(useScrollTop)도 이 location 을 따라야 옛 화면 스냅샷이 튀지 않는다.

   두 종류의 이동 (2026-09-06 사용자 요청으로 나눔):
     스택 — 상세로 들어가고(push) 돌아온다(back). 화면 전체가 밀린다. 탭바는 제자리에서 사라지고/나타난다.
     탭   — 형제 탭 사이(탭바: 홈·금융·상품·혜택·주식 / 상단 탭: 은행·카드·증권·보험 · 발견·보험).
            헤더·상단 탭·탭바는 제자리에 남고 **그 아래 내용만** 좌우로 미끄러진다. 방향은 탭 순서 —
            오른쪽 탭으로 가면 오른쪽에서(tab-forward), 왼쪽 탭이면 왼쪽에서(tab-back). 뒤로 가기(POP)도 순서를 따른다.
     none — 쿼리만 바뀜(?state·?popup·?cat) · REPLACE(리다이렉트) · 시연·진행자 화면(/demo·/export) ·
            S2-A 전체 목록 ↔ S2-D 카테고리 목록(같은 목록의 필터 상태) */

import { useLayoutEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { useLocation, useNavigationType, type Location, type NavigationType } from 'react-router-dom'

export type TransitionDirection = 'push' | 'back' | 'tab-forward' | 'tab-back' | 'none'

/** 앱 밖 화면 — 진행자·시연 도입부. 여기서 앱으로 들어오는 건 "실행"이지 화면 이동이 아니다 */
const NO_TRANSITION_PREFIX = ['/demo', '/export']

/** 라우트는 다르지만 같은 화면의 필터 상태 — 사이를 밀면 "화면이 바뀐" 것처럼 보여 버그로 읽힌다 (2026-09-06).
    S2-A 전체 목록 ↔ S2-D 카테고리 목록: 칩(암·건강…)·"모두 보기"가 여기를 오간다 */
const SAME_SCREEN_GROUPS: string[][] = [
  ['/product/insurance', '/product/insurance/list'],
]

/** 탭바가 있는 화면 → 탭바 순서(홈 0 · 금융 1 · 상품 2 · 혜택 3 · 주식 4). 둘 다 여기 있으면 "탭" 이동이다 */
const BOTTOM_TAB_INDEX: Record<string, number> = {
  '/home': 0,
  '/finance': 1, '/finance/card': 1, '/finance/stock': 1, '/finance/insurance': 1,
  '/product': 2, '/product/insurance': 2, '/product/insurance/list': 2,
  '/benefit': 3, '/stock': 4,
}

/** 상단 탭 순서 — 같은 탭바 탭 안에서 좌우 방향을 정한다 */
const TOP_TAB_ORDER: string[][] = [
  ['/finance', '/finance/card', '/finance/stock', '/finance/insurance'],
  ['/product', '/product/insurance'],
]

export function classifyTransition(from: Location, to: Location, navType: NavigationType): TransitionDirection {
  if (from.pathname === to.pathname) return 'none'
  if (navType === 'REPLACE') return 'none'
  const outside = (p: string) => NO_TRANSITION_PREFIX.some((prefix) => p === prefix || p.startsWith(`${prefix}/`))
  if (outside(from.pathname) || outside(to.pathname)) return 'none'
  if (SAME_SCREEN_GROUPS.some((g) => g.includes(from.pathname) && g.includes(to.pathname))) return 'none'

  const fromTab = BOTTOM_TAB_INDEX[from.pathname]
  const toTab = BOTTOM_TAB_INDEX[to.pathname]
  if (fromTab !== undefined && toTab !== undefined) {
    if (fromTab !== toTab) return toTab > fromTab ? 'tab-forward' : 'tab-back'
    const top = TOP_TAB_ORDER.find((g) => g.includes(from.pathname) && g.includes(to.pathname))
    if (top) return top.indexOf(to.pathname) > top.indexOf(from.pathname) ? 'tab-forward' : 'tab-back'
    /* 같은 탭바 탭인데 상단 탭 순서에 없는 조합(예: /product ↔ /product/insurance/list) — 앞뒤를 못 정하니 스택으로 */
  }
  return navType === 'POP' ? 'back' : 'push'
}

/** 화면에 그릴 location. 라우터 location 과 같거나, 전환 중이면 한 박자 이전 것 */
export function useRouteTransition(): Location {
  const location = useLocation()
  const navType = useNavigationType()
  const [displayed, setDisplayed] = useState(location)
  /* StrictMode 는 개발 모드에서 effect 를 두 번 돌린다 — 같은 목적지로 전환을 두 번 걸지 않는다 */
  const pending = useRef<string | null>(null)

  useLayoutEffect(() => {
    if (location.key === displayed.key) return
    if (pending.current === location.key) return

    const direction = classifyTransition(displayed, location, navType)
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    const start = typeof document.startViewTransition === 'function'
      ? document.startViewTransition.bind(document)
      : null

    if (direction === 'none' || reduced || !start) {
      setDisplayed(location)
      return
    }

    pending.current = location.key
    document.documentElement.dataset.nav = direction
    let transition: ViewTransition
    try {
      /* 콜백은 옛 화면을 찍은 뒤에 불린다 — 그 안에서 동기(flushSync)로 새 화면을 그려야 새 스냅샷이 잡힌다 */
      transition = start(() => {
        flushSync(() => setDisplayed(location))
      })
    } catch {
      /* 문서가 숨겨져 있는 등 전환을 못 걸면 그냥 바꾼다 */
      delete document.documentElement.dataset.nav
      pending.current = null
      setDisplayed(location)
      return
    }
    transition.finished.finally(() => {
      if (pending.current === location.key) pending.current = null
      delete document.documentElement.dataset.nav
    })
  }, [location, displayed, navType])

  return displayed
}
