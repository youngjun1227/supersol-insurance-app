/* 카드 컨테이너 — 라운드·배경만 담당한다.
     surface  흰 배경
     tint     --bg-tint 채움
   radius 는 토큰 이름 그대로 (§3 8개).

   ⚠️ 테두리는 기본이 아니다 — 필요한 화면만 `bordered` 로 켠다 (#46).
      스펙 §5 가 테두리를 명시한 카드는 ProductCard·InsightCard 뿐이고,
      figma-ref 상 틴트 배경 화면(홈·S1-9·S1-8·S1-14)의 카드에는 테두리가 없다.
      흰 배경에서 흰 카드를 구분해야 하는 S1-7·S3-E 만 켠다. */

import type { CSSProperties, ReactNode } from 'react'
import styles from './Card.module.css'

interface CardProps {
  variant?: 'surface' | 'tint'
  radius?: 'sm' | 'card' | 'xl' | 'lg'
  /** 1px 테두리 — 흰 배경 위 흰 카드처럼 경계가 필요할 때만 */
  bordered?: boolean
  className?: string
  style?: CSSProperties
  children: ReactNode
}

export function Card({
  variant = 'surface',
  radius = 'card',
  bordered = false,
  className,
  style,
  children,
}: CardProps) {
  return (
    <div
      className={`${styles.card} ${className ?? ''}`}
      data-variant={variant}
      data-radius={radius}
      data-bordered={bordered}
      style={style}
    >
      {children}
    </div>
  )
}
