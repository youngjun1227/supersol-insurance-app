# 작업지시 — 팀원 B (아이디어 3 청구 흐름 + 진행자 화면)

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
git switch -c feat/claim-flow
```
**`main`에 직접 push하지 마세요.** PR을 올리면 팀장이 머지합니다.
`.githooks/pre-push` 가 자동으로 막습니다 (clone 후 `git config core.hooksPath .githooks` 를 했다면).

```bash
git push -u origin feat/...   # 브랜치는 통과
git push origin main          # ❌ 훅이 거부
```

## 2. 맡은 화면

**아이디어 3 — 신한카드 결제 감지 → 보험금 청구 알림** 한 벌을 맡습니다.

| 화면 | 라우트 | Figma 레퍼런스 | 비고 |
|---|---|---|---|
| S4-A 결제 감지 팝업 | 오버레이 (메인홈 위) | `docs/figma-ref/S4-A-결제감지팝업.png` | 라우트 아님. **메인홈은 팀장이 만듭니다** — 그 위에 얹기만 하면 돼요 |
| S5-A 알림 설정·동의 | `/claim/settings` | `docs/figma-ref/S5-A-알림설정.png` | opt-in 동의 화면. 하단 고정 버튼 |
| S4-D 청구 절차 안내 | `/claim/guide` | `docs/figma-ref/S4-D-청구절차.png` | 하단 고정 CTA |
| 청구 완료 | `/claim/done` | `docs/figma-ref/청구완료.png` | 하단 고정 CTA |

### 추가 — 진행자 화면 `/moderator` (Figma 없음)

9/11 테스트를 진행할 때 **진행자가 별도 기기에서 여는 화면**입니다. 참가자에게는 안 보여요.

- 과제 4개 중 하나를 골라 **시작** → 참가자가 조작 → **성공/실패/포기** 기록 → **난이도 7점** 입력
- 쓸 함수는 이미 있습니다: `useAnalytics()`의 `startTask` · `endTask` · `rateDifficulty`
- 참가자용이 아니라서 **디자인 부담이 없습니다** — 토큰만 지키고 크고 누르기 쉽게
- 결과 확인·내보내기는 이미 만들어진 `/export`가 담당합니다 (참고: `src/pages/Export.tsx`)
- 과제 4개 정의는 `docs/디자인변경로그.md` 참고

### ⚠️ 컴플라이언스 문구 — 임의 수정 절대 금지

멘토 요구사항입니다. **`src/data/copy.ts`의 `CLAIM_COMPLIANCE`를 그대로 쓰세요.**

| 자리 | 문구 |
|---|---|
| 제목 (팝업·카톡·잠금·배너 공통) | "이 진료비, 보험금 청구가 **가능할 수 있어요**" |
| S4-A 팝업 부제 아래 | "지급 여부·금액은 가입한 보험에 따라 다르며, 심사 후 결정돼요" |

**"청구할 수 있어요" 같은 단정 표현은 규정 위반입니다.** 문구를 줄이거나 다듬지 마세요.

### 하단 처리 (Figma 실측 — 스펙 §4의 예외가 있습니다)

| 화면 | 탭바 | 하단 |
|---|---|---|
| S5-A · S4-D · 청구완료 | ✗ 없음 | **하단 고정 CTA/버튼** |
| `/moderator` | ✗ 없음 | 자유 (진행자용) |

서브 화면에는 **탭바가 없습니다.** 뒤로가기 헤더 + 하단 고정 버튼입니다.

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

<button onClick={() => { track(tid(SCREEN.s4Guide, ELEMENT.버튼, '청구하기')); goClaim() }}>
```

⚠️ **`targetId`를 손으로 쓰지 마세요.** 반드시 `tid()`를 씁니다 — 3명이 각자 이름을 지으면 집계가 안 됩니다.

화면 진입은 `<AppShell name="...">`이 자동으로 기록합니다.

## 4. 쓸 수 있는 것

```tsx
import { AppShell, Header, TabBar, Button } from '@/components'
import { useMock } from '@/app/MockProvider'

const { data, state } = useMock()   // 목데이터 + 상태
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
