import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Summarizer: Get Instant Summaries with Chrome Built-in AI',
  description:
    "Summarize articles, documents, and text instantly with Chrome's built-in AI. Extract key insights and save time. Try it online now!",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
