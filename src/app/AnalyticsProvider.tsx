/* 계측 컨텍스트 — 지금 화면 이름을 들고 있다가 useTrack() 이 채워 넣게 한다.

   예전엔 과제(taskId)·난이도 상태도 여기 있었는데 부르는 곳이 0곳이라 뺐다 (#102).
   과제 성공률은 평가지·설문 웹의 진행자 기록란에서 나온다 (PR #132). */

import { createContext, useContext, type ReactNode } from 'react'

/** 화면 이름 컨텍스트 — <AppShell>(=ScreenProvider) 이 채운다 */
const ScreenContext = createContext<string>('unknown')

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  return <>{children}</>
}

/** 화면 하나를 감싸 이름을 붙인다. <ScreenProvider name="S1-보험메인"> */
export function ScreenProvider({ name, children }: { name: string; children: ReactNode }) {
  return <ScreenContext.Provider value={name}>{children}</ScreenContext.Provider>
}

export function useScreenName(): string {
  return useContext(ScreenContext)
}
