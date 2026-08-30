/* 계측 컨텍스트 — 화면 이름과 진행 중인 과제를 들고 있다가
   useTrack()이 {taskId, targetId, screen, timestamp}를 채워 넣게 한다. */

import {
  createContext, useCallback, useContext, useMemo, useState, type ReactNode,
} from 'react'
import {
  setCurrentTask, track, type TaskId, type TaskOutcome,
} from '@/lib/analytics'

interface AnalyticsContextValue {
  /** 지금 화면 이름 — ScreenProvider가 덮어쓴다 */
  screen: string
  taskId: TaskId | null
  startTask: (taskId: TaskId) => void
  endTask: (outcome: TaskOutcome) => void
  rateDifficulty: (score: number, forTask?: TaskId) => void
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null)

/** 화면 이름만 갈아끼우는 안쪽 컨텍스트 */
const ScreenContext = createContext<string>('unknown')

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [taskId, setTaskId] = useState<TaskId | null>(null)
  /** 방금 끝난 과제 — 종료 뒤에 묻는 난이도 점수가 갈 곳 (#101) */
  const [lastEnded, setLastEnded] = useState<TaskId | null>(null)

  const startTask = useCallback((next: TaskId) => {
    setTaskId(next)
    setCurrentTask(next)
    track({ type: 'task_start', targetId: next, screen: 'moderator', taskId: next })
  }, [])

  const endTask = useCallback(
    (outcome: TaskOutcome) => {
      if (!taskId) return
      track({ type: 'task_end', targetId: taskId, screen: 'moderator', taskId, outcome })
      setTaskId(null)
      setCurrentTask(null)
      /* 난이도는 과제가 끝난 뒤에 묻는다 — 그때 taskId 는 이미 비어 있으므로
         방금 끝난 과제를 따로 들고 있어야 점수가 제 행에 붙는다 (#101) */
      setLastEnded(taskId)
    },
    [taskId],
  )

  /** 어려웠나 7점. 대상 과제를 명시할 수 있고, 생략하면 방금 끝난 과제에 붙인다.

      ⚠️ 예전엔 진행 중 taskId 로만 찍어서, 과제 종료 후 물으면 taskId 가 null 이라
         집계에서 통째로 버려지고, 다음 과제를 먼저 시작했으면 그 과제에 붙었다 (#101) */
  const rateDifficulty = useCallback(
    (score: number, forTask?: TaskId) => {
      const target = forTask ?? taskId ?? lastEnded
      if (!target) return
      track({
        type: 'difficulty', targetId: 'difficulty-7', screen: 'moderator', taskId: target, score,
      })
    },
    [taskId, lastEnded],
  )

  const value = useMemo<AnalyticsContextValue>(
    () => ({ screen: 'unknown', taskId, startTask, endTask, rateDifficulty }),
    [taskId, startTask, endTask, rateDifficulty],
  )

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>
}

/** 화면 하나를 감싸 이름을 붙인다. <Screen name="S1-보험메인"> */
export function ScreenProvider({ name, children }: { name: string; children: ReactNode }) {
  return <ScreenContext.Provider value={name}>{children}</ScreenContext.Provider>
}

export function useAnalytics(): AnalyticsContextValue {
  const ctx = useContext(AnalyticsContext)
  if (!ctx) throw new Error('useAnalytics()는 <AnalyticsProvider> 안에서만 쓸 수 있어요.')
  const screen = useContext(ScreenContext)
  return { ...ctx, screen }
}

export function useScreenName(): string {
  return useContext(ScreenContext)
}
