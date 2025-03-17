import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Translator: Instant Text Translation with Chrome Built-in AI',
  description:
    "Translate text instantly with Chrome's built-in AI. Get fast, accurate translations in multiple languages—directly in your browser. Try now!",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
