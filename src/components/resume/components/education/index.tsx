'use client';

import useIntersectionObserver from '@/hooks/window/use-intersection-observer';
import Image from 'next/image';
import EducationData from './data/educations.json';
import _get from 'lodash/get';

const THRESHOLD = 0.3;

export default function Education() {
  const { hit } = useIntersectionObserver({
    targetSelector: '#education',
    threshold: THRESHOLD,
  });

  return (
    <div className="relative min-h-80 w-full border-t border-neutral-300 px-4 py-20 dark:border-neutral-500">
      <Image
        className="absolute inset-0 -z-[1] object-cover opacity-10 blur-sm"
        src="/assets/images/home/school-background.jpg"
        fill={true}
        alt="background image"
        loading="lazy"
      />
      <div id="education" className="mx-auto max-w-screen-xl px-4">
        <div
          data-hit={hit}
          className="pt-40 opacity-0 data-[hit=true]:animate-slightly-fade-in-down data-[hit=true]:opacity-100"
        >
          <div className="text-5xl font-bold dark:text-white">Education</div>
          {EducationData.map((data) => (
            <div
              key={data.name}
              className="mt-20 border-t border-neutral-300 py-12 lg:grid lg:grid-cols-3 dark:border-neutral-500"
            >
              <div>{data.duration}</div>
              <div className="col-span-2">
                <div className="text-2xl font-bold">{data.name}</div>
                <div className="mt-5">{data.department}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// function JobIcon({
//   iconType,
//   className = '',
// }: {
//   iconType: string;
//   className: string;
// }) {
//   if (iconType === 'pencil-square') {
//     return <PencilSquareIcon className={className} />;
//   } else if (iconType === 'sparkles') {
//     return <SparklesIcon className={className} />;
//   } else if (iconType === 'circle-stack') {
//     return <CircleStackIcon className={className} />;
//   }
//   return null;
// }
