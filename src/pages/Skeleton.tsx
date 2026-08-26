/* 비테스트 탭 자리표시 (혜택·주식 + 금융/상품 안의 비보험 상단 탭).
   ⚠️ 이동은 되고 내용만 비어 있어야 한다 — no-op으로 두면 "고장났나"로 읽혀
   참가자 행동이 달라지고, 실제 앱(어디든 이동됨)과 기준이 어긋난다.
   ⚠️ "테스트 범위 밖" 같은 문구 금지 — 몰입이 깨진다. 그냥 비어 보이면 된다. */

import { AppShell, Header, TabBar } from '@/components'
import styles from './Skeleton.module.css'

interface SkeletonProps {
  /** 계측 화면 이름 */
  name: string
  title: string
  /** 어느 탭을 켜둘지 */
  tabId: string
  /** 상단 탭 행 (금융·상품 안에서 쓴다) */
  topTabs?: React.ReactNode
}

export function Skeleton({ name, title, tabId, topTabs }: SkeletonProps) {
  return (
    <AppShell
      name={name}
      header={
        <>
          <Header title={title} />
          {topTabs}
        </>
      }
      footer={<TabBar activeId={tabId} />}
      footerType="tabbar"
    >
      <div className={styles.body} aria-hidden="true">
        <div className={styles.banner} />
        <div className={styles.card}>
          <div className={`${styles.line} ${styles.w60}`} />
          <div className={`${styles.line} ${styles.w40}`} />
        </div>
        <div className={styles.card}>
          <div className={`${styles.line} ${styles.w50}`} />
          <div className={`${styles.line} ${styles.w70}`} />
        </div>
        <div className={styles.grid}>
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className={styles.gridItem}>
              <div className={styles.gridIcon} />
              <div className={styles.gridLabel} />
            </div>
          ))}
        </div>
        <div className={styles.card}>
          <div className={`${styles.line} ${styles.w60}`} />
          <div className={`${styles.line} ${styles.w30}`} />
        </div>
      </div>
    </AppShell>
  )
}
