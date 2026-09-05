'use client';

import EducationData from './data/educations.json';
import { RevealSection } from '@/components/ui/reveal-section';
import { cn } from '@/utils/cn';

export default function Education() {
  return (
    <RevealSection>
      <section id="education" className="mb-20">
        <h3
          className={cn(
            'mb-6 border-b-2 border-slate-100 pb-2 text-xl font-bold text-slate-900',
            'dark:border-slate-700/50 dark:text-white'
          )}
        >
          Education
        </h3>

        <div className="space-y-6">
          {EducationData.map((edu) => (
            <div key={edu.school} className="relative">
              {/* Timeline Dot */}
              <div
                className={cn(
                  'absolute -left-3 top-2 hidden h-2 w-2 rounded-full bg-slate-300',
                  'sm:block md:-left-4 dark:bg-slate-600 print:hidden'
                )}
              />
              <div className="mb-1 flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
                <h4 className="flex items-center gap-1.5 text-base font-bold text-slate-900 md:text-lg dark:text-white">
                  {edu.degree}
                  <span className="mx-1 hidden text-slate-400 sm:inline dark:text-slate-600">
                    |
                  </span>
                  <br className="sm:hidden" />
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {edu.school}
                  </span>
                </h4>
                <span className="mt-1 whitespace-nowrap text-sm text-slate-500 sm:mt-0 dark:text-slate-400">
                  {edu.duration}
                </span>
              </div>
              <ul
                className={cn(
                  'ml-1 space-y-1 border-l-2 border-slate-100 pl-3 text-sm text-slate-600',
                  'sm:ml-0 sm:pl-4 md:text-base dark:border-slate-700/50 dark:text-slate-400'
                )}
              >
                {edu.highlights.map((item, idx) => (
                  <li key={idx} dangerouslySetInnerHTML={{ __html: item }}></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </RevealSection>
  );
}
