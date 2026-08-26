/* 경로 화면 공통 조각 — 은행·카드·증권·발견이 같은 골격을 쓴다.
   본문 p12 · 카드 369 r24 p20/22 · 카드 간격 12 (변경로그 경로 화면 규격). */

import type { ReactNode } from 'react'
import styles from './PathCard.module.css'

/** 흰 카드 369 r24 */
export function PathCard({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className={styles.card}>
      {title ? <h2 className={`${styles.title} t-h2`}>{title}</h2> : null}
      {children}
    </section>
  )
}

/** 카드 밖 배너 행 — 텍스트 + 3D 일러스트 72 */
export function PathBanner({
  lines, link, icon,
}: { lines: string[]; link: string; icon: string }) {
  return (
    <div className={styles.banner}>
      <div className={styles.bannerText}>
        <p className={`${styles.bannerTitle} t-h3`}>
          {lines.map((l, i) => <span key={i}>{l}</span>)}
        </p>
        <p className={`${styles.bannerLink} t-caption-medium`}>{link} ›</p>
      </div>
      <img className={styles.bannerIcon} src={`/assets/3d/${icon}.png`} alt="" aria-hidden="true" />
    </div>
  )
}

/** 2열 그리드 서비스 목록 — 3D 26 + 라벨 14/500 */
export function PathGrid({ items }: { items: { icon: string; label: string }[] }) {
  return (
    <div className={styles.grid}>
      {items.map((it) => (
        <div key={it.label} className={styles.gridItem}>
          <img className={styles.gridIcon} src={`/assets/3d/${it.icon}.png`} alt="" aria-hidden="true" />
          <span className={`${styles.gridLabel} t-body-sm-medium`}>{it.label}</span>
        </div>
      ))}
    </div>
  )
}

/** 아이콘 박스 48 r14 + 2줄 텍스트 행 */
export function PathIconRow({
  icon, caption, title,
}: { icon: string; caption: string; title: string }) {
  return (
    <div className={styles.iconRow}>
      <div className={styles.iconBox}>
        <img className={styles.iconBoxImg} src={`/assets/3d/${icon}.png`} alt="" aria-hidden="true" />
      </div>
      <div className={styles.iconRowText}>
        <span className={`${styles.iconRowCaption} t-caption`}>{caption}</span>
        <span className={`${styles.iconRowTitle} t-body-lg-bold`}>{title}</span>
      </div>
    </div>
  )
}

/** 화면 하단 제공 고지 (증권·카드) */
export function PathProvider({ name, note }: { name: string; note: string }) {
  return (
    <div className={styles.provider}>
      <div className={styles.providerRow}>
        <img className={styles.providerLogo} src="/assets/logo/shinhan-symbol.png" alt="" aria-hidden="true" />
        <span className={`${styles.providerName} t-body-lg-bold`}>{name}</span>
      </div>
      <p className={`${styles.providerNote} t-caption`}>{note}</p>
    </div>
  )
}
