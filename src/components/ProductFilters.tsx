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

  /* 선택된 칩이 화면 밖이면 보이게 스크롤한다 — 어떤 필터가 켜져 있는지
     안 보이면 사용자가 상태를 알 수 없다 (S2-D 는 칩이 뒤쪽에 있는 경우가 많다) */
  useEffect(() => {
    const row = rowRef.current
    if (!row || !activeCategory) return
    const chip = row.querySelector<HTMLElement>('[data-selected="true"]')
    if (chip) chip.scrollIntoView({ block: 'nearest', inline: 'center' })
  }, [activeCategory])

  return (
    <>
      {/* 카테고리 칩 — 가로 스크롤 */}
      <div className={`${styles.chipRow} no-scrollbar`} ref={rowRef}>
        <button
          type="button"
          className={`${styles.chip} t-body-lg-medium`}
          data-selected={activeCategory === null}
          onClick={() => onCategory(null)}
        >
          전체
        </button>
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
