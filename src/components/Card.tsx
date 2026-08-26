/* 카드 컨테이너 — 라운드·배경·패딩만 담당한다.
     surface  흰 배경 + 테두리
     tint     --bg-tint 채움 (테두리 없음)
   radius 는 토큰 이름 그대로 (§3 8개). */

import type { CSSProperties, ReactNode } from 'react'
import styles from './Card.module.css'

interface CardProps {
  variant?: 'surface' | 'tint'
  radius?: 'sm' | 'card' | 'xl' | 'lg'
  className?: string
  style?: CSSProperties
  children: ReactNode
}

export function Card({
  variant = 'surface',
  radius = 'card',
  className,
  style,
  children,
}: CardProps) {
  return (
    <div
      className={`${styles.card} ${className ?? ''}`}
      data-variant={variant}
      data-radius={radius}
      style={style}
    >
      {children}
    </div>
  )
}
