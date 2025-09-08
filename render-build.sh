#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "🚀 Starting Render build..."

echo "📦 Installing npm packages..."

npm install

# Uncomment if your project needs a build step
# echo "🏗️ Running project build..."
# npm run build

echo "📂 Ensuring Puppeteer cache directory exists..."
PUPPETEER_CACHE_DIR=/opt/render/.cache/puppeteer
mkdir -p $PUPPETEER_CACHE_DIR

echo "🌐 Installing Chrome for Puppeteer..."
npx puppeteer browsers install chrome

echo "💾 Syncing Puppeteer cache..."
if [[ ! -d $PUPPETEER_CACHE_DIR/chrome ]]; then
  echo "➡️ Copying Chrome from build cache to runtime cache..."
  cp -R /opt/render/project/src/.cache/puppeteer/chrome/ $PUPPETEER_CACHE_DIR
else
  echo "⬅️ Storing runtime cache back into build cache..."
  cp -R $PUPPETEER_CACHE_DIR /opt/render/project/src/.cache/puppeteer/chrome/
fi

echo "✅ Render build script completed successfully!"
