/* 금융 탭의 상단 탭 행 (은행·카드·증권·보험).
   ⚠️ 코드로 만든 보험 메인(S1)에서도 은행·카드·증권으로 나갈 수 있어야 한다
   — "어디를 눌러도 이동" 원칙. 경로 화면과 같은 정의(data/paths.ts)를 쓴다.

   팀원 A: S1 에서 <Header> 아래에 이걸 그대로 넣으면 됩니다. 직접 만들지 마세요. */

import { useLocation, useNavigate } from 'react-router-dom'
import { FINANCE_TABS, type FinanceTabId } from '@/data/paths'
import { ELEMENT, SCREEN, tid } from '@/lib/targetId'
import { useTrack } from '@/lib/useTrack'
import { TopTabs } from './TopTabs'

export function FinanceTopTabs({ active }: { active: FinanceTabId }) {
  const navigate = useNavigate()
  const location = useLocation()
  const track = useTrack()

  return (
    <TopTabs
      items={FINANCE_TABS.map((t) => ({ id: t.id, label: t.label }))}
      activeId={active}
      onChange={(id) => {
        const tab = FINANCE_TABS.find((t) => t.id === id)
        if (!tab) return
        /* 활성 탭 재탭도 기록한다 (#88) — 이미 있는 탭을 또 누르는 건
           길을 못 찾고 있다는 신호라, 계측을 조기 반환보다 먼저 둔다.
           이동은 여전히 안 한다 (탭바와 같은 기준). */
        track(tid(SCREEN.financePath, ELEMENT.탭, tab.id))
        if (tab.id === active) return
        // 쿼리(?state=A|B) 유지 — 조건이 풀리면 안 된다
        navigate({ pathname: tab.path, search: location.search })
      }}
    />
  )
}
