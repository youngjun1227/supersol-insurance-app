/* 공통 레이아웃 셸 — 스펙 §4.
   모든 화면 = [헤더] + [스크롤 본문] + [탭바 또는 하단 CTA] 3단.
   탭바와 하단 CTA는 화면당 둘 중 하나만. */

import type { ReactNode } from 'react'
import { ScreenProvider } from '@/app/AnalyticsProvider'
import { useScreenView } from '@/lib/useTrack'
import styles from './AppShell.module.css'

export type ShellBackground = 'page' | 'surface'

export type FooterType = 'tabbar' | 'cta' | 'input' | 'none'

interface AppShellProps {
  /** 계측에 남는 화면 이름. 화면마다 유일하게 */
  name: string
  /** 상단 고정 영역 — <Header> (+ <TopTabs>) */
  header?: ReactNode
  /** 하단 고정 영역 — <TabBar> · <BottomCTA> · 입력 바 */
  footer?: ReactNode
  /** 본문 배경 (§1 배경 규칙): 메인 계열 'page' / 그 밖 'surface' */
  background?: ShellBackground
  /**
   * 본문 하단 여백. 변경로그 "서브 화면 하단 처리" 실측 표 기준:
   *  'tabbar' 90  — 홈·금융·상품·스켈레톤만
   *  'cta'    126 — S3-E·S4-D·S5-A·청구완료·S6-A
   *  'input'  — S3-F 대화 입력 바 (CTA 아님)
   *  'none'   — S1-7·S3-D·S3-C. 탭바도 CTA도 없다 (§4 "둘 중 하나"의 예외)
   */
  footerType?: FooterType
  children: ReactNode
}

function ShellBody({ header, footer, background, footerType, children }: Omit<AppShellProps, 'name'>) {
  useScreenView()

  return (
    <div className={styles.shell} data-bg={background}>
      {header ? <div className={styles.header}>{header}</div> : null}

      <main className={styles.body} data-footer={footerType}>
        {children}
      </main>

      {footer}
    </div>
  )
}

export function AppShell({
  background = 'surface',
  footerType = 'none',
  ...rest
}: AppShellProps) {
  return (
    <ScreenProvider name={rest.name}>
      <ShellBody background={background} footerType={footerType} {...rest} />
    </ScreenProvider>
  )
}
