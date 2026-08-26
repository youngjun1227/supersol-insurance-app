/* 상품 탭 경로 화면 — 발견(기본). Figma 재현본 615:2835.
   상단 탭 9개 가로 스크롤, '보험'은 맨 끝이라 스크롤해야 보인다.

   ⚠️ 검색 영역은 화면 전폭 393 · 라운드 0 틴트 밴드다.
      다른 카드처럼 369 로 만들지 말 것 (한 번 틀렸다가 되돌린 지점). */

import { MagnifyingGlass, Bell, List, ShoppingCart } from '@phosphor-icons/react'
import { AppShell, Header, IconAction, ProductTopTabs, TabBar } from '@/components'
import { PathCard } from '@/components/PathCard'
import { ELEMENT, SCREEN, tid } from '@/lib/targetId'
import styles from './ProductPath.module.css'

const RECOMMENDED = [
  { icon: '계약조회', name: '신한 SOL LINK', desc: '증권 거래 수수료가 낮은 은행·증권 통합계좌' },
  { icon: '배당금', name: '신한 적금 9단', desc: '첫 적금, 결제계좌 우대하는 목돈마련의 한 수!' },
  { icon: '포인트', name: '올리브영 SOL통장', desc: '올리브영 리워드 최대 11만원 혜택' },
]

export function ProductDiscover() {
  return (
    <AppShell
      name="상품-발견"
      header={
        <>
          <Header
            title="모든상품"
            actions={
              <>
                <IconAction targetId={tid(SCREEN.productPath, ELEMENT.버튼, '장바구니')} label="장바구니">
                  <ShoppingCart size={24} weight="regular" color="var(--text-secondary)" />
                </IconAction>
                <IconAction targetId={tid(SCREEN.productPath, ELEMENT.버튼, '알림')} label="알림 설정">
                  <Bell size={24} weight="regular" color="var(--text-secondary)" />
                </IconAction>
                <IconAction targetId={tid(SCREEN.productPath, ELEMENT.버튼, '전체메뉴')} label="전체메뉴">
                  <List size={24} weight="regular" color="var(--text-secondary)" />
                </IconAction>
              </>
            }
          />
          <ProductTopTabs active="discover" />
        </>
      }
      footer={<TabBar activeId="product" />}
      footerType="tabbar"
      background="page"
    >
      {/* 전폭 밴드 — 카드가 아니다 (393 · r0) */}
      <div className={styles.searchBand}>
        <p className={`${styles.searchTitle} t-h3`}>어떤 상품을 찾으세요?</p>
        <div className={styles.searchInput}>
          <span className={`${styles.searchPlaceholder} t-body`}>
            가족이 함께 가입하면 좋은 상품 알려줘
          </span>
          <MagnifyingGlass size={24} weight="regular" color="var(--text-secondary)" />
        </div>
      </div>

      <div className={styles.body}>
        <PathCard title="추천상품">
          <div className={styles.list}>
            {RECOMMENDED.map((p) => (
              <div key={p.name} className={styles.row}>
                <div className={styles.thumb}>
                  <img className={styles.thumbImg} src={`/assets/3d/${p.icon}.png`} alt="" aria-hidden="true" />
                </div>
                <div className={styles.rowText}>
                  <span className={`${styles.rowName} t-body-lg-bold`}>{p.name}</span>
                  <span className={`${styles.rowDesc} t-body-sm`}>{p.desc}</span>
                </div>
                <span className={styles.chevron} aria-hidden="true">›</span>
              </div>
            ))}
          </div>
        </PathCard>

        <PathCard title="요즘 내 관심사는?">
          <div className={styles.chips}>
            {['여행', '건강', '재테크', '자동차'].map((c, i) => (
              <span key={c} className={`${styles.chip} t-body-sm-medium`} data-selected={i === 0}>
                {c}
              </span>
            ))}
          </div>
        </PathCard>
      </div>
    </AppShell>
  )
}
