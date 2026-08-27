/* S1-13 기준 시트 — Figma 317:1286(on) / 387:2506(off 결과).
   보험 메인 위에 뜨는 오버레이. 라우트가 아니다.

   설문 "선별 기준 공개 요구 69.8%" 때문에 끄기가 필수인 화면이고,
   여기 토글이 ?custom=off 를 만들어 S1-14 를 띄운다.

   껍데기·토글·확인 버튼은 공용 <BottomSheet>·<Toggle>·<Button> (#35).
   딤 탭·Esc·뒤 스크롤 잠금은 BottomSheet 가 처리한다.
   X 버튼 없음 — figma-ref 의 S1-13·S4-A 둘 다 없어 공용 기본값이 X 없음. */

import { useCallback } from 'react'
import { BottomSheet, Button, Toggle } from '@/components'
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

  /** 딤 탭·Esc — 공용 BottomSheet 가 onClose 하나로 합치므로 경로를 나누지 않는다.
      확인 버튼은 <Button targetId> 가 따로 계측한다 */
  const dismiss = useCallback(() => {
    track(tid(SCREEN.s1Sheet, ELEMENT.닫기))
    onClose()
  }, [track, onClose])

  const toggle = (next: boolean) => {
    // 끄는 동작이 이 화면의 존재 이유라 on/off 를 타깃에 남긴다
    track(tid(SCREEN.s1Sheet, ELEMENT.토글, next ? 'on' : 'off'))
    setCustomOn(next)
  }

  return (
    <BottomSheet open={open} onClose={dismiss} label={C.title}>
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
          <Toggle checked={customOn} onChange={toggle} label={C.toggleLabel} />
        </div>
      </div>

      <Button
        size="lg"
        block
        targetId={tid(SCREEN.s1Sheet, ELEMENT.버튼, '확인')}
        onClick={onClose}
      >
        {C.confirm}
      </Button>
    </BottomSheet>
  )
}
