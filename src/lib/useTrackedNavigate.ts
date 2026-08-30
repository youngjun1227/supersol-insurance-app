/* 계측 + 쿼리 유지 이동 (#98).
   같은 go() 헬퍼가 화면마다 복붙되다 한 벌이 search 를 빠뜨려
   ?state=A 참가자가 화면 이동 중에 기본값 B 로 조용히 리셋됐다.
   화면 이동은 전부 이 훅으로 한다 — ?state 는 참가자 조건이라
   이동 중에 풀리면 조건 비교가 오염된다.

     const go = useTrackedNavigate()
     go(tid(SCREEN.s3c, ELEMENT.항목, item.id), `/diagnosis/${item.id}`)
     go(null, '/agent?ctx=c-actual')            // 계측 없이 이동만
*/

import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTrack } from '@/lib/useTrack'

/** 목적지 쿼리 위에 현재 쿼리를 합친다 — 목적지가 지정한 키(?ctx= 등)가 이기고,
    나머지(?state= 등)는 따라간다. <Navigate> 처럼 훅 밖에서도 쓴다. */
export function mergeSearch(
  to: string,
  currentSearch: string,
): { pathname: string; search: string } {
  const [pathname, toQuery = ''] = to.split('?')
  const merged = new URLSearchParams(currentSearch)
  merged.delete('popup') // 홈 오버레이 쿼리는 다른 화면으로 끌고 가지 않는다
  new URLSearchParams(toQuery).forEach((value, key) => merged.set(key, value))
  const search = merged.toString()
  return { pathname, search: search ? `?${search}` : '' }
}

export function useTrackedNavigate() {
  const navigate = useNavigate()
  const location = useLocation()
  const track = useTrack()

  return useCallback(
    (targetId: string | null, to: string) => {
      if (targetId) track(targetId)
      navigate(mergeSearch(to, location.search))
    },
    [navigate, location.search, track],
  )
}
