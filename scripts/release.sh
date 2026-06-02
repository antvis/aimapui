#!/bin/bash
set -e

# 获取版本号参数
VERSION=$1

if [ -z "$VERSION" ]; then
  echo "Usage: ./scripts/release.sh <version>"
  echo "Example: ./scripts/release.sh 0.2.0"
  exit 1
fi

echo "🚀 Releasing v${VERSION}..."

# 1. 同步版本号到两个发布包
echo "📦 Syncing version to $VERSION..."
cd packages/core
npm version "$VERSION" --no-git-tag-version
cd ../..

cd packages/cli
npm version "$VERSION" --no-git-tag-version
cd ../..

# 2. 构建两个包
echo "🔨 Building @antv/aimapui..."
pnpm --filter @antv/aimapui build

echo "🔨 Building @antv/aimapui-cli..."
pnpm --filter @antv/aimapui-cli build

# 3. 提交版本变更
echo "📝 Committing version bump..."
git add packages/core/package.json packages/cli/package.json
git commit -m "chore: release v${VERSION}"
git tag "v${VERSION}"

# 4. 发布两个包
echo "📤 Publishing @antv/aimapui@${VERSION}..."
cd packages/core
npm publish --access public
cd ../..

echo "📤 Publishing @antv/aimapui-cli@${VERSION}..."
cd packages/cli
npm publish --access public
cd ../..

echo "✅ Released v${VERSION} successfully!"
echo ""
echo "Don't forget to push:"
echo "  git push && git push --tags"
