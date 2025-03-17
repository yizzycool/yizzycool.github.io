import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Base64 to Image Converter – Decode & Restore Images Online',
  description:
    'Convert Base64-encoded text back to images with our free online tool. Supports PNG, JPG, and more. Fast, secure, and works in your browser. Try it now!',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
