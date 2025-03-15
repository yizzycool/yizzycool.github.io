import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Image to Base64 Converter',
  description:
    'Convert images to Base64 effortlessly with our free online tool. Supports PNG, JPG, GIF, and more. Fast, secure, and no installation required. Try now!',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
