#!/usr/bin/env bash
# 디자인 레포 → 개발 레포 에셋 동기화.
# 디자인 레포가 원본이다. 이쪽에서 고치지 말고 항상 이 스크립트로 가져온다.
#
#   npm run sync:assets
#   DESIGN_REPO=/다른/경로 npm run sync:assets
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DESIGN_REPO="${DESIGN_REPO:-$ROOT/../SOL_UI:UX_Redesign}"

if [ ! -d "$DESIGN_REPO" ]; then
  echo "✗ 디자인 레포를 찾을 수 없어요: $DESIGN_REPO" >&2
  echo "  형제 폴더로 clone 하거나 DESIGN_REPO 환경변수로 경로를 넘겨주세요." >&2
  echo "  git clone https://github.com/youngjun1227/supersol-insurance-redesign" >&2
  exit 1
fi

echo "디자인 레포: $DESIGN_REPO"

# 1) 3D 일러스트 (Fluent Emoji 3D, MIT)
SRC_3D="$DESIGN_REPO/00_reference/assets/fluent-3d"
DST_3D="$ROOT/public/assets/3d"
mkdir -p "$DST_3D"
rsync -a --delete --include='*.png' --include='README.md' --exclude='*' "$SRC_3D/" "$DST_3D/"
echo "✓ 3D 일러스트 $(find "$DST_3D" -name '*.png' | wc -l | tr -d ' ')개"

# 2) 로고 (신한 CI — 자사 표기 전용)
SRC_LOGO="$DESIGN_REPO/00_reference/logo"
DST_LOGO="$ROOT/public/assets/logo"
mkdir -p "$DST_LOGO"
cp "$SRC_LOGO/shc_symbol_ci_trim.png" "$DST_LOGO/shinhan-symbol.png"
cp "$SRC_LOGO/shinhanlife_logo.png"   "$DST_LOGO/shinhanlife.png"
cp "$SRC_LOGO/슈퍼쏠앱아이콘_투명.png"  "$DST_LOGO/app-icon.png"
echo "✓ 로고 3개"

# 3) 디자인 스펙은 자동으로 덮어쓰지 않는다 — 차이만 알려준다.
# (이쪽 문구 규칙으로 손본 부분이 있어 맹목적 cp는 위험)
SPEC_SRC="$DESIGN_REPO/03_final-ui/개발-디자인스펙.md"
if [ -f "$SPEC_SRC" ] && ! diff -q "$SPEC_SRC" "$ROOT/docs/디자인스펙.md" >/dev/null 2>&1; then
  echo "⚠ docs/디자인스펙.md 가 디자인 레포 원본과 달라요."
  echo "  확인: diff \"$SPEC_SRC\" docs/디자인스펙.md"
  echo "  반영할 거면 직접 cp 하세요 (문구 규칙 손본 부분이 있을 수 있음)."
fi

echo "완료. 바뀐 게 있으면 git status로 확인하세요."
