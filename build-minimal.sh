#!/bin/bash
echo "Building minimal Angular PWA..."

# Create dist directory
mkdir -p dist/toybits-pwa-skeleton

# Copy essential files
cp -r src/* dist/toybits-pwa-skeleton/

# Create index.html from our working version
cp ../public/index.html dist/toybits-pwa-skeleton/

# Create manifest
cp src/manifest.webmanifest dist/toybits-pwa-skeleton/

# Create simple service worker
cat > dist/toybits-pwa-skeleton/sw.js << 'SWEOF'
// Simple service worker
const CACHE_NAME = 'toybits-pwa-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.webmanifest'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
SWEOF

echo "Minimal build created in dist/toybits-pwa-skeleton/"
