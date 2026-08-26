#!/usr/bin/env bash
# 팀원이 초대를 수락한 뒤 이슈를 배정한다.
# 수락 전에는 assignee 지정이 안 되므로(GitHub 제약) 이슈 생성 때 못 붙였다.
#
#   bash scripts/assign-issues.sh
set -euo pipefail

REPO="youngjun1227/supersol-insurance-app"
A="Jongkwang131"        # 팀원 A — 아이디어 2 (S1 계열)
B="leechanyoung0710"    # 팀원 B — 아이디어 3 (청구 흐름)

# 아직 수락 안 한 사람이 있으면 알려주고 멈춘다
PENDING="$(gh api "repos/$REPO/invitations" --jq '.[].invitee.login' 2>/dev/null || true)"
if [ -n "$PENDING" ]; then
  echo "⚠️ 아직 초대를 수락하지 않은 계정이 있습니다:"
  echo "$PENDING" | sed 's/^/   /'
  echo "   수락 후 다시 실행하세요."
  exit 1
fi

echo "팀원 A ($A) — 아이디어 2"
for n in 6 7 8 9 10; do
  gh issue edit "$n" --repo "$REPO" --add-assignee "$A" >/dev/null && echo "  ✓ #$n"
done

echo "팀원 B ($B) — 아이디어 3"
for n in 11 12 13 14; do
  gh issue edit "$n" --repo "$REPO" --add-assignee "$B" >/dev/null && echo "  ✓ #$n"
done

echo "완료. gh issue list 로 확인하세요."
