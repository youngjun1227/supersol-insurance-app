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
  /** 크기를 직접 줄 때 (S1 카드 72×96 등). 높이는 3:4 로 자동 계산된다 */
  width?: number
  /** 비율을 벗어나야 할 때만. 보통은 width 만 준다 */
  height?: number
}

export function Battery({ level, size = 'row', width, height }: BatteryProps) {
  const preset = SIZES[size]
  const w = width ?? preset.w
  /* height 를 안 주면 3:4 로 맞춘다 (#109) — 예전엔 preset 높이로 폴백해서
     width 만 넘기면 비율이 깨졌다 (주석은 "3:4를 지킬 것"인데 코드가 강제하지 않았다) */
  const h = height ?? (width !== undefined ? Math.round((width * 4) / 3) : preset.h)

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
