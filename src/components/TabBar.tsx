/* §4 TabBar — 363×62 플로팅 pill, fixed, bottom 12 + safe-area.
   탭 5개(홈·금융·상품·혜택·주식).
   선택 = 채움 아이콘 22 + 라벨 12/500, 색만 --primary
   비선택 = 같은 아이콘 --text-disabled
   ⚠️ 선택 원 같은 건 없다 (8/23 정정). */

import {
  ChartLineUp, Gift, House, Storefront, Wallet,
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ELEMENT, type ScreenCode, tid } from '@/lib/targetId'
import { useTrack } from '@/lib/useTrack'
import styles from './TabBar.module.css'

export interface TabItem {
  id: string
  label: string
  /** 탭을 눌렀을 때 가는 곳 */
  path: string
  /** 선택 판정용 경로 앞부분. 하위 화면에서도 탭이 켜져 있게 한다 */
  match: string
  icon: Icon
}

/* 실제 슈퍼쏠 탭 5개.
   ⚠️ 금융·상품을 보험으로 직행시키지 않는다 — 실제 앱은 금융 탭 → 은행,
   상품 탭 → 발견이 기본이고 상단 탭에서 '보험'을 눌러야 도착한다.
   이 진입 마찰(클릭 1~2회)은 AS-IS 클릭 수의 일부라서, 건너뛰면 우리가 설계하지
   않은 이득으로 비교가 오염된다 (변경로그 라우팅 원칙 · 2026-08-26 정정). */
export const TABS: TabItem[] = [
  { id: 'home',    label: '홈',   path: '/home',               match: '/home',     icon: House },
  { id: 'finance', label: '금융', path: '/finance',            match: '/finance',  icon: Wallet },
  { id: 'product', label: '상품', path: '/product',            match: '/product',  icon: Storefront },
  { id: 'benefit', label: '혜택', path: '/benefit',            match: '/benefit',  icon: Gift },
  { id: 'stock',   label: '주식', path: '/stock',              match: '/stock',    icon: ChartLineUp },
]

interface TabBarProps {
  /** 계측용 화면 코드 — 필수다 (#75). 탭바는 화면 9개에 뜨는데 예전엔 전부
      같은 `탭바-{id}` 를 찍었다. 어느 화면에서 탭바로 이탈했는지 targetId 만으로
      갈리게 한다 (#44 헤더 뒤로와 같은 처리). 필수로 둬야 새 화면이 빠뜨리면
      typecheck 가 잡는다. */
  screen: ScreenCode
  /** 어느 탭을 선택 상태로 볼지. 없으면 현재 경로로 판단 */
  activeId?: string
}

export function TabBar({ activeId, screen }: TabBarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const track = useTrack()

  /* 서브 화면(진단·청구·에이전트)에는 탭바가 아예 없어서(Figma 실측)
     여기 걸릴 일이 없다. 탭바가 뜨는 건 홈·금융·상품·스켈레톤뿐. */
  const current =
    activeId ??
    TABS.find((t) => location.pathname.startsWith(t.match))?.id ??
    'home'

  return (
    <nav className={styles.bar} aria-label="주요 메뉴">
      {TABS.map((tab) => {
        const selected = tab.id === current
        const Icon = tab.icon
        return (
          <button
            key={tab.id}
            type="button"
            className={styles.tab}
            data-selected={selected}
            aria-current={selected ? 'page' : undefined}
            onClick={() => {
              track(tid(screen, ELEMENT.탭, tab.id))
              // 쿼리(?state=A|B)를 유지해야 조건이 안 풀린다
              navigate({ pathname: tab.path, search: location.search })
            }}
          >
            <Icon size={22} weight="fill" />
            <span className={`${styles.label} t-label`}>{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
