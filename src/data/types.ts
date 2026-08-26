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
  name: string
  description: string
}

/** 보장 진단 항목 (S3). 수치는 전부 가상값 */
export interface CoverageItem {
  id: string
  label: string
  /** 4그룹: 치료비 / 큰 병 / 노후·간병 / 만일 */
  group: CoverageGroup
  /** 내 보장 — 없으면 null */
  mine: string | null
  /** 내 보장이 어느 계약에서 왔는지 */
  fromPolicyId?: string
  /** 또래 평균(가상값) */
  peer: string
  /** 배터리 0~100 */
  battery: number
  /** S3-D 레이더 축 6개에 들어가는 주요 항목인지 */
  isRadarAxis: boolean
  /** 레이더용 또래 값 (주요 6개만) */
  peerRadar?: number
}

export type CoverageGroup = '치료비' | '큰 병' | '노후·간병' | '만일'

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
