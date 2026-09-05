# 슈퍼SOL 보험 탭 UI/UX 개선 — React 구현

## 한 줄 요약
신한 슈퍼쏠 보험 탭 **UI/UX 개선(리디자인)의 React 구현**. 룩앤필은 기존 슈퍼쏠 그대로, 개선하는 것은 정보 구조·흐름·배치다. Figma 최종 UI를 그대로 코드로 옮긴다. 1차 목표는 9/11 사용자 테스트(목데이터·백엔드 없음·폰 브라우저 링크 배포)이고, 이후 실제 기능 구현으로 확장한다 — **일회용 프로토타입이 아니다. 확장을 전제로 구조를 잡는다.**

## 저장소 관계
- **이 레포 (개발)**: https://github.com/youngjun1227/supersol-insurance-app — 코드만. **3인 개발**(아래 분담표).
- **디자인 레포**: https://github.com/youngjun1227/supersol-insurance-redesign — Figma 작업·리서치·토큰 원본. 로컬 경로 `../SOL_UI:UX_Redesign` (형제 폴더 전제).
- 디자인이 바뀌면 **디자인 레포가 원본** — 이쪽은 따라간다. 토큰·에셋은 스크립트로 동기화(`npm run sync:assets`).

## 커밋 규칙 (절대)
- **커밋 메시지에 `Co-Authored-By: Claude …` / `Generated with Claude Code` 절대 넣지 말 것.** `.claude/settings.json`(`includeCoAuthoredBy:false`) + `.githooks/commit-msg`가 강제. clone 후 `git config core.hooksPath .githooks` 1회.
- 커밋은 사용자가 요청할 때. 메시지는 한국어.

## 협업 규칙 (3인 개발 — 2026-08-26부터)

| 담당 | 범위 | 화면 | 브랜치 |
|---|---|---|---|
| **팀장** (`youngjun1227`) | **공용 표면** | 공용 컴포넌트 · 탭바 · **00 메인홈** · 스켈레톤(혜택·주식) · 라우터 | `feat/common`, `feat/home` |
| **팀장** (`youngjun1227`) | 아이디어 1 | S2-A · S2-D · S6-A | `feat/s2-*` |
| **팀장** (`youngjun1227`) | 아이디어 4 | S3-C/D/E/F | `feat/s3-*` |
| **팀원 A** (`Jongkwang131`) | 아이디어 2 | S1 보험 메인 3상태(`?state=A\|B`, `custom=off`) · S1-7 · S1-13 시트 | `feat/s1-main` |
| **팀원 B** (`leechanyoung0710`) | 아이디어 3 | S4-A 팝업 · S5-A · S4-D · 청구완료 | `feat/claim-flow` |
| **팀원 B** | 운영 | `/moderator` 진행자 화면 — **앱 완성 후 착수** (팀장 결정) | `feat/moderator` |

배정 기준은 **난이도**다 — S1 은 한 라우트에 상태 3개가 얽혀 로직이 까다롭고,
청구 흐름은 화면이 서로 독립적이라 상대적으로 단순하다.
디자인 시안 담당과 개발 담당은 일치하지 않는다 (시안은 팀 전체가 합의한 것이라 배분 근거가 아니다).

⚠️ 이 저장소는 public 이다. **문서·코드·커밋 어디에도 실명을 쓰지 않는다** — GitHub 계정명만 쓴다.
(목데이터의 실명 금지 규칙과 같은 이유. 김신한·010-0000-0000 은 목데이터 전용 가명이다.)

**공용 표면(홈·탭바·라우터)은 팀장이 소유한다** — 세 사람 화면의 공통 진입점이라 주인이 없으면 서로 조금씩 고치다 충돌한다. 9/11 과제 4개가 전부 홈에서 시작하므로 홈이 흔들리면 네 과제의 출발점이 전부 갈린다.

- **`main` 직접 push 금지.** 흐름 단위 브랜치 → PR → 팀장이 머지.
  `.githooks/pre-push` 가 막는다 — 문서로만 뒀더니 실제로 어겨져서(화면 5장이 main 에 직접 올라감) 훅으로 강제한다.
- **작업은 이슈 단위** — 화면 1개 = 이슈 1개. 이슈 본문에 Figma 노드·레퍼런스 PNG·완료 기준이 있다.
  PR 본문에 `Closes #N` 을 적으면 머지 시 이슈가 닫힌다.
- 작업 지시는 `docs/작업지시_팀원A.md` · `docs/작업지시_팀원B.md` · 처음이면 `docs/온보딩.md`
- **PR 은 화면 구현·공용 컴포넌트·목데이터/토큰 변경에 올린다.** PR 의 목적은 충돌 방지와
  figma-ref 시각 검수인데, 문서·CI 설정 변경은 둘 다 해당이 없어 작게 묶어 함께 올린다
- **공용 컴포넌트(`src/components/`)는 팀장이 만든다.** 필요한 게 없으면 각자 만들지 말고 요청할 것 — 각자 만들면 크기·비율이 갈린다.
- 계측 `targetId`는 반드시 `src/lib/targetId.ts`의 `tid()`로 만든다. 이름이 갈리면 9/11 집계가 안 된다.
- 커밋 전 `npm run lint:tokens`가 자동으로 돈다(pre-commit 훅). 토큰 이탈은 커밋이 막힌다.

## 디자인 스펙 (구현 기준)
**`docs/디자인스펙.md`가 단일 기준**이고, 스펙 이후의 변경은 **`docs/디자인변경로그.md`가 우선**한다 (충돌 시 로그가 최신). 색·타이포·라운드·간격·컴포넌트 스펙 전부 그 문서대로. 요점:
- 뷰포트 393×852 고정, `max-width:393px` 중앙, `100dvh`(`100vh` 금지)
- 폰트 **Pretendard** (웹폰트, 400/500/700만)
- 색은 스펙 §1의 CSS 변수만 — **토큰 외 색·라운드·폰트 크기 새로 만들기 금지**
- **토큰 vs Figma 충돌 시 토큰이 이긴다** — 스펙 §3은 실제 앱 픽셀 실측 규범이고 Figma는 손으로 그린 산출물이다. 토큰 밖 값을 발견하면 **가장 가까운 토큰으로 스냅해 구현 + 변경로그에 한 줄 보고**(Figma는 팀장이 고침)
- **픽셀 퍼펙트는 목표가 아니다** — Figma는 Noto Sans KR, 브라우저는 Pretendard라 1~2px 차이는 정상. 검수 기준 2개: ① DevTools 값 = 토큰 ② 나란히 놓고 육안 등가. 픽셀 오버레이 비교는 하지 않는다
- 구현 대상 화면의 Figma 레퍼런스 PNG 19장: `docs/figma-ref/` — 구현할 때 옆에 띄우고 검수 때 나란히 비교
- **룩앤필 개선 금지** — 9/11 테스트가 기존 앱 vs 우리 구현 구조 비교라서, "조금 더 예쁘게"가 측정을 오염시킨다
- 라이프 계열 색(`#265BF0` `#3668F6` `#111726` `#495365`) 금지
- 아이콘: `@phosphor-icons/react` `weight="regular"`(탭바만 `fill`) / 3D는 `public/assets/3d/` PNG
- 신한 CI 블루 `#0046FF`는 로고 전용 — 타사 카드·판매사 뱃지에 로고 금지 (계열사 우대 리스크)

## 코드 지도
```
src/app/        App.tsx(라우트 전체) · MockProvider · AnalyticsProvider
src/pages/      화면 1개 = Xxx.tsx + Xxx.module.css
src/components/ 공용 컴포넌트 (팀장 소유) · index.ts 로 배럴 export
src/lib/        targetId·analytics·useTrack·format·coverage·productFilter
src/data/       index.ts(접근 한 층) · mock.ts(원본) · types.ts · copy.ts
src/styles/     tokens.css(스펙 §1 색·간격) · typography.css · global.css
```
**S코드 → 라우트 → 파일** (문서·분담표는 S코드로, 코드는 개념명으로 부른다)

| S코드 | 라우트 | 파일 |
|---|---|---|
| S1-8/9/14 보험 메인 | `/finance/insurance?state=A\|B&custom=off` | `pages/FinanceInsurance.tsx` |
| S1-7 내 보험 | `/finance/insurance/my` | `pages/MyInsurance.tsx` |
| S1-13 기준 시트 | (S1 안의 시트) | `pages/BasisSheet.tsx` |
| S2-A 상품 목록 | `/product/insurance/list` | `pages/ProductList.tsx` |
| S2-D 상품 상세 | `/product/insurance/:productId` | `pages/ProductDetail.tsx` |
| S3-C 진단 결과 | `/diagnosis` | `pages/Diagnosis.tsx` ← **레퍼런스 구현** |
| S3-D 브리핑 | `/diagnosis/briefing` | `pages/Briefing.tsx` |
| S3-E 항목 상세 | `/diagnosis/:itemId` | `pages/ItemDetail.tsx` |
| S3-F·S6-A 에이전트 | `/agent?ctx=…` | `pages/Agent.tsx` |
| S4-A 결제 감지 팝업 | `/home?popup=claim` — 라우트 아닌 홈 위 오버레이 | `pages/ClaimPopup.tsx` |
| S4-D 청구 절차 | `/claim/guide` | `pages/ClaimGuide.tsx` |
| S5-A 알림 설정 | `/claim/settings` | `pages/ClaimSettings.tsx` |
| 청구 완료 | `/claim/done` | `pages/ClaimDone.tsx` |
| 00 메인홈 | `/home` | `pages/Home.tsx` |
| 혜택·주식 스켈레톤 | `/benefit` `/stock` | `pages/Skeleton.tsx` |
| 진행자 내보내기 | `/export` | `pages/Export.tsx` |

각 페이지 파일 **첫 줄 주석에 Figma 노드·figma-ref PNG·그렇게 만든 이유**가 있다 — 고치기 전에 읽을 것.

## 코드 규약
- **화면 1개 = `Xxx.tsx` + `Xxx.module.css`** 짝. 전역 CSS 추가 금지 — 색·간격은 `styles/tokens.css`
- **데이터는 `useMock()`** (`src/data/index.ts`)만 쓴다. 화면에서 `mock.ts` 직접 import 금지 — 실데이터 교체 지점이다
- **계측은 `useTrack()`** — `const track = useTrack(); track(tid(...))`. 화면 이름·과제는 컨텍스트가 채운다
- **모든 화면은 `<AppShell name="S3-C-진단결과">`** 로 감싼다. 이 `name` 이 계측 화면 코드(`lib/targetId.ts` 의 `SCREEN`)와 짝이다 — 빠뜨리면 집계에서 화면이 통째로 사라진다
- 경로 별칭 `@/` = `src/`

## 데이터 규칙
- 목데이터 원본: 디자인 레포 `02_to-be/mock-data.md` → `src/data/mock.ts`. **임의 값 생성 금지.** 나중에 실데이터로 교체할 수 있게 데이터 접근은 한 층으로 모은다.
- 계정 상태 2벌: 상태 B(보유 2건 20대) = 기본 / 상태 A(0건). `?state=A|B` 쿼리 전환.
- **실명·실번호·타사 실제 상품명 금지** — 김신한 / 010-0000-0000 / A생명·D생명.
- 에이전트 대화(S3-F)는 프리셋 고정 응답 — 실제 LLM 붙이지 않는다(테스트 통제 변수).

## 문구 규칙
- UI·문서에 "개선안"·"솔루션"·"MVP"·팀명 금지 (8/25 회의 전 기준 유지 + 사용자 지시 8/25: MVP라고 부르지 않는다).
- 회사 관점 문구 금지("노출 증대"·"가입 전환") — 사용자 관점만.
- 어조는 슈퍼SOL "~해요"체.
- 한국 사회적 상징으로 읽히는 이미지 금지 (노란 리본 = 세월호).

## 계측
모든 탭을 `{taskId, targetId, screen, timestamp}`로 로깅 → localStorage → 진행자용 내보내기 화면(`/export`). **화면 추가 시 계측 누락 금지** — 나중에 소급하면 화면을 다 다시 열어야 한다.

**9/11 비교 지표는 과제 성공률 + 주관 평가(평가지) 2종이다. 클릭 수·시간은 비교에서 뺀다** (2026-08-27 팀장 — 변경로그 "지표 위상 재정의"). 기존 슈퍼쏠은 코드를 못 건드려 자동 계측이 안 되는데, 한쪽만 기계로 세면 그 차이가 우리에게 유리한 편향이 된다. 계측은 **비교 근거가 아니라 우리 앱 내부 진단용**("어디서 헤맸나")으로 쓴다. 지표 가중치·`/moderator` 기기 구성·`taskId` 경계·외부 전송은 **평가지 확정 후로 보류**.

## 스택
Vite + React + TypeScript. 라이브러리 최소(라우터·Phosphor 정도). 백엔드 없음. 정적 배포(Vercel). PWA 메타(`manifest.json` + apple 메타)로 홈 화면 전체화면 실행.

```bash
npm run dev          # Vite 개발 서버
npm run build        # tsc -b && vite build
npm test             # vitest (스모크 = 전 라우트 렌더)
```
**PR 전 CI와 같은 검사를 로컬에서** (승인이 필수가 아니라 CI가 유일한 관문이다):
```bash
npm run lint:tokens && node scripts/check-copy.mjs && npm run check:mock \
  && npm run typecheck && npm run build && npm run check:bundle && npm test
```
`sync:assets`(디자인 레포 토큰·에셋 동기화) · `visual`(시각 회귀, 9/11 이후) 는 필요할 때만.

## 일정
React 1차 구현 8/25~31 → 9/1~ 다듬기·배포 → 🔒 9/11 사용자 테스트 → 9/20 발표. 화면 4~6개(8/25 회의에서 확정).

## 사용자
팀장(`youngjun1227`). 한국어로 소통. 문서·커밋 메시지 한국어. 팀원 2명도 Claude Code로 개발한다.

## 브랜치·CI 확정 (2026-08-26 팀장)
- **main + 짧은 토픽 브랜치** (`feat/s1-main` 등, 화면 단위 1~2일). develop·사람별 장수 브랜치 없음 — 같은 코드베이스라 충돌만 커짐
- **main 직접 push 금지 — 예외 없음(팀장 포함).** GitHub 브랜치 보호 + `.githooks/pre-push` 가 막는다.
  ⚠️ 이 훅은 규칙을 문서로만 뒀다가 실제로 어겨져서(화면 5장이 main 에 직접 올라감) 추가한 것이다
- **force push 전면 금지 — 모든 브랜치, 예외 없음.** GitHub 저장소 룰셋(`non_fast_forward`) +
  `.githooks/pre-push` 가 막는다. 되돌릴 게 있으면 `git revert` 로 새 커밋을 쌓는다.
  ⚠️ 히스토리를 다시 쓰면 남의 커밋이 조용히 사라진다. 팀장이 자기 브랜치에서 force push 를
  했다가 GitHub 워크플로 이벤트가 유실돼 CI 가 아예 안 도는 일도 겪었다
- **PR 은 팀장도 예외 없이 거친다** — figma-ref 비교 스크린샷 포함. 이게 시각 검수의 유일한 관문이다
- **승인 필수 아님 (2026-09-04 팀장)** — 필수 승인 수 0. 팀원이 밤에 올린 PR 이 팀장 확인을 기다리다
  쌓여서 내렸다. 시각 검수는 머지 뒤 팀장이 main 프리뷰를 보며 사후에 한다 — 어긋나면 이슈로 되돌린다
- **Squash merge만** · 머지 후 브랜치 자동 삭제
- **오토머지** (2026-09-04 팀장) — PR 올리고 `gh pr merge <번호> --auto --squash`(또는 PR 화면
  `Enable auto-merge`)를 켜두면 **CI 통과 + main 최신 반영** 조건이 갖춰지는 순간 squash 머지된다.
  main 이 먼저 앞서가면 `Update branch` 를 눌러야 다시 진행된다.
  ⚠️ 켠 뒤에는 브랜치에 커밋을 더 push 하지 말 것 — 머지 뒤에 push 하면 빠진다 (#150 이 그랬다).
  **9/10 프리즈 기간엔 켜지 않는다.**
- CI = 토큰 lint · 문구 컴플라이언스 · 목데이터 정합성 · typecheck/build/번들 · 스모크 · **협업 규칙(9/10 프리즈 · 공용 표면)**
  (`.github/workflows/ci.yml` · 명세 `docs/CI명세.md`). 승인이 필수가 아니라서 CI 가 유일한 관문이다. pre-commit 우회해도 CI가 막는다
- **시각 회귀는 9/11 이후로 보류** (2026-09-04 팀장) — 도구(`playwright.config.ts` · `e2e/visual.spec.ts` ·
  `npm run visual`)와 명세(`docs/CI명세.md`)는 다 있고 CI 잡만 뺐다. 회귀 비교는 화면이 안정된 뒤에야
  값이 나오는데 9/11 까지는 계속 만드는 중이라 기준선 갱신 잡일만 늘고, 첫 기준선을 검수 없이 찍으면
  현재 화면이 그대로 정답으로 굳어 figma-ref 와 어긋난 게 있어도 못 잡는다. 그때까지 화면 검수는 사람이 한다
- **9/10부터 main 프리즈** (9/11 테스트 전날) — 핫픽스만
- 배포: Vercel main=프로덕션 / PR=프리뷰 (✅ 연결 완료 — 프로덕션 https://supersol-insurance-app.vercel.app)
