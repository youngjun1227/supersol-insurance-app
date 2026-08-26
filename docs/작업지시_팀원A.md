# 작업지시 — 팀원 A (S1 보험 메인 계열) · `Jongkwang131`

> 슈퍼SOL 보험 탭 React 구현. **Figma에 있는 화면을 그대로 코드로 옮기는 일**입니다.
> 새로 디자인하지 않습니다 — 판단이 필요하면 팀장에게 물어보세요.

## 1. 시작하기 (한 번만)

```bash
git clone https://github.com/youngjun1227/supersol-insurance-app
cd supersol-insurance-app
git config core.hooksPath .githooks   # ← 빼먹으면 커밋 규칙이 안 걸립니다
npm install
npm run dev                            # http://localhost:5173
```

폰에서 볼 때는 `npm run dev`가 찍어주는 **Network 주소**로 접속하세요 (같은 와이파이).

작업 브랜치:
```bash
git switch -c feat/s1-main
```
**`main`에 직접 push하지 마세요.** PR을 올리면 팀장이 머지합니다.
`.githooks/pre-push` 가 자동으로 막습니다 (clone 후 `git config core.hooksPath .githooks` 를 했다면).

```bash
git push -u origin feat/...   # 브랜치는 통과
git push origin main          # ❌ 훅이 거부
git push --force              # ❌ 모든 브랜치에서 거부
```

되돌릴 게 있으면 `git revert` 로 새 커밋을 쌓으세요. `--amend` 후 force push 는 막힙니다.

PR 을 올리면 **팀장 승인 1개 + CI 통과** 후 머지됩니다.
PR 에 "out-of-date" 가 뜨면 `Update branch` — 자세한 건 `docs/온보딩.md` 참고.
(팀장도 PR 은 똑같이 올립니다 — 승인만 자기가 생략합니다. 승인해줄 사람이 팀장뿐이라서요.)

## 2. 맡은 화면

| 화면 | 라우트 | Figma 레퍼런스 | 비고 |
|---|---|---|---|
| S1-9 보험 메인 (보유 2건) | `/finance/insurance?state=B` | `docs/figma-ref/S1-9-보험메인-2건.png` | **기본 상태** |
| S1-8 보험 메인 (0건) | `/finance/insurance?state=A` | `docs/figma-ref/S1-8-보험메인-0건.png` | 분리형 진단 카드 |
| S1-14 보험 메인 (맞춤 OFF) | `/finance/insurance?state=B&custom=off` | `docs/figma-ref/S1-14-보험메인-맞춤OFF.png` | 또래·우선순위 문구 **없음** |
| S1-7 내 보험 | `/finance/insurance/my` | `docs/figma-ref/S1-7-내보험.png` | 하단 "보험 홈으로" |
| S1-13 기준 시트 | 오버레이 (라우트 아님) | `docs/figma-ref/S1-13-기준시트.png` | 토글이 `custom=off`를 만듦 |

**핵심: 라우트 하나에 상태 3개입니다.** `custom=off`는 라우트가 아니라 S1-13 시트의 토글 결과예요.

⚠️ **S1-14에 통합형 문구를 재사용하지 마세요.** 맞춤을 껐는데 "또래 78%"·"우선순위"가 나오면 전제와 모순됩니다. Figma 레퍼런스를 그대로 따르세요.

## 3. 반드시 지킬 것

### 토큰만 사용
- 색·라운드·폰트 크기는 `src/styles/tokens.css`에 있는 것만. **새로 만들지 마세요.**
- 글자는 `.t-h1` `.t-body-sm` 같은 유틸 클래스 (`src/styles/typography.css`)
- 커밋할 때 자동으로 검사합니다. 위반하면 **커밋이 막힙니다.**
- 미리 확인: `npm run lint:tokens`

### 목데이터는 임의로 바꾸지 않습니다

`src/data/mock.ts` 값은 디자인 레포 `02_to-be/mock-data.md` 가 원본입니다.
필요한 값이 없으면 **지어내지 말고 팀장에게 요청**하세요.

커밋할 때 `npm run check:mock` 이 자동으로 돌아 원본과 어긋나면 막습니다.
(카테고리 분류를 AS-IS/TO-BE 섞어 넣었다가 화면에 "건강 7"이 뜨고서야 발견한 적이 있어 생긴 검사입니다.)

### 아이콘은 쓰는 것만 명시적으로 import

```tsx
import { Tooth, Virus } from '@phosphor-icons/react'   // ✅
import * as Phosphor from '@phosphor-icons/react'       // ❌ 이름으로 조회하면
const Icon = Phosphor[name]                             //    아이콘 전체가 번들에 들어감
```

폰으로 링크를 열어 하는 테스트라 초기 로딩이 곧 체감입니다.
CI 에서 번들 상한(gzip 200KB)을 검사합니다 — 실제로 317KB → 5.2MB 가 된 적이 있습니다.

### Figma에 토큰 밖 값이 있으면
Figma는 손으로 그린 산출물이라 가끔 규범을 벗어납니다.
→ **가장 가까운 토큰으로 스냅해서 구현**하고, `docs/디자인변경로그.md`에 한 줄 남기세요. Figma는 팀장이 고칩니다.

### 픽셀 퍼펙트는 목표가 아닙니다
Figma는 Noto Sans KR, 브라우저는 Pretendard라 1~2px 차이는 정상입니다. 쫓지 마세요.
검수 기준은 두 개뿐: **① DevTools 값이 토큰과 일치 ② 나란히 놓고 육안 등가**

### 계측 (9/11 테스트의 존재 이유)
탭 가능한 모든 요소에 계측을 붙입니다. **누락 금지.**

```tsx
import { useTrack } from '@/lib/useTrack'
import { tid, SCREEN, ELEMENT } from '@/lib/targetId'

const track = useTrack()

<button onClick={() => { track(tid(SCREEN.s1, ELEMENT.카드, '현황')); goStatus() }}>
```

⚠️ **`targetId`를 손으로 쓰지 마세요.** 반드시 `tid()`를 씁니다 — 3명이 각자 이름을 지으면 집계가 안 됩니다.

화면 진입은 `<AppShell name="...">`이 자동으로 기록합니다.

## 4. 쓸 수 있는 것

```tsx
import { AppShell, Header, TabBar, Button } from '@/components'
import { useMock } from '@/app/MockProvider'

const { data, state, customOn } = useMock()   // 목데이터 + 상태
```

- **목데이터는 `src/data/mock.ts`** — 값을 지어내지 마세요. 필요한 값이 없으면 팀장에게 요청.
- **공용 컴포넌트는 팀장이 만듭니다.** 필요한 게 없으면 직접 만들지 말고 요청하세요 (각자 만들면 크기·비율이 갈립니다).

## 5. 레퍼런스 구현

**`src/pages/Diagnosis.tsx`(S3-C)를 먼저 열어보세요.** 팀장이 먼저 만든 화면이고, 여기에 규칙이 다 들어 있습니다:

- `<AppShell name="...">` 사용법 (화면 진입 계측이 자동)
- `tid()`로 targetId 만들기 — 탭 타깃이 2개일 때 분리하는 법 포함
- 공용 컴포넌트 조합 (`Battery` `Badge` `Card` `TierHeader` `CoverageRow` `MoreToggle`)
- `copy.ts`에서 문구 가져다 쓰기
- `footerType` 지정 (탭바/CTA/입력바/없음)

같이 볼 것: `docs/figma-ref/S3-C-진단결과-접힘.png` — 이 PNG와 위 코드를 나란히 보면
"Figma를 코드로 옮긴다"가 무슨 뜻인지 바로 보입니다.

## 6. 막히면

- 화면 구성이 애매하다 → `docs/figma-ref/` PNG를 먼저 보고, 그래도 모르면 팀장
- 목데이터에 값이 없다 → **지어내지 말고** 팀장에게 요청
- 문구가 애매하다 → `docs/디자인변경로그.md` 확인 → 없으면 팀장
- 스펙 원본: `docs/디자인스펙.md` (색·타이포·크기), `docs/디자인변경로그.md` (그 이후 변경 — **충돌 시 로그가 최신**)
