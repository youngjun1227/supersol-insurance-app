/* S2-D 카테고리 선택 후 목록 — Figma 317:7344.
   S2-A 에서 카테고리 칩·"모두 보기"를 누르면 여기로 온다 (?cat=…).

   S2-A 와 다른 점:
     - 선택된 카테고리 칩이 활성화되고, 그 섹션만 전체 목록으로 펼쳐진다
     - 섹션 헤더에 3D 아이콘 24 가 붙는다
     - 미리보기 3개 제한이 없다 ("모두 보기" 행도 없다)
     - 헤더가 드롭다운형("모든상품 ▾") */

import { useMemo, useState } from 'react'
import { CaretDown, House, List, MagnifyingGlass } from '@phosphor-icons/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import {
  AppShell, Header, IconAction, ProductFilters, ProductRow,
  ProductSectionHeader, ProductTopTabs, TabBar,
} from '@/components'
import { useMock } from '@/app/MockProvider'
import type { CompanyFilter } from '@/data/paths'
import type { CategoryId, Product } from '@/data/types'
import { ELEMENT, SCREEN, tid } from '@/lib/targetId'
import { useTrack } from '@/lib/useTrack'
import styles from './ProductList.module.css'

export function ProductList() {
  const navigate = useNavigate()
  const location = useLocation()
  const track = useTrack()
  const { data } = useMock()
  const [searchParams, setSearchParams] = useSearchParams()

  const raw = searchParams.get('cat')
  const activeCategory = (data.categories.find((c) => c.id === raw)?.id ?? null) as CategoryId | null
  const [company, setCompany] = useState<CompanyFilter>('all')

  const byCompany = useMemo(() => {
    if (company === 'all') return data.products
    return data.products.filter((p) =>
      company === 'life' ? p.issuer === 'own' : p.issuer === 'other',
    )
  }, [data.products, company])

  /** 선택된 카테고리만 (전체면 카테고리 순으로 전부) */
  const sections = data.categories
    .filter((c) => activeCategory === null || c.id === activeCategory)
    .map((c) => ({ category: c, items: byCompany.filter((p) => p.category === c.id) }))
    .filter((s) => s.items.length > 0)

  const snapshot = () => ({ cat: activeCategory ?? 'all', company })

  const selectCategory = (id: CategoryId | null) => {
    track(tid(SCREEN.s2List, ELEMENT.칩, id ?? 'all'), { cat: id ?? 'all', company })
    // 같은 화면에서 카테고리만 교체 (S2-A 와 달리 이동하지 않는다)
    setSearchParams(
      (prev) => {
        const p = new URLSearchParams(prev)
        if (id) p.set('cat', id)
        else p.delete('cat')
        return p
      },
      { replace: true },
    )
  }

  const goProduct = (p: Product) => {
    track(tid(SCREEN.s2List, ELEMENT.행, p.id), snapshot())
    navigate({ pathname: `/product/insurance/${p.id}`, search: location.search })
  }

  return (
    <AppShell
      name="S2-D-카테고리선택후"
      background="page"
      footer={<TabBar activeId="product" screen={SCREEN.s2List} />}
      footerType="tabbar"
      header={
        <>
          <Header
            title="모든상품"
            titleAdornment={<CaretDown size={16} weight="regular" color="var(--text-black)" />}
            actions={
              <>
                <IconAction targetId={tid(SCREEN.s2List, ELEMENT.버튼, '검색')} label="검색">
                  <MagnifyingGlass size={24} weight="regular" color="var(--text-secondary)" />
                </IconAction>
                <IconAction targetId={tid(SCREEN.s2List, ELEMENT.버튼, '홈')} label="홈">
                  <House size={24} weight="regular" color="var(--text-secondary)" />
                </IconAction>
                <IconAction targetId={tid(SCREEN.s2List, ELEMENT.버튼, '전체메뉴')} label="전체메뉴">
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
        activeCategory={activeCategory}
        onCategory={selectCategory}
        company={company}
        onCompany={(id) => {
          track(tid(SCREEN.s2List, ELEMENT.칩, `회사-${id}`), { cat: activeCategory ?? 'all', company: id })
          setCompany(id)
        }}
      />

      <div className={styles.sections}>
        {sections.map(({ category, items }) => (
          <section key={category.id} className={styles.section}>
            <ProductSectionHeader category={category} count={items.length} withIcon />
            {items.map((p) => (
              <ProductRow
                key={p.id}
                product={p}
                categoryId={category.id}
                onTap={() => goProduct(p)}
              />
            ))}
          </section>
        ))}

        {sections.length === 0 ? (
          <p className={`${styles.empty} t-body`}>조건에 맞는 상품이 없어요</p>
        ) : null}
      </div>
    </AppShell>
  )
}
