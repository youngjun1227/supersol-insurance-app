/* ─────────────────────────────────────────────────────────────
   계측 — 9/11 사용자 테스트 지표의 근거.
   지표: 과제 성공률 / 클릭 수 / 어려웠나(7점).
   모든 탭을 {taskId, targetId, screen, timestamp}로 남긴다 → localStorage
   → 진행자용 내보내기 화면(/export)에서 JSON·CSV로 꺼낸다.
   화면을 추가하면 계측도 같이 붙인다 — 누락 금지.
   ───────────────────────────────────────────────────────────── */

import { DEFAULT_STATE } from '@/data'
import type { AccountState } from '@/data/types'

const STORAGE_KEY = 'supersol.analytics.v1'
const SESSION_KEY = 'supersol.session.v1'

/** 테스트 과제 — 9/11 진행 대본과 1:1로 맞춘다 */
export type TaskId = string

export type EventType =
  /** 탭(클릭) — 클릭 수 지표의 원자료 */
  | 'tap'
  /** 화면 진입 */
  | 'screen_view'
  /** 과제 시작 */
  | 'task_start'
  /** 과제 종료 (성공/실패/포기) */
  | 'task_end'
  /** 어려웠나 7점 응답 */
  | 'difficulty'

export type TaskOutcome = 'success' | 'fail' | 'giveup'

export interface AnalyticsEvent {
  /** 이벤트 종류 */
  type: EventType
  /** 진행 중인 과제. 과제 밖 조작이면 null */
  taskId: TaskId | null
  /** 무엇을 눌렀는지 — 화면 안에서 유일한 이름 */
  targetId: string
  /** 어느 화면에서 */
  screen: string
  /** epoch ms */
  timestamp: number
  /** 세션(참가자) 구분 */
  sessionId: string
  /** 계정 상태 A|B — 조건 구분 */
  state: AccountState
  /** 과제 종료 결과 (type='task_end'일 때) */
  outcome?: TaskOutcome
  /** 어려웠나 1~7 (type='difficulty'일 때) */
  score?: number
}

/* ── 세션 ──────────────────────────────────────────────────── */

function makeId(): string {
  const c = globalThis.crypto
  if (c && 'randomUUID' in c) return c.randomUUID()
  return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

/** 참가자 1명 = 세션 1개. 진행자가 /export에서 새로 시작할 수 있다 */
export function getSessionId(): string {
  if (typeof localStorage === 'undefined') return 'no-storage'
  let id = localStorage.getItem(SESSION_KEY)
  if (!id) {
    id = makeId()
    localStorage.setItem(SESSION_KEY, id)
  }
  return id
}

export function resetSession(): string {
  const id = makeId()
  try {
    localStorage.setItem(SESSION_KEY, id)
  } catch {
    /* 사파리 시크릿 모드 등 — 계측이 화면을 막지는 않게 한다 */
  }
  return id
}

/* ── 저장 ──────────────────────────────────────────────────── */

export function readEvents(): AnalyticsEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as AnalyticsEvent[]) : []
  } catch {
    return []
  }
}

function writeEvents(events: AnalyticsEvent[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
  } catch {
    /* 용량 초과·저장 불가 — 화면은 계속 돌아가야 한다 */
  }
}

export function clearEvents(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* noop */
  }
  notify()
}

/* ── 구독 (내보내기 화면이 실시간으로 본다) ────────────────── */

type Listener = () => void
const listeners = new Set<Listener>()

export function subscribe(fn: Listener): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

function notify(): void {
  for (const fn of listeners) fn()
}

/* ── 현재 상태 (Provider가 채워 넣는다) ────────────────────── */

let currentTaskId: TaskId | null = null
let currentState: AccountState = DEFAULT_STATE

export function setCurrentTask(taskId: TaskId | null): void {
  currentTaskId = taskId
}

export function getCurrentTask(): TaskId | null {
  return currentTaskId
}

export function setCurrentAccountState(state: AccountState): void {
  currentState = state
}

/* ── 기록 ──────────────────────────────────────────────────── */

interface TrackInput {
  type: EventType
  targetId: string
  screen: string
  outcome?: TaskOutcome
  score?: number
  /** 과제를 명시하고 싶을 때 (기본은 진행 중인 과제) */
  taskId?: TaskId | null
}

export function track(input: TrackInput): AnalyticsEvent {
  const event: AnalyticsEvent = {
    type: input.type,
    taskId: input.taskId !== undefined ? input.taskId : currentTaskId,
    targetId: input.targetId,
    screen: input.screen,
    timestamp: Date.now(),
    sessionId: getSessionId(),
    state: currentState,
    ...(input.outcome ? { outcome: input.outcome } : {}),
    ...(input.score !== undefined ? { score: input.score } : {}),
  }

  const events = readEvents()
  events.push(event)
  writeEvents(events)
  notify()

  if (import.meta.env.DEV) {
    // 개발 중 눈으로 확인 — 배포 빌드에서는 빠진다
    console.debug('[track]', event.type, event.screen, event.targetId, event.taskId ?? '-')
  }

  return event
}

/* ── 집계 (내보내기 화면용) ────────────────────────────────── */

export interface TaskSummary {
  taskId: TaskId
  sessionId: string
  /** 과제 중 발생한 탭 수 — 클릭 수 지표 */
  taps: number
  /** 시작~종료 ms. 종료 안 됐으면 null */
  durationMs: number | null
  outcome: TaskOutcome | null
  /** 어려웠나 1~7 */
  difficulty: number | null
  state: AccountState
}

/** 세션·과제별로 묶어 지표 3종을 뽑는다 */
export function summarize(events: AnalyticsEvent[] = readEvents()): TaskSummary[] {
  const byKey = new Map<string, TaskSummary & { startedAt: number | null }>()

  for (const e of events) {
    if (!e.taskId) continue
    const key = `${e.sessionId}::${e.taskId}`
    let row = byKey.get(key)
    if (!row) {
      row = {
        taskId: e.taskId,
        sessionId: e.sessionId,
        taps: 0,
        durationMs: null,
        outcome: null,
        difficulty: null,
        state: e.state,
        startedAt: null,
      }
      byKey.set(key, row)
    }

    switch (e.type) {
      case 'tap':
        row.taps += 1
        break
      case 'task_start':
        row.startedAt = e.timestamp
        break
      case 'task_end':
        row.outcome = e.outcome ?? null
        if (row.startedAt !== null) row.durationMs = e.timestamp - row.startedAt
        break
      case 'difficulty':
        row.difficulty = e.score ?? null
        break
      default:
        break
    }
  }

  return [...byKey.values()].map(({ startedAt: _startedAt, ...row }) => row)
}

/** CSV — 엑셀에서 바로 열리게 BOM 포함 */
export function toCsv(rows: TaskSummary[]): string {
  const header = ['sessionId', 'state', 'taskId', 'outcome', 'taps', 'durationMs', 'difficulty']
  const body = rows.map((r) =>
    [r.sessionId, r.state, r.taskId, r.outcome ?? '', r.taps, r.durationMs ?? '', r.difficulty ?? ''].join(','),
  )
  return '﻿' + [header.join(','), ...body].join('\n')
}
