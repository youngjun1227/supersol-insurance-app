/* S3-C 보장 진단 결과 — Figma 485:2920(접힘) / 604:8662(펼침).
   탭바 없음, 하단 고정 CTA 없음 — "관련 보험 찾아보기"는 본문 스크롤 끝 버튼이다. */

import { Fragment, useState } from 'react'
import {
  AppShell, Badge, Battery, Button, Card,
  CoverageRow, Header, IconAction, MoreToggle, TierHeader,
} from '@/components'
import { List, MagnifyingGlass } from '@phosphor-icons/react'
import { useMock } from '@/app/MockProvider'
import { DIAGNOSIS } from '@/data/copy'
import type { CoverageItem, CoverageTier } from '@/data/types'
import { batteryLevelFor, filledCount, itemsFilledBy, toTierSections } from '@/lib/coverage'
import { ELEMENT, SCREEN, tid } from '@/lib/targetId'
import { useTrack } from '@/lib/useTrack'
import { useTrackedNavigate } from '@/lib/useTrackedNavigate'
import styles from './Diagnosis.module.css'

/** 계약이 채우는 항목을 문장으로 — "암 진단·입원 에너지를 채우고 있어요" */
function fillSentence(items: CoverageItem[]): string {
  const names = items.map((i) => i.label).join('·')
  // 일부만 채우는 계약은 "조금" (후유장해 30 → "조금 채우고 있어요")
  const partial = items.every((i) => i.batteryLevel < 100)
  return `${names} 에너지를 ${partial ? '조금 ' : ''}채우고 있어요`
}

export function Diagnosis() {
  const go = useTrackedNavigate()
  const track = useTrack()
  const { data } = useMock()

  // 티어별 펼침 상태. 기본은 전부 접힘
  const [expanded, setExpanded] = useState<Set<CoverageTier>>(new Set())

  const sections = toTierSections(data.coverage)
  const filled = filledCount(data.coverage)

  const openItem = (item: CoverageItem) => {
    go(tid(SCREEN.s3c, ELEMENT.항목, item.id), `/diagnosis/${item.id}`)
  }

  const askItem = (item: CoverageItem) => {
    go(tid(SCREEN.s3c, ELEMENT.물어보기, item.id), `/agent?ctx=${item.id}`)
  }

  const toggleTier = (tier: CoverageTier) => {
    track(tid(SCREEN.s3c, ELEMENT.토글, tier))
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(tier)) next.delete(tier)
      else next.add(tier)
      return next
    })
  }

  return (
    <AppShell
      name="S3-C-진단결과"
      header={
        <Header
          title="보장 진단 결과"
          variant="sub"
          screen={SCREEN.s3c}
          actions={
            <>
              <IconAction targetId={tid(SCREEN.s3c, ELEMENT.버튼, '검색')} label="검색">
                <MagnifyingGlass size={24} weight="regular" color="var(--text-secondary)" />
              </IconAction>
              <IconAction targetId={tid(SCREEN.s3c, ELEMENT.버튼, '전체메뉴')} label="전체메뉴">
                <List size={24} weight="regular" color="var(--text-secondary)" />
              </IconAction>
            </>
          }
        />
      }
      footerType="none"
    >
      <div className={styles.content}>
        {/* 요약 히어로 + 내 보험 (합침) */}
        <Card variant="tint" className={styles.summary}>
          <Battery level={batteryLevelFor(data.coverageTotal)} size="hero" />

          <div className={styles.headline}>
            <p className="t-h3">보장 에너지 {data.coverageTotal}%</p>
            <p className={`${styles.headlineSub} t-body-sm`}>
              {data.coverage.length}개 항목 중 {filled}개를 내 보험이 채우고 있어요
            </p>
          </div>

          <p className={`${styles.caption} t-caption`}>{DIAGNOSIS.summaryCaption}</p>

          <div className={styles.divider} />

          <div className={styles.policies}>
            {data.policies.map((policy, i) => {
              const fills = itemsFilledBy(data.coverage, policy.id)
              return (
                <Fragment key={policy.id}>
                  {/* 구분선은 카드 폭 전체 — 보험 블록(272)보다 넓다 */}
                  {i > 0 ? <div className={styles.policyDivider} /> : null}
                  <div className={styles.policy}>
                    <div className={styles.policyTitle}>
                      <span className="t-body-sm-medium">{policy.name}</span>
                      {policy.policyholder === '부모' ? (
                        <Badge variant="neutral">부모님 가입</Badge>
                      ) : null}
                    </div>
                    <p className={`${styles.policyDesc} t-caption`}>{fillSentence(fills)}</p>
                  </div>
                </Fragment>
              )
            })}
          </div>
        </Card>

        <p className={`${styles.basis} t-caption`}>{DIAGNOSIS.basisRow}</p>

        {/* 티어 4개 */}
        {sections.map((section) => {
          const isOpen = expanded.has(section.id)
          const shown = isOpen ? section.items : section.visible
          const isNow = section.id === 'now'

          return (
            <div key={section.id} className={styles.tier}>
              <TierHeader
                name={section.name}
                countLabel={section.countLabel}
                emphasized={isNow}
              />

              {shown.map((item) => (
                <CoverageRow
                  key={item.id}
                  item={item}
                  variant={isNow ? 'card' : 'compact'}
                  onOpen={openItem}
                  onAsk={askItem}
                />
              ))}

              {section.toggleLabel ? (
                <MoreToggle
                  label={section.toggleLabel}
                  collapseLabel={DIAGNOSIS.collapseLabel}
                  expanded={isOpen}
                  onToggle={() => toggleTier(section.id)}
                />
              ) : null}
            </div>
          )
        })}

        <p className={`${styles.disclaimer} t-caption`}>{DIAGNOSIS.disclaimer}</p>

        {/* 고정 CTA 아님 — 본문 끝 인라인 버튼 (Figma 실측) */}
        <Button
          variant="tint"
          block
          targetId={tid(SCREEN.s3c, ELEMENT.버튼, '관련보험')}
          onClick={() => go(null, '/product/insurance')}
        >
          {DIAGNOSIS.findProducts}
        </Button>
      </div>
    </AppShell>
  )
}
