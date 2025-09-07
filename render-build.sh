#!/usr/bin/env bash
set -e

echo "🚀 Starting Render build..."

echo "📦 Installing npm packages..."
npm install

echo "📂 Creating Puppeteer cache directory..."
mkdir -p /opt/render/.cache/puppeteer

echo "🌐 Installing Chrome for Puppeteer..."
npx puppeteer browsers install chrome --cache-dir=/opt/render/.cache/puppeteer

# Export path so server can use it
export PUPPETEER_EXECUTABLE_PATH="/opt/render/.cache/puppeteer/chrome/linux-140.0.7339.80/chrome-linux64/chrome"

echo "✅ Chrome installed at: $PUPPETEER_EXECUTABLE_PATH"
echo "🎉 Render build script completed!"
