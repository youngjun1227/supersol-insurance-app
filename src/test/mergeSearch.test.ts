/* useTrackedNavigate 의 쿼리 병합 규칙 (#98).

   묻는 것은 하나다 — "화면 이동이 ?state 를 흘리지 않는가."
   같은 go() 헬퍼가 복붙되다 한 벌이 search 를 빠뜨려 상태 A 참가자가
   이동 중에 기본값 B 로 리셋된 것이 원인이라, 규칙을 여기 고정한다. */

import { expect, test } from 'vitest'
import { mergeSearch } from '@/lib/useTrackedNavigate'

test('쿼리 없는 목적지 — 현재 ?state 가 따라간다', () => {
  expect(mergeSearch('/diagnosis', '?state=A')).toEqual({
    pathname: '/diagnosis',
    search: '?state=A',
  })
})

test('목적지 쿼리(?ctx=)와 현재 ?state 가 합쳐진다', () => {
  const { pathname, search } = mergeSearch('/agent?ctx=c-actual', '?state=A')
  expect(pathname).toBe('/agent')
  const p = new URLSearchParams(search)
  expect(p.get('ctx')).toBe('c-actual')
  expect(p.get('state')).toBe('A')
})

test('같은 키는 목적지가 이긴다 — ?cat 갈아타기', () => {
  const { search } = mergeSearch('/product/insurance/list?cat=dental', '?cat=cancer&state=A')
  const p = new URLSearchParams(search)
  expect(p.get('cat')).toBe('dental')
  expect(p.get('state')).toBe('A')
})

test('홈 오버레이 쿼리(popup)는 끌고 가지 않는다', () => {
  expect(mergeSearch('/claim/guide', '?popup=claim&state=A')).toEqual({
    pathname: '/claim/guide',
    search: '?state=A',
  })
})

test('둘 다 빈 쿼리면 search 도 빈 문자열', () => {
  expect(mergeSearch('/', '')).toEqual({ pathname: '/', search: '' })
})
