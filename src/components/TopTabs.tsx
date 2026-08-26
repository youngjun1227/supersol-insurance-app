/* §5 TopTabs — h46 · 16px.
   선택: --text-primary 700(Bold) + 언더라인 2px --text-caption(회색)
   비선택: --text-caption 400
   ⚠️ 2026-08-26 캡처 3x 실측 정정 — 이전 표기(500 + 파랑 언더라인)는 둘 다 틀렸다.
   스펙과 Figma가 부딪히면 실물 캡처(00_reference/screenshots/)가 최종 심판이다. */

import styles from './TopTabs.module.css'

export interface TopTabItem {
  id: string
  label: string
}

interface TopTabsProps {
  items: TopTabItem[]
  activeId: string
  onChange: (id: string) => void
}

export function TopTabs({ items, activeId, onChange }: TopTabsProps) {
  /* ⚠️ 여기서 계측하지 않는다 — 감싸는 쪽(FinanceTopTabs 등)이 tid()로 남긴다.
     둘 다 남기면 탭 1회가 2건으로 잡혀 클릭 수 지표가 부풀려진다 (실제로 겪음) */
  return (
    <div className={styles.row} role="tablist">
      {items.map((item) => {
        const selected = item.id === activeId
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={selected}
            className={`${styles.tab} ${selected ? 't-body-lg-bold' : 't-body-lg'}`}
            data-selected={selected}
            onClick={() => onChange(item.id)}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
