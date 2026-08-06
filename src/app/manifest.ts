import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Yizzy Peasy | Coding Life',
    short_name: 'Yizzy Peasy',
    description:
      'Focused on programming and frontend development, sharing technical articles and useful tools to help developers improve their skills and efficiency.',
    start_url: '/?utm_source=pwa&utm_medium=homescreen',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#0f172a',
    orientation: 'portrait',
    icons: [
      {
        'src': '/icons/icon-192x192.png',
        'type': 'image/png',
        'sizes': '192x192',
      },
      {
        'src': '/icons/icon-384x384.png',
        'type': 'image/png',
        'sizes': '384x384',
      },
      {
        'src': '/icons/icon-512x512.png',
        'type': 'image/png',
        'sizes': '512x512',
      },
      {
        'src': '/icons/icon-512x512.png',
        'type': 'image/png',
        'sizes': '512x512',
        'purpose': 'maskable',
      },
    ],
  };
}
