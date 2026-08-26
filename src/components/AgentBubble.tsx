/* S6 에이전트 진입 버블 — 헤더 아래 우측 플로팅.
   말풍선 "상품에 대한 궁금한 점 물어보세요!" (primary 채움 pill, 흰 글자 13)
   + 신한 마스코트(쏠·흰 곰).

   ✅ 마스코트 사용은 2026-08-26 멘토 구두 허락됨 (이전 금지 규칙 해제).
   ⚠️ 현재 Figma 의 곰은 유사본 — 공식 에셋을 받으면 교체한다.
   에셋이 아직 없으면 말풍선만 뜬다 (버블 자체는 동작). */

import { useState } from 'react'
import styles from './AgentBubble.module.css'

interface AgentBubbleProps {
  label: string
  onTap: () => void
}

/** 마스코트 이미지 — 에셋이 들어오면 이 경로만 채우면 된다 */
const MASCOT_SRC = '/assets/mascot/sol.png'

export function AgentBubble({ label, onTap }: AgentBubbleProps) {
  /* 에셋이 아직 없으면 말풍선만 띄운다 — 깨진 이미지도, 빈 자리도 남기지 않는다 */
  const [hasMascot, setHasMascot] = useState(true)

  return (
    <button type="button" className={styles.wrap} onClick={onTap}>
      <span className={`${styles.bubble} t-caption-medium`}>{label}</span>
      {hasMascot ? (
        <img
          className={styles.mascot}
          src={MASCOT_SRC}
          alt=""
          aria-hidden="true"
          onError={() => setHasMascot(false)}
        />
      ) : null}
    </button>
  )
}
