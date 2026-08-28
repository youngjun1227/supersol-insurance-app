/* S1-7 내 보험 — Figma 317:1084 · figma-ref `S1-7-내보험.png`.
   S1 보험 메인의 "내 보험" 카드에서 도착한다.

   ⚠️ 하단이 비어 있는 화면이다 — 탭바도 고정 CTA 도 없다(`footerType="none"`).
      "보험 홈으로"는 고정 CTA 가 아니라 본문 흐름 안 마지막 행이다
      (변경로그 "탭바 귀속" 표 · 스펙 §4 "탭바 또는 CTA 둘 중 하나"의 예외).

   ⚠️ 배경은 흰색(--bg-surface) — 메인 계열이 아니라 서브 화면이다(스펙 §1 배경 규칙).
      좌우 여백만 S1 메인과 같은 12(--gutter-main) 다: figma-ref 실측으로 카드가
      x 12..380(폭 369)에 놓여 있다. */

import { CaretRight, List, MagnifyingGlass } from '@phosphor-icons/react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppShell, Card, Header, IconAction } from '@/components'
import { useMock } from '@/app/MockProvider'
import { INSURANCE_MAIN as C, MY_INSURANCE as M } from '@/data/copy'
import type { Policy } from '@/data/types'
import { won } from '@/lib/format'
import { ELEMENT, SCREEN, tid } from '@/lib/targetId'
import { useTrack } from '@/lib/useTrack'
import styles from './MyInsurance.module.css'

export function MyInsurance() {
  const navigate = useNavigate()
  const location = useLocation()
  const track = useTrack()
  const { data } = useMock()

  /** 쿼리(?state=A|B&custom=off)를 유지한 채 이동 — 조건이 풀리면 계측이 갈린다 */
  const go = (targetId: string, pathname: string) => {
    track(targetId)
    navigate({ pathname, search: location.search })
  }

  /* ── 요약 카드 ────────────────────────────────────────────
     S1 메인의 "내 보험" 카드 위쪽과 같은 두 칸이다. 단, 건수는 여기서
     --text-primary 다 (S1-9 는 --primary 파랑) — figma-ref 두 장이 서로 다르다. */
  const summary = (
    <Card bordered className={styles.summary}>
      <span className={styles.stat}>
        <span className={`${styles.statLabel} t-caption`}>{C.myCountLabel}</span>
        <span className={`${styles.statValue} t-h2`}>{data.policies.length}건</span>
      </span>
      <span className={styles.stat}>
        <span className={`${styles.statLabel} t-caption`}>{C.myPremiumLabel}</span>
        <span className={`${styles.statValue} t-h2`}>{won(data.monthlyPremiumTotal)}</span>
      </span>
    </Card>
  )

  /* ── 계약 카드 ────────────────────────────────────────────
     키-값 3행은 각각 60 높이 행(--h-row)이다 — figma-ref 상 행 간격이 60 피치다. */
  const kv = (label: string, value: string) => (
    <div className={styles.kv} key={label}>
      <span className={`${styles.kvLabel} t-body`}>{label}</span>
      <span className={`${styles.kvValue} t-body`}>{value}</span>
    </div>
  )

  const policyCard = (policy: Policy) => (
    <Card bordered className={styles.policyCard} key={policy.id}>
      {/* 뱃지는 "가족이 들어준 보험"에만 붙는다 — figma-ref 상 본인 계약(2번째)에는 없다.
          note 를 그냥 찍지 않고 계약자≠피보험자로 거르는 이유가 이것이다 */}
      {policy.policyholder !== policy.insured && policy.note ? (
        <span className={styles.badgeRow}>
          <span className={`${styles.badge} t-caption-medium`}>{policy.note}</span>
        </span>
      ) : null}

      {/* 계약 상세 화면은 만들지 않는다 (9/11 화면 범위 밖 — 라우터에 주소가 없다).
          chevron 은 figma-ref 그대로 두고 탭은 계측만 남긴다 — 9/11 지표가 클릭 수라
          "계약 상세를 보려 했다"가 그 자체로 데이터다. 변경로그 S1-7 토큰 스냅 보고 절 */}
      <button
        type="button"
        className={styles.policyTitleRow}
        onClick={() => track(tid(SCREEN.s1My, ELEMENT.카드, policy.id))}
      >
        <span className={`${styles.policyName} t-h2`}>{policy.name}</span>
        <CaretRight size={20} weight="regular" color="var(--text-disabled)" />
      </button>

      <div className={styles.kvList}>
        {kv(M.policyholder, policy.policyholder)}
        {kv(M.insured, policy.insured)}
        {kv(M.premium, won(policy.monthlyPremium))}
      </div>

      <p className={`${styles.policyFoot} t-caption`}>
        {M.policyFooter.replace('{date}', policy.startedAt)}
      </p>
    </Card>
  )

  return (
    <AppShell
      name="S1-7-내보험"
      header={
        <Header
          title={C.myTitle}
          variant="sub"
          actions={
            <>
              <IconAction targetId={tid(SCREEN.s1My, ELEMENT.버튼, '검색')} label="검색">
                <MagnifyingGlass size={24} weight="regular" color="var(--text-secondary)" />
              </IconAction>
              <IconAction targetId={tid(SCREEN.s1My, ELEMENT.버튼, '전체메뉴')} label="전체메뉴">
                <List size={24} weight="regular" color="var(--text-secondary)" />
              </IconAction>
            </>
          }
        />
      }
      background="surface"
      footerType="none"
    >
      <div className={styles.body}>
        {summary}

        {/* 0건(?state=A)은 figma-ref 에 없다 — S1-8 에서 이 화면으로 가는 길도 없다.
            URL 을 직접 열었을 때 깨지지 않도록 요약 카드만 남긴다 */}
        {data.policies.map(policyCard)}

        <button
          type="button"
          className={styles.backRow}
          onClick={() => go(tid(SCREEN.s1My, ELEMENT.버튼, '보험홈으로'), '/finance/insurance')}
        >
          <span className={`${styles.backText} t-caption-medium`}>{M.backToHome}</span>
          <CaretRight size={20} weight="regular" color="var(--text-disabled)" />
        </button>
      </div>
    </AppShell>
  )
}
