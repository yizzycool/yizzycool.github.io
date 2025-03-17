import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Writer: Generate Engaging Content with Chrome Built-in AI',
  description:
    "Create high-quality content effortlessly with Chrome's built-in AI Writer. Generate articles, blogs, and creative text in seconds. Try it today!",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
