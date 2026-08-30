/* S3-E 항목 상세 — Figma 540:340 · figma-ref `S3-E-항목상세-실손.png`.
   S3-C(`/diagnosis`)의 항목 행에서 도착한다. `/diagnosis/:itemId`

   ⚠️ figma-ref 는 실손(가입 보험 없음) 한 장뿐이지만 항목은 10개다.
      보장이 있는 항목(입원·사망 등)은 같은 뼈대에서 빈 박스 자리가 실제 내용으로 찬다 —
      PNG 에 없는 화면을 지어내지 않으려고 목데이터에 있는 값(mineLabel·fromPolicyId)만 쓴다.

   ⚠️ 헤더는 "항목 상세"가 아니라 **"보장 상세"** 다 (PNG). 라우터 Placeholder 이름과 다르다. */

import { useEffect, useState } from 'react'
import { CaretRight } from '@phosphor-icons/react'
import { Navigate, useLocation, useParams } from 'react-router-dom'
import { AppShell, Battery, BottomCTA, Button, Card, Header, HeaderActions } from '@/components'
import { useMock } from '@/app/MockProvider'
import { ITEM_DETAIL as C } from '@/data/copy'
import type { CoverageItem } from '@/data/types'
import { ELEMENT, SCREEN, tid } from '@/lib/targetId'
import { useTrack } from '@/lib/useTrack'
import { useTrackedNavigate } from '@/lib/useTrackedNavigate'
import styles from './ItemDetail.module.css'

export function ItemDetail() {
  const go = useTrackedNavigate()
  const location = useLocation()
  const track = useTrack()
  const { itemId } = useParams()
  const { data } = useMock()

  /* 두 섹션의 펼침 상태. figma-ref 는 둘 다 펼쳐진 모습이라 기본 펼침이다.
     ⚠️ 그 상태에서도 우상단 라벨이 "모두 펼치기"인 것이 PNG 그대로다 — 뒤집지 않는다.
        누르면 전부 접었다 폈다 한다(계측은 방향을 남긴다). */
  const [open, setOpen] = useState<Set<string>>(new Set(['byAge', 'byPolicy']))

  /* 항목이 바뀌면 펼침 상태를 되돌린다 (#109) — /diagnosis/:itemId 는 같은
     컴포넌트를 재사용하므로, 항목 A 에서 접고 B 로 가면 B 도 접힌 채 뜬다.
     figma-ref 기준 기본은 펼침이다. */
  useEffect(() => {
    setOpen(new Set(['byAge', 'byPolicy']))
  }, [itemId])

  const item: CoverageItem | undefined = data.coverage.find((c) => c.id === itemId)

  /* 없는 itemId 로 직접 들어오면 진단 결과로 돌려보낸다 —
     빈 화면을 지어내는 것보다 원래 있던 화면으로 보내는 편이 덜 혼란스럽다.
     렌더 중 navigate() 는 경고가 나서 <Navigate> 로 선언해 돌린다 */
  if (!item) return <Navigate to={{ pathname: '/diagnosis', search: location.search }} replace />

  /** 이 항목을 채우는 계약 — 없으면 빈 상태 (PNG 가 이 경우다) */
  const fromPolicy = item.fromPolicyId
    ? data.policies.find((p) => p.id === item.fromPolicyId)
    : undefined

  const toggle = (key: string) => {
    track(tid(SCREEN.s3e, ELEMENT.토글, key))
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const allOpen = open.size === 2
  const toggleAll = () => {
    track(tid(SCREEN.s3e, ELEMENT.토글, allOpen ? '모두접기' : '모두펼치기'))
    setOpen(allOpen ? new Set() : new Set(['byAge', 'byPolicy']))
  }

  /** 아코디언 한 칸 — 제목 행 + 펼쳤을 때 내용 */
  const section = (key: string, title: string, link: React.ReactNode, body: React.ReactNode) => (
    <div className={styles.section}>
      <div className={styles.sectionHead}>
        {/* figma-ref 에는 제목 옆 캐럿이 없다 — 접기 조작은 위 "모두 펼치기"가 담당한다 */}
        <button
          type="button"
          className={`${styles.sectionTitle} t-body-sm-medium`}
          aria-expanded={open.has(key)}
          onClick={() => toggle(key)}
        >
          {title}
        </button>
        {link}
      </div>
      {open.has(key) ? body : null}
    </div>
  )

  return (
    <AppShell
      name="S3-E-항목상세"
      background="surface"
      header={
        <Header
          title={C.title}
          variant="sub"
          screen={SCREEN.s3e}
          actions={<HeaderActions screen={SCREEN.s3e} />}
        />
      }
      footerType="cta"
      footer={
        <BottomCTA>
          <div className={styles.dock}>
            <div className={styles.dockButtons}>
              <Button
                variant="tint"
                targetId={tid(SCREEN.s3e, ELEMENT.버튼, '내보험목록')}
                onClick={() => go(null, '/finance/insurance/my')}
              >
                {C.myPolicies}
              </Button>
              <Button
                targetId={tid(SCREEN.s3e, ELEMENT.버튼, '관련보험')}
                onClick={() => go(null, '/product/insurance')}
              >
                {C.findProducts}
              </Button>
            </div>
            <p className={`${styles.disclaimer} t-caption`}>{C.disclaimer}</p>
          </div>
        </BottomCTA>
      }
    >
      <div className={styles.body}>
        {/* 에이전트 진입 배너 → S3-F */}
        <button
          type="button"
          className={styles.agentBanner}
          onClick={() => go(tid(SCREEN.s3e, ELEMENT.버튼, '에이전트'), `/agent?ctx=${item.id}`)}
        >
          <span className={styles.agentIcon} aria-hidden="true">💬</span>
          <span className={`${styles.agentText} t-body-sm-medium`}>{C.agentBanner}</span>
          <CaretRight size={20} weight="regular" color="var(--text-disabled)" />
        </button>

        {/* 기준일 행 — 왼쪽은 S3-C 와 같은 문구, 오른쪽은 아코디언 일괄 토글 */}
        <div className={styles.basisRow}>
          <span className={`${styles.basisText} t-caption`}>{C.basisRow}</span>
          <button type="button" className={`${styles.basisAction} t-caption`} onClick={toggleAll}>
            {C.expandAll}
          </button>
        </div>

        <Card bordered className={styles.card}>
          {/* 제목 + 배터리 */}
          <div className={styles.head}>
            <div className={styles.headText}>
              <p className={`${styles.itemName} t-h2`}>{item.label}</p>
              <p className={`${styles.itemSub} t-body-lg-medium`}>
                {fromPolicy ? item.mineLabel : C.noCoverage}
              </p>
            </div>
            <Battery level={item.batteryLevel} width={40} height={54} />
          </div>

          {/* 또래 비교 — 목데이터 desc 를 그대로 쓴다 (변경로그 §2: 규칙으로 만들지 않는다) */}
          {item.desc ? (
            <p className={`${styles.peerBox} t-body-sm`}>{item.desc}</p>
          ) : (
            <p className={`${styles.peerBox} t-body-sm`}>{item.peerLabel}</p>
          )}

          {section(
            'byAge',
            C.byAgeTitle,
            <button
              type="button"
              className={`${styles.sectionLink} t-body-sm-medium`}
              onClick={() => go(tid(SCREEN.s3e, ELEMENT.버튼, '연령별관련보험'), '/product/insurance')}
            >
              {C.byAgeLink}
            </button>,
            fromPolicy ? (
              /* 보장이 있는 항목 — 또래 값은 실제 내용이라 빈 상태 회색으로 쓰지 않는다 */
              <p className={`${styles.peerRow} t-body-sm`}>{item.peerLabel}</p>
            ) : (
              <p className={`${styles.emptyBox} t-body-sm`}>{C.byAgeEmpty}</p>
            ),
          )}

          <div className={styles.divider} />

          {section(
            'byPolicy',
            C.byPolicyTitle,
            null,
            fromPolicy ? (
              <button
                type="button"
                className={styles.policyRow}
                onClick={() => go(tid(SCREEN.s3e, ELEMENT.카드, fromPolicy.id), '/finance/insurance/my')}
              >
                <span className={styles.policyText}>
                  <span className={`${styles.policyName} t-body-sm-medium`}>{fromPolicy.name}</span>
                  <span className={`${styles.policyValue} t-caption`}>{item.mineLabel}</span>
                </span>
                <CaretRight size={20} weight="regular" color="var(--text-disabled)" />
              </button>
            ) : (
              <p className={`${styles.emptyBox} t-body-sm`}>{C.byPolicyEmpty}</p>
            ),
          )}
        </Card>
      </div>
    </AppShell>
  )
}
