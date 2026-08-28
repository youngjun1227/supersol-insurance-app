/* S6-A 상품 상세 — Figma 317:1341 (+ 버블·툴팁 열림 S6-A-1).
   S2-A·S2-D 에서 상품을 누르면 도착한다.

   하단은 고정 CTA (탭바 없음 — Figma 실측).
   ⚠️ 상단 요약의 상품명·설명은 목데이터, 스탯·키값은 PRODUCT_DETAILS(전부 가상값). */

import { Clock, CreditCard, House, List, MagnifyingGlass, User } from '@phosphor-icons/react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  AgentBubble, AppShell, BottomCTA, Button, Header, IconAction, TermTooltip, TopTabs,
} from '@/components'
import { useMock } from '@/app/MockProvider'
import { PRODUCT_DETAILS } from '@/data'
import { PRODUCT_DETAIL_COPY as PD } from '@/data/copy'
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

  /* 상품별 상세 가상값 (mock-data §3-1). 26개 전부 있다.
     제조사·판매 채널은 여기서 파생한다 — 목데이터에 중복 저장하지 않는다.
     ⚠️ 전부 가상값이라 화면에 면책을 띄운다 (PRODUCT_DETAIL_COPY.detailNotice) */
  const d = product ? PRODUCT_DETAILS[product.id] : undefined
  const detail = product && d
    ? {
        stats: [
          { label: '납입방법', value: d.pay },
          { label: '가입나이', value: d.age },
          { label: '보험기간', value: d.term },
        ],
        rows: [
          { label: '보험종류', value: d.kind },
          { label: '제조사', value: product.company },
          {
            label: '판매 채널',
            value: product.issuer === 'own' ? '신한라이프 직접 판매' : '신한은행 판매',
          },
        ],
      }
    : null

  if (!product) {
    return (
      <AppShell name="S6-A-상품상세" header={<Header title="보험상세정보" variant="sub" />} footerType="none">
        <p className={`${styles.empty} t-body`}>{PD.notFound}</p>
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
          label={PD.bubble}
          labelSecond={PD.bubbleSecond}
          resetKey={product.id}
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

          {detail ? (
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
          ) : null}

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
        {tab === 'info' && detail ? (
          <>
            <dl className={styles.table}>
              {detail.rows.map((r) => (
                <div key={r.label} className={styles.row}>
                  <dt className={`${styles.key} t-body`}>{r.label}</dt>
                  <dd className={`${styles.value} t-body`}>{r.value}</dd>
                </div>
              ))}
            </dl>

            {/* 면책 — 스탯 3열(탭 위)과 이 표의 값이 전부 가상값이다.
                자사는 실제 상품명을 쓰므로 표시가 없으면 실제 조건으로 읽힌다 */}
            <p className={`${styles.notice} t-caption`}>{PD.detailNotice}</p>
          </>
        ) : (
          /* 상품안내 탭인데 값이 없는 경우와, 다른 탭(9/11 범위 밖)을 구분한다 —
             둘 다 "준비 중"으로 뭉뚱그리면 참가자가 고장으로 읽는다 */
          <p className={`${styles.empty} t-body`}>
            {tab === 'info' ? PD.noDetail : PD.tabEmpty}
          </p>
        )}
      </div>
    </AppShell>
  )
}
