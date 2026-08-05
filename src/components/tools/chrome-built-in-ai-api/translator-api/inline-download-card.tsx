import { cn } from '@/utils/cn';
import { Download } from 'lucide-react';
import { round } from 'lodash';

import intlUtils from '@/utils/intl-utils';
import Card from '@/components/common/card';

export default function InlineDownloadCard({
  options,
  progress = 0,
}: {
  options: AITranslatorCreateCoreOptions;
  progress?: number;
}) {
  return (
    <div
      className={cn(
        'absolute inset-0 z-20 flex items-center justify-center',
        'backdrop-blur-sm'
      )}
    >
      <Card className="max-w-[80%] text-center">
        {/* Status Icon */}
        <div className="relative mx-auto mb-3 flex h-12 w-12 items-center justify-center">
          {/* Spinning Rings - Faster for download activity */}
          <div
            className={cn(
              'absolute inset-0 animate-[spin_1.5s_linear_infinite] rounded-full border-[3px]',
              'border-gray-200 border-t-emerald-500/50',
              'dark:border-gray-700/30 dark:border-t-emerald-500/50'
            )}
          />
          {/* Center Icon */}
          <Download size={16} />
        </div>

        {/* Text Content */}
        <h3 className="mb-1 text-xl font-bold tracking-tight text-gray-900 dark:text-gray-200">
          Downloading Model
        </h3>
        <p className="mb-6 text-xs text-gray-500">
          Preparing{' '}
          {intlUtils.languageTagToHumanReadable(options.sourceLanguage)} →{' '}
          {intlUtils.languageTagToHumanReadable(options.targetLanguage)}{' '}
          dictionary
        </p>

        {/* Progress Bar Container */}
        <div
          className={cn(
            'mb-2 h-2 w-full overflow-hidden rounded-full border',
            'border-gray-200 bg-gray-100',
            'dark:border-gray-700/50 dark:bg-gray-800'
          )}
        >
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-300 ease-out"
            style={{ width: `${progress * 100}%` }}
          ></div>
        </div>

        {/* Progress Stats */}
        <div className="text-center text-xs font-bold text-emerald-400">
          {round(progress * 100, 1)}%
        </div>
      </Card>
    </div>
  );
}
