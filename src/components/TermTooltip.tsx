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

  /* 사전에 없는 용어면 버튼을 만들지 않는다 (#109) — 예전엔 [용어 ?] 가
     그대로 뜨고 aria-expanded 만 토글되면서 말풍선은 영영 안 나왔다.
     참가자에겐 "눌러도 아무 일 없는 버튼"이라 고장으로 읽힌다. */
  if (!text) return <span className={`${styles.term} t-body-sm`}>{term}</span>

  return (
    <span className={styles.wrap}>
      <button
        type="button"
        className={styles.row}
        aria-expanded={open}
        onClick={() => {
          /* 여는 것만이 아니라 닫는 것도 남긴다 — 용어를 열었다 닫았다 하는 건
             헤맴 신호다 (#88 "활성 탭 재탭도 기록"과 같은 기준) */
          onOpen?.(term)
          setOpen((v) => !v)
        }}
      >
        <span className={`${styles.term} t-body-sm`}>{term}</span>
        <span className={`${styles.mark} t-label`} aria-hidden="true">?</span>
      </button>

      {open ? (
        <span className={`${styles.bubble} t-caption`} role="tooltip">
          {text}
        </span>
      ) : null}
    </span>
  )
}
