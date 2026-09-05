/* 서류 목록 — 청구 흐름(S4-A·S4-D) 전용 로컬 조각.
   원래 체크 행(ClaimCheck)이었다. 필요 서류는 보험 상품·보험사에 따라 달라
   "준비했다"고 표시할 근거가 없어 체크박스를 빼고 점 불릿 목록으로 바꿨다
   (변경로그 "청구 서류 문구·체크박스" 2026-09-04). 탭할 게 없으니 계측도 없다.
   ⚠️ 공용 컴포넌트(src/components)는 팀장이 만든다 — 다른 화면에도 필요해지면 승격을 요청한다. */

import styles from './ClaimDocList.module.css'

interface ClaimDocListProps {
  docs: readonly string[]
  /** 행 간격 등 화면별 보정 — 목록 자체 스타일은 건드리지 않는다 */
  className?: string
}

export function ClaimDocList({ docs, className }: ClaimDocListProps) {
  return (
    <ul className={className ? `${styles.list} ${className}` : styles.list}>
      {docs.map((doc) => (
        <li key={doc} className={`${styles.item} t-body`}>
          {doc}
        </li>
      ))}
    </ul>
  )
}
