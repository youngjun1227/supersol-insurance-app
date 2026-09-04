/* 바텀시트 / 중앙 팝업 — 스펙 §5 · Figma 52:88.
   딤 --dim + 시트. 아래에서 올라오는 트랜지션 0.35s ease-out.

   variant:
     'sheet' 하단에서 올라옴 · 상단만 r24 · p 32/20   — S1-13 기준 시트
     'center' 중앙 팝업 · 사방 r24                    — S4-A 결제 감지 팝업

   ⚠️ X 버튼은 기본으로 넣지 않는다. figma-ref 의 S1-13·S4-A 둘 다 X 가 없고
   하단 버튼으로 닫는다. 스펙 §5 의 "X 24 우상단"이 실물과 어긋나는 쪽이라
   필요한 화면만 closable 로 켠다 (팀원 A 리포트로 확인, 2026-08-27) */

import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from '@phosphor-icons/react'
import styles from './BottomSheet.module.css'

/* 열려 있는 시트를 쌓아 둔다 (#104).
   ① 스크롤 잠금은 참조 카운트로 — 시트 A 위에 B 가 열렸다 A→B 순서로 닫히면
      각자 캡처한 prev 로 복원하다 body 가 'hidden' 인 채 영영 남는다.
   ② Esc 는 맨 위 시트만 닫는다 — document 리스너를 각자 달면 한 번에 다 닫힌다. */
const sheetStack: { close: () => void }[] = []
let savedBodyOverflow: string | null = null

function pushSheet(entry: { close: () => void }) {
  if (sheetStack.length === 0) {
    savedBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }
  sheetStack.push(entry)
}

function popSheet(entry: { close: () => void }) {
  const i = sheetStack.indexOf(entry)
  if (i !== -1) sheetStack.splice(i, 1)
  if (sheetStack.length === 0) {
    document.body.style.overflow = savedBodyOverflow ?? ''
    savedBodyOverflow = null
  }
}

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
  /** onClose 를 매 렌더 새로 만드는 호출부가 있어도 effect 가 다시 돌지 않게 */
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  /* Esc 로 닫기 + 열려 있는 동안 뒤 스크롤 막기.
     시트가 떠 있는데 뒤가 스크롤되면 어디를 보는지 알 수 없다 */
  useEffect(() => {
    if (!open) return

    const entry = { close: () => onCloseRef.current() }
    pushSheet(entry)

    const onKey = (e: KeyboardEvent) => {
      // 맨 위 시트만 닫는다 — 중첩 시 한 번에 다 닫히면 안 된다
      if (e.key === 'Escape' && sheetStack[sheetStack.length - 1] === entry) {
        entry.close()
      }
    }
    document.addEventListener('keydown', onKey)

    /* 열릴 때 시트로 포커스를 옮기고, 닫히면 열었던 자리로 돌려준다.
       aria-modal 만 선언하고 포커스를 안 옮기면 스크린리더가 시트가 뜬 걸 모른다 */
    const opener = document.activeElement as HTMLElement | null
    sheetRef.current?.focus()

    return () => {
      popSheet(entry)
      document.removeEventListener('keydown', onKey)
      opener?.focus?.()
    }
  }, [open])

  if (!open) return null

  /* body 로 포털 — 호출부가 AppShell .body(overflow-y:auto + -webkit-overflow-scrolling)
     안이라 iOS 사파리가 fixed 딤을 스크롤 컨테이너 기준으로 잡아 형제인 탭바가
     딤 위로 뜬다 (S4-A 실기기 리포트). 문서 루트에 두면 z-index 가 그대로 먹는다 */
  return createPortal(
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
        /* 포커스를 받되 탭 순서에는 끼지 않는다 (열릴 때 focus() 대상) */
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        {closable ? (
          <button type="button" className={styles.close} aria-label="닫기" onClick={onClose}>
            <X size={24} weight="regular" color="var(--text-secondary)" />
          </button>
        ) : null}
        {children}
      </div>
    </div>,
    document.body,
  )
}
