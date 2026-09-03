/* ─────────────────────────────────────────────────────────────
   계측 — 우리 앱 안에서 "어디서 헤맸나" 를 보는 내부 진단용.
   모든 탭을 {targetId, screen, timestamp}로 남긴다 → localStorage
   → 진행자용 내보내기 화면(/export)에서 원본 JSON 으로 꺼낸다.

   ⚠️ 과제 성공률·난이도는 여기서 나오지 않는다. 평가지·설문 웹의 진행자
      기록란이 찍는다 (PR #132, 변경로그 §"지표 위상 재정의"). 예전에 있던
      task_start/task_end/difficulty 파이프라인과 summarize/toCsv 는 호출부가
      0곳이라 뺐다 (#102, 2026-09-03 팀장 — /moderator 는 만들지 않는다).
   화면을 추가하면 계측도 같이 붙인다 — 누락 금지.
   ───────────────────────────────────────────────────────────── */

import { DEFAULT_STATE } from '@/data'
import type { AccountState } from '@/data/types'

const STORAGE_KEY = 'supersol.analytics.v1'
const SESSION_KEY = 'supersol.session.v1'

export type EventType =
  /** 탭(클릭) */
  | 'tap'
  /** 화면 진입 */
  | 'screen_view'
  /** 렌더 크래시 — 에러 바운더리가 잡았다 (#80). 어느 화면에서 터졌는지 진단용 */
  | 'error'

export interface AnalyticsEvent {
  /** 이벤트 종류 */
  type: EventType
  /** 항상 null. 과제 파이프라인을 뺀 뒤에도 필드는 남긴다 — 이미 저장된
      localStorage 이벤트·/export JSON 의 모양을 깨지 않기 위해서다 */
  taskId: null
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

let currentState: AccountState = DEFAULT_STATE

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

/* ── 기록 ──────────────────────────────────────────────────── */

interface TrackInput {
  type: EventType
  targetId: string
  screen: string
  /** 화면 상태 스냅샷 — S2-A 필터처럼 경로가 갈리는 화면에서 */
  context?: Record<string, string>
}

export function track(input: TrackInput): AnalyticsEvent {
  const event: AnalyticsEvent = {
    type: input.type,
    taskId: null,
    targetId: input.targetId,
    // 화면이 자기 AppShell 위에서 track 하면 'unknown' 이 온다 — setCurrentScreen 참고 (#38)
    screen: input.screen === 'unknown' && currentScreen ? currentScreen : input.screen,
    timestamp: Date.now(),
    sessionId: getSessionId(),
    state: currentState,
    ...(input.context ? { context: input.context } : {}),
  }

  const events = readEvents()
  events.push(event)
  writeEvents(events)
  notify()

  if (import.meta.env.DEV) {
    // 개발 중 눈으로 확인 — 배포 빌드에서는 빠진다
    console.debug('[track]', event.type, event.screen, event.targetId)
  }

  return event
}
