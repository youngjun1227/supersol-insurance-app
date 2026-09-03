/* 라우터 — 변경로그 "화면 목록 v2" 기준.
   ⚠️ 화면을 추가하면 AppShell의 name(계측 화면 이름)도 같이 붙인다.

   탭바가 뜨는 화면: / · /finance · /finance/card · /finance/stock ·
     /finance/insurance · /product · /product/insurance · /product/insurance/list · 스켈레톤
   그 밖(진단·청구·에이전트·상품 상세)은 Figma 실측상 탭바가 아예 없다. */

import { useEffect, useRef, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Splash } from '@/components'
import { SPLASH_MS } from '@/lib/timing'
import { SCREEN } from '@/lib/targetId'
import { useScrollTop } from '@/lib/useScrollTop'
import { AnalyticsProvider } from './AnalyticsProvider'
import { MockProvider } from './MockProvider'
import { Agent } from '@/pages/Agent'
import { Export } from '@/pages/Export'
import { Briefing } from '@/pages/Briefing'
import { Start } from '@/pages/Start'
import { DemoMenu } from '@/pages/DemoMenu'
import { DemoPush } from '@/pages/DemoPush'
import { ClaimDone } from '@/pages/ClaimDone'
import { ClaimGuide } from '@/pages/ClaimGuide'
import { ClaimSettings } from '@/pages/ClaimSettings'
import { Diagnosis } from '@/pages/Diagnosis'
import { FinanceInsurance } from '@/pages/FinanceInsurance'
import { FinanceBank, FinanceCard, FinanceStock } from '@/pages/FinancePath'
import { Home } from '@/pages/Home'
import { ItemDetail } from '@/pages/ItemDetail'
import { MyInsurance } from '@/pages/MyInsurance'
import { ProductDiscover } from '@/pages/ProductPath'
import { ProductInsurance } from '@/pages/ProductInsurance'
import { ProductList } from '@/pages/ProductList'
import { ProductDetail } from '@/pages/ProductDetail'
import { Skeleton } from '@/pages/Skeleton'

/** 앱 실행 스플래시를 건너뛰는 경로 — 진행자 화면과 시연 도입부.
    /demo/push 는 자기 흐름 안에서 스플래시를 따로 띄우므로 여기서 또 띄우면 두 번 나온다. */
const NO_SPLASH = ['/export', '/demo']

export function App() {
  /* 화면을 옮기면 맨 위에서 시작한다 — SPA 는 스크롤이 그대로 남는다 (#70) */
  useScrollTop()

  const { pathname } = useLocation()
  const skipSplash = NO_SPLASH.some((p) => pathname === p || pathname.startsWith(`${p}/`))

  /* 앱을 켤 때 스플래시를 한 번 지난다 (2026-08-31 팀장 — "항상 보여준다").
     ⚠️ 새로고침마다 다시 뜬다. 9/11 과제 3개가 홈에서 시작하므로 진행자가
        화면을 리셋할 때마다 1.2초를 기다린다 — 실제 앱과 같은 감각을 위해 감수한다. */
  const [booting, setBooting] = useState(!skipSplash)

  /* ⚠️ 타이머를 한 번만 건다. StrictMode 는 개발 모드에서 effect 를 두 번 돌리는데,
     booting 을 의존성에 넣으면 첫 타이머가 cleanup 으로 취소된 뒤 두 번째가
     걸리면서 스플래시가 아예 안 보이는 일이 생겼다 (실제로 겪음). */
  const bootTimer = useRef<number | null>(null)

  useEffect(() => {
    if (!booting || bootTimer.current !== null) return
    bootTimer.current = window.setTimeout(() => setBooting(false), SPLASH_MS)
  }, [booting])

  if (booting) return <Splash />

  return (
    <AnalyticsProvider>
      <MockProvider>
        <Routes>
          {/* 진입 화면 — 스플래시 다음, 앱의 첫 화면 (#130).
              ⚠️ NO_SPLASH 에 넣지 않는다. 스플래시 → 진입 → 홈 순서다.

              루트에 둔다: QR·주소 입력·PWA 어느 경로로 들어와도 상황을 고르고
              시작해야 한다. start_url 만 바꿨더니 PWA 로 추가했을 때만 진입
              화면이 뜨고, 링크를 그냥 열면 홈으로 갔다. */}
          <Route path="/" element={<Start />} />

          {/* 00 메인홈 — S4-A 결제 감지 팝업은 이 위 오버레이 */}
          <Route path="/home" element={<Home />} />

          {/* 금융 탭 = 은행이 기본. 상단 탭에서 '보험'을 눌러야 S1 에 도착한다
              (AS-IS 진입 마찰 유지 — 건너뛰면 클릭 수 비교가 오염된다) */}
          <Route path="/finance" element={<FinanceBank />} />
          <Route path="/finance/card" element={<FinanceCard />} />
          <Route path="/finance/stock" element={<FinanceStock />} />

          {/* 상품 탭 = 발견이 기본. '보험'은 상단 탭 가로 스크롤 맨 끝 */}
          <Route path="/product" element={<ProductDiscover />} />

          {/* S1 보험 메인 — 라우트 하나에 상태 3개:
              ?state=B(기본) 통합형 · ?state=A 0건 분리형 · ?state=B&custom=off 맞춤 OFF 분리형 */}
          <Route path="/finance/insurance" element={<FinanceInsurance />} />
          {/* S1-7 내 보험 — 탭바도 CTA 도 없다 (변경로그 "탭바 귀속" 표) */}
          <Route path="/finance/insurance/my" element={<MyInsurance />} />

          {/* S3 보장 진단 — 탭바 없음 */}
          <Route path="/diagnosis" element={<Diagnosis />} />
          <Route path="/diagnosis/briefing" element={<Briefing />} />
          {/* S3-E 항목 상세 — 헤더는 "보장 상세"(figma-ref). 탭바 없음 + 하단 버튼독 */}
          <Route path="/diagnosis/:itemId" element={<ItemDetail />} />

          {/* S3-F 에이전트 대화 — 진입 문맥은 쿼리로 (?ctx=). 프리셋 고정 응답 */}
          <Route path="/agent" element={<Agent />} />

          {/* S4·S5 청구 흐름 — 탭바 없음 + 하단 고정 CTA. S4-A 팝업은 홈 위 오버레이(ClaimPopup) */}
          <Route path="/claim/settings" element={<ClaimSettings />} />
          <Route path="/claim/guide" element={<ClaimGuide />} />
          <Route path="/claim/done" element={<ClaimDone />} />

          {/* S2 상품 찾기 — A안 확정 후 구현 완료 (변경로그 "S2 = A안") */}
          <Route path="/product/insurance" element={<ProductInsurance />} />
          <Route path="/product/insurance/list" element={<ProductList />} />
          <Route path="/product/insurance/:productId" element={<ProductDetail />} />

          {/* 비테스트 탭 — 이동은 되고 내용만 빈 화면 */}
          <Route path="/benefit" element={<Skeleton name="혜택-자리표시" title="혜택" tabId="benefit" screen={SCREEN.skeleton} />} />
          <Route path="/stock" element={<Skeleton name="주식-자리표시" title="주식" tabId="stock" screen={SCREEN.skeleton} />} />

          {/* 시연 도입부 — 앱 밖에서 알림을 받고 들어오는 흐름 (진행자가 연다).
              /demo 시나리오 선택 → /demo/push 홈화면·배너 → 스플래시 → /home?popup=claim */}
          <Route path="/demo" element={<DemoMenu />} />
          <Route path="/demo/push" element={<DemoPush />} />

          {/* 진행자용 — 참가자에게 노출하지 않는다 */}
          <Route path="/export" element={<Export />} />

          {/* 없는 주소는 홈으로 — 진입 화면으로 보내면 고른 상황이 풀린다 */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </MockProvider>
    </AnalyticsProvider>
  )
}
