/* S6-A 상품 상세 — Figma 317:1341 (+ 버블·툴팁 열림 S6-A-1).
   S2-A·S2-D 에서 상품을 누르면 도착한다.

   하단은 고정 CTA (탭바 없음 — Figma 실측).
   ⚠️ 상단 요약의 상품명·설명은 목데이터, 스탯·키값은 PRODUCT_DETAIL(가상값). */

import { Clock, CreditCard, House, List, MagnifyingGlass, User } from '@phosphor-icons/react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  AgentBubble, AppShell, BottomCTA, Button, Header, IconAction, TermTooltip, TopTabs,
} from '@/components'
import { useMock } from '@/app/MockProvider'
import { PRODUCT_DETAIL } from '@/data'
import { ELEMENT, SCREEN, tid } from '@/lib/targetId'
import { useTrack } from '@/lib/useTrack'
import { useState } from 'react'
import styles from './ProductDetail.module.css'

const TABS = [
  { id: 'info', label: '상품안내' },
  { id: 'coverage', label: '보장내용' },
  { id: 'notice', label: '유의사항' },
]

/* 스탯 3열 아이콘 — 납입방법(카드)·가입나이(사람)·보험기간(시계).
   아이콘-매핑.md: 가입나이=user (2026-08-25 추가) */
const STAT_ICONS = [CreditCard, User, Clock]

export function ProductDetail() {
  const navigate = useNavigate()
  const track = useTrack()
  const { productId } = useParams()
  const { data } = useMock()
  const [tab, setTab] = useState('info')

  const product = data.products.find((p) => p.id === productId)

  /* 상세 가상값은 케어받는암보험 기준으로만 있다 (mock-data §3-1).
     다른 상품이면 이름·설명만 바꿔 보여준다 — 값을 지어내지 않는다. */
  const detail = PRODUCT_DETAIL

  if (!product) {
    return (
      <AppShell name="S6-A-상품상세" header={<Header title="보험상세정보" variant="sub" />} footerType="none">
        <p className={`${styles.empty} t-body`}>상품을 찾을 수 없어요</p>
      </AppShell>
    )
  }

  return (
    <AppShell
      name="S6-A-상품상세"
      footerType="cta"
      header={
        <Header
          title="보험상세정보"
          variant="sub"
          actions={
            <>
              <IconAction targetId={tid(SCREEN.s6, ELEMENT.버튼, '검색')} label="검색">
                <MagnifyingGlass size={24} weight="regular" color="var(--text-secondary)" />
              </IconAction>
              <IconAction targetId={tid(SCREEN.s6, ELEMENT.버튼, '전체메뉴')} label="전체메뉴">
                <List size={24} weight="regular" color="var(--text-secondary)" />
              </IconAction>
            </>
          }
        />
      }
      footer={
        <BottomCTA>
          <button
            type="button"
            className={styles.iconBtn}
            aria-label="홈"
            onClick={() => {
              track(tid(SCREEN.s6, ELEMENT.버튼, '홈'))
              navigate('/')
            }}
          >
            <House size={24} weight="regular" color="var(--primary)" />
          </button>
          <Button size="lg" block targetId={tid(SCREEN.s6, ELEMENT.버튼, '가입하기')}>
            가입하기
          </Button>
        </BottomCTA>
      }
    >
      <div className={styles.body}>
        {/* 에이전트 진입 버블 — 헤더 아래 우측 플로팅 */}
        <AgentBubble
          label="상품에 대한 궁금한 점 물어보세요!"
          onTap={() => {
            track(tid(SCREEN.s6, ELEMENT.버튼, '에이전트'))
            navigate(`/agent?ctx=product&id=${product.id}`)
          }}
        />

        {/* 상단 요약 */}
        <section className={styles.summary}>
          <img
            className={styles.hero}
            src={`/assets/3d/${data.categories.find((c) => c.id === product.category)?.icon3d}.png`}
            alt=""
            aria-hidden="true"
          />
          <h1 className={`${styles.name} t-h3`}>
            {product.company} {product.name}
          </h1>
          <p className={`${styles.desc} t-body`}>{product.description}</p>

          <div className={styles.terms}>
            {['무배당', '갱신형'].map((t) => (
              <TermTooltip
                key={t}
                term={t}
                onOpen={(term) => track(tid(SCREEN.s6, ELEMENT.버튼, `툴팁-${term}`))}
              />
            ))}
          </div>

          <div className={styles.stats}>
            {detail.stats.map((s, i) => {
              const Icon = STAT_ICONS[i] ?? CreditCard
              return (
                <div key={s.label} className={styles.stat}>
                  <span className={styles.statCircle}>
                    <Icon size={24} weight="regular" color="var(--text-secondary)" />
                  </span>
                  <span className={`${styles.statLabel} t-caption`}>{s.label}</span>
                  <span className={`${styles.statValue} t-body-lg-bold`}>{s.value}</span>
                </div>
              )
            })}
          </div>

          <Button variant="tint" block targetId={tid(SCREEN.s6, ELEMENT.버튼, '보험료확인')}>
            내 보험료 확인
          </Button>
        </section>

        {/* 상단 탭 3개 */}
        <div className={styles.tabs}>
          <TopTabs
            items={TABS}
            activeId={tab}
            onChange={(id) => {
              track(tid(SCREEN.s6, ELEMENT.탭, id))
              setTab(id)
            }}
          />
        </div>

        {/* 키-값 표 — 상품안내 탭에만 */}
        {tab === 'info' ? (
          <dl className={styles.table}>
            {detail.rows.map((r) => (
              <div key={r.label} className={styles.row}>
                <dt className={`${styles.key} t-body`}>{r.label}</dt>
                <dd className={`${styles.value} t-body`}>{r.value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className={`${styles.empty} t-body`}>준비 중이에요</p>
        )}
      </div>
    </AppShell>
  )
}
