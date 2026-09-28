'use client';

import LabelBar from '@/components/tools/common/label-bar';
import { ProseMarkdown } from '@/components/shared/markdown';

type JwtSectionCardProps = {
  label: string;
  description?: string;
  content: string;
  emptyFallbackText?: string;
  type?: 'json' | 'secret';
};

export default function JwtSectionCard({
  label,
  description,
  content,
  emptyFallbackText = 'No data available',
  type = 'json',
}: JwtSectionCardProps) {
  const hasContent = content.trim().length > 0;

  return (
    <div className="flex flex-col">
      <LabelBar label={label} description={description} />

      <ProseMarkdown>
        {'```' +
          type +
          '\n' +
          (hasContent ? content : '// ' + emptyFallbackText) +
          '\n```'}
      </ProseMarkdown>
    </div>
  );
}
