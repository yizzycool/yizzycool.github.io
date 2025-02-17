import { Tools } from '@/components/header/components/tools-selector';
import _find from 'lodash/find';
import Link from 'next/link';

const ChromeAiApis = _find(Tools, (tool) => tool.name === 'Chrome AI APIs');

export default function UnsupportedFeature() {
  return (
    <div className="m-auto mt-10 border border-neutral-700 px-10 pb-40 pt-10">
      <div className="text-2xl font-bold">Unsupported Feature</div>
      <div className="mt-5">
        This feature is not supported on your device at the moment. Please try
        other AI API features.
      </div>
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
