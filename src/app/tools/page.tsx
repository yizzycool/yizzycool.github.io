import type { Metadata } from 'next';
import urlJoin from 'url-join';
import seoUtils from '@/utils/seo-utils';
import ToolsIndex from '@/components/tools';

const domain = process.env.NEXT_PUBLIC_DOMAIN || '/';

const meta = {
  url: urlJoin(domain, 'tools'),
  title: 'Tools Box | Yizzy Peasy',
  description:
    'Truly free daily utilities, image editors, developer toolkits, and Built-in Chrome AI Assistant. 完全免費的日常小工具、圖片編輯器、開發工具箱及 Chrome 內建 AI 助手。',
  og: {
    siteName: 'Yizzy Peasy',
    title: 'Tools Box | Yizzy Peasy — 實用開發與線上工具箱',
    description:
      'Truly free daily utilities, image editors, developer toolkits, and Built-in Chrome AI Assistant. 完全免費的日常小工具、圖片編輯器、開發工具箱及 Chrome 內建 AI 助手。',
    image: {
      url: urlJoin(domain, '/assets/images/tools/og-image.jpg'),
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
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: meta.og.title,
    description: meta.og.description,
    images: [meta.og.image.url],
  },
};

export default function ToolsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(seoUtils.generateToolsJsonLd()),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(seoUtils.generateToolsBreadcrumbJsonLd()),
        }}
      />
      <ToolsIndex />
    </>
  );
}
