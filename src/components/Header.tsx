/* §5 Header — h56.
   제목형: h1 22/700 --text-black + 우측 아이콘
   서브형: 뒤로 화살표 + 제목 20/700 */

import { CaretLeft } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTrack } from '@/lib/useTrack'
import styles from './Header.module.css'

interface HeaderProps {
  title: string
  /** 'title' = 페이지 제목형 / 'sub' = 뒤로 + 제목 */
  variant?: 'title' | 'sub'
  /** 우측 아이콘 버튼들 — <IconAction> 을 넣는다 */
  actions?: ReactNode
  /** 제목 옆 장식 — 드롭다운형 헤더의 ▾ (S2-D) */
  titleAdornment?: ReactNode
  /** 뒤로 눌렀을 때. 기본은 history back */
  onBack?: () => void
}

export function Header({ title, variant = 'title', actions, titleAdornment, onBack }: HeaderProps) {
  const navigate = useNavigate()
  const track = useTrack()

  const handleBack = () => {
    track('헤더-뒤로')
    if (onBack) onBack()
    else navigate(-1)
  }

  return (
    <header className={styles.header}>
      {variant === 'sub' ? (
        <button type="button" className={styles.back} onClick={handleBack} aria-label="뒤로">
          <CaretLeft size={24} weight="regular" color="var(--text-secondary)" />
        </button>
      ) : null}

      <h1 className={variant === 'title' ? `${styles.title} t-h1` : `${styles.subTitle} t-h2`}>
        {title}
      </h1>
      {titleAdornment ? <span className={styles.adornment}>{titleAdornment}</span> : null}

      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </header>
  )
}

interface IconActionProps {
  /** 계측용 이름 */
  targetId: string
  label: string
  onClick?: () => void
  children: ReactNode
}

/** 헤더 우측 아이콘 버튼 (검색·알림·전체메뉴 등) */
export function IconAction({ targetId, label, onClick, children }: IconActionProps) {
  const track = useTrack()
  return (
    <button
      type="button"
      className={styles.action}
      aria-label={label}
      onClick={() => {
        track(targetId)
        onClick?.()
      }}
    >
      {children}
    </button>
  )
}
