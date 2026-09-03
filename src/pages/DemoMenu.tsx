/* 시연 시나리오 선택 (/demo) — 진행자용.

   참가자에게 보여주는 화면이 아니라서 디자인 토큰만 지키고 꾸미지 않는다
   (/export 와 같은 기준). 진행자가 여기서 시나리오를 골라 참가자 폰에 띄운다. */

import { useNavigate } from 'react-router-dom'
import { AppShell, Button, Header } from '@/components'
import { SCENARIOS } from '@/data/scenarios'
import { ELEMENT, SCREEN, tid } from '@/lib/targetId'
import styles from './DemoMenu.module.css'

export function DemoMenu() {
  const navigate = useNavigate()

  return (
    <AppShell name="시연-시나리오" header={<Header title="시연 시나리오" variant="sub" />}>
      <div className={styles.body}>
        <p className={`${styles.note} t-body-sm`}>
          앱 밖에서 알림을 받고 들어오는 흐름을 재현합니다. 실제 푸시가 아니라 연출이라,
          참가자에게는 <b>“알림이 왔다고 가정하고 눌러 보세요”</b>라고 안내해 주세요.
        </p>

        {/* 상황 전환 — 발표에서 청중이 두 화면을 다 보게 하는 자리 (#130).
            9/11 에는 진행자가 참가자를 앉히기 전에 여기서 배정 상태를 고른다 */}
        <section className={styles.card}>
          <h2 className={`${styles.h} t-h3`}>상황 고르기</h2>
          <p className={`${styles.desc} t-body-sm`}>
            보험 가입 여부에 따라 보험 탭이 다른 화면을 보여줍니다.
            참가자를 앉히기 전에 배정된 쪽을 눌러 두세요.
          </p>
          <Button
            block
            targetId={tid(SCREEN.demoMenu, ELEMENT.버튼, '상황고르기')}
            onClick={() => navigate('/start')}
          >
            진입 화면 열기
          </Button>
        </section>

        {SCENARIOS.map((s) => (
          <section key={s.id} className={styles.card}>
            <h2 className={`${styles.h} t-h3`}>{s.label}</h2>
            <p className={`${styles.desc} t-body-sm`}>{s.desc}</p>
            {/* 계측은 Button 이 targetId 로 남긴다 — 여기서 또 부르면 탭 1회가 2건이 된다 */}
            <Button
              block
              targetId={tid(SCREEN.demoMenu, ELEMENT.버튼, s.id)}
              onClick={() => navigate(s.path)}
            >
              시작
            </Button>
          </section>
        ))}
      </div>
    </AppShell>
  )
}
