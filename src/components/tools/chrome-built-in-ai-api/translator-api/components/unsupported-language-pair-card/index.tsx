import intlUtils from '@/utils/intl-utils';
import clsx from 'clsx';
import { Languages } from 'lucide-react';

export default function UnsupportedLanguagePairCard({
  options,
}: {
  options: AITranslatorCreateCoreOptions;
}) {
  return (
    <div className="animate-fade-in group relative max-w-[80%]">
      {/* Ambient Glow */}
      <div className="absolute -inset-1 animate-pulse-glow rounded-3xl bg-gradient-to-r from-blue-600/30 to-purple-600/30 blur" />

      <div
        className={clsx(
          'relative flex max-w-sm flex-col items-center rounded-3xl border p-5',
          'border-gray-100 bg-white shadow-xl',
          'dark:border-gray-700/50 dark:bg-[#1f1f1f]'
        )}
      >
        {/* Animated Icon Container */}
        <div className="relative mb-3 flex h-16 w-16 items-center justify-center">
          {/* Outer Ring (Slow Spin) */}
          <div
            className={clsx(
              'absolute inset-0 animate-[spin_4s_linear_infinite] rounded-full border-[3px]',
              'border-gray-200 border-t-blue-500/50',
              'dark:border-gray-700/30 dark:border-t-blue-500/50',
              ''
            )}
          />
          {/* Inner Ring (Reverse Spin) */}
          <div
            className={clsx(
              'absolute inset-2 animate-[spin_3s_linear_infinite_reverse] rounded-full border-[3px]',
              'border-gray-200 border-b-purple-500/50',
              'dark:border-gray-700/30 dark:border-b-purple-500/50'
            )}
          />

          {/* Center Icon */}
          <div
            className={clsx(
              'relative z-10 flex h-6 w-6 items-center justify-center rounded-full shadow-inner',
              'bg-gray-800 text-gray-400',
              'dark:bg-gray-800 dark:text-gray-400'
            )}
          >
            <Languages size={12} />
          </div>

          {/* Decorative dots */}
          <div className="absolute top-0 h-1 w-1 rounded-full bg-blue-400 blur-[1px]" />
        </div>

        {/* Text Content */}
        <h3
          className={clsx(
            'mb-2 text-xl font-bold tracking-tight',
            'text-gray-900',
            'dark:text-gray-200'
          )}
        >
          Not Supported Yet
        </h3>

        <div className="mb-5 h-1 w-12 rounded-full bg-gray-200 dark:bg-gray-700/50" />

        <p className="text-sm text-gray-600 dark:text-gray-500">
          Translation between{' '}
          <span className="rounded bg-blue-50 px-1 font-medium text-blue-600 dark:bg-blue-400/10 dark:text-blue-400">
            {intlUtils.languageTagToHumanReadable(options.sourceLanguage)}
          </span>{' '}
          and{' '}
          <span className="rounded bg-blue-50 px-1 font-medium text-blue-600 dark:bg-blue-400/10 dark:text-blue-400">
            {intlUtils.languageTagToHumanReadable(options.targetLanguage)}
          </span>{' '}
          is not currently available.
        </p>
      </div>
    </div>
  );
}
