/* 보장 항목 행 — 2종 (Figma 실측).
     variant="card"    now 티어. 테두리 카드 r16 p14, 배터리 44×59,
                       이름 16/700 + 뱃지, 라벨 14/500, desc 13
     variant="compact" 그 밖 티어. 배경 없음 p4/8, 배터리 30×40,
                       이름 14/500, 라벨 13

   ⚠️ 탭 타깃이 2개다 — 행 전체(→S3-E)와 💬(→S3-F).

   ⚠️ 행 전체를 role="button" div 로 감싸면 안 된다 (#105) — 그 안의 💬 버튼이
      접근성 트리에서 텍스트로 평탄화돼, 스크린리더 사용자는 💬 를 아예 못 누른다
      (그 참가자에게서는 S3C-물어보기-* 이벤트가 절대 안 나온다).
      배터리·텍스트·chevron 만 <button> 으로 묶고 💬 는 형제로 둔다. */

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
    <div className={styles.row} data-variant={variant}>
      {/* 행 본문 = 항목 상세로 가는 버튼. 네이티브 <button> 이라
          Enter·Space 동작이 브라우저 기본과 같다 (예전 keydown 처리는
          키를 누르고 있으면 자동 반복해 탭이 여러 건 찍혔다) */}
      <button
        type="button"
        className={styles.main}
        onClick={() => onOpen?.(item)}
      >
        <Battery level={item.batteryLevel} size={isCard ? 'row' : 'compact'} />

        <span className={styles.text}>
          <span className={styles.nameRow}>
            <span className={isCard ? 't-body-lg-bold' : 't-body-sm-medium'}>{item.label}</span>
            {item.badge ? <Badge variant="primary">{item.badge}</Badge> : null}
          </span>

          <span className={`${styles.values} ${isCard ? 't-body-sm-medium' : 't-caption'}`}>
            {item.mineLabel} · {item.peerLabel}
          </span>

          {item.desc ? <span className={`${styles.desc} t-caption`}>{item.desc}</span> : null}
        </span>
      </button>

      <button
        type="button"
        className={styles.ask}
        aria-label={`${item.label} 물어보기`}
        onClick={() => onAsk?.(item)}
      >
        <ChatCircleDots size={22} weight="regular" color="var(--text-secondary)" />
      </button>

      <CaretRight size={16} weight="regular" color="var(--text-disabled)" />
    </div>
  )
}
