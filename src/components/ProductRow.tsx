/* S2 계열 공통 — 섹션 헤더와 상품 행.
   아이콘 문법: 섹션 헤더 = 3D 24 / 상품 행 = Phosphor 라인 24
   (변경로그: S2 목록 아이템만 라인 유지) */

import {
  AirplaneTilt, Bandaids, Brain, ChartLineUp, Heartbeat,
  PiggyBank, ShieldCheck, Tooth, Virus, type Icon,
} from '@phosphor-icons/react'
import type { Category, CategoryId, Product } from '@/data/types'
import styles from './ProductRow.module.css'

/* ⚠️ 이름으로 동적 조회(import * as)를 하면 아이콘 전체가 번들에 들어간다
   (317KB → 5.2MB 를 실제로 겪음). 쓰는 것만 명시적으로 import 한다. */
const CATEGORY_ICON: Record<CategoryId, Icon> = {
  cancer: Virus,
  health: Heartbeat,
  dementia: Brain,
  dental: Tooth,
  injury: Bandaids,
  travel: AirplaneTilt,
  etc: ShieldCheck,
  pension: PiggyBank,
  variable: ChartLineUp,
}

/** 섹션 헤더 — 3D 아이콘(옵션) + 카테고리명 + 카운트 */
/* 카테고리 섹션 헤더 — 3D 아이콘 + 이름 + 개수.
   ⚠️ 아이콘은 옵션이 아니다. withIcon prop 이었을 때 S2-A 가 그걸 빠뜨려
      같은 카테고리 줄이 두 화면에서 다르게 보였다 (figma-ref 는 둘 다 아이콘이 있다). */
export function ProductSectionHeader({
  category, count,
}: { category: Category; count: number }) {
  return (
    <div className={styles.head}>
      <img className={styles.headIcon} src={`/assets/3d/${category.icon3d}.png`} alt="" aria-hidden="true" />
      <h2 className={`${styles.headName} t-h2`}>{category.label}</h2>
      <span className={`${styles.headCount} t-h2`}>{count}</span>
    </div>
  )
}

/** 상품 행 — 라인 아이콘 + 회사명·상품명 + 설명 */
export function ProductRow({
  product, categoryId, onTap,
}: { product: Product; categoryId: CategoryId; onTap: () => void }) {
  /* 매핑에 없는 카테고리가 오면 <undefined /> 로 렌더 크래시가 난다 —
     ProductDetail 은 이미 폴백을 쓰고 있어 여기만 무방비였다 (#109) */
  const Icon = CATEGORY_ICON[categoryId] ?? ShieldCheck
  return (
    <button type="button" className={styles.item} onClick={onTap}>
      <span className={styles.itemIcon}>
        <Icon size={24} weight="regular" color="var(--text-secondary)" />
      </span>
      <span className={styles.itemText}>
        {/* 타사에 로고를 달지 않는다 — 회사명은 텍스트로만 (계열사 우대 리스크) */}
        <span className={`${styles.itemName} t-body-lg-bold`}>
          {/* 목록은 shortName — 전체명은 잘려서 뒤가 안 보인다.
              법정 전체명은 상세(S6-A)에서 보여준다 (#48) */}
          {product.company} {product.shortName}
        </span>
        <span className={`${styles.itemDesc} t-body-sm`}>{product.description}</span>
      </span>
    </button>
  )
}
