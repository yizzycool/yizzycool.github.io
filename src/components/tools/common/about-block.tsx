'use client';

import { usePathname } from 'next/navigation';
import { findKey, get } from 'lodash';
import { Info, ShieldCheck } from 'lucide-react';

import { cn } from '@/utils/cn';
import useGetTransitionClass from '@/hooks/animation/use-get-transition-class';
import { Badge } from '@/components/ui/badge';
import { ToolTitles, ToolUrls, NON_CLIENT_SIDE_TOOLS } from '@/data/tools';
import { ToolAbout } from '@/data/tools/about';

export default function AboutBlock() {
  const pathname = usePathname();
  const { getFadeUpClass } = useGetTransitionClass();

  const toolKey = findKey(ToolUrls, (url) => url === pathname);

  if (!toolKey) return null;

  const title = get(ToolTitles, [toolKey]);
  const about = get(ToolAbout, [toolKey]);

  if (!about) return null;

  const isClientSidePrivate = !NON_CLIENT_SIDE_TOOLS.includes(toolKey);
  const isString = typeof about === 'string';
  const overview = isString ? about : about.overview;
  const features = isString ? undefined : about.features;
  const bottomNote = isString ? undefined : about.bottomNote;

  return (
    <section
      aria-labelledby="about-tool-heading"
      className={cn(
        'mt-20 border-t border-slate-200/60 pt-8 text-left sm:mt-24 sm:pt-10 dark:border-neutral-800/60',
        getFadeUpClass('animate-delay-300')
      )}
    >
      {/* Header Row: Title on Left, 100% Private Badge on Right */}
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-slate-400 dark:text-neutral-500">
          <Info size={13} className="shrink-0 opacity-70" />
          <h2
            id="about-tool-heading"
            className="text-xs font-medium tracking-wide text-slate-400 dark:text-neutral-500"
          >
            About {title}
          </h2>
        </div>
        {isClientSidePrivate && (
          <Badge
            variant="neutral"
            size="xs"
            rounded="full"
            bordered
            icon={ShieldCheck}
            className="border-slate-200/60 bg-transparent text-[11px] text-slate-400 opacity-80 dark:border-neutral-800/80 dark:text-neutral-500"
          >
            100% Private
          </Badge>
        )}
      </div>

      {/* Description Body */}
      <p className="text-xs leading-relaxed text-slate-400/90 dark:text-neutral-500">
        {overview}
      </p>

      {/* Feature Highlights (SEO & List Snippet) */}
      {features && features.length > 0 && (
        <ul className="mt-3 space-y-1.5 text-xs leading-relaxed text-slate-400/85 dark:text-neutral-500">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-300 dark:bg-neutral-700" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Bottom Note */}
      {bottomNote && (
        <p className="mt-3 text-[11px] italic leading-relaxed text-slate-400/60 dark:text-neutral-600">
          {bottomNote}
        </p>
      )}
    </section>
  );
}
