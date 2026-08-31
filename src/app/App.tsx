/* 라우터 — 변경로그 "화면 목록 v2" 기준.
   ⚠️ 화면을 추가하면 AppShell의 name(계측 화면 이름)도 같이 붙인다.

   탭바가 뜨는 화면: / · /finance · /finance/card · /finance/stock ·
     /finance/insurance · /product · /product/insurance · /product/insurance/list · 스켈레톤
   그 밖(진단·청구·에이전트·상품 상세)은 Figma 실측상 탭바가 아예 없다. */

import { Navigate, Route, Routes } from 'react-router-dom'
import { SCREEN } from '@/lib/targetId'
import { useScrollTop } from '@/lib/useScrollTop'
import { AnalyticsProvider } from './AnalyticsProvider'
import { MockProvider } from './MockProvider'
import { Agent } from '@/pages/Agent'
import { Export } from '@/pages/Export'
import { Briefing } from '@/pages/Briefing'
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

export function App() {
  /* 화면을 옮기면 맨 위에서 시작한다 — SPA 는 스크롤이 그대로 남는다 (#70) */
  useScrollTop()

  return (
    <AnalyticsProvider>
      <MockProvider>
        <Routes>
          {/* 00 메인홈 — S4-A 결제 감지 팝업은 이 위 오버레이 */}
          <Route path="/" element={<Home />} />

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
              /demo 시나리오 선택 → /demo/push 홈화면·배너 → 스플래시 → /?popup=claim */}
          <Route path="/demo" element={<DemoMenu />} />
          <Route path="/demo/push" element={<DemoPush />} />

          {/* 진행자용 — 참가자에게 노출하지 않는다 */}
          <Route path="/export" element={<Export />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MockProvider>
    </AnalyticsProvider>
  )
}
