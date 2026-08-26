/* 보장 레이더 차트 — S3-D. 6축 육각형에 내 보장과 또래 평균을 겹쳐 그린다.
   ⚠️ Figma 는 SVG 이미지로 내보내지만 우리는 데이터로 그린다 —
   목데이터가 바뀌면 차트도 따라가야 하고, 상태 A(전부 0)도 같은 코드로 처리된다.

   축 순서는 Figma 의 시계방향 배치를 따른다: 실손(위) → 입원 → 수술 → 암(아래) → 후유 → 사망 */

import styles from './RadarChart.module.css'

export interface RadarAxis {
  /** 축 라벨 — 짧게 (실손·입원·수술·암·후유·사망) */
  label: string
  /** 내 보장 0~100 */
  mine: number
  /** 또래 평균 0~100 */
  peer: number
}

interface RadarChartProps {
  axes: RadarAxis[]
  /** 그리드 링 개수 */
  rings?: number
}

const SIZE = 220
const CENTER = SIZE / 2
const RADIUS = 78

/** 0..1 비율을 좌표로. 12시 방향에서 시작해 시계방향 */
function point(index: number, total: number, ratio: number): [number, number] {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2
  const r = RADIUS * ratio
  return [CENTER + r * Math.cos(angle), CENTER + r * Math.sin(angle)]
}

function polygon(values: number[]): string {
  return values
    .map((v, i) => point(i, values.length, Math.max(0, Math.min(100, v)) / 100).join(','))
    .join(' ')
}

export function RadarChart({ axes, rings = 3 }: RadarChartProps) {
  const n = axes.length

  return (
    <svg
      className={styles.svg}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role="img"
      aria-label={
        `보장 레이더 차트. ` +
        axes.map((a) => `${a.label} 내 ${a.mine}, 또래 ${a.peer}`).join('. ')
      }
    >
      {/* 그리드 링 */}
      {Array.from({ length: rings }, (_, r) => (
        <polygon
          key={r}
          className={styles.grid}
          points={polygon(Array(n).fill(((r + 1) / rings) * 100))}
        />
      ))}

      {/* 스포크 */}
      {axes.map((a, i) => {
        const [x, y] = point(i, n, 1)
        return <line key={a.label} className={styles.spoke} x1={CENTER} y1={CENTER} x2={x} y2={y} />
      })}

      {/* 또래 평균 — 점선 */}
      <polygon className={styles.peer} points={polygon(axes.map((a) => a.peer))} />

      {/* 내 보장 — 채움 */}
      <polygon className={styles.mine} points={polygon(axes.map((a) => a.mine))} />

      {/* 축 라벨 */}
      {axes.map((a, i) => {
        const [x, y] = point(i, n, 1.24)
        return (
          <text
            key={a.label}
            className={styles.label}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {a.label}
          </text>
        )
      })}
    </svg>
  )
}
