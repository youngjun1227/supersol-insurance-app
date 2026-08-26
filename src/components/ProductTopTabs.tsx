/* 상품 탭의 상단 탭 행 — 실제 가로 스크롤 (탭 9개).
   ⚠️ '보험'이 맨 끝이라 /product(발견)에서는 화면 밖에 있다 — 스크롤해야 보인다.
   실물의 "스크롤해서 보험 찾기" 마찰을 그대로 재현하는 게 목적이다 (계측 대상).

   /product          발견 선택 · 스크롤 위치 0
   /product/insurance 보험 선택 · 끝까지 스크롤된 상태 */

import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { PRODUCT_TABS, type ProductTabId } from '@/data/paths'
import { ELEMENT, SCREEN, tid } from '@/lib/targetId'
import { useTrack } from '@/lib/useTrack'
import styles from './ProductTopTabs.module.css'

export function ProductTopTabs({ active }: { active: ProductTabId }) {
  const navigate = useNavigate()
  const location = useLocation()
  const track = useTrack()
  const scrollRef = useRef<HTMLDivElement>(null)

  // 보험 선택 상태로 들어오면 끝까지 스크롤된 채로 시작한다
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    if (active === 'insurance') el.scrollLeft = el.scrollWidth
    else el.scrollLeft = 0
  }, [active])

  return (
    <div className={`${styles.scroller} no-scrollbar`} ref={scrollRef} role="tablist">
      <div className={styles.row}>
        {PRODUCT_TABS.map((tab) => {
          const selected = tab.id === active
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              className={`${styles.tab} ${selected ? 't-body-lg-bold' : 't-body-lg'}`}
              data-selected={selected}
              onClick={() => {
                if (selected) return
                track(tid(SCREEN.productPath, ELEMENT.탭, tab.id))
                // 아직 안 만든 탭은 이동하지 않는다 (발견·보험만 화면이 있다)
                if (tab.path) navigate({ pathname: tab.path, search: location.search })
              }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
