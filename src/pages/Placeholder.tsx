/* 화면 확정 전 자리표시.
   ⚠️ 8/25 회의에서 화면 4~6개를 확정하면 이 자리에 실제 화면이 들어간다.
   셸·계측·목데이터가 붙어 도는지 확인하는 용도. */

import { AppShell, FinanceTopTabs, Header, TabBar } from '@/components'
import { useMock } from '@/app/MockProvider'
import styles from './Placeholder.module.css'

interface PlaceholderProps {
  name: string
  title: string
  tabId: string
  /** 금융 상단 탭 행을 달지 — S1 계열. 팀원 A가 실제 화면을 만들 때까지 경로 유지 */
  financeTabs?: boolean
}

export function Placeholder({ name, title, tabId, financeTabs = false }: PlaceholderProps) {
  const { data, state } = useMock()

  return (
    <AppShell
      name={name}
      header={
        <>
          <Header title={title} />
          {financeTabs ? <FinanceTopTabs active="insurance" /> : null}
        </>
      }
      footer={<TabBar activeId={tabId} />}
      background={tabId === 'finance' ? 'page' : 'surface'}
      footerType="tabbar"
    >
      <div className={styles.body}>
        <p className={`${styles.line} t-body`}>
          화면은 8/25 회의 후 확정해요.
        </p>
        <p className={`${styles.meta} t-caption`}>
          계정 상태 {state} · 보유 {data.policies.length}건 · 이번 달{' '}
          {data.monthlyPremiumTotal.toLocaleString('ko-KR')}원
        </p>
      </div>
    </AppShell>
  )
}
