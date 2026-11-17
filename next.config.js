// The Android app (Capacitor) bundles a static export of the site: `npm run build:app`.
const isAppBuild = process.env.BUILD_TARGET === 'app';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  // no service worker inside the native app: its files are already on the device
  disable: process.env.NODE_ENV === 'development' || isAppBuild,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {},
  typescript: {
    ignoreBuildErrors: true,
  },
  ...(isAppBuild && {
    output: 'export',
    trailingSlash: true, // every route becomes folder/index.html, which the WebView serves directly
    images: { unoptimized: true },
  }),
};

module.exports = withPWA(nextConfig);
