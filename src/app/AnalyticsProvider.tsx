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
  rateDifficulty: (score: number) => void
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null)

/** 화면 이름만 갈아끼우는 안쪽 컨텍스트 */
const ScreenContext = createContext<string>('unknown')

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [taskId, setTaskId] = useState<TaskId | null>(null)

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
    },
    [taskId],
  )

  const rateDifficulty = useCallback(
    (score: number) => {
      track({ type: 'difficulty', targetId: 'difficulty-7', screen: 'moderator', taskId, score })
    },
    [taskId],
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
