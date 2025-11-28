import clsx from 'clsx';
import intlUtils from '@/utils/intl-utils';
import { Download } from 'lucide-react';
import _round from 'lodash/round';

export default function InlineDownloadCard({
  options,
  progress = 0,
}: {
  options: AITranslatorCreateCoreOptions;
  progress?: number;
}) {
  return (
    <div className="animate-fade-in group relative max-w-[80%]">
      {/* Ambient Glow */}
      <div
        className={clsx(
          'absolute -inset-1 animate-pulse-glow rounded-3xl bg-gradient-to-r blur-md',
          'from-emerald-400/50 to-blue-400/50 opacity-60',
          'dark:from-emerald-600/30 dark:to-blue-600/30 dark:opacity-100'
        )}
      />

      <div
        className={clsx(
          'relative z-10 flex w-full flex-col items-center rounded-3xl border px-12 py-8',
          'border-gray-100 bg-white shadow-xl',
          'shadow-none dark:border-gray-700/50 dark:bg-[#1f1f1f]'
        )}
      >
        {/* Status Icon */}
        <div className="relative mb-3 flex h-16 w-16 items-center justify-center">
          {/* Spinning Rings - Faster for download activity */}
          <div
            className={clsx(
              'absolute inset-0 animate-[spin_1.5s_linear_infinite] rounded-full border-[3px]',
              'border-gray-200 border-t-emerald-500/50',
              'dark:border-gray-700/30 dark:border-t-emerald-500/50'
            )}
          />
          <div
            className={clsx(
              'absolute inset-2 animate-[spin_2s_linear_infinite_reverse] rounded-full border-[3px]',
              'border-gray-200 border-b-blue-500/50',
              'dark:border-gray-700/30 dark:border-b-blue-500/50'
            )}
          />

          {/* Center Icon */}
          <div
            className={clsx(
              'relative z-10 flex h-6 w-6 items-center justify-center rounded-full shadow-inner',
              'bg-gray-50 text-emerald-600',
              'dark:bg-gray-800 dark:text-emerald-400'
            )}
          >
            <Download size={12} />
          </div>
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
          className={clsx(
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
          {_round(progress * 100, 1)}%
        </div>
      </div>
    </div>
  );
}
