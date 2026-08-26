/* 데이터 접근 한 층.
   화면은 `useMock()`을 쓰고, 이 파일만 목데이터를 안다.
   나중에 실데이터로 바꿀 때 여기만 갈아끼운다. */

import {
  ACCOUNTS, CATEGORIES, COPY, HOME, PAYMENTS,
  PEER_COVERAGE_TOTAL, PRODUCTS, SERVICES, USER,
} from './mock'
import type { AccountState, MockData } from './types'

export const DEFAULT_STATE: AccountState = 'B' // 보유 2건 20대

export function isAccountState(v: unknown): v is AccountState {
  return v === 'A' || v === 'B'
}

/** URL `?state=A|B` → 계정 상태. 없거나 이상하면 기본값 B */
export function readStateFromSearch(search: string): AccountState {
  const raw = new URLSearchParams(search).get('state')?.toUpperCase()
  return isAccountState(raw) ? raw : DEFAULT_STATE
}

/** 계정 상태 한 벌을 조립해서 돌려준다 */
export function getMockData(state: AccountState): MockData {
  return {
    ...ACCOUNTS[state],
    user: USER,
    peerCoverageTotal: PEER_COVERAGE_TOTAL,
    categories: CATEGORIES,
    products: PRODUCTS,
    payments: PAYMENTS,
    services: SERVICES,
    home: HOME,
    copy: COPY,
  }
}

export * from './types'
export {
  PRODUCT_DETAIL, TERM_TOOLTIPS, COPY,
} from './mock'
