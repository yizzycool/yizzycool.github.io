import type { Metadata } from 'next';
import urlJoin from 'url-join';
import seoUtils from '@/utils/seo-utils';
import ToolsIndex from '@/components/tools';

const domain = process.env.NEXT_PUBLIC_DOMAIN || '/';
const url = urlJoin(domain, 'tools');

export const metadata: Metadata = {
  title: 'Tools Box | Yizzy Peasy',
  description:
    'Truly free daily utilities, image editors, developer toolkits, and Built-in Chrome AI Assistant. 真・完全免費的日常小工具、圖片編輯器、開發工具箱及 Chrome 內建 AI 助手。',
  alternates: {
    canonical: url,
  },

  openGraph: {
    title: 'Tools Box | Yizzy Peasy — 實用開發與線上工具箱',
    description:
      'Truly free daily utilities, image editors, developer toolkits, and Built-in Chrome AI Assistant. 真・完全免費的日常小工具、圖片編輯器、開發工具箱及 Chrome 內建 AI 助手。',
    url,
    siteName: 'Yizzy Peasy',
    images: [
      {
        url: urlJoin(domain, 'assets/images/home/avatar.jpg'),
        width: 600,
        height: 600,
      },
    ],
    type: 'website',
  },

  twitter: {
    card: 'summary',
    title: 'Tools Box | Yizzy Peasy — 實用開發與線上工具箱',
    description:
      'Truly free daily utilities, image editors, developer toolkits, and Built-in Chrome AI Assistant. 真・完全免費的日常小工具、圖片編輯器、開發工具箱及 Chrome 內建 AI 助手。',
    images: [urlJoin(domain, 'assets/images/home/avatar.jpg')],
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
      <ToolsIndex />
    </>
  );
}
