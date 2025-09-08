#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "🚀 Starting Render build..."

echo "📦 Installing npm packages..."
npm install

# Uncomment if your project needs a build step
# echo "🏗️ Running project build..."
# npm run build

echo "📂 Ensuring Puppeteer cache directories exist..."
PUPPETEER_CACHE_DIR=/opt/render/.cache/puppeteer
BUILD_CACHE_DIR=/opt/render/project/src/.cache/puppeteer
mkdir -p $PUPPETEER_CACHE_DIR
mkdir -p $BUILD_CACHE_DIR

echo "🌐 Installing Chrome for Puppeteer..."
npx puppeteer browsers install chrome

echo "💾 Syncing Puppeteer cache..."
if [[ ! -d $PUPPETEER_CACHE_DIR/chrome ]]; then
  echo "➡️ Copying Chrome from build cache to runtime cache..."
  cp -R $BUILD_CACHE_DIR/chrome/ $PUPPETEER_CACHE_DIR || echo "⚠️ No Chrome found in build cache, skipping..."
else
  echo "⬅️ Storing runtime cache back into build cache..."
  cp -R $PUPPETEER_CACHE_DIR/chrome/ $BUILD_CACHE_DIR
fi

echo "✅ Render build script completed successfully!"
