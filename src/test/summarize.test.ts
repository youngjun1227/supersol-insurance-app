/* 집계·CSV 규칙 (#101).

   9/11 지표가 여기서 나온다. 조용히 틀어지면 당일에는 못 알아채고
   분석할 때가 되어서야 드러나므로, 규칙을 테스트로 고정한다. */

import { expect, test } from 'vitest'
import { summarize, toCsv, type AnalyticsEvent } from '@/lib/analytics'

type Partial = Omit<AnalyticsEvent, 'sessionId' | 'state' | 'timestamp'> & {
  timestamp?: number
}

let clock = 0
/** 테스트용 이벤트 — 세션·상태는 한 참가자로 고정 */
function ev(e: Partial): AnalyticsEvent {
  clock += 1000
  return {
    sessionId: 's1',
    state: 'B',
    timestamp: e.timestamp ?? clock,
    ...e,
  } as AnalyticsEvent
}

test('탭·소요시간·결과가 한 과제 행에 모인다', () => {
  const rows = summarize([
    ev({ type: 'task_start', targetId: 'claim', screen: 'moderator', taskId: 'claim', timestamp: 100 }),
    ev({ type: 'tap', targetId: 'a', screen: 'S1', taskId: 'claim' }),
    ev({ type: 'tap', targetId: 'b', screen: 'S1', taskId: 'claim' }),
    ev({ type: 'task_end', targetId: 'claim', screen: 'moderator', taskId: 'claim', outcome: 'success', timestamp: 900 }),
  ])
  expect(rows).toHaveLength(1)
  expect(rows[0].taps).toBe(2)
  expect(rows[0].durationMs).toBe(800)
  expect(rows[0].outcome).toBe('success')
  expect(rows[0].attempt).toBe(1)
})

test('같은 과제를 다시 돌리면 회차별로 행이 갈린다 — 합산하지 않는다', () => {
  const rows = summarize([
    ev({ type: 'task_start', targetId: 'claim', screen: 'moderator', taskId: 'claim' }),
    ev({ type: 'tap', targetId: 'a', screen: 'S1', taskId: 'claim' }),
    ev({ type: 'task_end', targetId: 'claim', screen: 'moderator', taskId: 'claim', outcome: 'fail' }),
    ev({ type: 'task_start', targetId: 'claim', screen: 'moderator', taskId: 'claim' }),
    ev({ type: 'tap', targetId: 'b', screen: 'S1', taskId: 'claim' }),
    ev({ type: 'tap', targetId: 'c', screen: 'S1', taskId: 'claim' }),
    ev({ type: 'task_end', targetId: 'claim', screen: 'moderator', taskId: 'claim', outcome: 'success' }),
  ])
  expect(rows).toHaveLength(2)
  expect(rows.map((r) => r.attempt)).toEqual([1, 2])
  // 1회차 실패가 2회차 성공에 덮이지 않는다
  expect(rows[0].outcome).toBe('fail')
  expect(rows[1].outcome).toBe('success')
  // 탭이 누적되지 않는다
  expect(rows[0].taps).toBe(1)
  expect(rows[1].taps).toBe(2)
})

test('과제가 끝난 뒤 매긴 난이도가 그 과제 행에 붙는다', () => {
  const rows = summarize([
    ev({ type: 'task_start', targetId: 'claim', screen: 'moderator', taskId: 'claim' }),
    ev({ type: 'task_end', targetId: 'claim', screen: 'moderator', taskId: 'claim', outcome: 'success' }),
    // 종료 뒤에 묻는다 — Provider 가 방금 끝난 과제로 taskId 를 채워 준다
    ev({ type: 'difficulty', targetId: 'difficulty-7', screen: 'moderator', taskId: 'claim', score: 5 }),
  ])
  expect(rows).toHaveLength(1)
  expect(rows[0].difficulty).toBe(5)
})

test('taskId 가 없는 이벤트는 집계에서 빠진다', () => {
  const rows = summarize([
    ev({ type: 'tap', targetId: 'a', screen: 'S1', taskId: null }),
    ev({ type: 'screen_view', targetId: 'S1', screen: 'S1', taskId: null }),
  ])
  expect(rows).toEqual([])
})

test('CSV — 쉼표·따옴표·줄바꿈이 든 값이 열을 밀지 않는다', () => {
  const csv = toCsv([
    {
      taskId: '과제1, 보험료 "확인"',
      sessionId: 's1',
      attempt: 1,
      taps: 3,
      durationMs: 800,
      outcome: 'success',
      difficulty: 5,
      state: 'B',
    },
  ])
  const dataLine = csv.split('\n')[1]
  expect(dataLine).toContain('"과제1, 보험료 ""확인"""')
  // 헤더와 데이터의 열 수가 같아야 한다 (따옴표 밖 쉼표만 센다)
  const countCols = (line: string) => line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).length
  expect(countCols(dataLine)).toBe(countCols(csv.split('\n')[0].replace('﻿', '')))
})

test('CSV — 빈 값은 빈 칸으로 나간다 (미종료 과제)', () => {
  const csv = toCsv([
    {
      taskId: 'claim',
      sessionId: 's1',
      attempt: 1,
      taps: 0,
      durationMs: null,
      outcome: null,
      difficulty: null,
      state: 'A',
    },
  ])
  expect(csv.split('\n')[1]).toBe('s1,A,claim,1,,0,,')
})
