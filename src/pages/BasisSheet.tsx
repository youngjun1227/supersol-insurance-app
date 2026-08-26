/* S1-13 기준 시트 — Figma 317:1286(on) / 387:2506(off 결과).
   보험 메인 위에 뜨는 오버레이. 라우트가 아니다.

   설문 "선별 기준 공개 요구 69.8%" 때문에 끄기가 필수인 화면이고,
   여기 토글이 ?custom=off 를 만들어 S1-14 를 띄운다.

   ⚠️ 껍데기(딤 + 올라오는 패널)와 토글 스위치는 공용 컴포넌트
      <BottomSheet>·<Toggle>(스펙 §5) 자리다. 아직 없어서 임시로 여기서 그린다.
      팀장이 만들어 주면 아래 [임시] 표시된 두 곳만 갈아끼우면 된다.
      S4-A 팝업(#11)·S5-A 알림설정(#12)이 같은 부품을 쓴다. */

import { useCallback, useEffect } from 'react'
import { useMock } from '@/app/MockProvider'
import { BASIS_SHEET as C } from '@/data/copy'
import { ELEMENT, SCREEN, tid } from '@/lib/targetId'
import { useTrack } from '@/lib/useTrack'
import styles from './BasisSheet.module.css'

interface BasisSheetProps {
  open: boolean
  onClose: () => void
}

export function BasisSheet({ open, onClose }: BasisSheetProps) {
  const track = useTrack()
  const { data, customOn, setCustomOn } = useMock()

  const policyCount = data.policies.length

  const close = useCallback(
    (via: string) => {
      track(tid(SCREEN.s1Sheet, ELEMENT.닫기, via))
      onClose()
    },
    [track, onClose],
  )

  // ESC 로 닫기 (데스크톱 검수용 — 폰에서는 딤 탭)
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close('esc')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close])

  if (!open) return null

  const toggle = () => {
    const next = !customOn
    // 끄는 동작이 이 화면의 존재 이유라 on/off 를 타깃에 남긴다
    track(tid(SCREEN.s1Sheet, ELEMENT.토글, next ? 'on' : 'off'))
    setCustomOn(next)
  }

  return (
    /* [임시 ①] 공용 <BottomSheet> 자리 — 딤 + 아래에서 올라오는 패널 */
    <div className={styles.overlay}>
      <button
        type="button"
        className={styles.dim}
        aria-label="닫기"
        onClick={() => close('딤')}
      />

      {/* ⚠️ 스펙 §5 BottomSheet 는 "X 24 우상단"이라고 적혀 있지만
          figma-ref/S1-13-기준시트.png 에는 X 가 없다. 검수 기준이 PNG 육안 등가라
          여기서는 PNG 를 따른다 — 닫기는 딤 탭·확인 버튼. 공용 <BottomSheet> 를
          만들 때 팀장이 정할 문제라 로그에 남길 것. */}
      <div className={styles.sheet} role="dialog" aria-modal="true" aria-label={C.title}>
        <p className={`${styles.title} t-h3`}>{C.title}</p>
        <p className={`${styles.subtitle} t-body-sm`}>
          {C.subtitle.replace('{n}', String(policyCount))}
        </p>

        <div className={styles.facts}>
          <p className={`${styles.factsTitle} t-body-sm-medium`}>{C.factsTitle}</p>

          <div className={styles.factRow}>
            <span className={`${styles.factLabel} t-body`}>{C.ageLabel}</span>
            <span className={`${styles.factValue} t-body`}>{C.ageValue}</span>
          </div>
          <div className={styles.factRow}>
            <span className={`${styles.factLabel} t-body`}>{C.policyLabel}</span>
            <span className={`${styles.factValue} t-body`}>
              {C.policyValue.replace('{n}', String(policyCount))}
            </span>
          </div>

          <div className={styles.toggleRow}>
            <span className={styles.toggleText}>
              <span className={`${styles.toggleLabel} t-body-lg-medium`}>{C.toggleLabel}</span>
              <span className={`${styles.toggleHint} t-caption`}>{C.toggleHint}</span>
            </span>

            {/* [임시 ②] 공용 <Toggle> 자리 — 51×31 iOS 스타일 (스펙 §5) */}
            <button
              type="button"
              className={styles.switch}
              role="switch"
              aria-checked={customOn}
              aria-label={C.toggleLabel}
              data-on={customOn}
              onClick={toggle}
            >
              <span className={styles.knob} aria-hidden="true" />
            </button>
          </div>
        </div>

        <button
          type="button"
          className={`${styles.confirm} t-body-lg-bold`}
          onClick={() => {
            track(tid(SCREEN.s1Sheet, ELEMENT.버튼, '확인'))
            onClose()
          }}
        >
          {C.confirm}
        </button>
      </div>
    </div>
  )
}
