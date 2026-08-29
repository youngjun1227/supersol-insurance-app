/* jsdom 에 없는 브라우저 API 스텁 (#81).
   ⚠️ 스텁은 "없어서 못 도는" 것만 — 동작을 흉내 내기 시작하면 테스트가 거짓말을 한다. */
import { vi } from 'vitest'

// AgentBubble 이 prefers-reduced-motion 을 읽는다
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
    onchange: null,
  })),
})

// useScrollTop·Agent 가 부른다 — jsdom 은 "Not implemented" 에러를 찍어서 스텁 필수
window.scrollTo = vi.fn()

/* ⚠️ Node 26 이 실험적 localStorage 전역(빈 접근자)을 깔아놔서 jsdom 것을 가린다 —
      --localstorage-file 없이는 undefined 라 앱의 계측 코드가 전부 죽는다.
      인메모리 Storage 로 덮는다 (스모크는 렌더만 보므로 영속성은 불필요). */
function memoryStorage(): Storage {
  let store = new Map<string, string>()
  return {
    getItem: (k) => store.get(k) ?? null,
    setItem: (k, v) => void store.set(k, String(v)),
    removeItem: (k) => void store.delete(k),
    clear: () => void (store = new Map()),
    key: (i) => [...store.keys()][i] ?? null,
    get length() { return store.size },
  }
}
Object.defineProperty(globalThis, 'localStorage', { value: memoryStorage(), configurable: true })
Object.defineProperty(globalThis, 'sessionStorage', { value: memoryStorage(), configurable: true })
