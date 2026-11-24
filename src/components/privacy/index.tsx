import Link from 'next/link';
import {
  ArrowUpRight,
  BarChart3,
  Mail,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';

import { DEFAULT_DOMAIN } from '@/data/global';
import { socialHrefMap } from '@/components/shared/social-icons/constants';

const HIGHLIGHTS = [
  {
    icon: ShieldCheck,
    title: '100% Client-Side Tools',
    description:
      'Files, images, and inputs stay inside your browser and are never uploaded to our servers.',
  },
  {
    icon: BarChart3,
    title: 'Transparent Ads & Analytics',
    description:
      'Clear disclosure of Google Ads, Google AdSense, and Google Tag Manager usage.',
  },
  {
    icon: SlidersHorizontal,
    title: 'Your Data, Your Control',
    description:
      'Clear local browser storage or opt out of personalized ads at any time.',
  },
];

const EXTERNAL_LINK_CLASS =
  'inline-flex items-center gap-0.5 font-medium text-sky-600 underline decoration-sky-500/40 underline-offset-4 transition-colors hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300';

export default function PrivacyPolicy() {
  const siteUrl = process.env.NEXT_PUBLIC_DOMAIN || DEFAULT_DOMAIN;
  const siteName = process.env.NEXT_PUBLIC_WEBSITE_NAME || 'Yizzy Peasy';

  return (
    <main className="mx-auto min-h-dvh max-w-3xl px-5 pb-24 pt-[128px] lg:px-8">
      {/* Header */}
      <header className="mb-10">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-3 py-1 text-xs font-medium text-slate-600 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/70 dark:text-slate-300">
          <ShieldCheck size={14} className="text-sky-500" />
          <span>Last updated: November 25, 2026</span>
        </div>

        <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl dark:text-white">
          Privacy Policy
        </h1>

        <p className="mt-3 text-base leading-relaxed text-slate-600 dark:text-slate-400">
          This Privacy Policy explains how{' '}
          <strong className="font-semibold text-slate-800 dark:text-slate-200">
            {siteName}
          </strong>{' '}
          (
          <span className="font-mono text-sm text-slate-700 dark:text-slate-300">
            {siteUrl}
          </span>
          ) handles data across technical blog articles and browser-based web
          utilities, including our use of Google Analytics, Google Tag Manager,
          Google Ads, and Google AdSense.
        </p>
      </header>

      {/* At-a-Glance Highlights */}
      <section
        aria-label="Privacy Highlights"
        className="mb-12 grid gap-4 sm:grid-cols-3"
      >
        {HIGHLIGHTS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200/80 bg-white/70 p-4 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/60"
            >
              <div className="mb-2.5 inline-flex size-8 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400">
                <Icon size={17} />
              </div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {item.title}
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                {item.description}
              </p>
            </div>
          );
        })}
      </section>

      {/* Structured Sections */}
      <article className="space-y-8 rounded-3xl border border-slate-200/80 bg-white/75 p-6 text-sm leading-relaxed text-slate-600 backdrop-blur-sm sm:p-8 dark:border-neutral-800 dark:bg-neutral-900/65 dark:text-slate-300">
        <section className="space-y-2.5">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            1. Overview
          </h2>
          <p>
            {siteName} is a personal software engineering blog and collection of
            client-side web utilities operated by Yizzy Wu. We respect your
            privacy and aim to collect only the minimum information required to
            measure site performance, support advertising, and keep the platform
            free for everyone.
          </p>
        </section>

        <section className="space-y-2.5 border-t border-slate-200/70 pt-6 dark:border-neutral-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            2. Client-Side Tools &amp; Local Browser Storage
          </h2>
          <p>
            Interactive tools on this site—such as Photo Editor Studio, PicMerge
            Studio, Markdown Notes, format converters, and Chrome Built-in AI
            utilities—execute{' '}
            <strong className="font-semibold text-slate-800 dark:text-slate-100">
              100% locally in your browser
            </strong>
            . Images, documents, notes, and text inputs you open or create are
            never uploaded to our servers.
          </p>
          <p>
            To improve usability, the site stores non-sensitive UI preferences
            and optional local workspaces in your browser via{' '}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-800 dark:bg-neutral-800 dark:text-slate-200">
              localStorage
            </code>{' '}
            and{' '}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-800 dark:bg-neutral-800 dark:text-slate-200">
              IndexedDB
            </code>{' '}
            (such as theme selection, sidebar collapse state, favorite tools,
            draft projects, and execution history snapshots). This data never
            leaves your device and can be paused or wiped anytime from the{' '}
            <Link href="/tools" className={EXTERNAL_LINK_CLASS}>
              Tools Directory
            </Link>{' '}
            settings modal or your browser settings.
          </p>
        </section>

        <section className="space-y-2.5 border-t border-slate-200/70 pt-6 dark:border-neutral-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            3. Analytics &amp; Tag Management
          </h2>
          <p>
            We use{' '}
            <strong className="font-semibold text-slate-800 dark:text-slate-100">
              Google Tag Manager (GTM)
            </strong>{' '}
            and analytics services to understand aggregated traffic patterns,
            popular articles or tools, and overall performance. These tools may
            set cookies or collect pseudonymous technical signals such as
            browser type, viewport dimensions, referring pages, and page
            interaction events.
          </p>
        </section>

        <section className="space-y-2.5 border-t border-slate-200/70 pt-6 dark:border-neutral-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            4. Advertising (Google Ads &amp; Google AdSense)
          </h2>
          <p>
            We use{' '}
            <strong className="font-semibold text-slate-800 dark:text-slate-100">
              Google Ads
            </strong>{' '}
            (including conversion measurement and remarketing) and may display
            third-party advertisements via{' '}
            <strong className="font-semibold text-slate-800 dark:text-slate-100">
              Google AdSense
            </strong>
            .
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Third-party vendors, including Google, use cookies or similar
              identifiers to serve ads based on your prior visits to {siteName}{' '}
              or other websites on the internet.
            </li>
            <li>
              Google&apos;s use of advertising cookies enables it and its
              partners to serve ads to you based on your visits to this site
              and/or other sites across the web.
            </li>
            <li>
              You may opt out of personalized advertising by visiting{' '}
              <a
                href="https://adssettings.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className={EXTERNAL_LINK_CLASS}
              >
                Google Ads Settings
                <ArrowUpRight size={13} />
              </a>{' '}
              or visiting{' '}
              <a
                href="https://www.aboutads.info/choices/"
                target="_blank"
                rel="noopener noreferrer"
                className={EXTERNAL_LINK_CLASS}
              >
                AboutAds Consumer Choices
                <ArrowUpRight size={13} />
              </a>
              .
            </li>
            <li>
              Learn more about how Google processes partner data in{' '}
              <a
                href="https://policies.google.com/technologies/partner-sites"
                target="_blank"
                rel="noopener noreferrer"
                className={EXTERNAL_LINK_CLASS}
              >
                How Google uses information from sites or apps that use our
                services
                <ArrowUpRight size={13} />
              </a>
              .
            </li>
          </ul>
        </section>

        <section className="space-y-2.5 border-t border-slate-200/70 pt-6 dark:border-neutral-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            5. Embedded Third-Party Services &amp; External Links
          </h2>
          <p>
            Blog articles embed{' '}
            <strong className="font-semibold text-slate-800 dark:text-slate-100">
              Giscus
            </strong>
            , an open-source comment system powered by GitHub Discussions. When
            you choose to sign in and leave a comment, GitHub&apos;s own privacy
            policy applies to your authentication and posted content. This
            website also links to external platforms such as GitHub, LinkedIn,
            and Buy Me a Coffee, whose privacy practices are governed by their
            respective policies.
          </p>
        </section>

        <section className="space-y-2.5 border-t border-slate-200/70 pt-6 dark:border-neutral-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            6. Cookies, Consent &amp; Your Privacy Rights
          </h2>
          <p>
            You can instruct your browser to refuse all cookies or notify you
            when a cookie is being set. When accessing this site from regions
            with statutory consent requirements—including the European Economic
            Area (EEA), the United Kingdom, and Switzerland—you can grant,
            customize, or withdraw your consent for analytics and personalized
            advertising at any time through the consent management controls
            displayed on the site.
          </p>
        </section>

        <section className="space-y-2.5 border-t border-slate-200/70 pt-6 dark:border-neutral-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            7. Policy Updates &amp; Contact
          </h2>
          <p>
            We may update this Privacy Policy periodically to reflect regulatory
            updates or changes to site features. Any revisions will be reflected
            with an updated revision date at the top of this page.
          </p>
          <p>
            If you have any questions about this Privacy Policy or how data is
            handled, please contact Yizzy Wu:
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href={socialHrefMap.email}
              aria-label="Send an email to Yizzy Wu"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-sky-400/60 hover:text-sky-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-slate-200 dark:hover:border-sky-500/50 dark:hover:text-sky-400"
            >
              <Mail size={14} />
              <span>Email</span>
            </a>
            <a
              href={socialHrefMap.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-sky-400/60 hover:text-sky-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-slate-200 dark:hover:border-sky-500/50 dark:hover:text-sky-400"
            >
              <span>LinkedIn</span>
              <ArrowUpRight size={13} />
            </a>
            <a
              href={socialHrefMap.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-sky-400/60 hover:text-sky-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-slate-200 dark:hover:border-sky-500/50 dark:hover:text-sky-400"
            >
              <span>GitHub</span>
              <ArrowUpRight size={13} />
            </a>
          </div>
        </section>
      </article>
    </main>
  );
}
