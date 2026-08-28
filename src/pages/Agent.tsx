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

import { useEffect, useRef, useState } from 'react'
import { PaperPlaneRight, X } from '@phosphor-icons/react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AppShell } from '@/components'
import { useMock } from '@/app/MockProvider'
import { AGENT as C, AGENT_MATCHES, AGENT_NO_MATCH, AGENT_PRESETS } from '@/data/copy'
import { ELEMENT, SCREEN, tid } from '@/lib/targetId'
import { useTrack } from '@/lib/useTrack'
import styles from './Agent.module.css'

/** 대화 한 덩이 — 진입/추천칩으로 온 프리셋이거나, 직접 입력한 질문이다 */
type Turn =
  /** 진입 안내만 — "…에서 자동으로 물어봤어요" 한 줄. 질문·답변은 아직 없다 */
  | { kind: 'note'; key: string }
  | { kind: 'preset'; key: string }
  | { kind: 'typed'; text: string; to: string | null }

/** 신한 심볼 — 답변 왼쪽 위. 다른 화면(홈·S3-D 등)과 같은 정사각 에셋을 쓴다
    (shinhanlife.png 은 가로로 긴 워드마크라 이 자리에 안 맞는다) */
const LOGO_SRC = '/assets/logo/shinhan-symbol.png'

export function Agent() {
  const navigate = useNavigate()
  const track = useTrack()
  const [params] = useSearchParams()
  const { data } = useMock()

  /* 대화는 쌓인다 — 진입 프리셋으로 시작해 직접 입력한 질문이 아래로 붙는다.
     추천 칩을 눌러도 새 라우트를 쌓지 않는다 (X 로 닫으면 원래 화면으로 한 번에) */
  /* ⚠️ 진입 직후에는 **안내 한 줄만** 띄운다 — 질문·답변을 미리 채워두지 않는다.
     사용자가 직접 물어봐야 대화가 시작된다 (팀장 결정 2026-08-28) */
  const first = params.get('ctx') ?? ''
  const [turns, setTurns] = useState<Turn[]>(() =>
    AGENT_PRESETS[first] ? [{ kind: 'note', key: first }] : [],
  )
  const [draft, setDraft] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  /* 새 대화가 붙으면 아래로 스크롤 — 카톡처럼 마지막 말이 보여야 한다 */
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [turns])

  /** 입력한 문구에서 아는 질문을 찾는다. 못 찾으면 null */
  const matchPreset = (text: string): string | null => {
    const t = text.replace(/\s/g, '')
    for (const m of AGENT_MATCHES) {
      if (m.keywords.every((k) => t.includes(k))) return m.to
    }
    return null
  }

  const send = () => {
    const text = draft.trim()
    if (!text) return
    const hit = matchPreset(text)
    track(tid(SCREEN.s3f, ELEMENT.버튼, hit ? `보내기-${hit}` : '보내기-매칭없음'))
    setTurns((prev) => [...prev, { kind: 'typed', text, to: hit }])
    setDraft('')
  }

  const close = () => {
    track(tid(SCREEN.s3f, ELEMENT.닫기))
    navigate(-1)
  }

  const pickSuggestion = (to: string) => {
    track(tid(SCREEN.s3f, ELEMENT.칩, to))
    setTurns((prev) => [...prev, { kind: 'preset', key: to }])
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
        /* 실제로 입력해서 보낸다 — 다만 LLM 이 아니라 **정해진 문구를 알아보고
           정해진 답**을 띄운다 (CLAUDE.md "프리셋 고정 응답"). 모르는 질문은 지어내지 않는다. */
        <form
          className={styles.inputBar}
          onSubmit={(e) => {
            e.preventDefault()
            send()
          }}
        >
          <input
            className={`${styles.input} t-body`}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={C.inputPlaceholder}
            aria-label={C.inputPlaceholder}
            enterKeyHint="send"
          />
          <button
            type="submit"
            className={styles.send}
            aria-label={C.sendLabel}
            disabled={!draft.trim()}
          >
            <PaperPlaneRight size={20} weight="fill" color="var(--on-primary)" />
          </button>
        </form>
      }
    >
      <div className={styles.thread}>
        <p className={`${styles.date} t-caption`}>{C.dateLabel}</p>

        {/* 문맥 없이 들어오면 인사말로 시작한다 (변경로그 §6). 질문을 지어내지 않는다 */}
        {turns.length === 0 ? (
          <div className={styles.answer}>
            <img className={styles.logo} src={LOGO_SRC} alt="" aria-hidden="true" />
            <p className={`${styles.paragraph} t-body`}>{C.greeting}</p>
          </div>
        ) : null}

        {turns.map((turn, i) => {
          /* 진입 안내는 칩 한 줄만 — 질문·답변 없이 여기서 끝난다 */
          if (turn.kind === 'note') {
            const note = AGENT_PRESETS[turn.key]?.systemNote
            return note ? (
              <p key={`note-${i}`} className={`${styles.systemNote} t-caption`}>{note}</p>
            ) : null
          }

          /* 직접 입력한 질문도 아는 것이면 같은 프리셋 답을 쓴다 —
             화면에 두 벌을 만들지 않으려고 답변 렌더를 하나로 모은다 */
          const key = turn.kind === 'preset' ? turn.key : turn.to
          const preset = key ? AGENT_PRESETS[key] : undefined
          const question = turn.kind === 'preset' ? preset?.question : turn.text
          const paragraphs = preset ? preset.paragraphs : AGENT_NO_MATCH.paragraphs

          return (
            <div key={`${turn.kind}-${i}`} className={styles.turn}>
              {/* 시스템 칩은 진입 프리셋에만 — 직접 물어본 건 "자동으로 물어봤어요"가 아니다 */}
              {turn.kind === 'preset' && preset ? (
                <p className={`${styles.systemNote} t-caption`}>{preset.systemNote}</p>
              ) : null}

              {question ? (
                <p className={`${styles.question} t-body-lg-medium`}>{question}</p>
              ) : null}

              <div className={styles.answer}>
                <img className={styles.logo} src={LOGO_SRC} alt="" aria-hidden="true" />

                {/* {name} 은 목데이터 사용자 이름으로 채운다 — 이름을 문구에 박아두면
                    mock.ts 가 바뀔 때 여기만 남는다 (데이터 접근은 한 층으로) */}
                {paragraphs.map((text) => (
                  <p key={text} className={`${styles.paragraph} t-body`}>
                    {text.replace('{name}', data.user.name)}
                  </p>
                ))}

                <p className={`${styles.aiNotice} t-caption`}>{C.aiNotice}</p>

                {/* 추천 칩은 마지막 덩이에만 — 위쪽 답변의 칩까지 남으면 어디를 누를지 헷갈린다 */}
                {preset?.suggestion && i === turns.length - 1 ? (
                  <button
                    type="button"
                    className={`${styles.suggestion} t-body-sm-medium`}
                    onClick={() => pickSuggestion(preset.suggestion!.to)}
                  >
                    {preset.suggestion.label}
                  </button>
                ) : null}
              </div>
            </div>
          )
        })}

        <div ref={endRef} />
      </div>
    </AppShell>
  )
}
