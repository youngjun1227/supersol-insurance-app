/* S5-A 청구 알림 설정·동의 — Figma 317:7126 · figma-ref/S5-A-알림설정.png
   opt-in 동의 화면 — 청구완료의 "다음부터 자동으로 알려드릴까요?" 행에서 들어온다.
   탭바 없음 + 하단 고정 버튼 (변경로그 "탭바 귀속" 표).
   figma-ref 기본 상태: 알림 토글 Off · 앱 알림만 고정 체크 · 카카오톡 해제. */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell, BottomCTA, Button, Card, Header, HeaderActions, Toggle } from '@/components'
import { CLAIM_SETTINGS as C } from '@/data/copy'
import { ELEMENT, SCREEN, tid } from '@/lib/targetId'
import { useTrack } from '@/lib/useTrack'
import { ClaimCheck } from './ClaimCheck'
import styles from './ClaimSettings.module.css'

export function ClaimSettings() {
  const navigate = useNavigate()
  const track = useTrack()

  const [alarmOn, setAlarmOn] = useState(false)
  const [kakaoOn, setKakaoOn] = useState(false)

  return (
    <AppShell
      name="S5-A-알림설정"
      footerType="cta"
      footer={
        <BottomCTA>
          <Button
            block
            size="lg"
            targetId={tid(SCREEN.s5Settings, ELEMENT.버튼, '동의')}
            /* 동의 = 들어온 화면으로 복귀. 상태는 세션 안 로컬 — 저장 장치가 없다(목업) */
            onClick={() => navigate(-1)}
          >
            {C.cta}
          </Button>
        </BottomCTA>
      }
      header={
        <Header
          title={C.title}
          variant="sub"
          screen={SCREEN.s5Settings}
          actions={<HeaderActions screen={SCREEN.s5Settings} />}
        />
      }
    >
      <div className={styles.body}>
        <h1 className={`${styles.headline} t-h1`}>{C.headline}</h1>

        <Card bordered className={styles.consent}>
          <span className={`${styles.consentLabel} t-body-lg-medium`}>{C.toggleLabel}</span>
          <Toggle
            checked={alarmOn}
            label={C.toggleLabel}
            onChange={(next) => {
              /* opt-in 동의가 이 화면의 존재 이유라 방향을 타깃에 남긴다 (S1-13 선례) */
              track(tid(SCREEN.s5Settings, ELEMENT.토글, next ? '청구알림-on' : '청구알림-off'))
              setAlarmOn(next)
            }}
          />
        </Card>

        <section className={styles.methods}>
          <h2 className={`${styles.methodTitle} t-body-lg-bold`}>{C.methodTitle}</h2>
          <ClaimCheck
            label={C.methodApp}
            checked
            targetId={tid(SCREEN.s5Settings, ELEMENT.체크, '앱알림')}
          />
          <ClaimCheck
            label={C.methodKakao}
            checked={kakaoOn}
            targetId={tid(SCREEN.s5Settings, ELEMENT.체크, '카카오톡')}
            onToggle={setKakaoOn}
          />
          <p className={`${styles.hint} t-caption`}>{C.methodHint}</p>
        </section>

        <div className={styles.faqBox}>
          {C.faq.map(({ q, a }) => (
            <div key={q} className={styles.faqItem}>
              <p className={`${styles.q} t-body-sm-medium`}>{q}</p>
              <p className={`${styles.a} t-body-sm`}>{a}</p>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
