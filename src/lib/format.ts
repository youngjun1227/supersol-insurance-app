/* 표시용 숫자 서식.
   ⚠️ 금액 표기는 S1-7 · S1-9 · 홈 · S2 · S4 에 흩어져 나온다.
      화면마다 따로 만들면 "35,000원" 과 "3.5만원" 이 섞인다 —
      9/11 과제 "이번 달 보험료 확인"의 정답값이 화면마다 다르게 보이면
      과제 성공 판정이 흔들린다. 새 표기가 필요하면 여기에 추가한다. */

/** 원화 표기 — 35,000원 · 9,250,000원 */
export function won(n: number): string {
  return `${n.toLocaleString('ko-KR')}원`
}

/** 결제일 표기 — Payment.date 'MM.DD' → '8월 17일' (S4-A 결제 라인) */
export function monthDay(mmdd: string): string {
  const [m, d] = mmdd.split('.').map(Number)
  return `${m}월 ${d}일`
}
