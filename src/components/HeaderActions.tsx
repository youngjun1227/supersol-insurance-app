/* 헤더 우측 아이콘 조합 프리셋 (#106).

   같은 검색+전체메뉴 조합이 화면 5곳에, 검색+알림+전체메뉴가 4곳에
   복붙돼 있었다. 아이콘 크기·weight·색이 화면마다 손으로 반복되니
   하나만 손대면 갈린다 — 조합을 여기 한 곳에 둔다.

     <Header … actions={<HeaderActions screen={SCREEN.s3c} />} />          검색+전체메뉴
     <Header … actions={<HeaderActions screen={SCREEN.s1} withAlarm />} /> +알림 */

import { Bell, List, MagnifyingGlass } from '@phosphor-icons/react'
import { ELEMENT, type ScreenCode, tid } from '@/lib/targetId'
import { IconAction } from './Header'

interface HeaderActionsProps {
  /** 계측 화면 코드 — 화면마다 targetId 가 갈려야 한다 (#100) */
  screen: ScreenCode
  /** 알림 버튼을 끼워 넣는다 (메인 계열 화면) */
  withAlarm?: boolean
}

/** 아이콘 한 벌 — 크기 24·regular·--text-secondary 는 전 화면 공통 */
const ICON = { size: 24, weight: 'regular', color: 'var(--text-secondary)' } as const

export function HeaderActions({ screen, withAlarm = false }: HeaderActionsProps) {
  return (
    <>
      <IconAction targetId={tid(screen, ELEMENT.버튼, '검색')} label="검색">
        <MagnifyingGlass {...ICON} />
      </IconAction>

      {withAlarm ? (
        <IconAction targetId={tid(screen, ELEMENT.버튼, '알림')} label="알림 설정">
          <Bell {...ICON} />
        </IconAction>
      ) : null}

      <IconAction targetId={tid(screen, ELEMENT.버튼, '전체메뉴')} label="전체메뉴">
        <List {...ICON} />
      </IconAction>
    </>
  )
}
