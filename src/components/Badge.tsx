/* 뱃지 — pill · 12/500 (스펙 §5).
   variant:
     primary  파랑 글자 + 틴트 배경 — "먼저 볼 항목"
     neutral  회색 글자 + 흰 배경   — "부모님 가입"
     fill     --primary 채움 + 흰 글자 — 자사 표기
     outline  테두리 + 회색 글자     — 타사 표기 */

import type { ReactNode } from 'react'
import styles from './Badge.module.css'

interface BadgeProps {
  variant?: 'primary' | 'neutral' | 'fill' | 'outline'
  children: ReactNode
}

export function Badge({ variant = 'primary', children }: BadgeProps) {
  return (
    <span className={`${styles.badge} t-label`} data-variant={variant}>
      {children}
    </span>
  )
}
