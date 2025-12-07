'use client';

import { GraduationCap } from 'lucide-react';
import EducationData from './data/educations.json';
import RevealSection from '@/components/common/reveal-section';
import _get from 'lodash/get';

export default function Education() {
  return (
    <div className="relative">
      <div id="education" className="mx-auto max-w-screen-xl">
        <RevealSection className="flex items-center gap-4">
          <div className="rounded-xl bg-purple-500/10 p-3 text-purple-600 dark:text-purple-400">
            <GraduationCap size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Education</h2>
            <p className="text-neutral-500 dark:text-neutral-400">
              Academic background
            </p>
          </div>
        </RevealSection>
        {EducationData.map((data) => (
          <RevealSection key={data.name}>
            <div className="mt-20 border-t border-neutral-300 py-12 lg:grid lg:grid-cols-3 dark:border-neutral-500">
              <div>{data.duration}</div>
              <div className="col-span-2">
                <div className="text-2xl font-bold">{data.name}</div>
                <div className="mt-5">{data.department}</div>
              </div>
            </div>
          </RevealSection>
        ))}
      </div>
    </div>
  );
}
