import type { Metadata } from 'next';

import urlJoin from 'url-join';

import seoUtils from '@/utils/seo-utils';
import PrivacyPolicy from '@/components/privacy';

const domain = process.env.NEXT_PUBLIC_DOMAIN || '';

const meta = {
  url: urlJoin(domain, 'privacy'),
  title: 'Privacy Policy | Yizzy Peasy',
  description:
    'Privacy Policy for Yizzy Peasy. Learn how client-side tools protect your files locally and how Google Analytics, Google Ads, and Google AdSense cookies are handled.',
  og: {
    siteName: 'Yizzy Peasy',
    title: 'Privacy Policy | Yizzy Peasy',
    description:
      'Transparent privacy policy covering 100% client-side tools, local browser storage, analytics, and advertising.',
    image: {
      url: urlJoin(domain, '/assets/images/home/og-image.jpg'),
      width: 1200,
      height: 630,
      alt: 'Yizzy Peasy Privacy Policy',
    },
  },
};

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  alternates: {
    canonical: meta.url,
  },
  openGraph: {
    title: meta.og.title,
    description: meta.og.description,
    url: meta.url,
    siteName: meta.og.siteName,
    images: [meta.og.image],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: meta.og.title,
    description: meta.og.description,
    images: [meta.og.image.url],
  },
};

export default function PrivacyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(seoUtils.generatePrivacyBreadcrumbJsonLd()),
        }}
      />
      <PrivacyPolicy />
    </>
  );
}
