/* S2-A 상품 찾기 (A안 확정) — Figma 317:7548.
   필터 2축: 카테고리 칩 10개(가로 스크롤) × 회사 칩 3개.

   ⚠️ 칩 동작이 다르다 (변경로그 "S2 = A안 확정"):
     카테고리 칩 · "N개 모두 보기" → S2-D 로 이동 (?cat=…)
     회사 칩                      → 제자리 필터링 (라우트 유지)
   ⚠️ 계측: 경로가 갈리는 화면이라 탭 이벤트에 필터 상태 스냅샷(cat·company)을 남긴다. */

import { useMemo, useState } from 'react'
import { Bell, CaretRight, List, MagnifyingGlass } from '@phosphor-icons/react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  AppShell, Header, IconAction, ProductFilters, ProductRow,
  ProductSectionHeader, ProductTopTabs, TabBar,
} from '@/components'
import { useMock } from '@/app/MockProvider'
import { SECTION_PREVIEW_MAX, type CompanyFilter } from '@/data/paths'
import type { CategoryId, Product } from '@/data/types'
import { ELEMENT, SCREEN, tid } from '@/lib/targetId'
import { useTrack } from '@/lib/useTrack'
import { useTrackedNavigate } from '@/lib/useTrackedNavigate'
import styles from './ProductInsurance.module.css'

export function ProductInsurance() {
  const navigate = useNavigate()
  const go = useTrackedNavigate()
  const location = useLocation()
  const track = useTrack()
  const { data } = useMock()

  /** 회사 필터만 상태로 둔다 — 카테고리는 선택 시 S2-D 로 나간다 */
  const [company, setCompany] = useState<CompanyFilter>('all')

  const filtered = useMemo(() => {
    if (company === 'all') return data.products
    return data.products.filter((p) =>
      company === 'life' ? p.issuer === 'own' : p.issuer === 'other',
    )
  }, [data.products, company])

  const sections = data.categories
    .map((c) => ({ category: c, items: filtered.filter((p) => p.category === c.id) }))
    .filter((s) => s.items.length > 0)

  /** 카테고리 칩·"모두 보기" → S2-D 이동 */
  const goCategory = (id: CategoryId | null) => {
    const cat = id ?? 'all'
    track(tid(SCREEN.s2, ELEMENT.칩, cat), { cat, company })
    if (!id) return // '전체'는 이미 이 화면이라 이동하지 않는다
    go(null, `/product/insurance/list?cat=${id}`)
  }

  const goProduct = (p: Product) => {
    track(tid(SCREEN.s2, ELEMENT.행, p.id), { cat: 'all', company })
    navigate({ pathname: `/product/insurance/${p.id}`, search: location.search })
  }

  return (
    <AppShell
      name="S2-A-상품찾기"
      background="page"
      footer={<TabBar activeId="product" screen={SCREEN.s2} />}
      footerType="tabbar"
      header={
        <>
          <Header
            title="모든상품"
            actions={
              <>
                <IconAction targetId={tid(SCREEN.s2, ELEMENT.버튼, '검색')} label="검색">
                  <MagnifyingGlass size={24} weight="regular" color="var(--text-secondary)" />
                </IconAction>
                <IconAction targetId={tid(SCREEN.s2, ELEMENT.버튼, '알림')} label="알림">
                  <Bell size={24} weight="regular" color="var(--text-secondary)" />
                </IconAction>
                <IconAction targetId={tid(SCREEN.s2, ELEMENT.버튼, '전체메뉴')} label="전체메뉴">
                  <List size={24} weight="regular" color="var(--text-secondary)" />
                </IconAction>
              </>
            }
          />
          <ProductTopTabs active="insurance" />
        </>
      }
    >
      <ProductFilters
        categories={data.categories}
        activeCategory={null}
        onCategory={goCategory}
        company={company}
        onCompany={(id) => {
          track(tid(SCREEN.s2, ELEMENT.칩, `회사-${id}`), { cat: 'all', company: id })
          setCompany(id)
        }}
      />

      {/* 섹션 9개 — 미리보기 3개 + 초과 시 "모두 보기" */}
      <div className={styles.sections}>
        {sections.map(({ category, items }) => (
          <section key={category.id} className={styles.section}>
            <ProductSectionHeader category={category} count={items.length} />

            {items.slice(0, SECTION_PREVIEW_MAX).map((p) => (
              <ProductRow
                key={p.id}
                product={p}
                categoryId={category.id}
                onTap={() => goProduct(p)}
              />
            ))}

            {items.length > SECTION_PREVIEW_MAX ? (
              <button
                type="button"
                className={styles.seeAll}
                onClick={() => goCategory(category.id)}
              >
                <span className={`${styles.seeAllText} t-body-sm-medium`}>
                  {category.label} 상품 {items.length}개 모두 보기
                </span>
                <CaretRight size={16} weight="regular" color="var(--text-disabled)" />
              </button>
            ) : null}
          </section>
        ))}
      </div>
    </AppShell>
  )
}
