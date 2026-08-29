/* S3-D 보장 진단 브리핑 — Figma 540:174.
   S1 진단 카드 탭 / S3-C "진단 다시하기" 로 들어온다.

   하단은 탭바도 고정 CTA도 없다 (Figma 실측) — "자세한 진단 보기"는 본문 흐름 끝 버튼. */

import { ChatCircleDots, List, MagnifyingGlass } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import { AppShell, Button, Header, IconAction, RadarChart } from '@/components'
import type { RadarAxis } from '@/components/RadarChart'
import { useMock } from '@/app/MockProvider'
import { batteryAsset, batteryLevelFor } from '@/lib/coverage'
import { ELEMENT, SCREEN, tid } from '@/lib/targetId'
import styles from './Briefing.module.css'

/* 레이더 축 순서 — Figma 시계방향 배치.
   짧은 라벨을 쓴다(실손의료비 → 실손) — 축 옆 공간이 좁다 */
const AXIS_ORDER: { id: string; short: string }[] = [
  { id: 'c-actual', short: '실손' },
  { id: 'c-hospital', short: '입원' },
  { id: 'c-surgery', short: '수술' },
  { id: 'c-cancer', short: '암' },
  { id: 'c-disabled', short: '후유' },
  { id: 'c-death', short: '사망' },
]

export function Briefing() {
  const navigate = useNavigate()
  const { data } = useMock()

  const axes: RadarAxis[] = AXIS_ORDER.map(({ id, short }) => {
    const item = data.coverage.find((c) => c.id === id)
    return { label: short, mine: item?.batteryLevel ?? 0, peer: item?.peerRadar ?? 0 }
  })

  /** 아직 비어 있는 항목 — 내 보장이 없는 것 */
  const empty = data.coverage.filter((c) => c.mine === null)
  /** 앞 3개만 문장에 넣는다 (Figma: "실손의료비, 수술, 치과치료 등") */
  const emptyNames = empty.slice(0, 3).map((c) => c.label).join(', ')

  return (
    <AppShell
      name="S3-D-브리핑"
      footerType="none"
      header={
        <Header
          title="보장 진단"
          variant="sub"
          screen={SCREEN.s3d}
          actions={
            <>
              <IconAction targetId={tid(SCREEN.s3d, ELEMENT.버튼, '검색')} label="검색">
                <MagnifyingGlass size={24} weight="regular" color="var(--text-secondary)" />
              </IconAction>
              <IconAction targetId={tid(SCREEN.s3d, ELEMENT.버튼, '전체메뉴')} label="전체메뉴">
                <List size={24} weight="regular" color="var(--text-secondary)" />
              </IconAction>
            </>
          }
        />
      }
    >
      <div className={styles.body}>
        {/* 히어로 — 에너지 % + 배터리 */}
        <section className={styles.hero}>
          <h1 className={`${styles.headline} t-h2`}>
            <span>{data.user.name}님의</span>
            <span>
              보장 에너지는 <em className={styles.percent}>{data.coverageTotal}%</em> 입니다.
            </span>
          </h1>

          <div className={styles.heroRow}>
            <div className={styles.heroText}>
              <p className={`${styles.basis} t-caption`}>2026.08.25 기준</p>
              <p className={`${styles.emptyText} t-body`}>
                {emptyNames} 등
                <br />
                {empty.length}개 항목이 아직 비어 있어요.
              </p>
            </div>
            <img
              className={styles.battery}
              src={batteryAsset(batteryLevelFor(data.coverageTotal))}
              alt=""
              aria-hidden="true"
            />
          </div>
        </section>

        {/* 레이더 차트 */}
        <section className={styles.chart}>
          <RadarChart axes={axes} />

          <div className={styles.legend}>
            <span className={`${styles.legendItem} t-caption`}>
              <span className={styles.swatchMine} aria-hidden="true" />내 보장
            </span>
            <span className={`${styles.legendItem} t-caption`}>
              <span className={styles.swatchPeer} aria-hidden="true" />20대 평균 보장
            </span>
          </div>

          <p className={`${styles.summary} t-body-lg-bold`}>
            내 보장 에너지 {data.coverageTotal}% · 20대 보장 평균 {data.peerCoverageTotal}%
          </p>
          <p className={`${styles.note} t-caption`}>
            주요 {axes.length}개 항목 기준 · 전체 {data.coverage.length}개는 자세한 진단에서
          </p>
        </section>

        {/* 에이전트 존 */}
        <section className={styles.agent}>
          <div className={styles.avatar}>
            <img
              className={styles.avatarImg}
              src="/assets/logo/shinhan-symbol.png"
              alt=""
              aria-hidden="true"
            />
          </div>
          <div className={styles.agentBody}>
            <p className={`${styles.agentName} t-caption-medium`}>
              보장 상담 에이전트
              <img className={styles.sparkle} src="/assets/3d/반짝임.png" alt="" aria-hidden="true" />
            </p>
            <div className={styles.bubble}>
              <p className={`${styles.bubbleText} t-body-sm`}>
                자세한 진단을 보다가 궁금한 항목이 있으면
              </p>
              <p className={`${styles.bubbleText} t-body-sm`}>
                <ChatCircleDots size={20} weight="regular" color="var(--text-secondary)" />
                버튼을 눌러 저에게 물어보세요
              </p>
            </div>
          </div>
        </section>

        {/* 본문 끝 버튼 — 고정 CTA 아님 */}
        <Button
          block
          targetId={tid(SCREEN.s3d, ELEMENT.버튼, '자세한진단')}
          onClick={() => navigate('/diagnosis')}
        >
          자세한 진단 보기
        </Button>
      </div>
    </AppShell>
  )
}
