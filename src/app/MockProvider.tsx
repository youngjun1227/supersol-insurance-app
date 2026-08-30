/* 목데이터 + 계정 상태(?state=A|B)를 화면에 공급한다.
   화면은 src/data/mock.ts를 직접 import 하지 않고 useMock()만 쓴다. */

import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getMockData, readStateFromSearch } from '@/data'
import type { AccountState, MockData } from '@/data/types'
import { setCurrentAccountState } from '@/lib/analytics'

interface MockContextValue {
  data: MockData
  state: AccountState
  /**
   * 맞춤(또래 비교) 켜짐 여부. `?custom=off`면 false.
   * 라우트가 아니라 S1-13 기준 시트 토글의 결과 상태다.
   * ⚠️ false면 또래·우선순위 문구를 쓰지 않는다 — 맞춤을 껐다는 전제와 모순된다.
   */
  customOn: boolean
  /** 상태를 바꾼다 (URL 쿼리도 같이 갱신 — 링크로 공유 가능) */
  setState: (next: AccountState) => void
  /** 맞춤 토글 — S1-13 시트에서 쓴다 */
  setCustomOn: (next: boolean) => void
}

const MockContext = createContext<MockContextValue | null>(null)

export function MockProvider({ children }: { children: ReactNode }) {
  const [searchParams, setSearchParams] = useSearchParams()

  /* 파싱은 data/index.ts 한 곳에서 한다 (#109) — 예전엔 여기서 같은 규칙을
     인라인으로 다시 구현해, 한쪽만 고치면 조용히 갈릴 수 있었다 */
  const state: AccountState = readStateFromSearch(searchParams.toString())
  const customOn = searchParams.get('custom')?.toLowerCase() !== 'off'

  // 계측 이벤트에 조건(A|B)을 같이 남기기 위해
  useEffect(() => {
    setCurrentAccountState(state)
  }, [state])

  const value = useMemo<MockContextValue>(
    () => ({
      data: getMockData(state),
      state,
      customOn,
      setState: (next) => {
        setSearchParams(
          (prev) => {
            const p = new URLSearchParams(prev)
            p.set('state', next)
            return p
          },
          { replace: true },
        )
      },
      setCustomOn: (next) => {
        setSearchParams(
          (prev) => {
            const p = new URLSearchParams(prev)
            if (next) p.delete('custom')
            else p.set('custom', 'off')
            return p
          },
          { replace: true },
        )
      },
    }),
    [state, customOn, setSearchParams],
  )

  return <MockContext.Provider value={value}>{children}</MockContext.Provider>
}

export function useMock(): MockContextValue {
  const ctx = useContext(MockContext)
  if (!ctx) throw new Error('useMock()은 <MockProvider> 안에서만 쓸 수 있어요.')
  return ctx
}
