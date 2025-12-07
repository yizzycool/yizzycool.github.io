'use client';

import ExperienceData from './data/experiences.json';
import {
  Briefcase,
  Building2,
  Layers,
  SquarePen,
  WandSparkles,
} from 'lucide-react';
import RevealSection from '@/components/common/reveal-section';
import _get from 'lodash/get';

export default function WorkExperience() {
  return (
    <div id="work-experience" className="mx-auto max-w-screen-xl">
      <RevealSection className="flex items-center gap-4">
        <div className="rounded-xl bg-blue-500/10 p-3 text-blue-600 dark:text-blue-400">
          <Briefcase size={28} />
        </div>
        <div>
          <h2 className="text-3xl font-bold">Work Experience</h2>
          <p className="text-neutral-500 dark:text-neutral-400">
            My professional journey
          </p>
        </div>
      </RevealSection>

      {ExperienceData.map((data) => (
        <div key={data.duration} className="mt-10">
          {/* Corp Info */}
          <RevealSection>
            <div className="mt-2 text-xl">{data.jobTitle}</div>
            <div className="mt-2 text-base">{data.duration}</div>
            <div className="mt-2 flex items-center text-sm">
              <Building2 className="mr-2 h-5 w-5" />
              <a
                className="underline"
                href={data.corpLink}
                target="_blank"
                rel="noreferrer noopener"
              >
                {data.corpName}
              </a>
            </div>
          </RevealSection>

          {/* Cards - Work Content */}
          <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-2 xl:grid-cols-3">
            {data.descriptions.map((desc) => (
              <RevealSection key={desc.title}>
                <div className="bg-mix-black-5 dark:bg-mix-white-5 flex gap-6 overflow-hidden rounded-lg px-8 py-8 ring-1 ring-inset ring-black/10 dark:ring-white/10">
                  <div>
                    <JobIcon
                      iconType={desc.iconType}
                      className="mt-1 h-6 w-6 text-sky-600"
                    />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-black dark:text-white">
                      {desc.title}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {desc.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-sky-50 px-2 py-1 text-xs text-sky-700 ring-1 ring-inset ring-blue-700/10 dark:bg-sky-800 dark:text-blue-50"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4">
                      {desc.items.map((item) => (
                        <div
                          key={item}
                          className="mt-4 text-base/7"
                          dangerouslySetInnerHTML={{ __html: item }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function JobIcon({
  iconType,
  className = '',
}: {
  iconType: string;
  className: string;
}) {
  if (iconType === 'pencil-square') {
    return <SquarePen className={className} />;
  } else if (iconType === 'sparkles') {
    return <WandSparkles className={className} />;
  } else if (iconType === 'circle-stack') {
    return <Layers className={className} />;
  }
  return null;
}
