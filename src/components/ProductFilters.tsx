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

  /* 선택된 칩을 스크롤 영역 맨 앞으로 — '전체' 바로 오른쪽에 온다.
     ⚠️ 가운데 정렬(inline:'center')이 아니다 — 뒤 칩이 절반만 보여 탐색이 끊긴다

     진입(마운트)은 즉시, 화면 안에서 칩을 갈아탈 때만 smooth (#124).
     - 도착 상태는 figma-ref S2-D 가 그리는 그대로다 — 선택 칩이 맨 왼쪽, 앞 칩은
       가장자리에 잘림. 이건 바뀌지 않는다
     - 즉시 대입은 눈앞의 칩을 눌렀는데 행 전체가 홱 튀어 뭐가 어디로 갔는지
       눈이 못 따라간다. smooth 는 정지 화면이 아니라 전환만 바꾼다
     - 마운트까지 smooth 로 하면 S2-A→S2-D 도착 장면이 흘러가 보인다.
       PNG 는 도착 상태라 진입은 즉시 놓는다 */
  const mounted = useRef(false)
  useEffect(() => {
    const row = rowRef.current
    const instant = !mounted.current
    mounted.current = true
    if (!row || !activeCategory) return
    const chip = row.querySelector<HTMLElement>('[data-selected="true"]')
    if (!chip) return
    /* ⚠️ offsetLeft 는 offsetParent 기준이라 스크롤 컨테이너와 다를 수 있다.
       실제 화면 위치 차이로 계산해야 칩이 영역 안에 정확히 들어온다 */
    const left = row.scrollLeft + chip.getBoundingClientRect().left - row.getBoundingClientRect().left
    /* jsdom 에는 Element.scrollTo 가 없어 스모크에서 throw 했다. 없으면 즉시 대입 —
       #124 이전과 정확히 같은 동작이라 어느 환경에서도 화면이 깨지지 않는다 */
    if (typeof row.scrollTo === 'function') row.scrollTo({ left, behavior: instant ? 'auto' : 'smooth' })
    else row.scrollLeft = left
  }, [activeCategory])

  return (
    <>
      {/* 카테고리 칩 — '전체' 는 고정, 나머지만 가로 스크롤.
          ⚠️ 같은 스크롤 영역 안에서 '전체' 를 sticky 로 두면
             선택 칩을 왼쪽 여백에 맞출 수 없다(둘이 같은 자리를 다툰다).
             '전체' 를 스크롤 밖으로 빼야 둘 다 만족한다 */}
      <div className={styles.catRow}>
        <button
          type="button"
          className={`${styles.chip} ${styles.chipAll} t-body-lg-medium`}
          data-selected={activeCategory === null}
          onClick={() => onCategory(null)}
        >
          전체
        </button>

        <div className={`${styles.chipRow} no-scrollbar`} ref={rowRef}>
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
