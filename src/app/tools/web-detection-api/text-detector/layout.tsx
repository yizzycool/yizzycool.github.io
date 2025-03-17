import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Text Detection API: Extract Text from Images with Chrome Web API',
  description:
    "Use Chrome's Text Detection API to recognize and extract text from images and documents. Fast, accurate, and browser-native AI. Try it today!",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
