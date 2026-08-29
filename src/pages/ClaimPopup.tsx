/* S4-A 결제 감지 팝업 — Figma 317:6911 · figma-ref/S4-A-결제감지팝업.png
   라우트가 아니라 메인홈 위 오버레이 — `/?popup=claim` 일 때 뜬다.
   9/11 과제 2(claim)는 진행자가 참가자 폰에서 이 주소를 열어 시작한다
   (변경로그 "진행자가 S4-A 팝업 트리거" — /moderator 가 생기면 그쪽이 이 링크를 연다).

   ⚠️ 스펙 §5 는 <CenterPopup> "중앙 팝업"으로 적었지만 figma-ref 는 하단 시트다
      (상단만 라운드 + 화면 아래 끝까지). 검수 기준이 PNG 육안 등가라 시트로 구현 —
      변경로그에 보고했고 스펙·Figma 는 팀장이 정리한다.
   ⚠️ 제목·고지는 CLAIM_COMPLIANCE 그대로 (멘토 요구 — 임의 수정 금지). */

import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { BottomSheet, Button } from '@/components'
import { useMock } from '@/app/MockProvider'
import { CLAIM_COMPLIANCE, CLAIM_POPUP as C } from '@/data/copy'
import { monthDay, won } from '@/lib/format'
import { ELEMENT, SCREEN, tid } from '@/lib/targetId'
import { useTrack } from '@/lib/useTrack'
import { ClaimCheck } from './ClaimCheck'
import styles from './ClaimPopup.module.css'

export function ClaimPopup() {
  const navigate = useNavigate()
  const track = useTrack()
  const { data } = useMock()
  const [searchParams, setSearchParams] = useSearchParams()
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  const open = searchParams.get('popup') === 'claim'
  /** 팝업이 보여주는 결제 건 — 청구 대상 중 가장 최근(목데이터 맨 앞 pay-1) */
  const payment = data.payments.find((p) => p.claimable)
  if (!open || !payment) return null

  /** popup 쿼리만 지운 search — 계정 상태(?state)는 유지한다 */
  const searchWithoutPopup = () => {
    const p = new URLSearchParams(searchParams)
    p.delete('popup')
    const s = p.toString()
    return s ? `?${s}` : ''
  }

  /* 닫기(딤·Esc·나중에·알림거부) — replace 로 지워 뒤로가기에 팝업이 안 남는다 */
  const close = (targetId: string) => {
    track(targetId)
    setSearchParams(
      (prev) => {
        const p = new URLSearchParams(prev)
        p.delete('popup')
        return p
      },
      { replace: true },
    )
  }

  return (
    <BottomSheet
      open
      onClose={() => close(tid(SCREEN.s4Popup, ELEMENT.닫기))}
      label={CLAIM_COMPLIANCE.title}
    >
      {/* 일러스트 96 은 스펙 §5 CenterPopup 값 그대로 (레이아웃만 시트) */}
      <img className={styles.illust} src="/assets/3d/청구서류.png" alt="" aria-hidden="true" />

      <div className={styles.head}>
        <h2 className={`${styles.title} t-h2`}>{CLAIM_COMPLIANCE.title}</h2>
        <p className={`${styles.payment} t-body`}>
          {monthDay(payment.date)} {payment.merchant} {won(payment.amount)} {C.paymentSuffix}
        </p>
        <p className={`${styles.notice} t-caption`}>{CLAIM_COMPLIANCE.popupNotice}</p>
      </div>

      <div className={styles.docsBox}>
        <p className={`${styles.docsTitle} t-body-sm-medium`}>{C.docsTitle}</p>
        {C.docs.map((doc) => (
          <ClaimCheck
            key={doc.id}
            label={doc.label}
            checked={checked[doc.id] ?? false}
            targetId={tid(SCREEN.s4Popup, ELEMENT.체크, doc.id)}
            onToggle={(next) => setChecked((prev) => ({ ...prev, [doc.id]: next }))}
          />
        ))}
      </div>

      <Button
        block
        size="lg"
        targetId={tid(SCREEN.s4Popup, ELEMENT.버튼, '청구하기')}
        onClick={() => navigate({ pathname: '/claim/guide', search: searchWithoutPopup() })}
      >
        {C.cta}
      </Button>

      {/* 둘 다 팝업 닫기 — "이 알림 받지 않기"의 별도 도착지는 Figma 에 없다 (팀장 확인 대기) */}
      <div className={styles.links}>
        <button
          type="button"
          className={`${styles.link} t-body`}
          onClick={() => close(tid(SCREEN.s4Popup, ELEMENT.버튼, '나중에'))}
        >
          {C.later}
        </button>
        <button
          type="button"
          className={`${styles.link} t-body`}
          onClick={() => close(tid(SCREEN.s4Popup, ELEMENT.버튼, '알림거부'))}
        >
          {C.optOut}
        </button>
      </div>
    </BottomSheet>
  )
}
