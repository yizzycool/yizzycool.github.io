'use client';

import clsx from 'clsx';
import { themes } from 'prism-react-renderer';
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live';
import { useEffect, useMemo, useState } from 'react';

import useDarkModeObserver from '@/hooks/window/use-dark-mode-observer';
import customEventUtils, { CustomEvents } from '@/utils/custom-event-utils';
import CopyAction from '@/components/common/action-button/copy';
import ButtonTabs from '@/components/common/tabs/button';
import Divider from '@/components/common/divider';
import Button from '@/components/common/button';

const ONE_DARK_BG = '#282c34';
const ONE_LIGHT_BG = '#fafafa';

type SwitchMode = 'code' | 'preview';

type Props = {
  code: string;
  metadata: string; // live?lang=<lang>&disabled=<disabled>
};

type LiveProviderConfig = {
  code?: string;
  disabled?: boolean;
  enableTypeScript?: boolean;
  language?: string;
  noInline?: boolean;
  scope?: Record<string, unknown>;
  theme?: typeof themes.nightOwl;
  transformCode?(code: string): void;
};

export default function ReactLive({ code = '', metadata }: Props) {
  const [draftCode, setDraftCode] = useState(code.replace(/\n$/, ''));
  const [executedCode, setExecutedCode] = useState(code.replace(/\n$/, ''));

  const [mode, setMode] = useState<SwitchMode>('code');
  const [lockMode, setLockMode] = useState(false);

  const [liveProviderConfig, setLiveProviderConfig] =
    useState<LiveProviderConfig>({
      disabled: true,
    });

  const { isDark } = useDarkModeObserver();

  // Parse metadata like ```live?lang=tsx
  useEffect(() => {
    const params = new URLSearchParams(metadata.replace(/^live/, ''));
    setLiveProviderConfig((prev) => ({
      ...prev,
      language: params.get('lang') || undefined,
      // disabled: params.get('disabled') === 'true',
    }));

    // Parse other configurations
    // `lockMode`
    const lockMode = params.get('lockMode') || '';
    if (['code', 'preview'].includes(lockMode)) {
      setLockMode(true);
      customEventUtils.emit(CustomEvents.common.switchTab, { tab: lockMode });
    }
  }, [metadata]);

  // To count number of lines
  const lineCount = useMemo(() => {
    return draftCode.split(/\r\n|\r|\n/).length;
  }, [draftCode]);

  // Generate `src` attribute of `<iframe>` element if target language is "html"
  const htmlStringBlobUrl = useMemo(() => {
    if (liveProviderConfig.language !== 'html') return;
    const blob = new Blob([executedCode], { type: 'text/html' });
    return URL.createObjectURL(blob);
  }, [liveProviderConfig.language, executedCode]);

  const onModeChange = (mode: string) => setMode(mode as SwitchMode);

  const onRun = () => {
    setExecutedCode(draftCode);
    customEventUtils.emit(CustomEvents.common.switchTab, { tab: 'preview' });
  };

  return (
    <LiveProvider
      code={executedCode}
      theme={isDark ? themes.oneDark : themes.oneLight}
      {...liveProviderConfig}
    >
      <div
        className={clsx(
          'relative flex h-96 w-full flex-col overflow-hidden',
          'rounded-md bg-neutral-100 dark:bg-neutral-800',
          'border border-neutral-200 dark:border-neutral-700'
        )}
      >
        {/* Header - language + copy button */}
        <div
          className={clsx(
            'flex items-center justify-between px-3 py-2',
            'text-xs text-gray-600 dark:text-gray-300',
            'overflow-x-auto'
          )}
        >
          <div className="flex items-center">
            <span>{liveProviderConfig.language}</span>
          </div>
          <div className="flex items-center">
            {mode === 'code' && (
              <>
                <div className="flex items-center gap-2">
                  <CopyAction
                    display="icon"
                    variant="secondary"
                    content={code}
                  />
                  {!liveProviderConfig.disabled && (
                    <Button variant="outline" size="xs" onClick={onRun}>
                      Run
                    </Button>
                  )}
                </div>
                <Divider orientation="vertical" className="mx-2 my-2 sm:mx-4" />
              </>
            )}
            {!lockMode && (
              <ButtonTabs
                tabs={['code', 'preview']}
                defaultActiveTab="code"
                size="xs"
                rounded="full"
                onChange={onModeChange}
              />
            )}
          </div>
        </div>
        <div
          className={clsx(
            'h-full w-full flex-1 overflow-hidden *:h-full *:overflow-auto',
            mode === 'preview' ? 'block' : 'hidden'
          )}
        >
          {liveProviderConfig.language === 'html' ? (
            <iframe
              src={htmlStringBlobUrl}
              sandbox="allow-scripts"
              className={clsx('h-full w-full')}
              style={{
                background: isDark ? ONE_DARK_BG : ONE_LIGHT_BG,
              }}
            />
          ) : (
            <LivePreview
              style={{
                background: isDark ? ONE_DARK_BG : ONE_LIGHT_BG,
              }}
            />
          )}
        </div>
        <div
          className={clsx(
            'flex-1 overflow-y-auto',
            mode === 'code' ? 'block' : 'hidden',
            'flex p-[1em]'
          )}
          style={{
            background: isDark ? ONE_DARK_BG : ONE_LIGHT_BG,
          }}
        >
          {/* Line Number */}
          <div className="flex h-auto select-none flex-col items-end text-right italic leading-normal *:h-auto">
            {Array.from({ length: lineCount }).map((_, idx) => (
              <span
                key={idx}
                className={clsx('min-w-[2.25em] pr-[1em]')}
                style={{
                  color: isDark ? '#5c6370' : '#a0a1a7',
                  fontFamily:
                    '"Fira Code", "Fira Mono", Menlo, Consolas, "DejaVu Sans Mono", monospace',
                }}
              >
                {idx + 1}
              </span>
            ))}
          </div>
          <LiveEditor
            className="[&>pre]:rounded-none [&>pre]:!p-0 [&>pre]:text-sm [&>pre]:leading-normal"
            style={{
              fontFamily:
                '"Fira Code", "Fira Mono", Menlo, Consolas, "DejaVu Sans Mono", monospace',
            }}
            onChange={setDraftCode}
          />
        </div>
        {liveProviderConfig.language !== 'html' && (
          <LiveError
            className={clsx(
              'absolute bottom-4 right-4 max-w-[calc(100%_-_8px)]',
              'm-0 block !px-3 !py-1.5 text-xs',
              'break-all text-left font-medium transition-all duration-300',
              '!border-red-500/20 !bg-red-100/50 !text-red-600 dark:!bg-red-800/10 dark:!text-red-400'
            )}
          />
        )}
      </div>
    </LiveProvider>
  );
}
