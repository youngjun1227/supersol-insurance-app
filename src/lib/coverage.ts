/* 보장 진단 파생 로직.
   화면이 직접 계산하지 않고 여기를 거친다 — 티어 순서·접기 규칙이
   여러 화면(S1·S3-C·S3-D)에 걸쳐 있어 한 곳에 모아야 어긋나지 않는다. */

import { TIER_VISIBLE_MAX, TIERS } from '@/data'
import type { BatteryLevel, CoverageItem, CoverageTier, TierMeta } from '@/data/types'

/** 배터리 3D 에셋 경로. 수치에 맞는 단계를 쓴다 (변경로그 §6) */
export function batteryAsset(level: BatteryLevel): string {
  return `/assets/3d/배터리_${level}.png`
}

/** 총점(%)에 맞는 배터리 단계.
    항목별 값은 데이터에 있고, 이건 합계용(S1 카드·S3-C 히어로). */
export function batteryLevelFor(percent: number): BatteryLevel {
  if (percent >= 100) return 100
  if (percent >= 60) return 60
  if (percent > 0) return 30
  return 0
}

export interface TierSection extends TierMeta {
  /** 티어에 속한 항목 — order 순 */
  items: CoverageItem[]
  /** 기본으로 보이는 앞 3개 */
  visible: CoverageItem[]
  /** 접히는 나머지 */
  hidden: CoverageItem[]
  /** 토글 문구 — 접힘이 없으면 null */
  toggleLabel: string | null
}

/** 항목을 티어 단위로 묶는다. 티어 순서·항목 순서 모두 고정 */
export function toTierSections(coverage: CoverageItem[]): TierSection[] {
  return TIERS.map((meta) => {
    const items = coverage
      .filter((c) => c.tier === meta.id)
      .sort((a, b) => a.order - b.order)

    const visible = items.slice(0, TIER_VISIBLE_MAX)
    const hidden = items.slice(TIER_VISIBLE_MAX)

    return {
      ...meta,
      items,
      visible,
      hidden,
      toggleLabel: hidden.length > 0 ? `항목 ${hidden.length}개 더 보기` : null,
    }
  })
}

/** S1 카드 헤드라인용 — now 티어에서 비어 있는(보장 없는) 항목 */
export function emptyPriorityItems(coverage: CoverageItem[]): CoverageItem[] {
  return coverage
    .filter((c) => c.tier === 'now' && c.mine === null)
    .sort((a, b) => a.order - b.order)
}

/** 내 보험이 채우고 있는 항목 수 — "10개 항목 중 3개" */
export function filledCount(coverage: CoverageItem[]): number {
  return coverage.filter((c) => c.mine !== null).length
}

/** 특정 계약이 채우는 항목들 — S3-C 요약 카드의 내 보험 행 */
export function itemsFilledBy(coverage: CoverageItem[], policyId: string): CoverageItem[] {
  return coverage.filter((c) => c.fromPolicyId === policyId).sort((a, b) => a.order - b.order)
}

export function tierOf(id: CoverageTier): TierMeta | undefined {
  return TIERS.find((t) => t.id === id)
}
