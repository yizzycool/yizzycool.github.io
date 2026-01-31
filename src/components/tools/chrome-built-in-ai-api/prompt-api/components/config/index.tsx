'use client';

import { LoaderCircle } from 'lucide-react';
import { useMemo, useState } from 'react';

import useWindowDevice from '@/hooks/window/use-window-device';
import customEventUtils, { CustomEvents } from '@/utils/custom-event-utils';
import Textarea from '@/components/common/textarea';
import ConfigDialog from '@/components/common/dialog/config';
import Button from '@/components/common/button';
import Slider from '@/components/common/slider';
import Divider from '@/components/common/divider';
import Snackbar from '@/components/common/snackbar';

import _isEqual from 'lodash/isEqual';

type Props = {
  options: AILanguageModelCreateOptions;
  isOptionUpdating: boolean;
  updateOption: (settings: AILanguageModelCreateOptions) => void;
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

  const onChange = (key: string, value: string | number) => {
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
          <Textarea
            title="System Prompt"
            desc="Give the language model some instructions"
            placeholder="ex: You are a helpful and friendly assistant."
            value={newOptions.systemPrompt}
            onChange={(e) => onChange('systemPrompt', e.target.value)}
          />
          <div className="mt-8">
            <Slider
              title="Top K"
              desc="Limits the model's word selection"
              min={1}
              max={8}
              value={newOptions.topK as number}
              step={1}
              onChange={(e) => onChange('topK', Number(e.target.value))}
            />
          </div>
          <div className="mt-8">
            <Slider
              title="Temperature"
              desc="Higher values increase diversity, while lower values make responses more deterministic."
              min={0.0}
              max={2.0}
              value={newOptions.temperature as number}
              step={0.1}
              onChange={(e) => onChange('temperature', Number(e.target.value))}
            />
          </div>
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
