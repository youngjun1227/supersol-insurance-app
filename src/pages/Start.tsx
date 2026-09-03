/* 진입 화면 — 스플래시 다음, 홈 앞 (#130).

   왜 있나: 보험 가입 여부에 따라 S1 이 다른 화면을 보여주는 것이
   아이디어 2 의 핵심 주장인데, 지금은 `?state=A` 를 주소창에 직접
   쳐야만 0건 화면에 갈 수 있었다. PWA 로 홈 화면에 추가하면 쿼리가
   날아가 항상 기본값(B)으로 시작하는 문제도 있었다.

   두 자리에서 쓴다:
     9/11  진행자가 배정된 쪽을 미리 눌러 두고 폰을 넘긴다
           — 참가자는 이 화면을 보지 않는다
     9/20  청중이 QR 로 들어와 직접 고르고, 보고 나서 다른 쪽도 눌러 본다

   ⚠️ 카드 2장의 크기·구조를 같게 둔다. 한쪽이 커지면 그쪽이
      권장안으로 읽혀 선택이 기운다. */

import { AppShell } from '@/components'
import { START as C } from '@/data/copy'
import { ELEMENT, SCREEN, tid } from '@/lib/targetId'
import { useTrackedNavigate } from '@/lib/useTrackedNavigate'
import styles from './Start.module.css'

interface Choice {
  /** targetId 식별자 — 어느 쪽을 골랐는지 집계에 남는다 */
  id: string
  title: string
  desc: string
  icon: string
  /** 목적지. ?state 는 여기서 정해지고 이후 화면 이동에서 유지된다 */
  to: string
}

/* ⚠️ 배터리(보장에너지) 그림을 먼저 썼다가 되돌렸다 — 원본이 큰 히어로용이라
   48px 로 줄이니 눈금이 뭉개져 두 장이 구분되지 않았다. 뜻이 바로 읽히는
   그림으로 바꾼다 */
const CHOICES: Choice[] = [
  { id: '보유', title: C.haveTitle, desc: C.haveDesc, icon: '건강', to: '/?state=B' },
  { id: '미보유', title: C.emptyTitle, desc: C.emptyDesc, icon: '신규추천', to: '/?state=A' },
]

export function Start() {
  const go = useTrackedNavigate()

  return (
    <AppShell name="START-진입" background="page">
      <div className={styles.body}>
        <div className={styles.head}>
          <h1 className={`${styles.title} t-display`}>{C.title}</h1>
          <p className={`${styles.subtitle} t-body-lg`}>{C.subtitle}</p>
        </div>

        <div className={styles.choices}>
          {CHOICES.map((c) => (
            <button
              key={c.id}
              type="button"
              className={styles.choice}
              onClick={() => go(tid(SCREEN.start, ELEMENT.카드, c.id), c.to)}
            >
              <img className={styles.icon} src={`/assets/3d/${c.icon}.png`} alt="" aria-hidden="true" />
              <span className={styles.texts}>
                <span className={`${styles.choiceTitle} t-h3`}>{c.title}</span>
                <span className={`${styles.choiceDesc} t-body-sm`}>{c.desc}</span>
              </span>
              <span className={styles.chevron} aria-hidden="true">›</span>
            </button>
          ))}
        </div>

        <p className={`${styles.footnote} t-caption`}>{C.footnote}</p>
      </div>
    </AppShell>
  )
}
