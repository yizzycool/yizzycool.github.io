import type { Metadata } from 'next';

import urlJoin from 'url-join';

import seoUtils from '@/utils/seo-utils';
import GlimmerBackground from '@/components/common/glimmer-background';
import GlimmerBackgroundConfigs from '@/data/glimmer-background-config/resume';
import Resume from '@/components/resume';

const domain = process.env.NEXT_PUBLIC_DOMAIN || '';
const resumeUrl = urlJoin(domain, 'resume');

export const metadata: Metadata = {
  title: 'Resume | Yizzy Peasy',
  description:
    'Experience, skills, and background of Yizzy Wu. Focused on Frontend Engineering, React, Next.js, and Web Development.',
  alternates: {
    canonical: resumeUrl,
  },
  openGraph: {
    title: 'Resume | Yizzy Peasy',
    description:
      'Experience, skills, and background of Yizzy Wu. Focused on Frontend Engineering, React, Next.js, and Web Development.',
    url: resumeUrl,
    type: 'profile',
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
