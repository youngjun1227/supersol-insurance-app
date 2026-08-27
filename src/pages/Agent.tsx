/* S3-F 에이전트 대화 — Figma 530:3126(실손) / 530:9824(사망).
   figma-ref `S3-F-대화-실손.png` · `S3-F-대화-사망.png`

   ⚠️ 프리셋 고정 응답이다. 실제 LLM 을 붙이지 않는다 — 9/11 테스트의 통제 변수다
      (CLAUDE.md 데이터 규칙). 하단 입력 바도 모양만 있고 보내지 않는다.

   진입 문맥은 쿼리로 온다:
     /agent?ctx=c-actual        S3-C·S3-E 의 실손 항목 💬
     /agent?ctx=c-death         사망 항목 💬
     /agent?ctx=product&id=…    S6-A 상품 상세 버블
     /agent                     S1 상담 배너 — 문맥 없음, 인사말만

   ⚠️ 뒤로가 아니라 X 로 닫는다 (figma-ref). 대화는 화면 위에 얹힌 것에 가깝다. */

import { useState } from 'react'
import { X } from '@phosphor-icons/react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AppShell } from '@/components'
import { useMock } from '@/app/MockProvider'
import { AGENT as C, AGENT_PRESETS } from '@/data/copy'
import { ELEMENT, SCREEN, tid } from '@/lib/targetId'
import { useTrack } from '@/lib/useTrack'
import styles from './Agent.module.css'

/** 신한 심볼 — 답변 왼쪽 위. 다른 화면(홈·S3-D 등)과 같은 정사각 에셋을 쓴다
    (shinhanlife.png 은 가로로 긴 워드마크라 이 자리에 안 맞는다) */
const LOGO_SRC = '/assets/logo/shinhan-symbol.png'

export function Agent() {
  const navigate = useNavigate()
  const track = useTrack()
  const [params] = useSearchParams()
  const { data } = useMock()

  /* 어떤 프리셋을 보여줄지. 추천 칩을 누르면 이 값만 갈아끼운다 —
     라우트를 새로 쌓지 않는 건 X 로 닫았을 때 원래 화면으로 한 번에 돌아가기 위해서다 */
  const [ctx, setCtx] = useState<string>(() => params.get('ctx') ?? '')

  const preset = AGENT_PRESETS[ctx]

  const close = () => {
    track(tid(SCREEN.s3f, ELEMENT.닫기))
    navigate(-1)
  }

  const pickSuggestion = (to: string) => {
    track(tid(SCREEN.s3f, ELEMENT.칩, to))
    setCtx(to)
  }

  return (
    <AppShell
      name="S3-F-에이전트"
      background="surface"
      footerType="input"
      header={
        <div className={styles.header}>
          <p className={`${styles.headerTitle} t-body-lg-medium`}>{C.title}</p>
          <button type="button" className={styles.close} aria-label="닫기" onClick={close}>
            <X size={24} weight="regular" color="var(--text-secondary)" />
          </button>
        </div>
      }
      footer={
        /* 목업 입력 바 — 실제로 보내지 않는다. 참가자가 눌러볼 수는 있어야 해서
           비활성이 아니라 읽기 전용으로 두고, 탭은 계측한다 */
        <div className={styles.inputBar}>
          <button
            type="button"
            className={`${styles.input} t-body`}
            onClick={() => track(tid(SCREEN.s3f, ELEMENT.버튼, '입력창'))}
          >
            {C.inputPlaceholder}
          </button>
        </div>
      }
    >
      <div className={styles.thread}>
        <p className={`${styles.date} t-caption`}>{C.dateLabel}</p>

        {preset ? (
          <>
            <p className={`${styles.systemNote} t-caption`}>{preset.systemNote}</p>

            <p className={`${styles.question} t-body-lg-medium`}>{preset.question}</p>

            <div className={styles.answer}>
              <img className={styles.logo} src={LOGO_SRC} alt="" aria-hidden="true" />

              {/* {name} 은 목데이터 사용자 이름으로 채운다 — 이름을 문구에 박아두면
                  mock.ts 가 바뀔 때 여기만 남는다 (데이터 접근은 한 층으로) */}
              {preset.paragraphs.map((text) => (
                <p key={text} className={`${styles.paragraph} t-body`}>
                  {text.replace('{name}', data.user.name)}
                </p>
              ))}

              <p className={`${styles.aiNotice} t-caption`}>{C.aiNotice}</p>

              {preset.suggestion ? (
                <button
                  type="button"
                  className={`${styles.suggestion} t-body-sm-medium`}
                  onClick={() => pickSuggestion(preset.suggestion!.to)}
                >
                  {preset.suggestion.label}
                </button>
              ) : null}
            </div>
          </>
        ) : (
          /* 문맥 없이 들어온 경우 — 변경로그 §6 "일반 인사말"로 시작한다.
             질문을 지어내지 않는다 (프리셋이 없는 항목의 💬도 여기로 온다) */
          <div className={styles.answer}>
            <img className={styles.logo} src={LOGO_SRC} alt="" aria-hidden="true" />
            <p className={`${styles.paragraph} t-body`}>{C.greeting}</p>
          </div>
        )}
      </div>
    </AppShell>
  )
}
