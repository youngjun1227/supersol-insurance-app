/* S2-A 상품 찾기 (A안 확정) — Figma 317:7548.
   필터 2축: 카테고리 칩 10개(가로 스크롤) × 회사 칩 3개.

   ⚠️ 칩 동작이 다르다 (변경로그 "S2 = A안 확정"):
     카테고리 칩 · "N개 모두 보기" → S2-D 로 이동 (?cat=…)
     회사 칩                      → 제자리 필터링 (라우트 유지)
   ⚠️ 계측: 경로가 갈리는 화면이라 탭 이벤트에 필터 상태 스냅샷(cat·company)을 남긴다
      — targetId 만으로는 해석이 안 된다.
   ⚠️ 아이콘 문법: 칩 = 3D 20 / 상품 행 = Phosphor 라인 24 */

import { useMemo, useState } from 'react'
import {
  AirplaneTilt, Bandaids, Bell, Brain, CaretRight, ChartLineUp, Heartbeat,
  List, MagnifyingGlass, PiggyBank, ShieldCheck, Tooth, Virus, type Icon,
} from '@phosphor-icons/react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppShell, Header, IconAction, ProductTopTabs, TabBar } from '@/components'
import { useMock } from '@/app/MockProvider'
import {
  CHANNEL_NOTICE, COMPANY_FILTERS, SECTION_PREVIEW_MAX, type CompanyFilter,
} from '@/data/paths'
import type { CategoryId, Product } from '@/data/types'
import { ELEMENT, SCREEN, tid } from '@/lib/targetId'
import { useTrack } from '@/lib/useTrack'
import styles from './ProductInsurance.module.css'

/* 카테고리 아이콘 — Phosphor 라인 24.
   ⚠️ 이름으로 동적 조회(import * as)를 하면 아이콘 전체가 번들에 들어간다
      (317KB → 5.2MB 를 실제로 겪음). 쓰는 것만 명시적으로 import 한다. */
const CATEGORY_ICON: Record<CategoryId, Icon> = {
  cancer: Virus,
  health: Heartbeat,
  dementia: Brain,
  dental: Tooth,
  injury: Bandaids,
  travel: AirplaneTilt,
  etc: ShieldCheck,
  pension: PiggyBank,
  variable: ChartLineUp,
}

function CategoryIcon({ id }: { id: CategoryId }) {
  const Icon = CATEGORY_ICON[id]
  return <Icon size={24} weight="regular" color="var(--text-secondary)" />
}

export function ProductInsurance() {
  const navigate = useNavigate()
  const location = useLocation()
  const track = useTrack()
  const { data } = useMock()

  /** 회사 필터 — 제자리 필터링. 카테고리는 선택 시 S2-D 로 나가므로 상태로 안 둔다 */
  const [company, setCompany] = useState<CompanyFilter>('all')

  /** 계측 스냅샷 — 지금 필터 상태 */
  const snapshot = () => ({ cat: 'all', company })

  const filtered = useMemo(() => {
    if (company === 'all') return data.products
    return data.products.filter((p) =>
      company === 'life' ? p.issuer === 'own' : p.issuer === 'other',
    )
  }, [data.products, company])

  /** 카테고리별로 묶는다 — 섹션 순서는 categories 순 */
  const sections = data.categories
    .map((c) => ({ category: c, items: filtered.filter((p) => p.category === c.id) }))
    .filter((s) => s.items.length > 0)

  const goCategory = (catId: string) => {
    track(tid(SCREEN.s2, ELEMENT.칩, catId), { cat: catId, company })
    navigate({ pathname: '/product/insurance/list', search: `?cat=${catId}` })
  }

  const goProduct = (p: Product) => {
    track(tid(SCREEN.s2, ELEMENT.행, p.id), snapshot())
    navigate({ pathname: `/product/insurance/${p.id}`, search: location.search })
  }

  return (
    <AppShell
      name="S2-A-상품찾기"
      background="page"
      footer={<TabBar activeId="product" />}
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
      {/* 카테고리 칩 — 가로 스크롤. 누르면 S2-D 로 이동 */}
      <div className={`${styles.chipRow} no-scrollbar`}>
        <button
          type="button"
          className={`${styles.chip} t-body-lg-medium`}
          data-selected="true"
          onClick={() => track(tid(SCREEN.s2, ELEMENT.칩, 'all'), snapshot())}
        >
          전체
        </button>
        {data.categories.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`${styles.chip} t-body-lg-medium`}
            onClick={() => goCategory(c.id)}
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
            onClick={() => {
              track(tid(SCREEN.s2, ELEMENT.칩, `회사-${f.id}`), { cat: 'all', company: f.id })
              setCompany(f.id)
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <p className={`${styles.notice} t-body-sm`}>{CHANNEL_NOTICE}</p>

      <div className={styles.band} />

      {/* 섹션 9개 — 미리보기 3개 + 초과 시 "모두 보기" */}
      <div className={styles.sections}>
        {sections.map(({ category, items }) => (
          <section key={category.id} className={styles.section}>
            <div className={styles.sectionHead}>
              <h2 className={`${styles.sectionName} t-h2`}>{category.label}</h2>
              <span className={`${styles.sectionCount} t-h2`}>{items.length}</span>
            </div>

            {items.slice(0, SECTION_PREVIEW_MAX).map((p) => (
              <button key={p.id} type="button" className={styles.item} onClick={() => goProduct(p)}>
                <span className={styles.itemIcon}>
                  <CategoryIcon id={category.id} />
                </span>
                <span className={styles.itemText}>
                  <span className={`${styles.itemName} t-body-lg-bold`}>
                    {p.company} {p.name}
                  </span>
                  <span className={`${styles.itemDesc} t-body-sm`}>{p.description}</span>
                </span>
              </button>
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
