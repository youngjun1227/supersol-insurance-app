/* 상품 탭의 상단 탭 행 — 실제 가로 스크롤 (탭 9개).
   ⚠️ '보험'이 맨 끝이라 /product(발견)에서는 화면 밖에 있다 — 스크롤해야 보인다.
   실물의 "스크롤해서 보험 찾기" 마찰을 그대로 재현하는 게 목적이다 (계측 대상).

   /product          발견 선택 · 스크롤 위치 0
   /product/insurance 보험 선택 · 끝까지 스크롤된 상태 */

import { useEffect, useRef } from 'react'
import { PRODUCT_TABS, type ProductTabId } from '@/data/paths'
import { ELEMENT, type ScreenCode, tid } from '@/lib/targetId'
import { useTrack } from '@/lib/useTrack'
import { useTrackedNavigate } from '@/lib/useTrackedNavigate'
import styles from './ProductTopTabs.module.css'

interface ProductTopTabsProps {
  active: ProductTabId
  /** 이 탭 행이 놓인 화면 (#100).
      ⚠️ 필수다 — 하드코딩했더니 S2-A·S2-D·경로 화면에서 누른 탭이
         전부 같은 targetId 로 뭉쳐 화면별 이탈을 구분할 수 없었다. */
  screen: ScreenCode
}

export function ProductTopTabs({ active, screen }: ProductTopTabsProps) {
  const go = useTrackedNavigate()
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
                /* 활성 탭 재탭도 기록 (#88) — 헤맴 신호. 이동만 막는다 */
                track(tid(screen, ELEMENT.탭, tab.id))
                if (selected) return
                // 아직 안 만든 탭은 이동하지 않는다 (발견·보험만 화면이 있다)
                if (tab.path) go(null, tab.path)
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
