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
  /** 렌더 크래시 — 에러 바운더리가 잡았다 (#80). 어느 화면에서 터졌는지 진단용 */
  | 'error'

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
  /**
   * 화면 상태 스냅샷. 경로가 갈리는 화면에서 targetId 만으로는 해석이 안 된다.
   * 예) S2-A 는 필터 2축이라 {cat, company} 를 같이 남긴다.
   */
  context?: Record<string, string>
}

/* ── 세션 ──────────────────────────────────────────────────── */

function makeId(): string {
  const c = globalThis.crypto
  if (c && 'randomUUID' in c) return c.randomUUID()
  return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

/* 저장이 막힌 브라우저에서 쓰는 메모리 세션 — 새로고침하면 사라진다.
   그래도 track() 이 throw 하지 않는 것이 중요하다 (아래 주석 참고) */
let memorySessionId: string | null = null

/** 참가자 1명 = 세션 1개. 진행자가 /export에서 새로 시작할 수 있다.

    ⚠️ 여기서 throw 하면 안 된다 (#99) — track() 이 이벤트를 만드는 도중 부르는데,
       그 호출은 버튼 onClick 안이라 ErrorBoundary(렌더 에러만 잡는다)가 못 막는다.
       사파리 시크릿·쿠키 차단에서는 localStorage 가 정의는 되어 있고 getItem 에서
       SecurityError 를 던지므로 typeof 가드로는 부족하다. */
export function getSessionId(): string {
  try {
    const saved = localStorage.getItem(SESSION_KEY)
    if (saved) return saved
    const id = makeId()
    localStorage.setItem(SESSION_KEY, id)
    return id
  } catch {
    storageBlocked = true
    memorySessionId ??= makeId()
    return memorySessionId
  }
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

/* 저장이 한 번이라도 막혔는지 — /export 가 배너로 알린다.
   조용히 삼키면 진행자가 "이벤트 N개"가 안 늘어나는 걸 눈으로 세야만 안다 (#99) */
let storageBlocked = false

/** 계측 저장이 막힌 적이 있으면 true — 진행자 화면 경고용 */
export function isStorageBlocked(): boolean {
  return storageBlocked
}

function writeEvents(events: AnalyticsEvent[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
  } catch {
    /* 용량 초과·저장 불가 — 화면은 계속 돌아가야 한다.
       대신 플래그를 세워 /export 에서 보이게 한다 */
    storageBlocked = true
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
  /* Set.delete 는 boolean 을 반환한다 — cleanup 시그니처와 맞추려고 블록으로 감싼다 */
  return () => {
    listeners.delete(fn)
  }
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

/* 지금 보고 있는 화면 이름 — screen 이 'unknown' 으로 올 때 대신 채운다.

   ⚠️ 화면 컴포넌트는 자기 <AppShell>(=<ScreenProvider>)을 "만드는" 쪽이라
      React 트리에서 그 위에 있다. 그래서 화면 파일이 직접 useTrack() 을 부르면
      ScreenContext 를 못 읽고 기본값 'unknown' 이 실려 온다 (#38).
      공용 컴포넌트(Header·TabBar·Button…)는 Provider 안쪽이라 멀쩡했다.

      화면 20개를 고치는 대신 여기서 받아준다 — 앞으로 만들 화면도 자동으로 커버된다.
      useScreenView() 가 진입 때마다 갱신한다. */
let currentScreen: string | null = null

export function setCurrentScreen(name: string): void {
  currentScreen = name
}

/** 테스트에서 모듈 상태를 되돌린다 */
export function resetCurrentScreen(): void {
  currentScreen = null
}

/* ── 기록 ──────────────────────────────────────────────────── */

interface TrackInput {
  type: EventType
  targetId: string
  screen: string
  outcome?: TaskOutcome
  score?: number
  /** 화면 상태 스냅샷 — S2-A 필터처럼 경로가 갈리는 화면에서 */
  context?: Record<string, string>
  /** 과제를 명시하고 싶을 때 (기본은 진행 중인 과제) */
  taskId?: TaskId | null
}

export function track(input: TrackInput): AnalyticsEvent {
  const event: AnalyticsEvent = {
    type: input.type,
    taskId: input.taskId !== undefined ? input.taskId : currentTaskId,
    targetId: input.targetId,
    // 화면이 자기 AppShell 위에서 track 하면 'unknown' 이 온다 — setCurrentScreen 참고 (#38)
    screen: input.screen === 'unknown' && currentScreen ? currentScreen : input.screen,
    timestamp: Date.now(),
    sessionId: getSessionId(),
    state: currentState,
    ...(input.outcome ? { outcome: input.outcome } : {}),
    ...(input.score !== undefined ? { score: input.score } : {}),
    ...(input.context ? { context: input.context } : {}),
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
  /** 같은 과제를 다시 돌린 회차 (1부터). 재시도를 한 줄로 합치지 않는다 (#101) */
  attempt: number
  /** 과제 중 발생한 탭 수 — 클릭 수 지표 */
  taps: number
  /** 시작~종료 ms. 종료 안 됐으면 null */
  durationMs: number | null
  outcome: TaskOutcome | null
  /** 어려웠나 1~7 */
  difficulty: number | null
  state: AccountState
}

type Row = TaskSummary & { startedAt: number | null }

/** 세션·과제별로 묶어 지표를 뽑는다.

    ⚠️ 같은 과제를 다시 돌리면 별도 행이 된다 (#101) — 진행자가 재시도하는 건
       대본상 흔한데, 한 줄로 합치면 탭 수가 누적되고 1회차 소요시간이 사라지며
       "1회차 실패 → 2회차 성공"이 성공 한 줄로만 남는다. */
export function summarize(events: AnalyticsEvent[] = readEvents()): TaskSummary[] {
  const rows: Row[] = []
  /** 세션::과제 → 지금 열려 있는 행 */
  const open = new Map<string, Row>()
  /** 세션::과제 → 지금까지 몇 회차인지 */
  const attempts = new Map<string, number>()

  const keyOf = (e: AnalyticsEvent) => `${e.sessionId}::${e.taskId}`

  /** 열린 행이 없으면 만든다 — task_start 없이 이벤트가 먼저 와도 기록은 남긴다 */
  const rowFor = (e: AnalyticsEvent): Row => {
    const key = keyOf(e)
    const existing = open.get(key)
    if (existing) return existing
    const attempt = (attempts.get(key) ?? 0) + 1
    attempts.set(key, attempt)
    const row: Row = {
      taskId: e.taskId as TaskId,
      sessionId: e.sessionId,
      attempt,
      taps: 0,
      durationMs: null,
      outcome: null,
      difficulty: null,
      state: e.state,
      startedAt: null,
    }
    rows.push(row)
    open.set(key, row)
    return row
  }

  for (const e of events) {
    if (!e.taskId) continue

    switch (e.type) {
      case 'task_start': {
        // 이전 회차가 안 닫혔으면 버리고 새 회차를 연다
        open.delete(keyOf(e))
        rowFor(e).startedAt = e.timestamp
        break
      }
      case 'tap':
        rowFor(e).taps += 1
        break
      case 'task_end': {
        const row = rowFor(e)
        row.outcome = e.outcome ?? null
        if (row.startedAt !== null) row.durationMs = e.timestamp - row.startedAt
        /* 행은 열어 둔 채로 둔다 — 난이도는 과제가 끝난 뒤에 묻기 때문이다.
           다음 task_start 가 오면 그때 새 회차로 넘어간다 (#101) */
        break
      }
      case 'difficulty':
        rowFor(e).difficulty = e.score ?? null
        break
      default:
        break
    }
  }

  return rows.map(({ startedAt: _startedAt, ...row }) => row)
}

/* CSV 한 칸 — 쉼표·따옴표·줄바꿈이 들어가면 열이 밀린다 (#101).
   taskId 가 자유 문자열이라 진행자가 "과제1, 보험료 확인" 같은 이름을 쓰면
   엑셀에서 조용히 어긋나고, 틀렸다는 걸 눈치채지 못한다. */
function csvCell(value: string | number | null): string {
  const text = value === null ? '' : String(value)
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/** CSV — 엑셀에서 바로 열리게 BOM 포함 */
export function toCsv(rows: TaskSummary[]): string {
  const header = [
    'sessionId', 'state', 'taskId', 'attempt', 'outcome', 'taps', 'durationMs', 'difficulty',
  ]
  const body = rows.map((r) =>
    [r.sessionId, r.state, r.taskId, r.attempt, r.outcome, r.taps, r.durationMs, r.difficulty]
      .map(csvCell)
      .join(','),
  )
  return '\ufeff' + [header.join(','), ...body].join('\n')
}
