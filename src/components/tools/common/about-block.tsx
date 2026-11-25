'use client';

import { usePathname } from 'next/navigation';
import { findKey, get } from 'lodash';
import { Check, Info, ShieldCheck } from 'lucide-react';

import { NON_CLIENT_SIDE_TOOLS, ToolTitles, ToolUrls } from '@/data/tools';
import { ToolAbout } from '@/data/tools/about';
import useGetTransitionClass from '@/hooks/animation/use-get-transition-class';
import { cn } from '@/utils/cn';

/** Splits `"Heading: Description"` strings at the first colon separator for scannable rendering. */
function parseFeature(feature: string): {
  heading: string | null;
  description: string;
} {
  const idx = feature.indexOf(': ');
  if (idx > 0) {
    return {
      heading: feature.slice(0, idx),
      description: feature.slice(idx + 2),
    };
  }
  return { heading: null, description: feature };
}

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
        'mt-14 border-t border-slate-200/60 pt-8 text-left dark:border-neutral-800/60',
        getFadeUpClass('animate-delay-300')
      )}
    >
      {/* Header Row: Aligned with RelatedToolsBlock */}
      <div className="mb-5 flex items-center gap-1.5 text-slate-500 dark:text-neutral-400">
        <Info size={14} className="shrink-0 text-sky-500 dark:text-sky-400" />
        <h2
          id="about-tool-heading"
          className="text-xs font-semibold uppercase tracking-wider"
        >
          About {title}
        </h2>
      </div>

      {/* Frameless Editorial Split: intentionally flat & receded from elevated workspace cards */}
      <div
        className={
          features && features.length > 0
            ? 'grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10'
            : 'max-w-3xl'
        }
      >
        <div
          className={
            features && features.length > 0 ? 'lg:col-span-5' : undefined
          }
        >
          <p className="text-[13px] leading-relaxed text-slate-500 dark:text-neutral-400">
            {overview}
          </p>

          {bottomNote && (
            <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-slate-400 dark:text-neutral-500">
              {isClientSidePrivate ? (
                <ShieldCheck
                  size={14}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-emerald-500/80 dark:text-emerald-400/80"
                />
              ) : (
                <Info
                  size={14}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-slate-400/90 dark:text-neutral-500"
                />
              )}
              <span>{bottomNote}</span>
            </p>
          )}
        </div>

        {features && features.length > 0 && (
          <ul className="grid grid-cols-1 gap-x-7 gap-y-4 sm:grid-cols-2 lg:col-span-7">
            {features.map((feature, idx) => {
              const { heading, description } = parseFeature(feature);
              return (
                <li key={idx} className="flex items-start gap-2.5">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sky-500/10 text-sky-600 dark:bg-sky-400/10 dark:text-sky-400"
                  >
                    <Check size={10} strokeWidth={2.5} />
                  </span>
                  <div className="min-w-0 space-y-0.5">
                    {heading && (
                      <p className="text-xs font-medium leading-snug text-slate-600 dark:text-neutral-300">
                        {heading}
                      </p>
                    )}
                    <p className="text-xs leading-relaxed text-slate-500/85 dark:text-neutral-400/90">
                      {description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
