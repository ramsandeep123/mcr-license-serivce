#!/usr/bin/env bash
set -e

echo "🚀 Starting Render build..."

echo "📦 Installing npm packages..."
npm install

echo "📂 Creating Puppeteer cache directory..."
mkdir -p /opt/render/.cache/puppeteer

echo "🌐 Installing Chrome for Puppeteer..."
npx puppeteer browsers install chrome --cache-dir=/opt/render/.cache/puppeteer

# Dynamically fetch executable path
CHROME_PATH=$(npx puppeteer browsers executable-path chrome --cache-dir=/opt/render/.cache/puppeteer)

echo "✅ Chrome installed at: $CHROME_PATH"

# Save it into .env so your Node app can use it
echo "PUPPETEER_EXECUTABLE_PATH=$CHROME_PATH" > .env

echo "🎉 Render build script completed" 
