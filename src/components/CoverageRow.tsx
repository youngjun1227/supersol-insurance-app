/* 보장 항목 행 — 2종 (Figma 실측).
     variant="card"    now 티어. 테두리 카드 r16 p14, 배터리 44×59,
                       이름 16/700 + 뱃지, 라벨 14/500, desc 13
     variant="compact" 그 밖 티어. 배경 없음 p4/8, 배터리 30×40,
                       이름 14/500, 라벨 13

   ⚠️ 탭 타깃이 2개다 — 행 전체(→S3-E)와 💬(→S3-F).
      계측도 따로 잡아야 해서 💬 클릭은 전파를 막는다. */

import { CaretRight, ChatCircleDots } from '@phosphor-icons/react'
import type { CoverageItem } from '@/data/types'
import { Badge } from './Badge'
import { Battery } from './Battery'
import styles from './CoverageRow.module.css'

interface CoverageRowProps {
  item: CoverageItem
  variant?: 'card' | 'compact'
  /** 행 전체 탭 — 항목 상세로 */
  onOpen?: (item: CoverageItem) => void
  /** 💬 탭 — 에이전트 대화로 */
  onAsk?: (item: CoverageItem) => void
}

export function CoverageRow({ item, variant = 'compact', onOpen, onAsk }: CoverageRowProps) {
  const isCard = variant === 'card'

  return (
    <div
      className={styles.row}
      data-variant={variant}
      role="button"
      tabIndex={0}
      onClick={() => onOpen?.(item)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen?.(item)
        }
      }}
    >
      <Battery level={item.batteryLevel} size={isCard ? 'row' : 'compact'} />

      <div className={styles.text}>
        <div className={styles.nameRow}>
          <span className={isCard ? 't-body-lg-bold' : 't-body-sm-medium'}>{item.label}</span>
          {item.badge ? <Badge variant="primary">{item.badge}</Badge> : null}
        </div>

        <p className={`${styles.values} ${isCard ? 't-body-sm-medium' : 't-caption'}`}>
          {item.mineLabel} · {item.peerLabel}
        </p>

        {item.desc ? <p className={`${styles.desc} t-caption`}>{item.desc}</p> : null}
      </div>

      <button
        type="button"
        className={styles.ask}
        aria-label={`${item.label} 물어보기`}
        onClick={(e) => {
          // 행 전체 탭과 다른 타깃이라 전파를 막는다
          e.stopPropagation()
          onAsk?.(item)
        }}
      >
        <ChatCircleDots size={22} weight="regular" color="var(--text-secondary)" />
      </button>

      <CaretRight size={16} weight="regular" color="var(--text-disabled)" />
    </div>
  )
}
