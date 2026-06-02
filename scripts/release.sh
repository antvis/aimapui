#!/bin/bash
set -e

# ──────────────────────────────────────────────
# aimapui 发布脚本
# 用法:
#   ./scripts/release.sh <version>            # 自动 bump + 构建 + 提交 + 发布
#   ./scripts/release.sh <version> --otp=xxx  # 带 2FA 验证码发布
#   ./scripts/release.sh --publish-only        # 跳过 bump/构建，仅发布（版本已 bump 时使用）
#   ./scripts/release.sh --publish-only --otp=xxx
# 示例:
#   ./scripts/release.sh 0.2.0
#   ./scripts/release.sh 0.3.0 --otp=123456
#   ./scripts/release.sh --publish-only --otp=123456
# ──────────────────────────────────────────────

VERSION=""
OTP_ARG=""
PUBLISH_ONLY=false

for arg in "$@"; do
  case $arg in
    --otp=*)
      OTP_ARG="--otp=${arg#--otp=}"
      ;;
    --publish-only)
      PUBLISH_ONLY=true
      ;;
    *)
      VERSION="$arg"
      ;;
  esac
done

if [ "$PUBLISH_ONLY" = false ] && [ -z "$VERSION" ]; then
  echo "Usage:"
  echo "  ./scripts/release.sh <version> [options]"
  echo "  ./scripts/release.sh --publish-only [options]"
  echo ""
  echo "Options:"
  echo "  --otp=<code>       npm 2FA 验证码"
  echo "  --publish-only     跳过 bump/构建，仅发布"
  echo ""
  echo "Examples:"
  echo "  ./scripts/release.sh 0.2.0"
  echo "  ./scripts/release.sh 0.3.0 --otp=123456"
  echo "  ./scripts/release.sh --publish-only --otp=123456"
  exit 1
fi

# ── 1. Bump 版本号 ────────────────────────────
if [ "$PUBLISH_ONLY" = false ]; then
  echo "📦 Bumping version to $VERSION..."

  cd packages/core
  npm version "$VERSION" --no-git-tag-version
  cd ../..

  cd packages/cli
  npm version "$VERSION" --no-git-tag-version
  cd ../..

  # ── 2. 构建 ─────────────────────────────────
  echo "🔨 Building @antv/aimapui..."
  pnpm --filter @antv/aimapui build

  echo "🔨 Building @antv/aimapui-cli..."
  pnpm --filter @antv/aimapui-cli build

  # ── 3. 提交版本变更 ─────────────────────────
  echo "📝 Committing version bump..."
  git add packages/core/package.json packages/cli/package.json
  git commit -m "chore: release v${VERSION}"
  git tag "v${VERSION}"
fi

# ── 4. 发布 ──────────────────────────────────
CURRENT_VERSION=$(node -p "require('./packages/core/package.json').version")
echo "📤 Publishing @antv/aimapui@${CURRENT_VERSION}..."
cd packages/core
npm publish --access public $OTP_ARG
cd ../..

echo "📤 Publishing @antv/aimapui-cli@${CURRENT_VERSION}..."
cd packages/cli
npm publish --access public $OTP_ARG
cd ../..

echo "✅ Released v${CURRENT_VERSION} successfully!"
echo ""
echo "Don't forget to push:"
echo "  git push && git push --tags"
