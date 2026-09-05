/* S4-D 청구 절차 안내 — Figma 317:7032 · figma-ref/S4-D-청구절차.png
   S4-A 팝업의 "보험금 청구하기"에서 도착한다. 9/11 과제 2(claim)의 성공 판정 지점.
   실제 청구 입력·제출 화면은 범위 밖 — "청구 시작하기"는 완료 화면으로 바로 간다. */

import { List } from '@phosphor-icons/react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppShell, BottomCTA, Button, Header, IconAction } from '@/components'
import { CLAIM_GUIDE as C } from '@/data/copy'
import { ELEMENT, SCREEN, tid } from '@/lib/targetId'
import { ClaimDocList } from './ClaimDocList'
import styles from './ClaimGuide.module.css'

export function ClaimGuide() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <AppShell
      name="S4-D-절차안내"
      footerType="cta"
      footer={
        <BottomCTA>
          <Button
            block
            size="lg"
            targetId={tid(SCREEN.s4Guide, ELEMENT.버튼, '청구시작')}
            onClick={() => navigate({ pathname: '/claim/done', search: location.search })}
          >
            {C.cta}
          </Button>
        </BottomCTA>
      }
      header={
        <Header
          title={C.title}
          variant="sub"
          screen={SCREEN.s4Guide}
          actions={
            <IconAction targetId={tid(SCREEN.s4Guide, ELEMENT.버튼, '전체메뉴')} label="전체메뉴">
              <List size={24} weight="regular" color="var(--text-secondary)" />
            </IconAction>
          }
        />
      }
    >
      <div className={styles.body}>
        <section className={styles.section}>
          <h2 className={`${styles.sectionTitle} t-h2`}>{C.stepsTitle}</h2>
          <ol className={styles.steps}>
            {C.steps.map((step, i) => (
              <li key={step.name} className={styles.step}>
                <span className={`${styles.stepNo} t-body-sm-medium`} aria-hidden="true">
                  {i + 1}
                </span>
                <div className={styles.stepText}>
                  <p className={`${styles.stepName} t-body-lg-bold`}>{step.name}</p>
                  <p className={`${styles.stepDesc} t-body-sm`}>{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.section}>
          <h2 className={`${styles.sectionTitle} t-h2`}>{C.docsTitle}</h2>
          <ClaimDocList docs={C.docs} className={styles.docs} />
          <p className={`${styles.note} t-caption`}>{C.docsNote}</p>
        </section>
      </div>
    </AppShell>
  )
}
