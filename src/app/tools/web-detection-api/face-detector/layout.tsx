import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Face Detection API: Detect Faces Instantly with Chrome Web API',
  description:
    "Detect faces in images and videos using Chrome's Face Detection API. Real-time AI-powered recognition with built-in browser support. Try now!",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
