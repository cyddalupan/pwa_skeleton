#!/bin/bash

echo "🚀 Building Angular Ionic PWA Skeleton..."

# Install dependencies
echo "📦 Installing/updating dependencies..."
npm install

# Build the Angular app
echo "🔨 Building Angular app (production with hash)..."
npm run build:prod

# Copy to public directory
echo "📁 Copying to public directory..."
rm -rf ../public/*
cp -r dist/toybits-pwa-skeleton/* ../public/

# IMPORTANT: DO NOT overwrite the production-built service worker
# The production build generates a proper service worker with cache busting
echo "✅ Production build complete with hashed filenames!"
echo "🌐 Access at: https://pwa.toybits.cloud"
echo ""
echo "📝 Cache busting is now automatic:"
echo "   - Production build uses 'outputHashing: all'"
echo "   - Filenames include content hashes (e.g., main.abc123.js)"
echo "   - Service worker is generated with proper cache strategy"
echo ""
echo "🔄 To update PWA icon:"
echo "   1. Run this build script"
echo "   2. Clear browser cache"
echo "   3. Reinstall PWA"