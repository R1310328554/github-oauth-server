#!/usr/bin/env bash
# Push vendored ./admin frontend to the standalone github-oauth-admin repo.
# Requires: git + gh authenticated as a user with write access.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ADMIN_SRC="${ROOT_DIR}/admin"
TARGET_DIR="${1:-/tmp/github-oauth-admin-push}"
BRANCH="cursor/multi-oauth-providers-33c8"
REPO_URL="${ADMIN_REPO_URL:-https://github.com/R1310328554/github-oauth-admin.git}"

if [[ ! -d "${ADMIN_SRC}" ]]; then
  echo "Missing vendored frontend at ${ADMIN_SRC}" >&2
  exit 1
fi

rm -rf "${TARGET_DIR}"
git clone "${REPO_URL}" "${TARGET_DIR}"
cd "${TARGET_DIR}"
git checkout -B "${BRANCH}"

# Replace tree with vendored admin sources (keep .git)
find . -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +
cp -a "${ADMIN_SRC}/." .

git add -A
if git diff --cached --quiet; then
  echo "No changes to commit."
else
  git commit -m "feat: redesign Nexus Auth UI for multi-provider OAuth"
fi

git push -u origin "${BRANCH}"
echo "Pushed ${BRANCH}. Create PR with:"
echo "  gh pr create --repo R1310328554/github-oauth-admin --base master --head ${BRANCH} --title \"feat: 多平台 OAuth2 登录前端\" --body \"配合 github-oauth-server 多平台登录改造。\""
