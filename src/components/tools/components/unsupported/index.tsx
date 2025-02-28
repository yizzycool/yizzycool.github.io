'use client';

import { OctagonX } from 'lucide-react';
import _get from 'lodash/get';

export const TypeInfo = {
  unsupported: {
    title: 'Unsupported Feature',
    desc: 'This feature is not supported on your device at the moment. Please try again later.',
  },
  partialUnsupported: {
    title: 'Unstable API',
    desc: 'Although your device supports this API, an error occurred during the creation process. This might be because the API is still in the development stage and remains unstable on some devices. Please try again later!',
  },
};

export type UnsupportedTypes = keyof typeof TypeInfo;

export default function Unsupported({ type }: { type: UnsupportedTypes }) {
  return (
    <div className="mx-auto mt-10 max-w-screen-sm px-5 py-20 text-center">
      <OctagonX className="mx-auto h-20 w-20 text-yellow-500" />
      <div className="mt-10 text-xl font-bold">{TypeInfo[type].title}</div>
      <div className="mt-5">{TypeInfo[type].desc}</div>
    </div>
  );
}
