/* 토글 — 스펙 §5. 51×31 iOS 표준.
   On --primary / Off --bg-segment-track

   ⚠️ Figma 컴포넌트는 52×32 지만 스펙(51×31)을 따른다 —
   스펙 §3 은 실제 앱 픽셀 실측 규범이고 1px 차이는 육안 등가다.
   (변경로그 "토큰 vs Figma 충돌 시 토큰이 이긴다") */

import styles from './Toggle.module.css'

interface ToggleProps {
  checked: boolean
  onChange: (next: boolean) => void
  /** 스크린리더용 이름 — 라벨이 따로 있으면 그걸 가리켜도 된다 */
  label: string
  disabled?: boolean
}

export function Toggle({ checked, onChange, label, disabled = false }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={styles.track}
      data-on={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
    >
      <span className={styles.knob} aria-hidden="true" />
    </button>
  )
}
