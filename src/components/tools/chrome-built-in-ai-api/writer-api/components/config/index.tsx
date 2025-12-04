'use client';

import { useMemo, useState } from 'react';
import useWindowDevice from '@/hooks/window/use-window-device';
import Selector from '@/components/common/selector';
import Textarea from '@/components/common/textarea';
import { Settings2 } from 'lucide-react';
import ConfigDialog from '@/components/common/config-dialog';
import Button from '@/components/common/button';
import _isEqual from 'lodash/isEqual';

const Settings = [
  {
    key: 'tone',
    title: 'Tone',
    desc: 'The tone of the writer',
    options: ['formal', 'neutral', 'casual'],
    defaultValue: 'neutral',
  },
  {
    key: 'format',
    title: 'Format',
    desc: 'The format of the writer',
    options: ['markdown', 'plain-text'],
    defaultValue: 'markdown',
  },
  {
    key: 'length',
    title: 'Length',
    desc: 'The length of the writer',
    options: ['short', 'medium', 'long'],
    defaultValue: 'short',
  },
];

type Props = {
  options: AIWriterCreateOptions;
  isOptionUpdating: boolean;
  updateOption: (settings: AIWriterCreateOptions) => void;
};

export default function Config({
  options,
  isOptionUpdating,
  updateOption,
}: Props) {
  const [newOptions, setNewOptions] = useState(options);

  const { isMobile } = useWindowDevice();

  const buttonDisabled = useMemo(() => {
    return _isEqual(options, newOptions) || isOptionUpdating;
  }, [options, newOptions, isOptionUpdating]);

  const onChange = (key: string, value: string) => {
    setNewOptions((ps) => ({ ...ps, [key]: value }));
  };

  const onUpdate = () => !buttonDisabled && updateOption(newOptions);

  return (
    <ConfigDialog
      size="sm"
      title="Configuration"
      icon={Settings2}
      display={isMobile ? 'icon' : 'icon-label'}
    >
      <div className="border-b border-slate-100 dark:border-white/5" />
      <div className="flex flex-col overflow-y-auto px-4 py-8 sm:px-8">
        <div className="">
          <Textarea
            title="Shared Context"
            desc="Enables shared context across multiple write requests"
            placeholder="ex: This is an email to acquaintances about an upcoming event."
            value={newOptions.sharedContext}
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
      </div>
    </ConfigDialog>
  );
}
