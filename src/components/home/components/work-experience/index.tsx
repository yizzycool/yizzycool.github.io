'use client';

import useIntersectionObserver from '@/hooks/window/use-intersection-observer';
import ExperienceData from './data/experiences.json';
import Image from 'next/image';
import { Building2, Layers, SquarePen, WandSparkles } from 'lucide-react';
import _get from 'lodash/get';

const THRESHOLD = 0.3;

export default function WorkExperience() {
  const { hit } = useIntersectionObserver({
    targetSelector: '#work-experience',
    threshold: THRESHOLD,
  });

  return (
    <div className="relative min-h-80 w-full px-4 py-20">
      <Image
        className="absolute inset-0 -z-[1] object-cover opacity-10 blur-sm"
        src="/assets/images/home/meeting.jpg"
        fill={true}
        alt="background image"
      />
      <div id="work-experience" className="mx-auto max-w-screen-xl px-4">
        <div
          data-hit={hit}
          className="pt-40 opacity-0 data-[hit=true]:animate-slightly-fade-in-down data-[hit=true]:opacity-100"
        >
          <div className="text-5xl font-bold dark:text-white">
            Work Experience
          </div>
          {ExperienceData.map((data) => (
            <div key={data.duration} className="mt-10">
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
              {/* Cards */}
              <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-2 xl:grid-cols-3">
                {data.descriptions.map((desc) => (
                  <div
                    key={desc.title}
                    className="bg-mix-black-5 dark:bg-mix-white-5 flex gap-6 overflow-hidden rounded-lg px-8 py-8 ring-1 ring-inset ring-black/10 dark:ring-white/10"
                  >
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
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
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
