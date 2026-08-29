/* 루트 에러 바운더리 (#80).
   렌더 중 어디서든 throw 하면 React 가 트리를 통째로 내려 흰 화면이 된다 —
   9/11 테스트 중에 터지면 참가자 앞에서 복구 방법이 없다. 폴백을 깔아 세션을 살린다.

   ⚠️ 클래스 컴포넌트다 — componentDidCatch 는 아직 훅으로 못 쓴다.

   ⚠️ 복구는 location.href 로 전체 새로고침이다. 크래시 뒤의 React 상태는
      믿을 수 없어서 라우터로 홈만 갈아끼우는 것보다 처음부터 다시 그리는 게
      안전하다. 계측은 localStorage 라 새로고침에도 살아 있다. */

import { Component, type ReactNode } from 'react'
import { track } from '@/lib/analytics'
import { ERROR_FALLBACK as C } from '@/data/copy'
import styles from './ErrorBoundary.module.css'

interface Props { children: ReactNode }
interface State { crashed: boolean }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { crashed: false }

  static getDerivedStateFromError(): State {
    return { crashed: true }
  }

  componentDidCatch(error: Error) {
    /* 어느 화면에서 터졌는지 계측에 남긴다 — screen 은 'unknown' 으로 보내면
       analytics 가 마지막 화면으로 채운다 (#38 의 폴백을 그대로 탄다) */
    try {
      track({
        type: 'error',
        targetId: String(error?.message ?? error).slice(0, 120),
        screen: 'unknown',
      })
    } catch {
      /* 계측까지 죽었어도 폴백은 떠야 한다 */
    }
  }

  render() {
    if (!this.state.crashed) return this.props.children

    return (
      <div className={styles.fallback} role="alert">
        <p className={`${styles.title} t-h2`}>{C.title}</p>
        <p className={`${styles.body} t-body`}>{C.body}</p>
        {/* 공용 <Button> 을 안 쓴다 — 크래시 상황에서는 의존을 최소로.
            (useTrack 훅·컨텍스트가 크래시 원인일 수도 있다) */}
        <button
          type="button"
          className={`${styles.action} t-body-lg-bold`}
          onClick={() => {
            window.location.href = '/'
          }}
        >
          {C.action}
        </button>
      </div>
    )
  }
}
