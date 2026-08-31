/* 계측 targetId 명명 규칙.
   ⚠️ 3명이 각자 이름을 지으면 9/11 집계가 안 된다 — 반드시 이 헬퍼를 쓴다.

   형식: {화면}-{요소}-{식별자}
     S3C-항목-c-actual      진단 결과의 실손의료비 행
     S3C-물어보기-c-actual  같은 행의 💬 (행 전체 탭과 다른 타깃)
     S3C-토글-later         여유 티어 더보기
     S1-현황카드            식별자가 없으면 생략

   화면 코드는 아래 SCREEN 을 쓴다 (오타로 집계가 갈리는 걸 막는다). */

/** 화면 코드 — AppShell 의 name 과 짝을 이룬다 */
export const SCREEN = {
  home: 'HOME',
  s1: 'S1',
  s1My: 'S1-7',
  s1Sheet: 'S1-13',
  financePath: 'FINPATH',
  productPath: 'PRODPATH',
  s2: 'S2A',
  s2List: 'S2D',
  s3c: 'S3C',
  s3d: 'S3D',
  s3e: 'S3E',
  s3f: 'S3F',
  s4Popup: 'S4A',
  s4Guide: 'S4D',
  s4Done: 'S4DONE',
  s5Settings: 'S5A',
  s6: 'S6A',
  skeleton: 'SKEL',
  /* 시연 도입부 (#S5-D) — 참가자가 앱에 들어오기 **전** 단계다.
     앱 안에서 헤맨 것과 구분해야 해서 화면 코드를 따로 둔다 */
  demoMenu: 'DEMO',
  demoPush: 'DEMO-PUSH',
} as const

export type ScreenCode = (typeof SCREEN)[keyof typeof SCREEN]

/** 자주 쓰는 요소 이름. 여기 없으면 새로 쓰되 한국어 명사로 */
export const ELEMENT = {
  항목: '항목',
  물어보기: '물어보기',
  토글: '토글',
  체크: '체크',
  칩: '칩',
  카드: '카드',
  버튼: '버튼',
  행: '행',
  탭: '탭',
  뒤로: '뒤로',
  닫기: '닫기',
  모두보기: '모두보기',
  탭행: '탭행',
} as const

/**
 * targetId 를 만든다.
 *
 *   tid(SCREEN.s3c, ELEMENT.항목, 'c-actual')  // 'S3C-항목-c-actual'
 *   tid(SCREEN.s1, ELEMENT.카드, '현황')        // 'S1-카드-현황'
 *   tid(SCREEN.s3d, ELEMENT.버튼)               // 'S3D-버튼'
 */
export function tid(screen: ScreenCode, element: string, id?: string): string {
  return id ? `${screen}-${element}-${id}` : `${screen}-${element}`
}
