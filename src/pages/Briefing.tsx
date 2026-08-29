/* S3-D 보장 진단 브리핑 — Figma 540:174.
   S1 진단 카드 탭 / S3-C "진단 다시하기" 로 들어온다.

   하단 "자세한 진단 보기"는 **고정 CTA** 다 (팀장 결정 2026-08-29, #77).
   ⚠️ Figma 실측(934 프레임, 본문 끝 인라인)과 다르다 — 원안대로면 버튼이
      첫 화면에서 6px 만 보여 참가자가 다음 단계를 못 찾는다. 내용은 스크롤,
      버튼은 항상 보인다. S3-E·S6-A 와 같은 구조라 앱 안에서도 일관된다.
      Figma 는 팀장이 맞춘다 (변경로그가 우선). */

import { List, MagnifyingGlass } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import { AgentBubble, AppShell, BottomCTA, Button, Header, IconAction, RadarChart } from '@/components'
import type { RadarAxis } from '@/components/RadarChart'
import { useMock } from '@/app/MockProvider'
import { BRIEFING as C } from '@/data/copy'
import { useTrack } from '@/lib/useTrack'
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
  const track = useTrack()
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
      footerType="cta"
      footer={
        <BottomCTA>
          <Button
            block
            size="lg"
            targetId={tid(SCREEN.s3d, ELEMENT.버튼, '자세한진단')}
            onClick={() => navigate('/diagnosis')}
          >
            자세한 진단 보기
          </Button>
        </BottomCTA>
      }
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
        {/* 에이전트 진입 버블 — 헤더 아래 우측 플로팅 (S6-A 와 같은 패턴).
            ⚠️ figma 원안의 하단 에이전트 존을 대체한다 (#77 후속, 팀장 결정) —
               원안 자리는 고정 독 뒤에 완전히 숨어 안 보였다 (실측 top 740 > 독 684).
               버블은 항상 보이고 그 자체가 에이전트 진입점이다. */}
        <AgentBubble
          label={C.bubble}
          labelSecond={C.bubbleSecond}
          onTap={() => {
            track(tid(SCREEN.s3d, ELEMENT.버튼, '에이전트'))
            navigate('/agent')
          }}
        />

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


      </div>
    </AppShell>
  )
}
