'use client';

import { Tools } from '@/components/header/components/tools-selector';
import Link from 'next/link';
import _find from 'lodash/find';
import _get from 'lodash/get';

export const TypeInfo = {
  chromeAiApi: {
    title: 'Discover More AI Features',
    desc: 'Discover advanced Chrome AI tools designed to enhance your browsing experience and boost productivity. Try them now to see the difference.',
    features: _find(Tools, (tool) => tool.name === 'Chrome AI APIs'),
  },
  chromeDetectionApi: {
    title: 'Discover More Web Detection Features',
    desc: 'Discover advanced Chrome detection tools designed to enhance your browsing experience and boost productivity. Try them now to see the difference.',
    features: _find(Tools, (tool) => tool.name === 'Chrome Detector APIs'),
  },
};

export type DiscoverMoreTypes = keyof typeof TypeInfo;

export default function DiscoverMoreFeatures({
  type,
}: {
  type: DiscoverMoreTypes;
}) {
  return (
    <div className="m-auto mt-10 border-t border-neutral-400/50 px-5 py-20 text-center md:px-10">
      <div className="mx-auto max-w-screen-sm text-2xl font-bold">
        {TypeInfo[type].title}
      </div>
      <div className="mx-auto mt-5 max-w-screen-sm">{TypeInfo[type].desc}</div>
      {!!TypeInfo[type].features && (
        <div className="mx-auto mt-20 grid w-fit grid-cols-1 justify-start gap-10 md:pl-10">
          {TypeInfo[type].features.items.map((item) => (
            <Link
              key={item.name}
              className="flex hover:text-sky-500 hover:underline"
              href={item.href}
            >
              <div className="mr-3 h-12 w-12 rounded border border-gray-300 p-3 dark:border-gray-500/50">
                <item.icon.component className="h-full w-full" />
              </div>
              <div className="text-left">
                <div className="font-bold">{item.name}</div>
                <div className="mt-1">{item.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
