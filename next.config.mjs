import NextBundleAnalyzer from '@next/bundle-analyzer';
import withSerwistInit from '@serwist/next';

const isDev = process.env.NODE_ENV === 'development';
const isTestPwa = process.env.TEST_PWA === 'true';
const isAnalyze = process.env.ANALYZE === 'true';

// PWA (Service Worker) configuration using Serwist
const shouldEnableSerwist = !isDev || isTestPwa;
const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  disable: !shouldEnableSerwist,
});

// To visualize bundle size
const withBundleAnalyzer = NextBundleAnalyzer({
  enabled: isAnalyze,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },
};

let finalConfig = nextConfig;

if (shouldEnableSerwist) {
  finalConfig = withSerwist(finalConfig);
}

if (isAnalyze) {
  finalConfig = withBundleAnalyzer(finalConfig);
}

export default finalConfig;
