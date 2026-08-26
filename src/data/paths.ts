/* 금융·상품 탭의 상단 탭 정의.
   ⚠️ 경로 화면(은행·카드·증권·발견)과 코드로 만든 보험 화면(S1·S2)이
   같은 정의를 써야 서로 어긋나지 않는다. */

/** 금융 탭의 상단 탭 4개 — 화면에 다 들어가므로 스크롤 없음 */
export type FinanceTabId = 'bank' | 'card' | 'stock' | 'insurance'

export const FINANCE_TABS: { id: FinanceTabId; label: string; path: string }[] = [
  { id: 'bank',      label: '은행', path: '/finance' },
  { id: 'card',      label: '카드', path: '/finance/card' },
  { id: 'stock',     label: '증권', path: '/finance/stock' },
  { id: 'insurance', label: '보험', path: '/finance/insurance' },
]

/** 상품 탭의 상단 탭 9개 — 실물이 가로 스크롤. '보험'이 맨 끝이라 스크롤해야 보인다 */
export type ProductTabId =
  | 'discover' | 'deposit' | 'saving' | 'card' | 'loan'
  | 'fx' | 'invest' | 'pension' | 'insurance'

export const PRODUCT_TABS: { id: ProductTabId; label: string; path?: string }[] = [
  { id: 'discover',  label: '발견',     path: '/product' },
  { id: 'deposit',   label: '입출금' },
  { id: 'saving',    label: '저축' },
  { id: 'card',      label: '카드' },
  { id: 'loan',      label: '대출' },
  { id: 'fx',        label: '외환' },
  { id: 'invest',    label: '투자' },
  { id: 'pension',   label: '퇴직연금' },
  { id: 'insurance', label: '보험',     path: '/product/insurance' },
]
