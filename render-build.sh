#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -o errexit

echo "🚀 Starting Render build..."

# Step 1: Install Node dependencies
echo "📦 Installing npm packages..."
npm install

# Step 2: Ensure Puppeteer cache dir exists
echo "📂 Creating Puppeteer cache directory..."
mkdir -p /opt/render/.cache/puppeteer

# Step 3: Install Chrome into the cache dir
echo "🌐 Installing Chrome for Puppeteer..."
npx puppeteer browsers install chrome --path /opt/render/.cache/puppeteer

# Step 4: List installed Chrome for debugging
echo "✅ Installed Chrome versions in Puppeteer cache:"
ls -la /opt/render/.cache/puppeteer/chrome || true

# Step 5: Done
echo "🎉 Render build script completed!"
