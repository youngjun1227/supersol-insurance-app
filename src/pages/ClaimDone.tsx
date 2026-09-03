/* 청구 완료 — Figma 386:2481 · figma-ref/청구완료.png
   S4-D "청구 시작하기"에서 도착한다 (입력·제출은 9/11 범위 밖 — 목업 접수).
   접수 내역은 S4-A 팝업과 같은 결제 건(pay-1)이다. 과제 2 "완료 화면까지면 가산" 지점. */

import { CaretRight, List } from '@phosphor-icons/react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppShell, BottomCTA, Button, Header, IconAction } from '@/components'
import { useMock } from '@/app/MockProvider'
import { CLAIM_DONE as C } from '@/data/copy'
import { won } from '@/lib/format'
import { ELEMENT, SCREEN, tid } from '@/lib/targetId'
import { useTrack } from '@/lib/useTrack'
import styles from './ClaimDone.module.css'

export function ClaimDone() {
  const navigate = useNavigate()
  const location = useLocation()
  const track = useTrack()
  const { data } = useMock()

  const payment = data.payments.find((p) => p.claimable)

  return (
    <AppShell
      name="청구완료"
      footerType="cta"
      footer={
        <BottomCTA>
          <Button
            block
            size="lg"
            targetId={tid(SCREEN.s4Done, ELEMENT.버튼, '확인')}
            onClick={() => navigate({ pathname: '/home', search: location.search })}
          >
            {C.cta}
          </Button>
        </BottomCTA>
      }
      header={
        <Header
          title={C.title}
          variant="sub"
          screen={SCREEN.s4Done}
          actions={
            <IconAction targetId={tid(SCREEN.s4Done, ELEMENT.버튼, '전체메뉴')} label="전체메뉴">
              <List size={24} weight="regular" color="var(--text-secondary)" />
            </IconAction>
          }
        />
      }
    >
      <div className={styles.body}>
        <img className={styles.illust} src="/assets/3d/축하.png" alt="" aria-hidden="true" />

        <h1 className={`${styles.headline} t-h2`}>{C.headline}</h1>
        <p className={`${styles.sub} t-body`}>{C.sub}</p>

        <dl className={styles.receipt}>
          <div className={styles.kv}>
            <dt className={`${styles.k} t-body-sm`}>{C.receiptLabel}</dt>
            <dd className={`${styles.v} t-body-sm-medium`}>{C.receiptNo}</dd>
          </div>
          <div className={styles.kv}>
            <dt className={`${styles.k} t-body-sm`}>{C.hospitalLabel}</dt>
            <dd className={`${styles.v} t-body-sm-medium`}>{payment?.merchant}</dd>
          </div>
          <div className={styles.kv}>
            <dt className={`${styles.k} t-body-sm`}>{C.amountLabel}</dt>
            <dd className={`${styles.v} t-body-sm-medium`}>{payment ? won(payment.amount) : ''}</dd>
          </div>
        </dl>

        {/* S5-A 진입 행 — 아이디어 3 의 opt-in 동의가 여기서 시작한다 */}
        <button
          type="button"
          className={styles.settingsRow}
          onClick={() => {
            track(tid(SCREEN.s4Done, ELEMENT.행, '알림설정'))
            navigate({ pathname: '/claim/settings', search: location.search })
          }}
        >
          <span className={styles.settingsText}>
            <span className={`${styles.settingsTitle} t-body-sm-medium`}>{C.settingsTitle}</span>
            <span className={`${styles.settingsSub} t-caption`}>{C.settingsSub}</span>
          </span>
          <CaretRight size={20} weight="regular" color="var(--text-disabled)" />
        </button>
      </div>
    </AppShell>
  )
}
