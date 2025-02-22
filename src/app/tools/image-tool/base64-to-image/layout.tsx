import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Base64 Image Viewer | Base64 to Image Converter',
  description:
    'Paste your Base64 image code to instantly decode and display the image. Free Base64 to image converter, supporting PNG, JPG, and GIF. No downloads required—just paste and view!',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
