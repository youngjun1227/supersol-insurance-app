/* S2 계열 공통 — 카테고리 칩 행 · 회사 칩 행 · 채널 고지 · 구분 밴드.
   S2-A(전체)와 S2-D(카테고리 선택 후)가 같은 필터 UI를 쓴다.
   ⚠️ 칩 동작이 화면마다 다르므로 onCategory 는 호출부가 정한다
      (S2-A: S2-D 로 이동 / S2-D: 같은 화면에서 카테고리 교체) */

import { useEffect, useRef } from 'react'
import type { Category, CategoryId } from '@/data/types'
import { CHANNEL_NOTICE, COMPANY_FILTERS, type CompanyFilter } from '@/data/paths'
import styles from './ProductFilters.module.css'

interface ProductFiltersProps {
  categories: Category[]
  /** 선택된 카테고리. null 이면 '전체' */
  activeCategory: CategoryId | null
  onCategory: (id: CategoryId | null) => void
  company: CompanyFilter
  onCompany: (id: CompanyFilter) => void
}

export function ProductFilters({
  categories, activeCategory, onCategory, company, onCompany,
}: ProductFiltersProps) {
  const rowRef = useRef<HTMLDivElement>(null)

  /* 선택된 칩을 앞쪽으로 스크롤한다 — 어떤 필터가 켜져 있는지 보이면서,
     그 뒤 칩들도 함께 노출돼 다음 선택으로 이어가기 쉽다.
     ⚠️ 가운데 정렬(inline:'center')이 아니다 — 뒤 칩이 절반만 보여 탐색이 끊긴다
     ⚠️ '전체' 칩이 sticky 로 왼쪽에 떠 있으므로 그 폭만큼 더 밀어야
        선택 칩이 '전체' 뒤에 가리지 않는다 */
  useEffect(() => {
    const row = rowRef.current
    if (!row || !activeCategory) return
    const chip = row.querySelector<HTMLElement>('[data-selected="true"]')
    if (!chip) return
    const pad = parseFloat(getComputedStyle(row).paddingLeft) || 0
    // 첫 자식은 '전체' sticky 래퍼다
    const all = row.firstElementChild as HTMLElement | null
    const gap = parseFloat(getComputedStyle(row).gap) || 0
    const stickyW = all ? all.offsetWidth + gap : 0
    row.scrollLeft = chip.offsetLeft - pad - stickyW
  }, [activeCategory])

  return (
    <>
      {/* 카테고리 칩 — 가로 스크롤 */}
      <div className={`${styles.chipRow} no-scrollbar`} ref={rowRef}>
        {/* '전체' 는 sticky 래퍼로 왼쪽에 고정 — 스크롤해도 남아 필터를 풀 수 있다.
            래퍼가 왼쪽 여백까지 덮어서 지나가는 칩이 비치지 않는다 */}
        <span className={styles.chipAllWrap}>
          <button
            type="button"
            className={`${styles.chip} t-body-lg-medium`}
            data-selected={activeCategory === null}
            onClick={() => onCategory(null)}
          >
            전체
          </button>
        </span>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`${styles.chip} t-body-lg-medium`}
            data-selected={activeCategory === c.id}
            onClick={() => onCategory(c.id)}
          >
            <img className={styles.chipIcon} src={`/assets/3d/${c.icon3d}.png`} alt="" aria-hidden="true" />
            {c.label}
          </button>
        ))}
      </div>

      {/* 회사 칩 — 제자리 필터링 */}
      <div className={styles.companyRow}>
        {COMPANY_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`${styles.chip} t-body-lg-medium`}
            data-selected={company === f.id}
            onClick={() => onCompany(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 회사 구분 고지 — 규제 대응 장치라 지우지 않는다 */}
      <p className={`${styles.notice} t-caption`}>{CHANNEL_NOTICE}</p>

      <div className={styles.band} />
    </>
  )
}
