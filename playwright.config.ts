/* 시각 회귀 (docs/CI명세.md 2.0).
   뷰포트 393×852 · DPR 2 하나 (스펙 §0). WebKit 이 P0 — 9/11 참가자 전원 아이폰.
   ⚠️ 기준선은 CI 컨테이너에서만 찍는다 (REQ-006). 로컬 맥 폰트 렌더가 달라 즉시 실패한다 —
      로컬은 `npm run visual` 로 "돌아가는가"만 본다. 갱신은 PR 라벨 `기준선-갱신`. */
import { defineConfig, devices } from '@playwright/test'

const viewport = { width: 393, height: 852 }

export default defineConfig({
  testDir: 'e2e',
  // 기준선 파일명에 OS 를 안 붙인다 — CI 컨테이너(linux) 한 곳에서만 찍으므로 엔진만 구분
  snapshotPathTemplate: '{testDir}/__snapshots__/{arg}-{projectName}{ext}',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0, // 오탐은 REQ-008 위반 — 재시도로 숨기지 않는다
  reporter: process.env.CI ? [['html', { open: 'never' }], ['github']] : 'list',
  timeout: 30_000,
  expect: {
    toHaveScreenshot: {
      // 절대값 — 비율은 긴 페이지에서 아이콘 22→28 같은 작은 회귀를 놓친다 (REQ-009).
      // 컨테이너 렌더는 결정적이라 정상 흔들림은 0 에 가깝다
      maxDiffPixels: 100,
      animations: 'disabled',
      caret: 'hide',
    },
  },
  use: {
    baseURL: 'http://localhost:4173',
    viewport,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    colorScheme: 'light',
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
  },
  projects: [
    { name: 'webkit',   use: { ...devices['iPhone 14'], viewport, deviceScaleFactor: 2 } },
    { name: 'chromium', use: { ...devices['Pixel 7'],   viewport, deviceScaleFactor: 2 } },
  ],
  // 빌드 결과물을 찍는다 — 배포되는 것과 같은 파일. build job 과 별개로 여기서도 빌드한다
  webServer: {
    command: 'npm run build && npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
