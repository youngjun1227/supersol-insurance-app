# PR: [화면코드] 제목 (예: [S3-C] 진단 결과 — 티어 접기)

## 무엇을 (담당 화면·작업지시 문서의 항목 명시)

-

## 어떻게 확인했나

- [ ] **figma-ref PNG와 나란히 비교한 스크린샷 첨부** (`docs/figma-ref/…` ↔ 구현 화면) ← 필수
- [ ] **Vercel 프리뷰를 폰에서 열어 확인** (PR에 자동으로 링크가 달립니다) — 스크린샷보다 정확합니다
- [ ] `npm run lint:tokens` · `npm run typecheck` · `npm run build` 로컬 통과
- [ ] 393px 뷰포트에서 확인 (다른 폭 아님)

## 체크리스트

- [ ] 색·크기·라운드는 전부 토큰 (`docs/디자인스펙.md` §1~3) — 직접값 0
- [ ] 탭 요소마다 `tid(SCREEN.…, ELEMENT.…, …)` 계측 부착
- [ ] 문구는 `docs/디자인변경로그.md` 확정본 그대로 — **컴플라이언스 문구 임의 수정 금지**
- [ ] 목데이터는 `mock.ts`만 사용 — 컴포넌트 안 하드코딩 값 0 (`npm run check:mock` 통과)
- [ ] 아이콘은 쓰는 것만 명시 import — `import * as` 로 이름 조회 금지 (번들 폭증)
- [ ] 커밋·PR 본문에 Claude co-author/attribution 라인 없음
