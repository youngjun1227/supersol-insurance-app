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
import { useTrack } from '@/lib/useTrack'
import styles from './TabBar.module.css'

export interface TabItem {
  id: string
  label: string
  path: string
  icon: Icon
}

/** 실제 슈퍼쏠 탭 5개 */
export const TABS: TabItem[] = [
  { id: 'home',    label: '홈',   path: '/',        icon: House },
  { id: 'finance', label: '금융', path: '/finance', icon: Wallet },
  { id: 'product', label: '상품', path: '/product', icon: Storefront },
  { id: 'benefit', label: '혜택', path: '/benefit', icon: Gift },
  { id: 'stock',   label: '주식', path: '/stock',   icon: ChartLineUp },
]

interface TabBarProps {
  /** 어느 탭을 선택 상태로 볼지. 없으면 현재 경로로 판단 */
  activeId?: string
}

export function TabBar({ activeId }: TabBarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const track = useTrack()

  const current =
    activeId ??
    TABS.find((t) => t.path !== '/' && location.pathname.startsWith(t.path))?.id ??
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
              track(`탭바-${tab.id}`)
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
