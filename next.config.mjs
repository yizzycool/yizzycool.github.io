import NextBundleAnalyzer from '@next/bundle-analyzer';
import withSerwistInit from '@serwist/next';

// PWA (Service Worker) configuration using Serwist
const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  // Disable Service Worker in development mode, unless TEST_PWA is explicitly set to 'true'
  disable:
    process.env.NODE_ENV === 'development' && process.env.TEST_PWA !== 'true',
});

// To visualize bundle size
const withBundleAnalyzer = NextBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default withBundleAnalyzer(withSerwist(nextConfig));
