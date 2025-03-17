import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chat with AI: Chrome Built-in Gemini Nano Prompt API',
  description:
    "Explore Chrome's built-in AI with Gemini Nano Prompt API. Generate text, answer questions, and chat with AI—directly in your browser. Try it now!",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
