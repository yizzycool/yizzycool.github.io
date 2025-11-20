import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'URL Encoder / Decoder - Free Online URL Encoding & Decoding Tool',
  description:
    'Free online URL Encoder and Decoder tool. Instantly encode or decode URLs, handle UTF-8 characters, and convert special characters for web development and API testing.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
