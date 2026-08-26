/* 용어 툴팁 — [무배당 ?] 를 탭하면 말풍선이 뜬다.
   ⚠️ 오버레이(absolute)라 콘텐츠를 밀지 않는다 (스펙 §5).
   말풍선: bg --bg-chip-selected · 흰 글자 13 · r8 */

import { useState } from 'react'
import { TERM_TOOLTIPS } from '@/data'
import styles from './TermTooltip.module.css'

interface TermTooltipProps {
  term: string
  /** 계측 — 어떤 용어를 눌렀는지 */
  onOpen?: (term: string) => void
}

export function TermTooltip({ term, onOpen }: TermTooltipProps) {
  const [open, setOpen] = useState(false)
  const text = TERM_TOOLTIPS[term]

  return (
    <span className={styles.wrap}>
      <button
        type="button"
        className={styles.row}
        aria-expanded={open}
        onClick={() => {
          if (!open) onOpen?.(term)
          setOpen((v) => !v)
        }}
      >
        <span className={`${styles.term} t-body-sm`}>{term}</span>
        <span className={`${styles.mark} t-label`} aria-hidden="true">?</span>
      </button>

      {open && text ? (
        <span className={`${styles.bubble} t-caption`} role="tooltip">
          {text}
        </span>
      ) : null}
    </span>
  )
}
