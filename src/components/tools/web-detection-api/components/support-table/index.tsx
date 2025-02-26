'use client';

import clsx from 'clsx';
import useFaceDetector from '../../hooks/use-face-detector';
import { ExternalLink } from 'lucide-react';
import ApiStatus from './components/api-status';
import _get from 'lodash/get';
import _isNull from 'lodash/isNull';

const ApiList = [
  {
    name: 'Face Detector',
    url: 'https://developer.chrome.com/docs/capabilities/shape-detection#facedetector',
    supportKey: 'face-detector',
  },
];

export default function SupportTable() {
  const { isSupported: isFaceDetectorSupported } = useFaceDetector({
    createInstance: false,
  });

  const getCapability = (key: string) => {
    switch (key) {
      case ApiList[0].supportKey:
        return isFaceDetectorSupported;
      default:
        return false;
    }
  };

  return (
    <table className="mx-auto mt-10 table-auto text-left">
      <thead>
        <tr className="border-b border-neutral-400/50">
          <th className="p-4">API</th>
          <th className="p-4 text-center">Is Your Device Supported?</th>
        </tr>
      </thead>
      <tbody>
        {ApiList.map((api, idx) => (
          <tr key={idx}>
            <td className="p-4">
              <a
                className="hover:underline"
                href={api.url}
                target="_blank"
                rel="noreferrer noopener"
              >
                {api.name}
                <ExternalLink className="ml-2 inline h-4 w-4" />
              </a>
            </td>
            <td className="p-4">
              <div
                data-supported={JSON.stringify(getCapability(api.supportKey))}
                className={clsx(
                  'm-auto flex w-fit items-center justify-center rounded-md px-2 py-1 text-xs font-medium',
                  'data-[supported=null]:bg-gray-400/10 data-[supported=null]:text-gray-400',
                  'data-[supported=true]:bg-green-400/20 data-[supported=true]:text-green-400',
                  'data-[supported=false]:bg-red-400/10 data-[supported=false]:text-red-400'
                )}
              >
                <ApiStatus isSupported={getCapability(api.supportKey)} />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
