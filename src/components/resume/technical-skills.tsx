'use client';

import SkillsData from './data/skills.json';
import RevealSection from '@/components/common/reveal-section';
import { cn } from '@/utils/cn';

export default function TechnicalSkills() {
  return (
    <RevealSection>
      <section id="technical-skills">
        <h3
          className={cn(
            'mb-6 border-b-2 border-slate-100 pb-2 text-xl font-bold text-slate-900',
            'dark:border-slate-700/50 dark:text-white'
          )}
        >
          Technical Skills
        </h3>

        <div className="space-y-4">
          {SkillsData.map((group) => (
            <div key={group.category}>
              <h4
                className={cn(
                  'mb-2 text-sm font-semibold uppercase tracking-wider',
                  'text-slate-800 dark:text-slate-200'
                )}
              >
                {group.category}
              </h4>
              <div className="flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <span
                    key={skill}
                    className={cn(
                      'print-exact cursor-default rounded-lg border px-3 py-1 text-sm font-medium transition-colors print:text-black',
                      group.category === 'Frontend Architecture'
                        ? [
                            'border-transparent bg-indigo-100 text-indigo-700 hover:bg-indigo-200/70',
                            'dark:border-indigo-800/50 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50',
                            'print:border-gray-300',
                          ]
                        : [
                            'border-transparent bg-slate-100 text-slate-700 hover:bg-slate-200',
                            'dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-300 dark:hover:bg-slate-700',
                          ]
                    )}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </RevealSection>
  );
}
