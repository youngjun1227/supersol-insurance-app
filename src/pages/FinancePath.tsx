/* 금융 탭 경로 화면 — 은행(기본)·카드·증권. Figma 재현본.
   ⚠️ 실기기 캡처가 아니라 우리 토큰·컴포넌트로 재현한다 (캡처+핫스팟 방식 폐기).
   상단 탭 4개는 전부 상호 이동 — "어디를 눌러도 이동" 원칙.

   Figma: 은행 614:2768 / 카드 616:8864 / 증권 616:8983 */

import type { ReactNode } from 'react'
import { Bell, List, MagnifyingGlass } from '@phosphor-icons/react'
import { AppShell, FinanceTopTabs, Header, IconAction, TabBar } from '@/components'
import { PathBanner, PathCard, PathGrid, PathIconRow, PathProvider } from '@/components/PathCard'
import { ELEMENT, SCREEN, tid } from '@/lib/targetId'
import styles from './FinancePath.module.css'

/** 금융 3화면 공통 껍데기 — 헤더 + 상단 탭 + 본문(p12) + 탭바 */
function Shell({ name, tab, children }: {
  name: string
  tab: 'bank' | 'card' | 'stock'
  children: ReactNode
}) {
  return (
    <AppShell
      name={name}
      header={
        <>
          <Header
            title="금융"
            actions={
              <>
                <IconAction targetId={tid(SCREEN.financePath, ELEMENT.버튼, '검색')} label="검색">
                  <MagnifyingGlass size={24} weight="regular" color="var(--text-secondary)" />
                </IconAction>
                <IconAction targetId={tid(SCREEN.financePath, ELEMENT.버튼, '알림')} label="알림 설정">
                  <Bell size={24} weight="regular" color="var(--text-secondary)" />
                </IconAction>
                <IconAction targetId={tid(SCREEN.financePath, ELEMENT.버튼, '전체메뉴')} label="전체메뉴">
                  <List size={24} weight="regular" color="var(--text-secondary)" />
                </IconAction>
              </>
            }
          />
          <FinanceTopTabs active={tab} />
        </>
      }
      footer={<TabBar activeId="finance" />}
      footerType="tabbar"
      background="page"
    >
      <div className={styles.body}>{children}</div>
    </AppShell>
  )
}

/* ── 은행 (기본) — 614:2768 ─────────────────────────────── */
export function FinanceBank() {
  return (
    <Shell name="금융-은행" tab="bank">
      <div className={styles.toggleRow}>
        <span className={`${styles.toggleLabel} t-body`}>금액</span>
        <span className={styles.toggleOff} aria-hidden="true" />
        <span className={styles.spacer} />
        <span className={`${styles.edit} t-body`}>편집 ›</span>
      </div>

      <PathCard>
        <div className={styles.cardHead}>
          <h2 className={`${styles.headTitle} t-h2`}>계좌</h2>
          <span className={`${styles.headLink} t-caption`}>전체계좌 ›</span>
        </div>
        <div className={styles.accountRow}>
          <img className={styles.accountLogo} src="/assets/logo/shinhan-symbol.png" alt="" aria-hidden="true" />
          <div className={styles.accountText}>
            <span className={`${styles.accountName} t-body`}>입출금 신한 주거래 우대통장(저축예금)</span>
            <span className={`${styles.accountNo} t-caption`}>신한 110-•••-••••••</span>
          </div>
        </div>
        <p className={styles.hidden}>금액 숨김</p>
        <div className={`${styles.transferBtn} t-body`}>이체</div>
        <div className={styles.quickRow}>
          {[
            { name: '김신한', amount: '204,900' },
            { name: '이신한', amount: '46,739' },
            { name: '박신한', amount: '495,147' },
          ].map((q) => (
            <div key={q.name} className={styles.quickCard}>
              <span className={styles.quickAvatar} aria-hidden="true" />
              <span className={styles.quickText}>
                <span className={`${styles.quickName} t-label`}>{q.name}</span>
                <span className={`${styles.quickAmount} t-label`}>{q.amount}</span>
              </span>
            </div>
          ))}
        </div>
      </PathCard>

      <PathBanner
        lines={['신한은행에서 개인형', 'IRP 통합관리하기']}
        link="퇴직연금 가져오기"
        icon="자동이체"
      />

      <PathCard title="자산관리">
        <PathIconRow icon="배당금" caption="금융자산, 부동산, 자동차까지" title="내 모든 자산 통합 관리" />
      </PathCard>

      <PathCard title="SOL메이트">
        <PathIconRow icon="영양분석" caption="나의 포트폴리오를 한 눈에" title="나의 포트" />
      </PathCard>

      <PathCard title="은행 추천 서비스">
        <PathGrid
          items={[
            { icon: '혜택', label: '땡겨요' },
            { icon: '이벤트', label: 'SOL야구' },
            { icon: '계약대출', label: '대출비교/갈아타기' },
            { icon: '건강사전', label: '슈퍼SOL 사용팁' },
            { icon: '여행레저', label: 'SOL트래블' },
            { icon: '그밖의보장', label: '신한인증서' },
            { icon: '상해', label: '50+ 걸어요' },
            { icon: '배당금', label: 'SOL모임통장' },
            { icon: '포인트', label: '환전' },
            { icon: '자동이체', label: '모바일OTP' },
            { icon: '축하', label: '내 쿠폰함' },
            { icon: '보험료납입', label: '급여클럽+' },
          ]}
        />
      </PathCard>
    </Shell>
  )
}

/* ── 증권 — 616:8983 ────────────────────────────────────── */
export function FinanceStock() {
  return (
    <Shell name="금융-증권" tab="stock">
      <PathCard>
        <div className={styles.center}>
          <img className={styles.hero} src="/assets/3d/신규추천.png" alt="" aria-hidden="true" />
        </div>
        <p className={`${styles.heroTitle} t-h3`}>
          <span>증권계좌 만들고</span>
          <span>공모주 신청 준비할까요?</span>
        </p>
        <div className={`${styles.primaryCta} t-body-lg-bold`}>증권계좌 만들기</div>
      </PathCard>

      <PathBanner
        lines={['연금계좌에서도 ETF', '투자할 수 있어요!']}
        link="연금ETF 투자하기"
        icon="변액"
      />

      <PathCard title="추천 서비스">
        <PathGrid
          items={[
            { icon: '거래내역', label: '주문내역' },
            { icon: '포인트', label: '투자쿠폰함' },
            { icon: '계약조회', label: '주식검색' },
            { icon: '혜택', label: '주식순위' },
            { icon: '자동이체', label: '환전신청' },
            { icon: '분할보험금', label: '공모주일정' },
          ]}
        />
      </PathCard>

      <PathProvider name="신한투자증권" note="신한투자증권에서 제공하는 화면입니다." />
    </Shell>
  )
}

/* ── 카드 — 616:8864 ────────────────────────────────────── */
export function FinanceCard() {
  return (
    <Shell name="금융-카드" tab="card">
      <div className={styles.toggleRow}>
        <span className={`${styles.toggleLabel} t-body`}>금액</span>
        <span className={styles.toggleOff} aria-hidden="true" />
      </div>

      <PathCard>
        <span className={`${styles.headLink} t-caption`}>8월 결제금액</span>
        <p className={styles.hidden}>금액보기</p>
        <div className={styles.divider} />
        <PathGrid
          items={[
            { icon: '보험료납입', label: '체크 소액신용서비스' },
            { icon: '계약조회', label: '체크카드 대표계좌' },
          ]}
        />
      </PathCard>

      <PathCard>
        <div className={styles.cardHead}>
          <h2 className={`${styles.headTitle} t-h2`}>내 카드</h2>
          <span className={`${styles.headLink} t-caption`}>카드 관리 ›</span>
        </div>
        <div className={styles.myCardRow}>
          <img className={styles.cardArt} src="/assets/cards/kpass-check.png" alt="" aria-hidden="true" />
          <div className={styles.accountText}>
            <span className={`${styles.accountName} t-body-lg-bold`}>(경기패스) K-패스 체크</span>
            <span className={`${styles.accountNo} t-caption`}>26.08.01~26.08.26</span>
          </div>
        </div>
        <p className={`${styles.hiddenSm} t-body`}>금액 숨김</p>
      </PathCard>

      <PathCard>
        <div className={styles.emptyBox}>
          <div className={styles.emptyThumb} aria-hidden="true" />
          <p className={`${styles.emptyText} t-body-sm`}>대출을 이용한 내역이 없어요</p>
          <p className={`${styles.bannerLink} t-body-sm-medium`}>금융서비스 알아보기 ›</p>
        </div>
      </PathCard>

      <PathCard>
        <PathGrid
          items={[
            { icon: '혜택', label: '내 카드실적·혜택' },
            { icon: '공지', label: '카드 분실신고' },
            { icon: '거래내역', label: '교통카드 이용내역' },
            { icon: '이벤트', label: '받은 혜택' },
            { icon: '보험료납입', label: '카드 재발급' },
          ]}
        />
      </PathCard>

      <PathProvider name="신한카드" note="신한카드에서 제공하는 화면입니다." />
    </Shell>
  )
}

export { Shell as FinancePathShell }
