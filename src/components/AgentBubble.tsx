/* S6 에이전트 진입 버블 — 헤더 아래 우측 플로팅.
   말풍선(primary 채움 pill, 흰 글자 13) + 신한 마스코트(쏠·흰 곰).

   ✅ 마스코트 사용은 2026-08-26 멘토 구두 허락됨 (이전 금지 규칙 해제).
   ✅ 공식 에셋 반영 완료 (2026-08-28). 에셋이 없으면 말풍선만 뜬다 (버블 자체는 동작).

   ⚠️ 말풍선은 계속 떠 있지 않는다 — 화면 폭의 65%를 차지해 상품명을 가린다.
      문구 2개를 순서대로 보여준 뒤 접고, 마스코트만 남긴다 (팀장 결정 2026-08-28).
      접힌 뒤에도 탭 영역은 그대로라 진입점은 유지된다. */

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import styles from './AgentBubble.module.css'

interface AgentBubbleProps {
  /** 첫 번째 문구 */
  label: string
  /** 두 번째 문구 — 넘기면 label 다음에 이어서 뜬다 */
  labelSecond?: string
  /** 이 값이 바뀌면 문구를 처음부터 다시 보여준다 (상품 전환 등) */
  resetKey?: string
  onTap: () => void
}

/** 마스코트 이미지 — 에셋이 들어오면 이 경로만 채우면 된다 */
const MASCOT_SRC = '/assets/mascot/sol.png'

/** 문구 하나가 머무는 시간(ms). 13pt 한 줄을 읽기에 충분한 길이 */
const HOLD_MS = 2600

export function AgentBubble({ label, labelSecond, resetKey, onTap }: AgentBubbleProps) {
  /* 에셋이 아직 없으면 말풍선만 띄운다 — 깨진 이미지도, 빈 자리도 남기지 않는다 */
  const [hasMascot, setHasMascot] = useState(true)

  /** 0 = 첫 문구 · 1 = 두 번째 문구 · null = 접힘(마스코트만) */
  const [step, setStep] = useState<number | null>(0)
  const timers = useRef<number[]>([])

  /* 문구마다 폭이 다르다(예: 202px vs 136px). max-width 를 고정해 두면 폭이 안 변해
     글자만 툭 바뀌어 보인다 — 각 문구의 실제 폭을 재서 넣어야 말주머니가 늘었다 줄었다 한다. */
  const measureRef = useRef<HTMLSpanElement>(null)
  const [width, setWidth] = useState<number | null>(null)

  /* ⚠️ 상품을 바꿔 가며 볼 때(S6-A → 다른 상품) 이 컴포넌트는 같은 자리라 재마운트되지 않는다.
        그대로 두면 첫 상품에서 접힌 뒤 다음 상품부터는 버블이 영영 안 뜬다.
        label 이 바뀌지 않아도 화면이 바뀌면 다시 돌도록 resetKey 를 받는다. */
  useEffect(() => {
    setStep(0)
  }, [resetKey])

  useEffect(() => {
    /* 애니메이션을 줄이도록 설정한 사용자에게는 문구가 번갈아 뜨는 것 자체가 방해다.
       첫 문구만 남기고 순환하지 않는다 (전역 CSS 는 트랜지션만 줄여줘서 여기서 따로 본다) */
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const seq = labelSecond ? [HOLD_MS, HOLD_MS * 2] : [HOLD_MS]
    timers.current = seq.map((ms, i) =>
      window.setTimeout(() => setStep(labelSecond && i === 0 ? 1 : null), ms),
    )
    return () => {
      timers.current.forEach(clearTimeout)
      timers.current = []
    }
  }, [labelSecond, resetKey])

  const text = step === 0 ? label : step === 1 ? labelSecond : null

  /* 보이는 문구가 바뀔 때마다 그 문구의 자연 폭을 잰다.
     ⚠️ 폭과 글자를 같은 프레임에 바꾸면 트랜지션이 안 걸려 "툭" 바뀐다.
        측정은 숨은 span 으로 미리 해 두고, 폭 → 글자 순서로 나눠 적용한다. */
  useLayoutEffect(() => {
    const el = measureRef.current
    if (!el || text === null) return
    setWidth(el.scrollWidth)
  }, [text])

  return (
    <button type="button" className={styles.wrap} onClick={onTap}>
      {/* 접힌 뒤에도 버튼은 남는다 — 마스코트가 진입점이다.
          aria-label 은 항상 첫 문구로 둬서 스크린리더 안내가 바뀌지 않게 한다 */}
      {/* 측정 전용 — 화면에 안 보이지만 실제 문구의 자연 폭을 갖는다 */}
      <span ref={measureRef} className={`${styles.measure} t-caption-medium`} aria-hidden="true">
        {text ?? label}
      </span>

      <span
        className={`${styles.bubble} t-caption-medium`}
        data-hidden={text === null}
        aria-hidden={text === null}
        /* 접힘은 0, 그 밖에는 잰 폭. width 를 직접 줘야 폭 변화에 트랜지션이 걸린다
           (max-width 는 상한이라 내용이 바뀌면 실제 폭이 한 프레임에 튄다) */
        style={{ width: text === null ? 0 : (width ?? 'auto') }}
      >
        {/* 글자는 따로 페이드 — 말주머니가 늘었다 줄어드는 동안 부드럽게 바뀐다.
            key 를 문구로 두면 바뀔 때마다 다시 페이드인 한다 */}
        <span key={text ?? 'end'} className={styles.text}>{text ?? label}</span>
      </span>
      {hasMascot ? (
        <img
          className={styles.mascot}
          src={MASCOT_SRC}
          alt=""
          aria-hidden="true"
          onError={() => setHasMascot(false)}
        />
      ) : null}
      <span className="sr-only">{label}</span>
    </button>
  )
}
