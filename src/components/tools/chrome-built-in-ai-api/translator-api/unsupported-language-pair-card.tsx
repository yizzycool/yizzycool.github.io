import { X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';
import intlUtils from '@/utils/intl-utils';

export default function UnsupportedLanguagePairCard({
  options,
}: {
  options: AITranslatorCreateCoreOptions;
}) {
  return (
    <div
      className={cn(
        'absolute inset-0 flex items-center justify-center',
        'backdrop-blur-sm'
      )}
    >
      <div className="max-w-[82%] rounded-2xl border border-neutral-200/80 bg-white/90 p-6 shadow-lg backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/90">
        <h3
          className={cn(
            'mb-2 flex items-center gap-2 text-xl font-bold tracking-tight',
            'text-slate-900 dark:text-slate-100'
          )}
        >
          <X className="text-red-600 dark:text-red-400" />
          Not Supported Yet
        </h3>

        <div className="text-sm text-slate-600 dark:text-slate-300">
          Translation between{' '}
          <Badge variant="blue" rounded="sm" className="inline-block">
            {intlUtils.languageTagToHumanReadable(options.sourceLanguage)}
          </Badge>{' '}
          and{' '}
          <Badge variant="blue" rounded="sm" className="inline-block">
            {intlUtils.languageTagToHumanReadable(options.targetLanguage)}
          </Badge>{' '}
          is not currently available.
        </div>
      </div>
    </div>
  );
}
