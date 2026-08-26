# 작업지시 — 팀원 B (청구 흐름 + 메인홈)

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

## 2. 맡은 화면

| 화면 | 라우트 | Figma 레퍼런스 | 비고 |
|---|---|---|---|
| 00 메인홈 | `/` | `docs/figma-ref/00-메인홈.png` | 앱 켠 직후. 계좌 9,250,000원 / 카드 122,400원 |
| S4-A 결제 감지 팝업 | 오버레이 (메인홈 위) | `docs/figma-ref/S4-A-결제감지팝업.png` | 라우트 아님 |
| S5-A 알림 설정·동의 | `/claim/settings` | `docs/figma-ref/S5-A-알림설정.png` | 하단 고정 버튼 |
| S4-D 청구 절차 안내 | `/claim/guide` | `docs/figma-ref/S4-D-청구절차.png` | 하단 고정 CTA |
| 청구 완료 | `/claim/done` | `docs/figma-ref/청구완료.png` | 하단 고정 CTA |

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
| 00 메인홈 | ✅ 있음 | — |
| S5-A · S4-D · 청구완료 | ✗ 없음 | **하단 고정 CTA/버튼** |

서브 화면에는 **탭바가 없습니다.** 뒤로가기 헤더 + 하단 고정 버튼입니다.

## 3. 반드시 지킬 것

### 토큰만 사용
- 색·라운드·폰트 크기는 `src/styles/tokens.css`에 있는 것만. **새로 만들지 마세요.**
- 글자는 `.t-h1` `.t-body-sm` 같은 유틸 클래스 (`src/styles/typography.css`)
- 커밋할 때 자동으로 검사합니다. 위반하면 **커밋이 막힙니다.**
- 미리 확인: `npm run lint:tokens`

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

## 5. 막히면

- 화면 구성이 애매하다 → `docs/figma-ref/` PNG를 먼저 보고, 그래도 모르면 팀장
- 목데이터에 값이 없다 → **지어내지 말고** 팀장에게 요청
- 문구가 애매하다 → `docs/디자인변경로그.md` 확인 → 없으면 팀장
- 스펙 원본: `docs/디자인스펙.md` (색·타이포·크기), `docs/디자인변경로그.md` (그 이후 변경 — **충돌 시 로그가 최신**)
