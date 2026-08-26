/* 라우터. 화면은 8/25 회의 후 확정 — 지금은 탭 5개 자리와 진행자 화면만.
   ⚠️ 화면을 추가하면 AppShell의 name(계측 화면 이름)도 같이 붙인다. */

import { Navigate, Route, Routes } from 'react-router-dom'
import { AnalyticsProvider } from './AnalyticsProvider'
import { MockProvider } from './MockProvider'
import { Placeholder } from '@/pages/Placeholder'
import { Export } from '@/pages/Export'

export function App() {
  return (
    <AnalyticsProvider>
      <MockProvider>
        <Routes>
          <Route path="/"        element={<Placeholder name="00-메인홈"   title="홈"   tabId="home" />} />
          <Route path="/finance" element={<Placeholder name="S1-보험메인" title="금융" tabId="finance" />} />
          <Route path="/product" element={<Placeholder name="S2-상품찾기" title="상품" tabId="product" />} />
          <Route path="/benefit" element={<Placeholder name="혜택"        title="혜택" tabId="benefit" />} />
          <Route path="/stock"   element={<Placeholder name="주식"        title="주식" tabId="stock" />} />

          {/* 진행자용 — 참가자에게 노출하지 않는다 */}
          <Route path="/export" element={<Export />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MockProvider>
    </AnalyticsProvider>
  )
}
