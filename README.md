# 슈퍼SOL 보험 탭 UI/UX 개선 — React 구현

신한 슈퍼쏠(SOL) 앱 **보험 탭의 UI/UX 개선(리디자인)** 을 실제로 구현하는 React 프로젝트. 기존 컴포넌트 룩앤필은 유지하고 정보 구조·흐름·배치를 개선한다. 모바일웹(393×852 기준)으로 만들고, 폰 브라우저 링크·홈 화면 추가로 실행한다.

- 디자인 원본(Figma·리서치·토큰): [supersol-insurance-redesign](https://github.com/youngjun1227/supersol-insurance-redesign)
- 구현 기준 문서: [docs/디자인스펙.md](docs/디자인스펙.md)

## 개발

```bash
npm install
npm run dev        # http://localhost:5173 (폰에서는 Network 주소로)
npm run build      # 타입체크 + 프로덕션 빌드
npm run typecheck
```

clone 후 1회:
```bash
git config core.hooksPath .githooks
```

## 3인 개발 — 팀원은 여기부터

작업 지시서를 먼저 읽으세요:
- **팀원 A** → [docs/작업지시_팀원A.md](docs/작업지시_팀원A.md) — S1 보험 메인 계열
- **팀원 B** → [docs/작업지시_팀원B.md](docs/작업지시_팀원B.md) — 청구 흐름 + 메인홈
- 팀장 — 공용 컴포넌트 · S3 진단 계열 · S2 · S6

규칙 요약:
- `main` 직접 push 금지. 흐름 단위 브랜치 → PR → 팀장이 머지
- 토큰 밖 색·라운드·폰트 크기는 **커밋이 막힙니다** (`npm run lint:tokens`)
- 계측 `targetId`는 `src/lib/targetId.ts`의 `tid()`로만
- 공용 컴포넌트는 팀장이 만듭니다 — 없으면 직접 만들지 말고 요청

디자인 레포에서 에셋(3D 일러스트·로고) 가져오기 — 형제 폴더에 `../SOL_UI:UX_Redesign` 전제:
```bash
npm run sync:assets
```

## 구조

| 경로 | 무엇 |
|---|---|
| `src/styles/tokens.css` | 디자인 토큰 — 스펙 §1·§2·§3. **여기 없는 색·라운드·폰트 크기는 만들지 않는다** |
| `src/styles/typography.css` | 타이포 13단계 유틸 클래스 (`.t-h1` 등). `font-size` 직접 쓰지 않기 |
| `src/components/` | 공통 셸 — `AppShell` `Header` `TopTabs` `TabBar` `Button` `BottomCTA` |
| `src/data/` | 목데이터와 접근 층. 화면은 `useMock()`만 쓴다 |
| `src/lib/analytics.ts` | 계측 — `{taskId, targetId, screen, timestamp}` → localStorage |
| `src/lib/useTrack.ts` | 화면에서 쓰는 계측 훅 |
| `src/pages/Export.tsx` | 진행자용 내보내기 (`/export`) |

## 계정 상태

`?state=B` 보유 2건 20대 (기본) · `?state=A` 0건.
링크에 붙여 쓰면 됩니다 — 예: `/finance?state=A`

## 계측

화면을 추가하면 계측도 같이 붙입니다 (누락 금지).

```tsx
<AppShell name="S1-보험메인" …>   // 화면 진입 자동 기록
const track = useTrack()
<button onClick={() => { track('현황카드'); … }}>   // 탭 기록
```

진행자는 `/export`에서 과제별 요약(성공/클릭 수/시간/난이도)을 보고 CSV·JSON으로 내려받습니다.
참가자를 바꿀 때 "다음 참가자 (세션 새로 시작)"를 누릅니다.

## 일정
1차 구현 8/25~31 → 배포·다듬기 → 9/11 사용자 테스트 → 9/20 발표 → 이후 기능 확장.
