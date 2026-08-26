/* 목데이터 + 계정 상태(?state=A|B)를 화면에 공급한다.
   화면은 src/data/mock.ts를 직접 import 하지 않고 useMock()만 쓴다. */

import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getMockData, isAccountState, DEFAULT_STATE } from '@/data'
import type { AccountState, MockData } from '@/data/types'
import { setCurrentAccountState } from '@/lib/analytics'

interface MockContextValue {
  data: MockData
  state: AccountState
  /** 상태를 바꾼다 (URL 쿼리도 같이 갱신 — 링크로 공유 가능) */
  setState: (next: AccountState) => void
}

const MockContext = createContext<MockContextValue | null>(null)

export function MockProvider({ children }: { children: ReactNode }) {
  const [searchParams, setSearchParams] = useSearchParams()

  const raw = searchParams.get('state')?.toUpperCase()
  const state: AccountState = isAccountState(raw) ? raw : DEFAULT_STATE

  // 계측 이벤트에 조건(A|B)을 같이 남기기 위해
  useEffect(() => {
    setCurrentAccountState(state)
  }, [state])

  const value = useMemo<MockContextValue>(
    () => ({
      data: getMockData(state),
      state,
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
    }),
    [state, setSearchParams],
  )

  return <MockContext.Provider value={value}>{children}</MockContext.Provider>
}

export function useMock(): MockContextValue {
  const ctx = useContext(MockContext)
  if (!ctx) throw new Error('useMock()은 <MockProvider> 안에서만 쓸 수 있어요.')
  return ctx
}
