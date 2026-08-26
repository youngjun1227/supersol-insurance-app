/* §5 TopTabs — h46 · 16px.
   선택: --text-primary 500 + 언더라인 2px --primary
   비선택: --text-caption 400 (Medium 아님, 8/24 보정) */

import { useTrack } from '@/lib/useTrack'
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
  const track = useTrack()

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
            className={`${styles.tab} ${selected ? 't-body-lg-medium' : 't-body-lg'}`}
            data-selected={selected}
            onClick={() => {
              track(`상단탭-${item.id}`)
              onChange(item.id)
            }}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
