/* 바텀시트 / 중앙 팝업 — 스펙 §5 · Figma 52:88.
   딤 --dim + 시트. 아래에서 올라오는 트랜지션 0.35s ease-out.

   variant:
     'sheet' 하단에서 올라옴 · 상단만 r24 · p 32/20   — S1-13 기준 시트
     'center' 중앙 팝업 · 사방 r24                    — S4-A 결제 감지 팝업

   ⚠️ X 버튼은 기본으로 넣지 않는다. figma-ref 의 S1-13·S4-A 둘 다 X 가 없고
   하단 버튼으로 닫는다. 스펙 §5 의 "X 24 우상단"이 실물과 어긋나는 쪽이라
   필요한 화면만 closable 로 켠다 (팀원 A 리포트로 확인, 2026-08-27) */

import { useEffect, useRef, type ReactNode } from 'react'
import { X } from '@phosphor-icons/react'
import styles from './BottomSheet.module.css'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  variant?: 'sheet' | 'center'
  /** 우상단 X — 기본 없음 (figma-ref 기준) */
  closable?: boolean
  /** 스크린리더용 제목. 시트 안에 제목이 있으면 같은 문구를 넣는다 */
  label: string
  children: ReactNode
}

export function BottomSheet({
  open, onClose, variant = 'sheet', closable = false, label, children,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)

  /* Esc 로 닫기 + 열려 있는 동안 뒤 스크롤 막기.
     시트가 떠 있는데 뒤가 스크롤되면 어디를 보는지 알 수 없다 */
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className={styles.dim}
      data-variant={variant}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      /* 딤을 눌러도 닫힌다 — 시트 안 클릭은 전파를 막는다 */
      onClick={onClose}
    >
      <div
        className={styles.sheet}
        ref={sheetRef}
        onClick={(e) => e.stopPropagation()}
      >
        {closable ? (
          <button type="button" className={styles.close} aria-label="닫기" onClick={onClose}>
            <X size={24} weight="regular" color="var(--text-secondary)" />
          </button>
        ) : null}
        {children}
      </div>
    </div>
  )
}
