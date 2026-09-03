/* 00 메인홈 — Figma 387:7886. 앱 켠 직후 화면이자 9/11 과제 4개의 공통 출발점.
   ⚠️ S4-A 결제 감지 팝업(팀원 B)이 이 위에 오버레이로 뜬다.

   공용 표면이라 팀장이 소유한다 — 홈의 targetId 가 흔들리면 클릭 수 기준점이 갈린다. */

import { Bell, Gift, House, Info, List, MagnifyingGlass } from '@phosphor-icons/react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppShell, Card, TabBar } from '@/components'
import { useMock } from '@/app/MockProvider'
import { won } from '@/lib/format'
import { ELEMENT, SCREEN, tid } from '@/lib/targetId'
import { useSecretTap } from '@/lib/useSecretTap'
import { useTrack } from '@/lib/useTrack'
import { ClaimPopup } from './ClaimPopup'
import styles from './Home.module.css'

export function Home() {

  const navigate = useNavigate()
  const location = useLocation()
  const track = useTrack()
  const { data } = useMock()

  const goFinance = () => {
    track(tid(SCREEN.home, ELEMENT.카드, '계좌'))
    navigate({ pathname: '/finance', search: location.search })
  }

  const openModerator = useSecretTap(() => navigate('/demo'))

  return (
    <AppShell
      name="00-메인홈"
      background="page"
      footer={<TabBar activeId="home" screen={SCREEN.home} />}
      footerType="tabbar"
      header={
        <div className={styles.header}>
          {/* 이름을 5번 연속 누르면 진행자 화면으로 (숨은 입구).
              참가자가 실수로 누를 자리가 아니고, 진행자는 주소를 타이핑하지 않아도 된다.
              ⚠️ 계측하지 않는다 — 진행자 조작이라 참가자 탭 수에 섞이면 안 된다 */}
          <div className={styles.greeting} onClick={openModerator}>
            <Info size={24} weight="regular" color="var(--text-secondary)" />
            <span className={`${styles.name} t-h2`}>{data.user.name}님</span>
          </div>
          <div className={styles.actions}>
            {[
              { id: '검색', label: '검색', Icon: MagnifyingGlass },
              { id: '알림', label: '알림', Icon: Bell },
              { id: '전체메뉴', label: '전체메뉴', Icon: List },
              { id: '홈', label: '홈', Icon: House },
            ].map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                className={styles.action}
                aria-label={label}
                onClick={() => track(tid(SCREEN.home, ELEMENT.버튼, id))}
              >
                <Icon size={24} weight="regular" color="var(--text-secondary)" />
              </button>
            ))}
          </div>
        </div>
      }
    >
      <div className={styles.body}>
        {/* 계좌 — 금융 탭으로 나가는 진입점 */}
        <Card radius="xl" className={styles.card}>
          <button type="button" className={styles.titleRow} onClick={goFinance}>
            <span className={`${styles.title} t-h2`}>계좌</span>
            <span className="u-chevron" aria-hidden="true">›</span>
          </button>

          <div className={styles.accountRow}>
            <img className={styles.logo} src="/assets/logo/shinhan-symbol.png" alt="" aria-hidden="true" />
            <div className={styles.accountText}>
              <span className={`${styles.accountName} t-body-sm`}>신한 주거래 우대통장(저축예금)</span>
              <span className={`${styles.accountAmount} t-h2`}>{won(data.home.accountBalance)}</span>
            </div>
            <span className={`${styles.pillBtn} t-body-sm`}>이체</span>
          </div>

          <p className={`${styles.tintBanner} t-label`}>
            모든 금융사 자산을 통합해서 한번에 관리하세요
          </p>
        </Card>

        {/* 카드 — 8월 이용 금액. S4-A 팝업이 이 값을 이어받는다 */}
        <Card radius="xl" className={styles.card}>
          <div className={styles.cardRow}>
            <img className={styles.cardArt} src="/assets/cards/kpass-check.png" alt="" aria-hidden="true" />
            <div className={styles.accountText}>
              <span className={`${styles.accountAmount} t-h2`}>(경기패스) K-패스 체크</span>
              <span className={`${styles.accountName} t-body`}>
                8월 이용 금액 {won(data.home.cardMonthlyUsage)}
              </span>
            </div>
          </div>
          <p className={`${styles.tintBtn} t-body-sm-medium`}>앱카드 가입</p>
        </Card>

        {/* 땡겨요 */}
        <Card radius="xl" className={styles.card}>
          <div className={styles.titleRow}>
            <span className={`${styles.title} t-h2`}>땡겨요</span>
            <span className="u-chevron" aria-hidden="true">›</span>
          </div>
          <div className={styles.promoRow}>
            <Gift size={24} weight="regular" color="var(--text-secondary)" />
            <span className={`${styles.promoText} t-body-lg-medium`}>
              8월 최대할인! 브랜드데이 확인하기
            </span>
          </div>
          <p className={`${styles.tintBanner} t-label`}>쿠폰 바로 받기</p>
          <div className={styles.divider} />
          <div className={styles.linkRow}>
            {['이벤트', '쿠폰', '포인트'].map((l) => (
              <span key={l} className={`${styles.link} t-body`}>{l}</span>
            ))}
          </div>
        </Card>

        {/* 이벤트 (스크롤 끝에서 잘림) */}
        <Card radius="xl" className={styles.card}>
          <div className={styles.eventRow}>
            <span className={`${styles.title} t-h2`}>가입 즉시 1만원 올영 상품권</span>
            <img className={styles.eventIcon} src="/assets/3d/이벤트.png" alt="" aria-hidden="true" />
          </div>
        </Card>
      </div>

      {/* S4-A 결제 감지 팝업 — ?popup=claim 일 때만 뜬다 (진행자 트리거, 팀원 B) */}
      <ClaimPopup />
    </AppShell>
  )
}
