'use client';

import { useMemo, useState } from 'react';
import Selector from '@/components/common/selector';
import Textarea from '@/components/common/textarea';
import _isEqual from 'lodash/isEqual';
import { Settings2 } from 'lucide-react';
import ConfigDialog from '@/components/common/config-dialog';
import Button from '@/components/common/button';

const Settings = [
  {
    key: 'type',
    title: 'Summary Type',
    desc: 'The type of the summarization, with the allowed values',
    options: ['key-points', 'tl;dr', 'teaser', 'headline'],
    defaultValue: 'key-points',
  },
  {
    key: 'format',
    title: 'Format',
    desc: 'The format of the summarization',
    options: ['markdown', 'plain-text'],
    defaultValue: 'markdown',
  },
  {
    key: 'length',
    title: 'Length',
    desc: 'The length of the summarization',
    options: ['short', 'medium', 'long'],
    defaultValue: 'medium',
  },
];

type Props = {
  options: AISummarizerCreateOptions;
  isOptionUpdating: boolean;
  updateSummarizer: (settings: AISummarizerCreateOptions) => void;
};

export default function Config({
  options,
  isOptionUpdating,
  updateSummarizer,
}: Props) {
  const [newOptions, setNewOptions] = useState(options);

  const buttonDisabled = useMemo(() => {
    return _isEqual(options, newOptions) || isOptionUpdating;
  }, [options, newOptions, isOptionUpdating]);

  const onChange = (key: string, value: string) => {
    setNewOptions((ps) => ({ ...ps, [key]: value }));
  };

  const onUpdate = () => !buttonDisabled && updateSummarizer(newOptions);

  return (
    <ConfigDialog size="sm" title="Configuration" icon={Settings2}>
      <div className="border-b border-slate-100 dark:border-white/5" />
      <div className="flex flex-col overflow-y-auto px-4 py-8 sm:px-8">
        <div className="">
          <Textarea
            title="Shared Context"
            desc="Enables shared context across multiple summarization requests"
            placeholder="ex: An article from the magazine"
            onChange={(e) => onChange('sharedContext', e.target.value)}
          />
        </div>
        {Settings.map((setting) => (
          <div key={setting.key} className="mt-8">
            <Selector
              title={setting.title}
              desc={setting.desc}
              options={setting.options}
              defaultValue={setting.defaultValue}
              onChange={(value) => onChange(setting.key, value)}
            />
          </div>
        ))}
        <div className="-mx-4 my-4 border-b border-slate-100 sm:-mx-8 dark:border-white/5" />
        <Button
          onClick={onUpdate}
          variant="primary"
          size="base"
          rounded="lg"
          className="w-fit self-end"
          disabled={buttonDisabled}
        >
          {isOptionUpdating ? 'Updating...' : 'Update'}
        </Button>
        {/* <button
            className={clsx(
              'relative ml-4 rounded-md bg-sky-600 p-4 py-2 text-base text-white hover:bg-sky-600/80 disabled:bg-gray-300',
              'dark:bg-sku-700 dark:hover:bg-sky-700/80 dark:disabled:bg-gray-500'
            )}
            onClick={onUpdate}
            disabled={buttonDisabled}
          >
            {isOptionUpdating ? 'Updating...' : 'Update'}
          </button> */}
      </div>
    </ConfigDialog>
  );

  // return (
  //   <div className="relative mb-4 rounded-md border border-neutral-700">
  //     <div className="absolute left-0 top-0 -translate-y-1/2 translate-x-4 bg-white text-lg font-bold dark:bg-neutral-900">
  //       Settings
  //     </div>
  //     <div className="p-4">
  //       <div className="mt-8">
  //         <Textarea
  //           title="Shared Context"
  //           desc="Enables shared context across multiple summarization requests"
  //           placeholder="ex: An article from the magazine"
  //           onChange={(e) => onChange('sharedContext', e.target.value)}
  //         />
  //       </div>
  //       {Settings.map((setting) => (
  //         <div key={setting.key} className="mt-8">
  //           <Selector
  //             title={setting.title}
  //             desc={setting.desc}
  //             options={setting.options}
  //             defaultValue={setting.defaultValue}
  //             onChange={(value) => onChange(setting.key, value)}
  //           />
  //         </div>
  //       ))}
  //       <div className="mt-8 text-right">
  //         <button
  //           className={clsx(
  //             'relative ml-4 rounded-md bg-sky-600 p-4 py-2 text-base text-white hover:bg-sky-600/80 disabled:bg-gray-300',
  //             'dark:bg-sku-700 dark:hover:bg-sky-700/80 dark:disabled:bg-gray-500'
  //           )}
  //           onClick={onUpdate}
  //           disabled={buttonDisabled}
  //         >
  //           {isOptionUpdating ? 'Updating...' : 'Update'}
  //         </button>
  //       </div>
  //     </div>
  //   </div>
  // );
}
