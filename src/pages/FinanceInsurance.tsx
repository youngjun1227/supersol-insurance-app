/* S1-9 보험 메인 (보유 2건) — Figma 310:608. 기본 상태이자 9/11 과제 대부분의 출발점.

   라우트 하나에 상태 3개가 얹힌다:
     ?state=B (기본)        S1-9  통합형 — 보장진단 카드가 내 보험 바로 아래
     ?state=A               S1-8  0건 분리형
     ?state=B&custom=off    S1-14 맞춤 OFF 분리형 — 보장진단이 맨 아래로 내려간다
   세 상태가 섹션 조각을 공유하고, 상태별로 순서·문구만 갈아끼운다.
   분리형 진단 카드(S1-8 · S1-14)는 통합 카드와 별개 — 변경로그 §1. */

import { useState } from 'react'
import { Bell, HandCoins, List, MagnifyingGlass } from '@phosphor-icons/react'
import { AppShell, Battery, Card, FinanceTopTabs, Header, IconAction, TabBar } from '@/components'
import { useMock } from '@/app/MockProvider'
import {
  DIAGNOSIS, INSURANCE_CUSTOM_OFF as O, INSURANCE_EMPTY as E, INSURANCE_MAIN as C,
} from '@/data/copy'
import type { Policy, ServiceItem } from '@/data/types'
import { batteryLevelFor, emptyPriorityItems, topRecommendation } from '@/lib/coverage'
import { withJosa, won } from '@/lib/format'
import { ELEMENT, SCREEN, tid } from '@/lib/targetId'
import { useTrack } from '@/lib/useTrack'
import { useTrackedNavigate } from '@/lib/useTrackedNavigate'
import { BasisSheet } from './BasisSheet'
import styles from './FinanceInsurance.module.css'

/** figma-ref 에 없는 서비스. 목데이터는 건드리지 않고 화면에서만 뺀다
    (2026-08-27 확인 — "정보" 묶음은 PNG 기준 2개가 맞다) */
const HIDDEN_SERVICES = ['sv-energy']

/** 서비스 그리드 묶음 — figma-ref 순서 그대로 */
const SERVICE_GROUPS: ServiceItem['group'][] = ['조회·계약', '청구·신청', '정보']

/** S1-8 "20대가 많이 보는 보험" 2행 — figma-ref 에 그려진 두 상품.
    ⚠️ mock.ts 에 추천 플래그가 없어 화면에서 id 로 고른다. 목데이터에
    필드를 추가할지는 팀장 확인 대기 (지금 mock 을 고치지 않는 이유). */
const RECOMMENDED_IDS = ['sp-transit-mini', 'sp-sol-teeth']

export function FinanceInsurance() {
  const track = useTrack()
  const { data, state, customOn } = useMock()

  /** 상태 A(0건) = S1-8 분리형 / 상태 B(2건) = S1-9 통합형 / B + custom=off = S1-14 분리형.
      0건 + custom=off 는 Figma 에 없다 — S1-8 그대로 둔다 */
  const isEmpty = state === 'A'
  const isCustomOff = !isEmpty && !customOn

  /** S1-13 기준 시트 — 라우트가 아니라 이 화면 위 오버레이 */
  const [sheetOpen, setSheetOpen] = useState(false)

  const go = useTrackedNavigate()

  const policyCount = data.policies.length
  /** 카드가 가리키는 항목 — 우선순위가 높은데 비어 있는 것 중 첫 번째 (상태 B = 실손의료비) */
  const emptyPriority = emptyPriorityItems(data.coverage)
  const topEmpty = emptyPriority[0]

  const services = data.services.filter((s) => !HIDDEN_SERVICES.includes(s.id))

  /** figma-ref 순서대로 (id 순이 아니라 화면 순서) */
  const recommended = RECOMMENDED_IDS.map((id) => data.products.find((p) => p.id === id)).filter(
    (p): p is NonNullable<typeof p> => Boolean(p),
  )

  /** 서비스 그리드 한 칸 — 상태 A·B 가 같이 쓴다 */
  const serviceItem = (s: ServiceItem) => (
    <button
      key={s.id}
      type="button"
      className={styles.gridItem}
      onClick={() => track(tid(SCREEN.s1, ELEMENT.항목, s.id))}
    >
      <img
        className={styles.gridIcon}
        src={`/assets/3d/${s.icon3d}.png`}
        alt=""
        aria-hidden="true"
      />
      <span className={`${styles.gridLabel} t-body-sm`}>{s.label}</span>
    </button>
  )

  /* ── 기준 행 — 카드 밖, 상단 탭 바로 아래 ─────────────────── */
  const basisRow = (
    <div className={styles.basis}>
      <span className={`${styles.basisText} t-caption`}>
        {isCustomOff ? C.basisOff : `가입 보험 ${policyCount}건 · ${C.basisOn}`}
      </span>
      <button
        type="button"
        className={`${styles.basisAction} t-caption-medium`}
        onClick={() => {
          track(tid(SCREEN.s1, ELEMENT.버튼, '맞춤설정'))
          setSheetOpen(true)
        }}
      >
        {C.basisAction}
        <span className={styles.chevron} aria-hidden="true">›</span>
      </button>
    </div>
  )

  /* ── 내 보험 카드 + 2분할 액션 ────────────────────────────── */
  const policyRow = (policy: Policy) => (
    <button
      key={policy.id}
      type="button"
      className={styles.policyRow}
      onClick={() => go(tid(SCREEN.s1, ELEMENT.행, policy.id), '/finance/insurance/my')}
    >
      {policy.issuer === 'own' ? (
        <img
          className={styles.policyLogo}
          src="/assets/logo/shinhan-symbol.png"
          alt=""
          aria-hidden="true"
        />
      ) : (
        <span className={styles.policyLogo} aria-hidden="true" />
      )}
      <span className={styles.policyText}>
        <span className={`${styles.policyName} t-body-lg-medium`}>{policy.name}</span>
        <span className={`${styles.policyMeta} t-body-sm`}>
          {policy.startedAt} 가입 · 월 {won(policy.monthlyPremium)}
        </span>
      </span>
      <span className={styles.chevron} aria-hidden="true">›</span>
    </button>
  )

  const myInsurance = (
    <div className={styles.myBlock}>
      <Card radius="lg" className={styles.myCard}>
        <button
          type="button"
          className={styles.titleRow}
          onClick={() => go(tid(SCREEN.s1, ELEMENT.카드, '내보험'), '/finance/insurance/my')}
        >
          <span className={`${styles.title} t-h2`}>{C.myTitle}</span>
          <span className={styles.chevron} aria-hidden="true">›</span>
        </button>

        <div className={styles.stats}>
          <span className={styles.stat}>
            <span className={`${styles.statLabel} t-caption`}>{C.myCountLabel}</span>
            <span className={`${styles.statCount} t-h2`}>{policyCount}건</span>
          </span>
          <span className={styles.stat}>
            <span className={`${styles.statLabel} t-caption`}>{C.myPremiumLabel}</span>
            <span className={`${styles.statValue} t-h2`}>{won(data.monthlyPremiumTotal)}</span>
          </span>
        </div>

        <div className={styles.divider} />

        <div className={styles.policies}>{data.policies.map(policyRow)}</div>
      </Card>

      {/* 2분할 액션 — 내 보험 카드 아래 붙는 틴트 면 (스펙 §5 SplitButton) */}
      <div className={styles.split}>
        <button
          type="button"
          className={styles.splitItem}
          onClick={() => go(tid(SCREEN.s1, ELEMENT.버튼, '보험금청구'), '/claim/guide')}
        >
          <HandCoins size={24} weight="regular" color="var(--text-secondary)" />
          <span className="t-body-lg-bold">{C.actionClaim}</span>
        </button>
        <button
          type="button"
          className={styles.splitItem}
          onClick={() => go(tid(SCREEN.s1, ELEMENT.버튼, '보험찾기'), '/product/insurance')}
        >
          <MagnifyingGlass size={24} weight="regular" color="var(--text-secondary)" />
          <span className="t-body-lg-bold">{C.actionFind}</span>
        </button>
      </div>
    </div>
  )

  /* ── 진단 연계 추천 배너 (2026-09-02 팀장 — B안) ────────────
     Figma 679:5622 의 배너 자리. 시안은 이벤트 광고였으나 개인화 축을
     드러내는 자리로 바꿨다 — 진단 1순위 빈 항목에서 상품을 잇는다.
     ⚠️ 근거("진단 결과 · OO이 비어 있어요")를 먼저 적는 게 이 배너의 핵심이다.
        근거 없이 상품만 놓으면 우리가 AS-IS 에서 비판한 광고 배너와 같아진다.
     ⚠️ 맞춤 OFF 에서는 렌더하지 않는다 — 개인화를 끄면 추천도 사라진다. */
  const reco = topRecommendation(data.coverage)
  /* ⚠️ 특정 상품 하나를 콕 집지 않는다.
     자사 상품이 4개 카테고리(암·치아·건강·상해)뿐이라 진단 항목마다
     맞는 상품이 없고, 억지로 이으면 이미 보유한 상품을 권하게 된다
     (실제로 실손의료비 → 보유 중인 원(ONE)Core 가 나왔다).
     대신 해당 카테고리 목록으로 보낸다 — 고르는 건 사용자 몫이다. */
  const recoProducts = reco
    ? data.products.filter((p) => p.category === reco.categoryId)
    : []
  const recoCategory = reco
    ? data.categories.find((c) => c.id === reco.categoryId)
    : undefined

  const recoBanner =
    reco && recoCategory && recoProducts.length > 0 ? (
      <Card radius="lg" className={styles.recoCard}>
        <button
          type="button"
          className={styles.recoBody}
          onClick={() =>
            go(
              tid(SCREEN.s1, ELEMENT.카드, `추천-${reco.item.id}`),
              `/product/insurance/list?cat=${reco.categoryId}`,
            )
          }
        >
          <span className={`${styles.recoBasis} t-caption`}>
            {C.recoBasis.replace('{item}', withJosa(reco.item.label, '이/가'))}
          </span>
          <span className={styles.recoMain}>
            <img
              className={styles.recoIcon}
              src={`/assets/3d/${recoCategory.icon3d}.png`}
              alt=""
              aria-hidden="true"
            />
            <span className={styles.recoText}>
              <span className={`${styles.recoLead} t-body-sm`}>{C.recoLead}</span>
              <span className={`${styles.recoName} t-body-lg-medium`}>
                {C.recoCategory
                  .replace('{category}', recoCategory.label)
                  .replace('{n}', String(recoProducts.length))}
              </span>
            </span>
            <span className={styles.chevron} aria-hidden="true">›</span>
          </span>
        </button>
        <span className={`${styles.recoNote} t-caption`}>{C.recoNote}</span>
      </Card>
    ) : null

  /* ── 보장진단 통합 카드 (변경로그 §1) ──────────────────────
     카드 전체 탭 → S3-D 브리핑 / 틴트 박스 탭 → S3-E 항목 상세.
     타깃이 2개라 버튼을 겹치지 않게 나눈다 (중첩 버튼은 HTML 위반). */
  const diagnosisCard = (
    <Card radius="lg" className={styles.diagCard}>
      <button
        type="button"
        className={styles.diagMain}
        onClick={() => go(tid(SCREEN.s1, ELEMENT.카드, '보장진단'), '/diagnosis/briefing')}
      >
        <span className={styles.titleRow}>
          <span className={`${styles.title} t-h2`}>{C.diagnosisTitle}</span>
          <span className={styles.chevron} aria-hidden="true">›</span>
        </span>

        <Battery level={batteryLevelFor(data.coverageTotal)} width={72} height={96} />

        <span className={`${styles.diagHeadline} t-body-lg-bold`}>
          {C.diagnosisHeadline.replace('{n}', String(emptyPriority.length))}
        </span>
        <span className={`${styles.diagBasis} t-caption`}>
          {C.diagnosisBasis.replace('{n}', String(policyCount))}
        </span>
      </button>

      {topEmpty ? (
        <button
          type="button"
          className={styles.diagItem}
          onClick={() => go(tid(SCREEN.s1, ELEMENT.항목, topEmpty.id), `/diagnosis/${topEmpty.id}`)}
        >
          <img
            className={styles.diagItemIcon}
            src="/assets/3d/병원.png"
            alt=""
            aria-hidden="true"
          />
          <span className={styles.diagItemText}>
            <span className={`${styles.diagItemName} t-body-lg-medium`}>{topEmpty.label}</span>
            <span className={`${styles.diagItemPeer} t-body-sm`}>{C.diagnosisPeer}</span>
          </span>
          <span className={styles.chevron} aria-hidden="true">›</span>
        </button>
      ) : null}

      <p className={`${styles.diagDisclaimer} t-caption`}>{DIAGNOSIS.disclaimer}</p>
    </Card>
  )

  /* ── 서비스 그리드 3묶음 ──────────────────────────────────── */
  const serviceGroups = SERVICE_GROUPS.map((group) => {
    const items = services.filter((s) => s.group === group)
    if (!items.length) return null
    return (
      <Card radius="lg" className={styles.serviceCard} key={group}>
        <p className={`${styles.title} t-h2`}>{group}</p>
        <div className={styles.grid}>{items.map(serviceItem)}</div>
      </Card>
    )
  })

  /* ══════ 상태 A (0건) 전용 — S1-8 분리형 ══════════════════════
     변경로그 §1: 통합 카드는 상태 B 전용. 0건은 "내 보험이 채우는
     에너지"가 없어 통합형 문장이 성립하지 않아 분리형을 유지한다. */

  /* 페이지 상단 큰 제목 — 카드 밖, 기준 행 위.
     스펙 §2 display 28/700 "온보딩 헤드라인". figma-ref 글리프 실측 25px = 28 (h1 22 는 20px)
     부제도 같은 방법으로 재봤다 — 글리프 14px = body-lg 16 (body-sm 14 는 글리프 12px) */
  const emptyHeadline = (
    <div className={styles.emptyHead}>
      <p className={`${styles.emptyTitle} t-display`}>{E.headline}</p>
      <p className={`${styles.emptySub} t-body-lg`}>{E.headlineSub}</p>
    </div>
  )

  /* 분리형 진단 카드 — S1-8 · S1-14 공용. 틴트 행도 면책도 없다.
     배터리는 PNG 대로 100(초록) — 진단 결과가 아니라 초대 카드라 수치 기준이 아님 (팀장 확인, 2026-08-27).
     초대 문구는 h3 18/700 — figma-ref 글리프 16px (h2 20 → 19px · body-lg 16 → ~15px 보정).

     ⚠️ targetId 를 인자로 받는다 — S1-8 과 S1-14 가 같은 카드를 쓰지만 집계는 갈려야 한다.
        한 라우트에 상태가 3개라 targetId 가 같으면 tap 행만으로 구분이 안 된다. */
  const inviteCard = (targetId: string, title: string, line1: string, line2: string) => (
    <Card radius="lg" className={styles.diagCard}>
      <button
        type="button"
        className={styles.diagMain}
        onClick={() => go(targetId, '/diagnosis/briefing')}
      >
        <span className={styles.titleRow}>
          <span className={`${styles.title} t-h2`}>{title}</span>
          <span className={styles.chevron} aria-hidden="true">›</span>
        </span>

        <Battery level={100} width={72} height={96} />

        <span className={`${styles.diagHeadline} t-h3`}>
          {line1}
          <br />
          {line2}
        </span>
      </button>
    </Card>
  )
  /* S1-9(통합)는 `S1-카드-보장진단` 그대로 둔다 — 기본 상태라 기존 집계 기준선이다.
     0건·맞춤OFF 만 접미사로 갈라 "맞춤을 꺼도 진단에 들어가는가"를 tap 행에서 바로 센다 */
  const diagnosisCardEmpty = inviteCard(
    tid(SCREEN.s1, ELEMENT.카드, '보장진단-0건'),
    E.diagnosisTitle, E.diagnosisInviteLine1, E.diagnosisInviteLine2,
  )
  /* S1-14 — 통합 카드 대신 분리형이 맨 아래로 내려간다 */
  const diagnosisCardOff = inviteCard(
    tid(SCREEN.s1, ELEMENT.카드, '보장진단-맞춤OFF'),
    O.diagnosisTitle, O.diagnosisInviteLine1, O.diagnosisInviteLine2,
  )

  /* "20대가 많이 보는 보험" — 상품 2행 */
  const recommendCard = (
    <Card radius="lg" className={styles.serviceCard}>
      <p className={`${styles.title} t-h2`}>{E.recommendTitle}</p>

      <div className={styles.recommends}>
        {recommended.map((product) => {
          const category = data.categories.find((c) => c.id === product.category)
          return (
            <button
              key={product.id}
              type="button"
              className={styles.policyRow}
              onClick={() =>
                go(tid(SCREEN.s1, ELEMENT.항목, product.id), `/product/insurance/${product.id}`)
              }
            >
              {category ? (
                <img
                  className={styles.recommendIcon}
                  src={`/assets/3d/${category.icon3d}.png`}
                  alt=""
                  aria-hidden="true"
                />
              ) : null}
              <span className={styles.policyText}>
                {/* 목록은 shortName (#48) — figma-ref 도 괄호 없는 짧은 이름이다 */}
                <span className={`${styles.policyName} t-body-lg-medium`}>{product.shortName}</span>
                {/* figma-ref 부제는 "설명 · 월 N원" 이다 (#48).
                    description 은 원본 §3 값 그대로 두고 보험료만 여기서 붙인다 */}
                <span className={`${styles.policyMeta} t-body-sm`}>
                  {product.description} · 월 {won(product.monthlyPremium)}
                </span>
              </span>
              <span className={styles.chevron} aria-hidden="true">›</span>
            </button>
          )
        })}
      </div>

      <p className={`${styles.diagDisclaimer} t-caption`}>{E.recommendNotice}</p>
    </Card>
  )

  /* "알아두면 좋은 것" — 상태 B 의 "정보" 묶음과 같은 항목, 제목만 다르다 */
  const infoCard = (() => {
    const items = services.filter((s) => s.group === '정보')
    if (!items.length) return null
    return (
      <Card radius="lg" className={styles.serviceCard}>
        <p className={`${styles.title} t-h2`}>{E.infoTitle}</p>
        <div className={styles.grid}>{items.map(serviceItem)}</div>
      </Card>
    )
  })()

  /* "가입하면 쓸 수 있어요 (9)" — 0건에서는 서비스 그리드가 한 줄로 접힌다 */
  const servicesCollapsed = (() => {
    const count = services.filter((s) => s.group !== '정보').length
    return (
      <Card radius="lg" className={styles.serviceCard}>
        <button
          type="button"
          className={styles.collapsedRow}
          onClick={() => track(tid(SCREEN.s1, ELEMENT.모두보기, '서비스'))}
        >
          <span className={styles.collapsedText}>
            <span className={`${styles.title} t-h2`}>
              {E.servicesTitle.replace('{n}', String(count))}
            </span>
            <span className={`${styles.policyMeta} t-body-sm`}>{E.servicesSub}</span>
          </span>
          <span className={styles.chevron} aria-hidden="true">›</span>
        </button>
      </Card>
    )
  })()

  /* ── 하단 배너 2개 ────────────────────────────────────────── */
  const banners = (
    <div className={styles.banners}>
      <button
        type="button"
        className={styles.banner}
        onClick={() => go(tid(SCREEN.s1, ELEMENT.카드, '상담'), '/agent')}
      >
        <img className={styles.bannerIcon} src="/assets/3d/상담.png" alt="" aria-hidden="true" />
        <span className={`${styles.bannerText} t-body`}>{C.bannerExpert}</span>
      </button>
      <button
        type="button"
        className={styles.banner}
        onClick={() => track(tid(SCREEN.s1, ELEMENT.카드, '이벤트'))}
      >
        <img className={styles.bannerIcon} src="/assets/3d/이벤트.png" alt="" aria-hidden="true" />
        <span className={`${styles.bannerText} t-body`}>{C.bannerEvent}</span>
      </button>
    </div>
  )

  return (
    <AppShell
      name={isEmpty ? 'S1-8-보험메인-0건' : isCustomOff ? 'S1-14-보험메인-맞춤OFF' : 'S1-9-보험메인'}
      header={
        <>
          <Header
            title="금융"
            actions={
              <>
                <IconAction targetId={tid(SCREEN.s1, ELEMENT.버튼, '검색')} label="검색">
                  <MagnifyingGlass size={24} weight="regular" color="var(--text-secondary)" />
                </IconAction>
                <IconAction targetId={tid(SCREEN.s1, ELEMENT.버튼, '알림')} label="알림">
                  <Bell size={24} weight="regular" color="var(--text-secondary)" />
                </IconAction>
                <IconAction targetId={tid(SCREEN.s1, ELEMENT.버튼, '전체메뉴')} label="전체메뉴">
                  <List size={24} weight="regular" color="var(--text-secondary)" />
                </IconAction>
              </>
            }
          />
          <FinanceTopTabs active="insurance" screen={SCREEN.s1} />
        </>
      }
      footer={<TabBar activeId="finance" screen={SCREEN.s1} />}
      background="page"
      footerType="tabbar"
    >
      {/* 상태에 따라 섹션 구성이 통째로 갈린다 (변경로그 §1) */}
      <div className={styles.body}>
        {isEmpty ? (
          <>
            {emptyHeadline}
            {basisRow}
            {diagnosisCardEmpty}
            {recommendCard}
            {infoCard}
            {servicesCollapsed}
          </>
        ) : isCustomOff ? (
          <>
            {basisRow}
            {myInsurance}
            {serviceGroups}
            {diagnosisCardOff}
          </>
        ) : (
          <>
            {basisRow}
            {myInsurance}
            {recoBanner}
            {diagnosisCard}
            {serviceGroups}
          </>
        )}
        {banners}
      </div>

      {/* S1-13 기준 시트 — 이 화면 위 오버레이 (#10) */}
      <BasisSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </AppShell>
  )
}
