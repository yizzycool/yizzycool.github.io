import type { Metadata } from 'next';

import urlJoin from 'url-join';

import seoUtils from '@/utils/seo-utils';
import { GlimmerBackground } from '@/components/ui/glimmer-background';
import GlimmerBackgroundConfigs from '@/data/glimmer-background-config/resume';
import Resume from '@/components/resume';

const domain = process.env.NEXT_PUBLIC_DOMAIN || '';

const meta = {
  url: urlJoin(domain, 'resume'),
  title: 'Resume | Yizzy Peasy',
  description:
    'Experience, skills, and background of Yizzy Wu. Focused on Frontend Engineering, React, Next.js, and Web Development.',
  og: {
    siteName: 'Yizzy Peasy',
    title: 'Resume | Yizzy Peasy',
    description:
      'Experience, skills, and background of Yizzy Wu. Focused on Frontend Engineering, React, Next.js, and Web Development.',
    image: {
      url: urlJoin(domain, '/assets/images/home/og-image.jpg'),
      width: 1200,
      height: 630,
      alt: 'Banner image',
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
    type: 'profile',
  },
  twitter: {
    card: 'summary',
    title: meta.og.title,
    description: meta.og.description,
    images: [meta.og.image.url],
  },
};

export default function ResumePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(seoUtils.generateResumeJsonLd()),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(seoUtils.generateResumeBreadcrumbJsonLd()),
        }}
      />
      <GlimmerBackground configs={GlimmerBackgroundConfigs} />
      <Resume />
    </>
  );
}
