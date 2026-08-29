/* 스모크 테스트 설정 (#81).
   vite.config.ts 를 건드리지 않으려고 별도 파일 — 빌드 설정과 테스트 설정을 섞지 않는다. */
import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['src/test/setup.ts'],
    css: false, // CSS Modules 는 렌더 검사에 불필요 — 클래스명만 스텁된다
  },
})
