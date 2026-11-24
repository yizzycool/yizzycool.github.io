'use client';

import type { StarterTemplateId } from './types/studio';

import { LayoutTemplate, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { BaseDialog, DialogHeader } from '@/components/ui/dialog';

import { STARTER_TEMPLATES } from './constants';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (templateId: StarterTemplateId) => void;
};

/**
 * Starter templates picker modal offering curated social and blog artwork layouts
 * (YouTube Thumbnail, IG Carousel, Blog OG Banner, IG Story, Product Spotlight).
 */
export default function TemplatesDialog({
  isOpen,
  onClose,
  onSelectTemplate,
}: Props) {
  return (
    <BaseDialog isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-lg space-y-5 p-6 text-left">
        <DialogHeader
          icon={LayoutTemplate}
          title="Starter Templates"
          description="Pick an editable multi-layer layout to start quickly"
          onClose={onClose}
          closeAriaLabel="Close starter templates"
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {STARTER_TEMPLATES.map((tpl) => {
            const ratioW = Math.max(
              18,
              Math.round((tpl.width / Math.max(tpl.width, tpl.height)) * 44)
            );
            const ratioH = Math.max(
              18,
              Math.round((tpl.height / Math.max(tpl.width, tpl.height)) * 44)
            );

            return (
              <div
                key={tpl.id}
                className="flex flex-col justify-between gap-3 rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-3.5 transition-colors hover:border-sky-400/70 dark:border-neutral-800/80 dark:bg-neutral-900/60"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-neutral-200/80 bg-white dark:border-neutral-700/80 dark:bg-neutral-950">
                    <div
                      className="shadow-xs rounded-sm border"
                      style={{
                        width: `${ratioW}px`,
                        height: `${ratioH}px`,
                        backgroundColor: tpl.bgColor,
                        borderColor: tpl.accentColor,
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="truncate text-xs font-bold text-neutral-900 dark:text-neutral-100">
                        {tpl.title}
                      </span>
                      <span className="shrink-0 rounded bg-sky-500/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-sky-600 dark:text-sky-400">
                        {tpl.category}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] leading-snug text-neutral-500 dark:text-neutral-400">
                      {tpl.subtitle}
                    </p>
                    <div className="mt-1.5 font-mono text-[10px] font-semibold text-neutral-400 dark:text-neutral-500">
                      {tpl.width} × {tpl.height} px
                    </div>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  size="xs"
                  bordered
                  icon={Sparkles}
                  onClick={() => {
                    onSelectTemplate(tpl.id);
                    onClose();
                  }}
                  className="w-full font-semibold"
                >
                  Use Template
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </BaseDialog>
  );
}
