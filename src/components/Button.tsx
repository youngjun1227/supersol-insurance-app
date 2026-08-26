/* §5 Button.
   primary: bg --primary · 글자 흰 16/700
   tint:    bg --bg-tint-btn · 글자 --primary 16/500
   ⚠️ 아웃라인 버튼은 없다 — SOL 2차 버튼은 틴트 채움 (실측 확정).
   size: 'md' 인라인 h48 r8 / 'lg' 하단 CTA h56 r16 */

import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { useTrack } from '@/lib/useTrack'
import styles from './Button.module.css'

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  variant?: 'primary' | 'tint'
  size?: 'md' | 'lg'
  /** 계측용 이름. 없으면 버튼 글자를 쓴다 */
  targetId?: string
  /** 폭 100% */
  block?: boolean
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  targetId,
  block = false,
  children,
  onClick,
  ...rest
}: ButtonProps) {
  const track = useTrack()

  return (
    <button
      type="button"
      className={`${styles.btn} ${size === 'lg' ? 't-body-lg-bold' : variant === 'tint' ? 't-body-lg-medium' : 't-body-lg-bold'}`}
      data-variant={variant}
      data-size={size}
      data-block={block}
      onClick={(e) => {
        track(targetId ?? (typeof children === 'string' ? children : 'button'))
        onClick?.(e)
      }}
      {...rest}
    >
      {children}
    </button>
  )
}
