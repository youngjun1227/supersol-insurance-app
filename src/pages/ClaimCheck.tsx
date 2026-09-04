/* 체크 행 — 청구 흐름(S5-A 알림 방법) 안에서만 쓰는 로컬 조각.
   S4-A·S4-D 서류 목록도 이걸 썼으나 2026-09-04 체크박스를 뺐다 (→ ClaimDocList).
   ⚠️ 공용 컴포넌트(src/components)는 팀장이 만든다 — 체크박스가 아직 없어
      흐름 안에 두고, 다른 화면에도 필요해지면 승격을 요청한다.
   onToggle 이 없으면 고정 체크 — S5-A "앱 알림 (기본)" 처럼 끌 수 없는 항목. */

import { Check } from '@phosphor-icons/react'
import { useTrack } from '@/lib/useTrack'
import styles from './ClaimCheck.module.css'

interface ClaimCheckProps {
  label: string
  checked: boolean
  /** 계측용 — 반드시 tid() 로 만들어 넘긴다 */
  targetId: string
  /** 없으면 고정 체크 (탭해도 안 바뀌지만 탭 자체는 기록한다 — 헤맴 진단용) */
  onToggle?: (next: boolean) => void
}

export function ClaimCheck({ label, checked, targetId, onToggle }: ClaimCheckProps) {
  const track = useTrack()
  const fixed = !onToggle

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-disabled={fixed || undefined}
      className={styles.row}
      data-checked={checked}
      data-fixed={fixed}
      onClick={() => {
        track(targetId)
        onToggle?.(!checked)
      }}
    >
      <span className={styles.box} aria-hidden="true">
        {checked ? <Check size={16} weight="regular" color="var(--on-primary)" /> : null}
      </span>
      <span className={`${styles.label} t-body`}>{label}</span>
    </button>
  )
}
