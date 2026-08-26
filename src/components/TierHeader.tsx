/* 티어 헤더 — 강조 바 4×18 + 제목 18/700 + 카운트 라벨 13.
   now 티어만 --primary (바·제목 둘 다), 나머지는 --border-default / --text-primary.
   ⚠️ 카운트 라벨은 조립하지 않는다 — 데이터에 통째로 들어 있다
   (now 만 "20대 우선 ·" 접두라 조립하면 예외가 생긴다). */

import styles from './TierHeader.module.css'

interface TierHeaderProps {
  name: string
  countLabel: string
  /** now 티어면 강조 */
  emphasized?: boolean
}

export function TierHeader({ name, countLabel, emphasized = false }: TierHeaderProps) {
  return (
    <div className={styles.row} data-emphasized={emphasized}>
      <span className={styles.bar} aria-hidden="true" />
      <h2 className={`${styles.name} t-h3`}>{name}</h2>
      <span className={`${styles.count} t-caption`}>{countLabel}</span>
    </div>
  )
}
