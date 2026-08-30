/* 상품 필터 — S2-A(상품 찾기)와 S2-D(목록)가 같은 규칙을 쓴다 (#106).

   두 화면이 같은 useMemo 본문을 복붙하고 있었다. 'life'/'bank' 를 삼항으로
   가르는 미묘한 로직이라, 한쪽만 고치면 두 화면의 필터 결과가 갈린다. */

import type { CompanyFilter } from '@/data/paths'
import type { Product } from '@/data/types'

/** 회사 칩(전체·신한은행·신한라이프)으로 거른다.
    자사(신한라이프) = issuer 'own' / 타사(신한은행 판매) = 'other' */
export function filterByCompany(products: Product[], company: CompanyFilter): Product[] {
  if (company === 'all') return products
  return products.filter((p) => (company === 'life' ? p.issuer === 'own' : p.issuer === 'other'))
}
