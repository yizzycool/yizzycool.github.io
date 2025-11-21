'use client';

import clsx from 'clsx';
import { useMemo, useState } from 'react';
import Textarea from '@/components/common/textarea';
import Slider from '@/components/common/slider';
import _isEqual from 'lodash/isEqual';

export default function SettingsPanel({
  options,
  isOptionUpdating,
  updateLanguageModel,
}: {
  options: AILanguageModelCreateOptions;
  isOptionUpdating: boolean;
  updateLanguageModel: (settings: AILanguageModelCreateOptions) => void;
}) {
  const [newOptions, setNewOptions] = useState(options);

  const buttonDisabled = useMemo(() => {
    return _isEqual(options, newOptions) || isOptionUpdating;
  }, [options, newOptions, isOptionUpdating]);

  const onChange = (key: string, value: string | number) => {
    setNewOptions((ps) => ({ ...ps, [key]: value }));
  };

  const onUpdate = () => !buttonDisabled && updateLanguageModel(newOptions);

  return (
    <div className="relative mb-4 rounded-md border border-neutral-700">
      <div className="absolute left-0 top-0 -translate-y-1/2 translate-x-4 bg-white text-lg font-bold dark:bg-neutral-900">
        Settings
      </div>
      <div className="p-4">
        <div className="mt-8">
          <Textarea
            title="System Prompt"
            desc="Give the language model some instructions"
            placeholder="ex: You are a helpful and friendly assistant."
            onChange={(e) => onChange('systemPrompt', e.target.value)}
          />
        </div>
        <div className="mt-8">
          <Slider
            title="Top K"
            desc="Limits the model's word selection"
            min={1}
            max={8}
            value={newOptions.topK as number}
            step={1}
            onChange={(value) => onChange('topK', value)}
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
            onChange={(value) => onChange('temperature', value)}
          />
        </div>
        <div className="mt-8 text-right">
          <button
            className={clsx(
              'relative ml-4 rounded-md bg-sky-600 p-4 py-2 text-base text-white hover:bg-sky-600/80 disabled:bg-gray-300',
              'dark:bg-sku-700 dark:hover:bg-sky-700/80 dark:disabled:bg-gray-500'
            )}
            onClick={onUpdate}
            disabled={buttonDisabled}
          >
            {isOptionUpdating ? 'Updating...' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  );
}
