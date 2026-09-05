import { X } from 'lucide-react';

import intlUtils from '@/utils/intl-utils';
import { cn } from '@/utils/cn';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
      <Card className="max-w-[80%]">
        {/* Text Content */}
        <h3
          className={cn(
            'mb-2 flex items-center gap-2 text-xl font-bold tracking-tight',
            'text-slate-900 dark:text-slate-100'
          )}
        >
          <X className="text-red-600" />
          Not Supported Yet
        </h3>

        <div className="text-sm">
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
      </Card>
    </div>
  );
}
