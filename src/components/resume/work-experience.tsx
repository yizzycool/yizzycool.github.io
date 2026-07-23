'use client';

import { Check, ExternalLink } from 'lucide-react';

import { cn } from '@/utils/cn';
import ExperienceData from './data/experiences.json';
import RevealSection from '@/components/common/reveal-section';

export default function WorkExperience() {
  return (
    <RevealSection>
      <section id="work-experience" className="mb-20">
        <h3
          className={cn(
            'mb-6 border-b-2 border-slate-100 pb-2 text-xl font-bold text-slate-900',
            'dark:border-slate-700/50 dark:text-white'
          )}
        >
          Work Experience
        </h3>

        {ExperienceData.map((exp) => (
          <div key={exp.corpName} className="relative mb-8">
            {/* Timeline Dot */}
            <div
              className={cn(
                'absolute -left-3 top-2.5 hidden h-2 w-2 rounded-full bg-indigo-500',
                'sm:block md:-left-4 dark:bg-indigo-400 print:hidden'
              )}
            />

            <div className="mb-2 flex flex-col justify-between sm:flex-row sm:items-baseline">
              <h4 className="flex items-center gap-2 text-lg font-bold">
                <span className="text-slate-900 dark:text-white">
                  {exp.jobTitle}
                </span>
                <span className="mx-1">|</span>
                <a
                  href={exp.corpLink}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center gap-1 font-semibold hover:underline"
                >
                  {exp.corpName}
                  <ExternalLink className="h-4 w-4" />
                </a>
              </h4>
              <span className="mt-1 whitespace-nowrap text-sm text-slate-500 sm:mt-0 dark:text-slate-400">
                {exp.duration}
              </span>
            </div>

            {exp.domains.map((domain, dIdx) => (
              <div
                key={domain.title}
                className={cn('mt-6', dIdx === 0 && 'mt-5')}
              >
                <h5 className="mb-2 flex items-center gap-2 text-base font-semibold text-slate-800 dark:text-slate-200">
                  <Check
                    className="h-3 w-3 rounded-full bg-indigo-500 p-0.5 text-white dark:bg-indigo-400 dark:text-slate-900"
                    strokeWidth={4}
                  />
                  {domain.title}
                </h5>
                <ul
                  className={cn(
                    'list-disc space-y-1.5 pl-5 text-sm md:text-base',
                    'leading-relaxed marker:text-slate-300 sm:pl-8',
                    'dark:marker:text-slate-600 [&_b]:font-medium [&_b]:text-slate-700 dark:[&_b]:text-slate-300'
                  )}
                >
                  {domain.highlights.map((highlight, idx) => (
                    <li
                      key={idx}
                      dangerouslySetInnerHTML={{ __html: highlight }}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))}
      </section>
    </RevealSection>
  );
}
