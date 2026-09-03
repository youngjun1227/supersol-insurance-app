/* 진행자용 내보내기 화면 (/export) — 9/11 테스트 운영용.
   참가자에게 보여주는 화면이 아니라서 디자인 토큰만 지키고 꾸미지 않는다.
   원본 JSON 만 꺼낸다 — "어디서 헤맸나" 내부 진단용. 과제 성공률은 설문 웹이 찍는다 (#102) */

import { useCallback, useEffect, useState } from 'react'
import { AppShell, Button, Header } from '@/components'
import {
  clearEvents, getSessionId, isStorageBlocked, readEvents, resetSession, subscribe,
  type AnalyticsEvent,
} from '@/lib/analytics'
import styles from './Export.module.css'

function download(filename: string, text: string, mime: string) {
  const blob = new Blob([text], { type: `${mime};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  /* 문서에 붙였다 떼고, revoke 는 다음 틱에 — click() 직후 동기 revoke 하면
     iOS 사파리에서 다운로드가 조용히 실패한다 (#109) */
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function Export() {
  const [events, setEvents] = useState<AnalyticsEvent[]>(() => readEvents())
  const [sessionId, setSessionId] = useState(() => getSessionId())
  const [copied, setCopied] = useState(false)

  const refresh = useCallback(() => setEvents(readEvents()), [])

  useEffect(() => subscribe(refresh), [refresh])

  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')

  /* 폰에서는 다운로드가 막히는 경우가 있어 클립보드 복사도 같이 둔다 */
  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(events, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('복사해서 쓰세요', JSON.stringify(events))
    }
  }

  return (
    <AppShell name="진행자-내보내기" header={<Header title="계측 내보내기" variant="sub" />}>
      <div className={styles.body}>
        <section className={styles.block}>
          <h2 className={`${styles.h} t-h3`}>현재 세션</h2>
          <p className={`${styles.mono} t-caption`}>{sessionId}</p>
          <p className={`${styles.meta} t-caption`}>
            이벤트 {events.length}개
          </p>
          {/* 저장이 막힌 브라우저(시크릿·쿠키 차단)면 기록이 안 쌓인다 —
              진행자가 모르고 진행하면 그 참가자 데이터가 통째로 빈다 (#99) */}
          {isStorageBlocked() ? (
            <p className={`${styles.warn} t-caption`}>
              ⚠️ 이 브라우저는 계측 저장이 막혀 있어요. 시크릿 모드를 끄거나 다른 브라우저로
              열어 주세요 — 지금 기록은 새로고침하면 사라져요.
            </p>
          ) : null}
        </section>

        <section className={styles.actions}>
          <Button block targetId="내보내기-JSON"
            onClick={() => download(`supersol-${stamp}.json`, JSON.stringify(events, null, 2), 'application/json')}>
            원본 JSON 내려받기
          </Button>
          <Button block variant="tint" targetId="내보내기-복사" onClick={copyJson}>
            {copied ? '복사했어요' : 'JSON 클립보드로 복사'}
          </Button>
        </section>

        <section className={styles.actions}>
          <Button block variant="tint" targetId="세션-새로시작"
            onClick={() => {
              if (!window.confirm('참가자를 바꿀까요? 새 세션으로 시작해요. (기록은 남아요)')) return
              setSessionId(resetSession())
            }}>
            다음 참가자 (세션 새로 시작)
          </Button>
          <Button block variant="tint" targetId="기록-비우기"
            onClick={() => {
              if (!window.confirm('기록을 전부 지울까요? 되돌릴 수 없어요.')) return
              clearEvents()
            }}>
            기록 전부 비우기
          </Button>
        </section>
      </div>
    </AppShell>
  )
}
