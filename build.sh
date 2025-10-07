#!/bin/bash
set -e

# Verify VITE environment variables are available
echo "🔍 Checking build-time environment variables..."

if [ -z "$VITE_SUPABASE_URL" ]; then
  echo "❌ ERROR: VITE_SUPABASE_URL is not set during build!"
  echo "This variable must be available at BUILD time, not just runtime."
  exit 1
fi

if [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
  echo "❌ ERROR: VITE_SUPABASE_ANON_KEY is not set during build!"
  echo "This variable must be available at BUILD time, not just runtime."
  exit 1
fi

echo "✅ VITE_SUPABASE_URL is available at build time"
echo "✅ VITE_SUPABASE_ANON_KEY is available at build time"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🏗️  Building application..."
npm run build

echo "✅ Build complete!"
