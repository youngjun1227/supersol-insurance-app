/* 목데이터 타입. 값 원본은 디자인 레포 `02_to-be/mock-data.md`. */

/** 계정 상태 — B(보유 2건 20대)가 기본, A(0건)는 두 번째 상태. `?state=A|B` */
export type AccountState = 'A' | 'B'

/** 판매사 구분 — 자사만 로고를 단다. 타사에 로고 금지 (계열사 우대 리스크) */
export type Issuer = 'own' | 'other'

export interface User {
  name: string
  phone: string
  age: number
  /** 비교 기준 문장에 쓰는 표현. 성별 표기 안 함 */
  peerLabel: string
}

/** 보유 계약 */
export interface Policy {
  id: string
  /** 상품명 */
  name: string
  /** 판매사 표기 (자사는 실명, 타사는 가명) */
  company: string
  issuer: Issuer
  /** 계약자 — 부모가 들어준 보험 구분에 쓴다 */
  policyholder: string
  insured: string
  /** 월 보험료(원) */
  monthlyPremium: number
  /** 가입일 YYYY.MM */
  startedAt: string
  note?: string
}

/** 상품 카테고리 (S2 통일 9종) */
export type CategoryId =
  | 'cancer' | 'health' | 'dementia' | 'dental' | 'injury'
  | 'travel' | 'etc' | 'pension' | 'variable'

export interface Category {
  id: CategoryId
  label: string
  /** public/assets/3d/ 파일명 (확장자 제외) */
  icon3d: string
}

export interface Product {
  id: string
  category: CategoryId
  /** 판매사 — 자사는 신한라이프, 타사는 가명(A생명 등) */
  company: string
  issuer: Issuer
  /** 법정 상품명(전체). 상세 화면(S6-A)은 이걸 쓴다 — 임의로 줄이지 않는다 */
  name: string
  /** 목록·카드용 짧은 이름. figma-ref 가 목록에서 괄호 이하를 뗀 형태로 그려져 있다.
      ⚠️ 코드 규칙(괄호 제거)으로 만들지 않는다 — `(무)…`·`원(ONE)Core` 처럼
         괄호가 이름의 일부인 상품이 있고, 쏠한치아 일반/자녀는 구분이 사라진다. */
  shortName: string
  description: string
}

/** 보장 진단 항목 (S3). 수치는 전부 가상값 */
export interface CoverageItem {
  id: string
  label: string
  /** 4그룹: 치료비 / 큰 병 / 노후·간병 / 만일. `tier`와는 별개 축이다 */
  group: CoverageGroup

  /* ── 원본 값 — 레이더·집계용. 화면에 그대로 찍지 않는다 ──────── */
  /** 내 보장 — 없으면 null */
  mine: string | null
  /** 내 보장이 어느 계약에서 왔는지 */
  fromPolicyId?: string
  /** 또래 평균(가상값) */
  peer: string

  /* ── 표시용 라벨 — 화면은 이것만 쓴다 (변경로그 §2 확정본) ────
     mine/peer 에서 규칙으로 만들지 않는다: 실손만 "가입률" 어순이라
     분기가 생기고 그 분기가 곧 표시 버그가 된다. */
  /** 예: "내 보장 없음" · "내 보장 1만원" */
  mineLabel: string
  /** 예: "또래 평균 500만원" · "또래 가입률 78%" */
  peerLabel: string
  /** 아래 줄 13 caption. 있는 항목만 (now 2개 + 사망) */
  desc?: string
  /** now 티어 전용 뱃지 — "먼저 볼 항목" */
  badge?: string

  /* ── S3-C 티어 ─────────────────────────────────────────────── */
  /** 우선순위 티어. 기준은 "20대 중요도 × 충족 여부"이지 보장 유무가 아니다 */
  tier: CoverageTier
  /** 티어 안 표시 순서(1부터). 접기는 이 순서 앞 3개를 보여준다 */
  order: number

  /** 배터리 단계 — 없음 0 / 일부 30 / 또래 도달 100 (60은 현재 미사용) */
  batteryLevel: BatteryLevel

  /** S3-D 레이더 축 6개에 들어가는 주요 항목인지 */
  isRadarAxis: boolean
  /** 레이더용 또래 값 (주요 6개만) */
  peerRadar?: number
}

export type CoverageGroup = '치료비' | '큰 병' | '노후·간병' | '만일'

/** S3-C 우선순위 티어 (변경로그 §2 / 디자인 레포 mock-data.md §2-3) */
export type CoverageTier = 'now' | 'later' | 'covered' | 'notyet'

/** 3D 배터리 에셋이 있는 단계. public/assets/3d/배터리_{n}.png */
export type BatteryLevel = 0 | 30 | 60 | 100

/** 티어 메타. 카운트 라벨은 티어마다 문자열이 달라(now만 "20대 우선 ·" 접두)
    조립하지 않고 통째로 둔다 */
export interface TierMeta {
  id: CoverageTier
  /** 티어 이름 — "지금 채우면 좋아요" 등 */
  name: string
  /** 카운트 라벨 — "20대 우선 · 2개 항목" · "6개 항목" */
  countLabel: string
}

/** 카드 결제 내역 (S4) */
export interface Payment {
  id: string
  /** MM.DD */
  date: string
  /** 가맹점 — 병원·약국은 가명 */
  merchant: string
  amount: number
  /** 보험금 청구 대상인지 (병원 아니면 목록에 안 나온다) */
  claimable: boolean
}

/** S1 서비스 그리드 항목 */
export interface ServiceItem {
  id: string
  label: string
  /** 묶음 */
  group: '조회·계약' | '청구·신청' | '정보'
  /** public/assets/3d/ 파일명 (확장자 제외) */
  icon3d: string
}

/** 계정 상태별로 달라지는 값 묶음 */
export interface AccountData {
  state: AccountState
  policies: Policy[]
  /** 이번 달 보험료 합계(원) */
  monthlyPremiumTotal: number
  coverage: CoverageItem[]
  /** 보장 총점 % */
  coverageTotal: number
}

/** 화면이 보는 목데이터 한 벌 */
export interface MockData extends AccountData {
  user: User
  /** 또래 평균 총점 % */
  peerCoverageTotal: number
  categories: Category[]
  products: Product[]
  payments: Payment[]
  services: ServiceItem[]
  /** 메인홈 배경 값 (보험 탭 밖이지만 흐름에서 숫자가 튀면 안 됨) */
  home: { accountBalance: number; cardMonthlyUsage: number }
  /** 공통 문구 */
  copy: Copy
}

/** 화면 공통 문구. 지어내지 말고 여기에 추가한다 */
export interface Copy {
  /** 비교 기준 */
  peerBasis: string
  /** 한계 고지 */
  limitation: string
  /** 하단 안내 */
  noPressure: string
  /** 0건일 때 대체 문구 */
  emptyCoverage: string
}

/* ── S3-F 에이전트 대화 (프리셋 고정) ──────────────────────────
   ⚠️ 실제 LLM 을 붙이지 않는다 — 9/11 테스트의 통제 변수다(CLAUDE.md 데이터 규칙).
      문답은 Figma 에 이미 그려져 있고 그대로 옮긴다. */

/** 답변 한 덩이 — 문단 배열. 화면이 문단 사이 간격을 준다 */
export interface AgentAnswer {
  /** 회색 시스템 칩 — "실손의료비 항목에서 자동으로 물어봤어요" */
  systemNote: string
  /** 사용자 말풍선 (오른쪽) */
  question: string
  /** 에이전트 답변 문단들 (왼쪽, 로고 아래) */
  paragraphs: string[]
  /** 답변 아래 추천 칩. 누르면 그 프리셋으로 갈아탄다 */
  suggestion?: { label: string; to: string }
}

/** S6-A 상품 상세 가상값 (mock-data.md §3-1) — ⚠️ 전부 가상값, 실제 조건 아님.
    제조사·판매 채널은 `Product.company`·`issuer` 에서 파생하므로 여기 없다. */
export interface ProductDetail {
  /** 스탯 1 — 납입방법 (월납·일시납·연납) */
  pay: string
  /** 스탯 2 — 가입나이 */
  age: string
  /** 스탯 3 — 보험기간 */
  term: string
  /** 키-값 1 — 보험종류 */
  kind: string
}
