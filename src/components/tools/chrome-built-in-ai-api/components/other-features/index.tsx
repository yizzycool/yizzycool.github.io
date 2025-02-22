import { Tools } from '@/components/header/components/tools-selector';
import Link from 'next/link';
import _find from 'lodash/find';
import _get from 'lodash/get';

const ChromeAiApis = _find(Tools, (tool) => tool.name === 'Chrome AI APIs');

export const TypeInfo = {
  unsupported: {
    title: 'Unsupported Feature',
    desc: 'This feature is not supported on your device at the moment. Please try other AI API features.',
  },
  partialUnsupported: {
    title: 'Unstable API',
    desc: 'Although your device supports this API, an error occurred during the creation process. This might be because the API is still in the development stage and remains unstable on some devices. Please try again later!',
  },
  discoverMore: {
    title: 'Discover More Chrome AI Features',
    desc: 'Discover advanced Chrome AI tools designed to enhance your browsing experience and boost productivity. Try them now to see the difference.',
  },
};

export type OtherFeatureTypeInfoKeys = keyof typeof TypeInfo;

export default function OtherFeatures({
  type,
}: {
  type: OtherFeatureTypeInfoKeys;
}) {
  return (
    <div className="m-auto mt-10 border-t border-neutral-700 px-5 pb-40 pt-10 text-center md:px-10">
      <div className="mx-auto max-w-screen-sm text-2xl font-bold">
        {TypeInfo[type].title}
      </div>
      <div className="mx-auto mt-5 max-w-screen-sm">{TypeInfo[type].desc}</div>
      {!!ChromeAiApis && (
        <div className="mx-auto mt-20 grid w-fit grid-cols-1 justify-start gap-10">
          {ChromeAiApis.items.map((item) => (
            <Link
              key={item.name}
              className="flex hover:text-sky-500 hover:underline"
              href={item.href}
            >
              <div className="mr-3 h-12 w-12 rounded border border-gray-300 p-1.5 dark:border-gray-500/50">
                <item.icon.component className="h-full w-full" />
              </div>
              <div className="text-left">
                <div className="text-lg font-bold">{item.name}</div>
                <div className="">{item.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
