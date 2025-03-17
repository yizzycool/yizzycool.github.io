import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Image to Base64 Converter – Fast & Free Online Tool',
  description:
    'Easily convert images to Base64 encoding with our free online tool. Supports PNG, JPG, GIF, and more. Fast, secure, and works directly in your browser. Try now!',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
