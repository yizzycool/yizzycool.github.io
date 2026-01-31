'use client';

import { LoaderCircle } from 'lucide-react';
import { useMemo, useState } from 'react';

import useWindowDevice from '@/hooks/window/use-window-device';
import customEventUtils, { CustomEvents } from '@/utils/custom-event-utils';
import Selector from '@/components/common/selector';
import Textarea from '@/components/common/textarea';
import ConfigDialog from '@/components/common/dialog/config';
import Button from '@/components/common/button';
import Divider from '@/components/common/divider';
import Snackbar from '@/components/common/snackbar';

import _isEqual from 'lodash/isEqual';

const Settings = [
  {
    key: 'tone',
    title: 'Tone',
    desc: 'The tone of the rewriter',
    options: ['as-is', 'more-formal', 'more-casual'],
    defaultValue: 'as-is',
  },
  {
    key: 'format',
    title: 'Format',
    desc: 'The format of the rewriter',
    options: ['as-is', 'plain-text', 'markdown'],
    defaultValue: 'as-is',
  },
  {
    key: 'length',
    title: 'Length',
    desc: 'The length of the rewriter',
    options: ['as-is', 'shorter', 'longer'],
    defaultValue: 'as-is',
  },
];

type Props = {
  options: AIRewriterCreateOptions;
  isOptionUpdating: boolean;
  updateOption: (settings: AIRewriterCreateOptions) => void;
};

export default function Config({
  options,
  isOptionUpdating,
  updateOption,
}: Props) {
  const [newOptions, setNewOptions] = useState(options);
  const [isUpdated, setIsUpdated] = useState(false);

  const { isMobile } = useWindowDevice();

  const buttonDisabled = useMemo(() => {
    return _isEqual(options, newOptions) || isOptionUpdating;
  }, [options, newOptions, isOptionUpdating]);

  const onChange = (key: string, value: string) => {
    setNewOptions((ps) => ({ ...ps, [key]: value }));
  };

  const onUpdate = async () => {
    if (buttonDisabled) return;
    await updateOption(newOptions);
    // To trigger snackbar
    setIsUpdated(true);
    // To close config dialog
    customEventUtils.emit(CustomEvents.common.toggleConfigDialog);
  };

  return (
    <>
      <ConfigDialog display={isMobile ? 'icon' : 'icon-label'}>
        <div className="border-b border-slate-100 dark:border-white/5" />
        <div className="flex flex-col overflow-y-auto px-4 py-8 sm:px-8">
          <div className="">
            <Textarea
              title="Shared Context"
              desc="Enables shared context across multiple rewrite requests"
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
          <Divider className="my-8" />
          <Button
            onClick={onUpdate}
            variant="primary"
            size="sm"
            rounded="lg"
            className="w-fit self-end"
            disabled={buttonDisabled}
          >
            {isOptionUpdating ? (
              <>
                <LoaderCircle size={16} className="mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              'Update'
            )}
          </Button>
        </div>
      </ConfigDialog>

      <Snackbar
        open={isUpdated}
        onClose={() => setIsUpdated(false)}
        content="Updated!"
      />
    </>
  );
}
