import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowUpRight,
  Github,
  Linkedin,
  Mail,
  ShieldCheck,
} from 'lucide-react';

import { socialHrefMap } from '@/components/shared/social-icons/constants';

const EXPLORE_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Blog', href: '/blog' },
  { label: 'Tools Directory', href: '/tools' },
  { label: 'Resume', href: '/resume' },
];

const FEATURED_TOOL_LINKS = [
  { label: 'Photo Editor Studio', href: '/tools/image-tool/photo-editor' },
  { label: 'PicMerge Studio', href: '/tools/image-tool/pic-merge-studio' },
  {
    label: 'Markdown Notes',
    href: '/tools/everyday-life-tool/markdown-notes',
  },
  { label: 'JSON Formatter', href: '/tools/dev-tool/json-formatter' },
  {
    label: 'QR Code Generator',
    href: '/tools/everyday-life-tool/qr-code-generator',
  },
];

const SOCIAL_LINKS = [
  {
    label: 'GitHub',
    href: socialHrefMap.github,
    icon: Github,
    external: true,
  },
  {
    label: 'LinkedIn',
    href: socialHrefMap.linkedin,
    icon: Linkedin,
    external: true,
  },
  {
    label: 'Email Yizzy Wu',
    href: socialHrefMap.email,
    icon: Mail,
    external: false,
  },
];

const LINK_CLASS =
  'text-sm text-slate-600 transition-colors hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400';

export default function Footer() {
  const siteName = process.env.NEXT_PUBLIC_WEBSITE_NAME || 'Yizzy Peasy';
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-neutral-400/20 bg-white/60 backdrop-blur-sm dark:bg-neutral-950/40">
      <div className="mx-auto max-w-screen-2xl px-6 lg:px-10">
        {/* Top Multi-Column Grid */}
        <div className="grid grid-cols-1 gap-10 py-12 sm:grid-cols-2 md:grid-cols-12 lg:py-16">
          {/* Brand Column */}
          <div className="space-y-4 sm:col-span-2 md:col-span-5">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 text-slate-900 transition-opacity hover:opacity-85 dark:text-white"
            >
              <Image
                src="/assets/images/header/logo.png"
                width={28}
                height={28}
                alt="Yizzy Peasy Logo"
              />
              <span className="text-base font-bold tracking-tight">
                {siteName}
              </span>
            </Link>

            <p className="max-w-sm text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Frontend engineering notes and 100% client-side web tools built
              for speed, craftsmanship, and privacy.
            </p>

            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300">
              <ShieldCheck size={13} />
              <span>100% Client-Side Tools</span>
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              {SOCIAL_LINKS.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    aria-label={item.label}
                    {...(item.external
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                    className="inline-flex size-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white/80 text-slate-600 transition-colors hover:border-sky-400/50 hover:text-sky-600 dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-slate-400 dark:hover:border-sky-500/40 dark:hover:text-sky-400"
                  >
                    <Icon size={16} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Explore Column */}
          <div className="md:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Explore
            </h3>
            <ul className="mt-4 space-y-2.5">
              {EXPLORE_LINKS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={LINK_CLASS}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Featured Tools Column */}
          <div className="md:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Featured Tools
            </h3>
            <ul className="mt-4 space-y-2.5">
              {FEATURED_TOOL_LINKS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={LINK_CLASS}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & More Column */}
          <div className="md:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Legal &amp; More
            </h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link href="/privacy" className={LINK_CLASS}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <a href={socialHrefMap.email} className={LINK_CLASS}>
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="https://www.buymeacoffee.com/yizzypeasy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${LINK_CLASS} inline-flex items-center gap-1`}
                >
                  <span>Buy Me a Coffee</span>
                  <ArrowUpRight size={13} />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200/70 py-6 text-xs text-slate-500 sm:flex-row dark:border-neutral-800/80 dark:text-slate-400">
          <p>
            &copy; {currentYear} {siteName}. Crafted by{' '}
            <a
              href={socialHrefMap.github}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-slate-700 underline decoration-slate-300 underline-offset-4 transition-colors hover:text-sky-600 dark:text-slate-300 dark:decoration-neutral-700 dark:hover:text-sky-400"
            >
              Yizzy Wu
            </a>
            .
          </p>

          <div className="flex items-center gap-3">
            <Link
              href="/privacy"
              className="transition-colors hover:text-sky-600 dark:hover:text-sky-400"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
