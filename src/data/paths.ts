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

/* ── S2-A 필터 (변경로그 "S2 = A안 확정") ──────────────────
   필터 2축: 카테고리 칩 10개(전체 + 9) × 회사 칩 3개.
   칩 동작 분리 — 카테고리 칩·"모두 보기" → S2-D 이동 / 회사 칩 → 제자리 필터링 */

/** 회사 필터 — 판매 채널 */
export type CompanyFilter = 'all' | 'bank' | 'life'

export const COMPANY_FILTERS: { id: CompanyFilter; label: string }[] = [
  { id: 'all',  label: '전체' },
  { id: 'bank', label: '신한은행' },
  { id: 'life', label: '신한라이프' },
]

/** 회사 구분 고지 — 규제 대응 장치라 지우지 않는다 */
export const CHANNEL_NOTICE =
  '신한은행에서 파는 다른 보험사 상품과, 신한라이프가 직접 만든 상품을 한 번에 보여드려요'

/** 섹션당 미리보기 최대 개수. 초과하면 "N개 모두 보기" 행이 붙는다 */
export const SECTION_PREVIEW_MAX = 3
