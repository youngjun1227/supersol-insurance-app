/* 시연 도입부 — iOS 홈화면 → 배너 → 스플래시 → 앱 (Figma 시연용 `394:3307`).

   아이디어 3 은 "앱 밖에서 알림을 받고 들어온다"가 핵심인데, S4-A 팝업부터
   시작하면 그 맥락이 빠진다. 백엔드가 없어 진짜 푸시는 못 보내므로 연출로 재현한다.

   단계: home ─(2.5초)─▶ banner ─(탭)─▶ splash ─(0.8초)─▶ /?popup=claim

   ⚠️ 홈화면은 Figma 원본을 PNG 로 내보낸 것이다 (아이콘 격자가 통짜 컴포넌트라
      분해가 안 된다). 우리 앱 화면이 아니므로 디자인 토큰 대상이 아니다.
   ⚠️ 스플래시 0.8초는 디자인 레포가 정한 값 (`438:10131`, AFTER_TIMEOUT 0.8s). */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Splash } from '@/components'
import { ScreenProvider } from '@/app/AnalyticsProvider'
import { CLAIM_COMPLIANCE, DEMO_PUSH } from '@/data/copy'
import { ELEMENT, SCREEN, tid } from '@/lib/targetId'
import { BANNER_DELAY_MS, SPLASH_MS } from '@/lib/timing'
import { useScreenView, useTrack } from '@/lib/useTrack'
import styles from './DemoPush.module.css'

type Stage = 'home' | 'banner' | 'splash'

function DemoPushInner() {
  const navigate = useNavigate()
  const track = useTrack()
  const [stage, setStage] = useState<Stage>('home')
  useScreenView()

  // 홈화면에서 잠시 기다렸다가 배너를 내린다
  useEffect(() => {
    if (stage !== 'home') return
    const t = setTimeout(() => setStage('banner'), BANNER_DELAY_MS)
    return () => clearTimeout(t)
  }, [stage])

  // 스플래시를 거쳐 앱으로 — 알림을 눌러 앱이 콜드 스타트하는 연출
  useEffect(() => {
    if (stage !== 'splash') return
    const t = setTimeout(() => {
      navigate('/?popup=claim', { replace: true })
    }, SPLASH_MS)
    return () => clearTimeout(t)
  }, [stage, navigate])

  // 알림을 눌러 앱이 콜드 스타트하는 자리 — 앱 진입(/)과 같은 스플래시를 쓴다
  if (stage === 'splash') return <Splash />

  return (
    <div className={styles.phone}>
      {/* iOS 홈화면 — Figma 원본 PNG. 참가자에겐 "폰 바탕화면"으로 읽힌다.
          그림뿐이라 스크린리더에는 읽을 것이 없다 — 지금 무슨 상태인지 알려 준다 */}
      <img className={styles.wallpaper} src="/assets/demo/ios-home.jpg" alt="" aria-hidden="true" />
      <p className="sr-only" role="status">
        {stage === 'home' ? '알림을 기다리는 중이에요' : '알림이 도착했어요'}
      </p>

      {stage === 'banner' ? (
        <button
          type="button"
          className={styles.banner}
          onClick={() => {
            track(tid(SCREEN.demoPush, ELEMENT.버튼, '배너'))
            setStage('splash')
          }}
        >
          {/* 앱 아이콘 — iOS 알림 왼쪽에 붙는 것. 원본이 투명 PNG 라
              배너의 반투명 판 위에서 흐려 보이지 않게 흰 바탕을 깐다 */}
          <img
            className={styles.appIcon}
            src="/assets/logo/app-icon.png"
            alt=""
            aria-hidden="true"
          />
          <span className={styles.bannerText}>
            <span className={styles.bannerHead}>
              <span className={`${styles.bannerTitle} t-body-lg-bold`}>
                {CLAIM_COMPLIANCE.title}
              </span>
              <span className={`${styles.bannerWhen} t-caption`}>{DEMO_PUSH.when}</span>
            </span>
            {/* 시안은 결제 요약과 안내가 한 문단(줄바꿈 없이 흐른다), 면책만 따로 */}
            <span className={`${styles.bannerBody} t-body-sm`}>
              {DEMO_PUSH.merchant} {DEMO_PUSH.action}
            </span>
            <span className={`${styles.bannerBody} t-body-sm`}>{CLAIM_COMPLIANCE.pushNotice}</span>
          </span>
        </button>
      ) : null}
    </div>
  )
}

export function DemoPush() {
  return (
    <ScreenProvider name="시연-푸시">
      <DemoPushInner />
    </ScreenProvider>
  )
}
