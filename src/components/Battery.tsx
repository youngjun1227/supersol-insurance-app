/* 보장 에너지 배터리 — Fluent Emoji 3D `Battery` 4단계(0/30/60/100).
   원본 비율 96×128 = 3:4. 크기를 바꿔도 이 비율을 유지한다.
   ⚠️ 빈 상태도 회색 — 경고색(빨강) 안 씀 (Figma 컴포넌트 설명). */

import type { BatteryLevel } from '@/data/types'
import { batteryAsset } from '@/lib/coverage'
import styles from './Battery.module.css'

/** Figma 실측 크기 3종 */
export type BatterySize = 'hero' | 'row' | 'compact'

const SIZES: Record<BatterySize, { w: number; h: number }> = {
  hero: { w: 64, h: 85 },     // S3-C 요약 카드
  row: { w: 44, h: 59 },      // now 티어 항목 행
  compact: { w: 30, h: 40 },  // 그 밖 티어 항목 행
}

interface BatteryProps {
  level: BatteryLevel
  size?: BatterySize
  /** 크기를 직접 줄 때 (S1 카드 72×96 등). 3:4를 지킬 것 */
  width?: number
  height?: number
}

export function Battery({ level, size = 'row', width, height }: BatteryProps) {
  const preset = SIZES[size]
  const w = width ?? preset.w
  const h = height ?? preset.h

  return (
    <img
      className={styles.battery}
      src={batteryAsset(level)}
      alt=""
      width={w}
      height={h}
      style={{ width: w, height: h }}
      aria-hidden="true"
    />
  )
}
