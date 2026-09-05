/* ─────────────────────────────────────────────────────────────
   목데이터 — 원본: 디자인 레포 `02_to-be/mock-data.md`.
   ⚠️ 카테고리는 그 문서 §3 표가 아니라 `notes/S2_카테고리체계.md` §S2-5 가 기준이다.
      §3 의 카테고리 열은 AS-IS 채널 분류라서 다르다 (섞어 쓰다 한 번 틀렸음).
   ⚠️ 여기 없는 값이 필요하면 지어내지 말고 원본 문서에 먼저 추가한다.
   ⚠️ 수치는 전부 가상값이며 실제 통계가 아니다.
   ⚠️ 실명·실번호·타사 실제 상품명 금지 — 타사는 가명(A생명…), 병원도 가명.
   화면은 이 파일을 직접 import 하지 말고 `useMock()`(src/app/MockProvider)을 쓴다.
   ───────────────────────────────────────────────────────────── */

import type {
  AccountData, AccountState, Category, Copy, CoverageItem, Payment, Policy, Product, ProductDetail, ServiceItem, TierMeta, User,
} from './types'

/* ── 1. 사용자 ─────────────────────────────────────────────── */
export const USER: User = {
  name: '김신한',
  phone: '010-0000-0000',
  age: 26,
  peerLabel: '20대 중반',
}

/* ── 2-1. 메인홈 배경 값 (최종 UI 기준) ────────────────────── */
export const HOME = {
  accountBalance: 9_250_000,
  cardMonthlyUsage: 122_400,
}

/* ── 2. 보유 계약 — 상태 B ─────────────────────────────────── */
const POLICIES_B: Policy[] = [
  {
    id: 'p-one-core',
    name: '신한통합건강보험 원(ONE)Core',
    company: '신한라이프',
    issuer: 'own',
    policyholder: '부모',
    insured: '김신한',
    monthlyPremium: 32_000,
    startedAt: '2018.04',
    note: '가족이 들어준 보험',
  },
  {
    id: 'p-transit-mini',
    name: '신한SOL대중교통보험 mini',
    company: '신한라이프',
    issuer: 'own',
    policyholder: '김신한',
    insured: '김신한',
    monthlyPremium: 3_000,
    startedAt: '2026.03',
    note: '본인 가입',
  },
]

/* ── 2-2. 보장 진단 10항목 (전부 가상값) ───────────────────── */
// "N% 부족" 화법 금지 — 내 보장/또래를 나란히 보여주기만 한다.
// mineLabel/peerLabel/desc/badge/tier/order/batteryLevel 은 변경로그 §2 확정본 그대로.
// ⚠️ 라벨을 mine/peer 에서 규칙으로 만들지 않는다 (실손만 어순이 달라 분기가 생긴다).
const COVERAGE_B: CoverageItem[] = [
  {
    id: 'c-actual', label: '실손의료비', group: '치료비',
    mine: null, peer: '78% 가입',
    mineLabel: '내 보장 없음', peerLabel: '또래 가입률 78%',
    desc: '병원비 부담을 가장 자주 덜어 주는 보장인데, 아직 가입된 보험이 없어요.',
    badge: '먼저 볼 항목',
    tier: 'now', order: 1, batteryLevel: 0,
    isRadarAxis: true, peerRadar: 78,
  },
  {
    id: 'c-hospital', label: '입원', group: '치료비',
    mine: '입원일당 1만원', fromPolicyId: 'p-one-core', peer: '3만원',
    mineLabel: '내 보장 1만원', peerLabel: '또래 평균 3만원',
    desc: '입원하면 하루 단위로 받는 보장이에요. 일부만 준비돼 있어요.',
    badge: '먼저 볼 항목',
    tier: 'now', order: 2, batteryLevel: 30,
    isRadarAxis: true, peerRadar: 60,
  },
  {
    id: 'c-surgery', label: '수술', group: '치료비',
    mine: null, peer: '500만',
    mineLabel: '내 보장 없음', peerLabel: '또래 평균 500만원',
    tier: 'later', order: 1, batteryLevel: 0,
    isRadarAxis: true, peerRadar: 55,
  },
  {
    id: 'c-dental', label: '치과치료', group: '치료비',
    mine: null, peer: '100만',
    mineLabel: '내 보장 없음', peerLabel: '또래 평균 100만원',
    tier: 'later', order: 2, batteryLevel: 0,
    isRadarAxis: false,
  },
  {
    id: 'c-heart', label: '심혈관질환진단', group: '큰 병',
    mine: null, peer: '1,000만',
    mineLabel: '내 보장 없음', peerLabel: '또래 평균 1,000만원',
    tier: 'later', order: 3, batteryLevel: 0,
    isRadarAxis: false,
  },
  {
    id: 'c-brain', label: '뇌혈관질환진단', group: '큰 병',
    mine: null, peer: '1,000만',
    mineLabel: '내 보장 없음', peerLabel: '또래 평균 1,000만원',
    tier: 'later', order: 4, batteryLevel: 0,
    isRadarAxis: false,
  },
  {
    id: 'c-dementia', label: '치매진단', group: '노후·간병',
    mine: null, peer: '500만',
    mineLabel: '내 보장 없음', peerLabel: '또래 평균 500만원',
    tier: 'later', order: 5, batteryLevel: 0,
    isRadarAxis: false,
  },
  {
    // 보유 중(1,000만)이지만 또래(3,000만) 미달이라 covered 자격이 없고,
    // 20대 중요도가 낮아 now 도 아니다 — later 가 의도다 (변경로그 §2)
    id: 'c-disabled', label: '후유장해', group: '노후·간병',
    mine: '1,000만', fromPolicyId: 'p-transit-mini', peer: '3,000만',
    mineLabel: '내 보장 1,000만원', peerLabel: '또래 평균 3,000만원',
    tier: 'later', order: 6, batteryLevel: 30,
    isRadarAxis: true, peerRadar: 50,
  },
  {
    // covered 는 "또래 평균 도달"만 들어간다
    id: 'c-cancer', label: '암 진단', group: '큰 병',
    mine: '3,000만', fromPolicyId: 'p-one-core', peer: '3,000만',
    mineLabel: '내 보장 3,000만원', peerLabel: '또래 평균 3,000만원',
    tier: 'covered', order: 1, batteryLevel: 100,
    isRadarAxis: true, peerRadar: 65,
  },
  {
    id: 'c-death', label: '사망', group: '만일',
    mine: null, peer: '5,000만',
    mineLabel: '내 보장 없음', peerLabel: '또래 평균 5,000만원',
    desc: '보통 부양가족이 생길 때 필요해져요.',
    tier: 'notyet', order: 1, batteryLevel: 0,
    isRadarAxis: true, peerRadar: 45,
  },
]

/** 티어 메타 — 표시 순서대로. 카운트 라벨은 조립하지 않고 통째로 둔다 */
export const TIERS: TierMeta[] = [
  { id: 'now',     name: '지금 채우면 좋아요',       countLabel: '20대 우선 · 2개 항목' },
  { id: 'later',   name: '여유 있을 때 봐도 돼요',    countLabel: '6개 항목' },
  { id: 'covered', name: '이미 준비돼 있어요',       countLabel: '1개 항목' },
  { id: 'notyet',  name: '지금은 서두르지 않아도 돼요', countLabel: '1개 항목' },
]

/** 티어당 표시할 최대 항목 수. 초과분은 접힘 (기본 접힘) */
export const TIER_VISIBLE_MAX = 3

/** 상태 A는 같은 10항목에 내 보장만 전부 비어 있다 */
const COVERAGE_A: CoverageItem[] = COVERAGE_B.map((c) => ({
  ...c,
  mine: null,
  fromPolicyId: undefined,
  mineLabel: '내 보장 없음',
  batteryLevel: 0,
}))

/* ── 계정 상태 2벌 ─────────────────────────────────────────── */
export const ACCOUNTS: Record<AccountState, AccountData> = {
  // 상태 A — 보유 0건 20대 (두 번째 상태)
  A: {
    state: 'A',
    policies: [],
    monthlyPremiumTotal: 0,
    coverage: COVERAGE_A,
    coverageTotal: 0,
  },
  // 상태 B — 보유 2건 20대 (부모 가입분 포함). 기본값
  B: {
    state: 'B',
    policies: POLICIES_B,
    monthlyPremiumTotal: 35_000, // 과제 "이번 달 보험료 확인"의 정답값
    coverage: COVERAGE_B,
    coverageTotal: 30, // 10개 중 3개에 보험 있음
  },
}

/** 또래 평균 총점(가상값) */
export const PEER_COVERAGE_TOTAL = 60

/* ── 3. 카테고리 9종 (S2 통일 체계) ────────────────────────── */
export const CATEGORIES: Category[] = [
  { id: 'cancer',   label: '암',        icon3d: '암' },
  { id: 'health',   label: '건강',      icon3d: '건강' },
  { id: 'dementia', label: '치매·간병', icon3d: '치매간병' },
  { id: 'dental',   label: '치아',      icon3d: '치아' },
  { id: 'injury',   label: '상해',      icon3d: '상해' },
  { id: 'travel',   label: '여행·레저', icon3d: '여행레저' },
  { id: 'etc',      label: '그 밖의 보장', icon3d: '그밖의보장' },
  { id: 'pension',  label: '연금·저축', icon3d: '연금저축' },
  { id: 'variable', label: '변액',      icon3d: '변액' },
]

/* ── 3. 상품 목록 ──────────────────────────────────────────── */
// 자사(신한라이프)는 실명, 타사는 가명. 타사에 로고 금지.
export const PRODUCTS: Product[] = [
  // 신한라이프 채널 (자사)
  { id: 'sp-cancer-care',   category: 'cancer',   company: '신한라이프', issuer: 'own', name: '신한케어받는암보험(무배당, 갱신형)', shortName: '신한케어받는암보험', description: '치료비 걱정은 덜고, 암 걱정은 멈추세요', monthlyPremium: 19_000 },
  { id: 'sp-one-more-care', category: 'dementia', company: '신한라이프', issuer: 'own', name: '신한치매간병보험 ONE더케어Core(무배당, 해약환급금 미지급형)', shortName: '신한치매간병보험 ONE더케어Core', description: '장기요양과 치매를 준비하는 보험', monthlyPremium: 28_000 },
  { id: 'sp-one-core',      category: 'health',   company: '신한라이프', issuer: 'own', name: '신한통합건강보험 원(ONE)Core(무배당, 갱신형)', shortName: '신한통합건강보험 원(ONE)Core', description: '라이프스타일에 맞게 설계가능', monthlyPremium: 32_000 },
  { id: 'sp-teeth-plus',    category: 'dental',   company: '신한라이프', issuer: 'own', name: '신한참좋은치아보험 PlusⅢ(무배당, 갱신형)', shortName: '신한참좋은치아보험 PlusⅢ', description: '치아 치료비 든든하게', monthlyPremium: 24_000 },
  { id: 'sp-sol-teeth',     category: 'dental',   company: '신한라이프', issuer: 'own', name: '신한SOL쏠한치아보험(무배당)(일반보장형)', shortName: '신한SOL쏠한치아보험 일반보장형', description: '빈번한 치과치료, 핵심 보장으로 든든', monthlyPremium: 15_000 },
  { id: 'sp-sol-teeth-kid', category: 'dental',   company: '신한라이프', issuer: 'own', name: '신한SOL쏠한치아보험(무배당)(자녀보장형)', shortName: '신한SOL쏠한치아보험 자녀보장형', description: '우리아이에게 맞춘 치과치료 중심', monthlyPremium: 12_000 },
  { id: 'sp-transit-mini',  category: 'injury',   company: '신한라이프', issuer: 'own', name: '신한SOL대중교통보험 mini(무배당)', shortName: '신한SOL대중교통보험 mini', description: '매일타는 대중교통, 365일 안심', monthlyPremium: 3_000 },
  { id: 'sp-one-safe',      category: 'injury',   company: '신한라이프', issuer: 'own', name: '신한생활보장보험 ONE더세이프(무배당, 해약환급금 미지급형)', shortName: '신한생활보장보험 ONE더세이프', description: '일상 생활 중 상해사고를 대비', monthlyPremium: 21_000 },
  { id: 'sp-sol-pension',   category: 'pension',  company: '신한라이프', issuer: 'own', name: '신한슈퍼SOL연금보험(무배당)', shortName: '신한슈퍼SOL연금보험', description: '연금 강화형으로 은퇴 후 더 든든하게', monthlyPremium: 50_000 },

  // 신한은행 채널 (타사 — 전부 가명)
  { id: 'op-a-care',      category: 'cancer',   company: 'A생명',    issuer: 'other', name: '(무)안심케어보험(e)(해약환급금 일부지급형)', shortName: '안심케어보험(e)', description: '암 검사·진단·치료 3단계 보장', monthlyPremium: 17_000 },
  { id: 'op-b-checkup',   category: 'health',   company: 'B생명',    issuer: 'other', name: '(무)건강검진 걱정없는 미니보험(모바일)', shortName: '건강검진 걱정없는 미니보험', description: '한 번 납입으로 면책기간 없이 바로 보장', monthlyPremium: 5_000 },
  { id: 'op-c-better',    category: 'health',   company: 'C생명',    issuer: 'other', name: '(무)더나은안심보험', shortName: '더나은안심보험', description: '10년간 적용이율 최대 연 3.0%', monthlyPremium: 26_000 },
  { id: 'op-b-diabetes',  category: 'health',   company: 'B생명',    issuer: 'other', name: '(무)당뇨플러스건강보험(모바일)', shortName: '당뇨플러스건강보험', description: '당뇨병 진단자금부터 치료비까지', monthlyPremium: 22_000 },
  { id: 'op-d-100friend', category: 'health',   company: 'D생명',    issuer: 'other', name: '(무)백년친구 e-안심보험', shortName: '백년친구 e-안심보험', description: '만기까지 보험료 인상없이 보장', monthlyPremium: 34_000 },
  { id: 'op-e-cancer',    category: 'cancer',   company: 'E생명',    issuer: 'other', name: '(무)언제나안심암보험(모바일)', shortName: '언제나안심암보험', description: '갱신없이 동일 보험료, 최대 110세까지', monthlyPremium: 20_000 },
  // 간병 성격이라 치매·간병 (S2_카테고리체계 §S2-5: "간편간병인·장기요양안심은 치매·간병으로")
  { id: 'op-f-carer',     category: 'dementia', company: 'F손해보험', issuer: 'other', name: '간편간병인보험(무배당) 모바일', shortName: '간편간병인보험', description: '입원 첫날부터 최대 365일 한도', monthlyPremium: 18_000 },
  { id: 'op-f-health',    category: 'health',   company: 'F손해보험', issuer: 'other', name: '간편건강보험(무배당) 모바일', shortName: '간편건강보험', description: '암·뇌·심장 주요치료비 10년 최대 2억', monthlyPremium: 23_000 },
  { id: 'op-a-injury',    category: 'injury',   company: 'A생명',    issuer: 'other', name: '(무)일상안심상해보험', shortName: '일상안심상해보험', description: '일상 속 상해사고 대비', monthlyPremium: 9_000 },
  { id: 'op-d-teeth',     category: 'dental',   company: 'D생명',    issuer: 'other', name: '(무)치아사랑보험', shortName: '치아사랑보험', description: '충치·보철 치료비 보장', monthlyPremium: 16_000 },
  { id: 'op-c-ltc',       category: 'dementia', company: 'C생명',    issuer: 'other', name: '(무)장기요양안심보험', shortName: '장기요양안심보험', description: '장기요양등급 판정 시 보장', monthlyPremium: 29_000 },
  { id: 'op-f-travel',    category: 'travel',   company: 'F손해보험', issuer: 'other', name: '해외여행보험(무배당)', shortName: '해외여행보험', description: '여행 중 사고·질병 보장', monthlyPremium: 8_000 },
  { id: 'op-a-loan',      category: 'etc',      company: 'A생명',    issuer: 'other', name: '(무)대출안심보험', shortName: '대출안심보험', description: '사고 시 남은 대출 상환 지원', monthlyPremium: 11_000 },
  { id: 'op-f-golf',      category: 'travel',   company: 'F손해보험', issuer: 'other', name: '골프보험(무배당)', shortName: '골프보험', description: '홀인원·배상책임 보장', monthlyPremium: 13_000 },
  { id: 'op-b-variable',  category: 'variable', company: 'B생명',    issuer: 'other', name: '(무)변액연금보험', shortName: '변액연금보험', description: '1일 1회 적합성 진단 후 확인 가능', monthlyPremium: 100_000 },
  { id: 'op-d-happy',     category: 'pension',  company: 'D생명',    issuer: 'other', name: '(무)행복연금보험(거치형, 무배당)', shortName: '행복연금보험', description: '5년 유지 시 최저적립액 보장', monthlyPremium: 80_000 },
  { id: 'op-c-taxsave',   category: 'pension',  company: 'C생명',    issuer: 'other', name: '(무)연금저축보험', shortName: '연금저축보험', description: '연말정산 세액공제 대상', monthlyPremium: 60_000 },
]

/* ── 3-1. 상품 상세 가상값 (S6-A) ───────────────────────────
   ⚠️⚠️ **전부 가상값이다. 실제 상품 조건이 아니다.** (mock-data.md §3-1)
        자사 9개는 실제 상품명을 쓰지만 조건은 시연용으로 지어낸 값이다 —
        화면에도 면책을 띄운다(`PRODUCT_DETAIL_COPY.detailNotice`).
        실제 조건은 수시로 바뀌고 검증할 방법이 없어 일부러 실값을 넣지 않는다.

   값은 상품 유형에서 유도했다 — 암·치아는 갱신형, 여행·골프는 단기,
   연금은 종신, 간편심사는 고연령대. 아무 숫자나 넣지 않았다.

   제조사·판매 채널은 여기 두지 않는다 — `company`·`issuer` 에서 파생한다(중복 방지). */
export const PRODUCT_DETAILS: Record<string, ProductDetail> = {
  'sp-cancer-care': { pay: '월납', age: '만 15~70세', term: '20년 갱신', kind: '갱신형 암보험 (무배당)' },
  'sp-one-more-care': { pay: '월납', age: '만 30~70세', term: '100세 만기', kind: '치매·간병보험 (무배당)' },
  'sp-one-core': { pay: '월납', age: '만 15~70세', term: '20년 갱신', kind: '갱신형 종합건강보험 (무배당)' },
  'sp-teeth-plus': { pay: '월납', age: '만 15~65세', term: '10년 갱신', kind: '갱신형 치아보험 (무배당)' },
  'sp-sol-teeth': { pay: '월납', age: '만 20~60세', term: '10년 갱신', kind: '갱신형 치아보험 (무배당)' },
  'sp-sol-teeth-kid': { pay: '월납', age: '만 0~19세', term: '10년 갱신', kind: '갱신형 치아보험 (무배당)' },
  'sp-transit-mini': { pay: '월납', age: '만 15~70세', term: '1년 갱신', kind: '갱신형 상해보험 (무배당)' },
  'sp-one-safe': { pay: '월납', age: '만 15~70세', term: '20년 만기', kind: '상해·생활보장보험 (무배당)' },
  'sp-sol-pension': { pay: '월납', age: '만 15~65세', term: '종신 연금', kind: '연금보험 (무배당)' },
  'op-a-care': { pay: '월납', age: '만 20~65세', term: '20년 갱신', kind: '갱신형 암보험 (무배당)' },
  'op-b-checkup': { pay: '일시납', age: '만 20~60세', term: '1년', kind: '미니 건강보험 (무배당)' },
  'op-c-better': { pay: '월납', age: '만 15~65세', term: '20년 만기', kind: '종합건강보험 (무배당)' },
  'op-b-diabetes': { pay: '월납', age: '만 30~65세', term: '10년 갱신', kind: '갱신형 질병보험 (무배당)' },
  'op-d-100friend': { pay: '월납', age: '만 40~75세', term: '100세 만기', kind: '간편심사 건강보험 (무배당)' },
  'op-e-cancer': { pay: '월납', age: '만 20~60세', term: '20년 만기', kind: '비갱신형 암보험 (무배당)' },
  'op-f-carer': { pay: '월납', age: '만 30~70세', term: '10년 갱신', kind: '갱신형 간병보험 (무배당)' },
  'op-f-health': { pay: '월납', age: '만 30~70세', term: '10년 갱신', kind: '간편심사 건강보험 (무배당)' },
  'op-a-injury': { pay: '월납', age: '만 15~70세', term: '20년 만기', kind: '상해보험 (무배당)' },
  'op-d-teeth': { pay: '월납', age: '만 15~65세', term: '10년 갱신', kind: '갱신형 치아보험 (무배당)' },
  'op-c-ltc': { pay: '월납', age: '만 30~70세', term: '100세 만기', kind: '장기요양보험 (무배당)' },
  'op-f-travel': { pay: '일시납', age: '만 0~79세', term: '여행 기간', kind: '여행자보험 (무배당)' },
  'op-a-loan': { pay: '월납', age: '만 20~65세', term: '대출 기간', kind: '신용생명보험 (무배당)' },
  'op-f-golf': { pay: '연납', age: '만 15~75세', term: '1년', kind: '골프보험 (무배당)' },
  'op-b-variable': { pay: '월납', age: '만 15~65세', term: '종신 연금', kind: '변액연금보험 (무배당)' },
  'op-d-happy': { pay: '일시납', age: '만 20~75세', term: '종신 연금', kind: '거치형 연금보험 (무배당)' },
  'op-c-taxsave': { pay: '월납', age: '만 15~65세', term: '종신 연금', kind: '연금저축보험 (무배당)' },
}


/** 용어 툴팁 (S2-12) */
export const TERM_TOOLTIPS: Record<string, string> = {
  무배당: '배당금을 주지 않는 대신 보험료가 저렴한 상품이에요',
  갱신형: '일정 주기마다 보험료를 다시 계산해 계약을 이어가는 방식이에요',
}

/* ── 5. 카드 결제 내역 (S4) — 병원·약국은 가명 ─────────────── */
export const PAYMENTS: Payment[] = [
  { id: 'pay-1', date: '08.17', merchant: '○○내과의원',  amount: 32_000,  claimable: true },
  { id: 'pay-2', date: '08.17', merchant: '○○약국',      amount: 8_400,   claimable: true },
  { id: 'pay-3', date: '08.09', merchant: '△△정형외과',  amount: 45_000,  claimable: true },
  { id: 'pay-4', date: '07.28', merchant: '□□치과의원',  amount: 120_000, claimable: true },
  { id: 'pay-5', date: '07.15', merchant: '○○약국',      amount: 6_200,   claimable: true },
  { id: 'pay-6', date: '08.16', merchant: '◇◇마트',      amount: 23_500,  claimable: false }, // 병원 아님 — 목록에 안 나옴
]

/* ── 6. 서비스 12개 (S1 그리드 3묶음) ────────────────────────
   2026-09-04: "조회·계약" → "조회", 자동이체등록/변경은 청구·신청으로
   (등록·변경은 신청 성격이라 조회 묶음과 어울리지 않는다 — 변경로그 "S1 서비스 묶음 정리").
   ⚠️ 원본 mock-data.md 는 아직 이전 구성 — 팀장이 맞춘다. */
export const SERVICES: ServiceItem[] = [
  { id: 'sv-contract',  label: '보험계약조회',      group: '조회',      icon3d: '계약조회' },
  { id: 'sv-history',   label: '보험거래내역',      group: '조회',      icon3d: '거래내역' },
  { id: 'sv-claim',     label: '보험금청구',        group: '청구·신청', icon3d: '보험금청구' },
  { id: 'sv-premium',   label: '보험료납입',        group: '청구·신청', icon3d: '보험료납입' },
  { id: 'sv-autopay',   label: '자동이체등록/변경', group: '청구·신청', icon3d: '자동이체' },
  { id: 'sv-loan',      label: '보험계약대출신청',  group: '청구·신청', icon3d: '계약대출' },
  { id: 'sv-dividend',  label: '배당금신청',        group: '청구·신청', icon3d: '배당금' },
  { id: 'sv-withdraw',  label: '중도인출신청',      group: '청구·신청', icon3d: '중도인출' },
  { id: 'sv-split',     label: '분할보험금신청',    group: '청구·신청', icon3d: '분할보험금' },
  { id: 'sv-dict',      label: '건강사전',          group: '정보',      icon3d: '건강사전' },
  { id: 'sv-nutrition', label: 'AI영양분석',        group: '정보',      icon3d: '영양분석' },
  { id: 'sv-energy',    label: '보장에너지',        group: '정보',      icon3d: '보장에너지' },
]

/* ── 4. 공통 문구 ──────────────────────────────────────────── */
export const COPY: Copy = {
  peerBasis: '20대 중반과 비교했어요',
  limitation: '보험마다 보장 기준이 달라 실제와 다를 수 있어요. 가족이 가입해준 보험은 일부만 반영됩니다.',
  noPressure: '가입을 권하는 것이 아니에요. 궁금한 점만 물어보셔도 됩니다.',
  emptyCoverage: '아직 준비된 보장이 없어요',
}
