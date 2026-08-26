/* 티어 더보기 토글 — 배경 없음, 14/500 --text-caption, chevron 회전.
   ⚠️ 버튼처럼 크게 만들지 말 것 (Figma에서 한 번 크게 갔다가 축소한 이력). */

import { CaretDown } from '@phosphor-icons/react'
import styles from './MoreToggle.module.css'

interface MoreToggleProps {
  /** 접힘 상태의 문구 — "항목 3개 더 보기" */
  label: string
  /** 펼침 상태의 문구 — "접기" */
  collapseLabel: string
  expanded: boolean
  onToggle: () => void
}

export function MoreToggle({ label, collapseLabel, expanded, onToggle }: MoreToggleProps) {
  return (
    <button
      type="button"
      className={`${styles.toggle} t-body-sm-medium`}
      aria-expanded={expanded}
      onClick={onToggle}
    >
      {expanded ? collapseLabel : label}
      <span className={styles.icon} data-expanded={expanded}>
        <CaretDown size={14} weight="regular" color="var(--text-caption)" />
      </span>
    </button>
  )
}
