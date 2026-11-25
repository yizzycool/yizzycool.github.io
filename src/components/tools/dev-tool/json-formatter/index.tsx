'use client';

import type { TabItem } from './constants';
import type { JsonHistoryData } from './hooks/use-json-formatter';

import {
  Braces,
  CodeXml,
  Download,
  FileText,
  GitCompareArrows,
  Wrench,
} from 'lucide-react';
import { isEmpty } from 'lodash';

import {
  CopyAction,
  DeleteAction,
  PasteAction,
  SampleAction,
} from '@/components/shared/action-button';
import { ProseMarkdown } from '@/components/shared/markdown';
import ExecuteBar from '@/components/tools/common/execute-bar';
import HeaderBlock from '@/components/tools/common/header-block';
import { InsetGroup } from '@/components/tools/common/inset-group';
import LabelBar from '@/components/tools/common/label-bar';
import SectionGap from '@/components/tools/common/section-gap';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Tabs } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { TOOL_HOTKEYS } from '@/hooks/tools/use-tool-hotkeys';

import { TAB_ICON_MAP, TAB_ITEMS } from './constants';
import useJsonFormatter from './hooks/use-json-formatter';
import { JsonDiffView } from './json-diff-view';
import { JsonTelemetryBar } from './json-telemetry-bar';
import JsonTreeView from './json-tree-view';

export default function JsonFormatter() {
  const {
    tab,
    input,
    compareInput,
    compareError,
    compareReady,
    diffEntries,
    output,
    error,
    repairPreview,
    telemetry,
    parsedObject,
    syntaxLanguage,
    executeButtonLabel,
    historyList,
    isLoadingHistory,
    inputRef,
    processJson,
    onAutoRepair,
    onJsonStringChanged,
    onCompareInputChanged,
    onClearCompareInput,
    onPaste,
    onLoadSample,
    onLoadDiffSample,
    onClear,
    onDownloadOutput,
    onTabChanged,
    onRestoreHistory,
    renameHistory,
    removeHistory,
    clearHistory,
  } = useJsonFormatter();

  return (
    <>
      <HeaderBlock<JsonHistoryData>
        historyList={historyList}
        isLoadingHistory={isLoadingHistory}
        onRestoreHistory={onRestoreHistory}
        onRenameHistory={renameHistory}
        onRemoveHistory={removeHistory}
        onClearHistory={clearHistory}
        customShortcuts={[
          { ...TOOL_HOTKEYS.process, label: 'Execute' },
          TOOL_HOTKEYS.paste,
          TOOL_HOTKEYS.copy,
          { ...TOOL_HOTKEYS.clear, label: 'Clear' },
          TOOL_HOTKEYS.help,
          TOOL_HOTKEYS.history,
        ]}
      />

      <SectionGap />

      {/* Modern Pill Mode Switcher */}
      <div className="overflow-x-auto pb-1">
        <Tabs<TabItem>
          tabs={[...TAB_ITEMS]}
          tabIcons={TAB_ICON_MAP}
          activeTab={tab}
          onChange={onTabChanged}
          size="xs"
          rounded="lg"
          variant="segment"
        />
      </div>

      {/* Responsive Split Workbench */}
      <div className="mt-6 flex flex-col gap-8 xl:grid xl:grid-cols-12 xl:items-start xl:gap-8">
        {/* Left Col 1-6: JSON Input + Repair + Telemetry */}
        <div className="space-y-4 text-left xl:col-span-6">
          <LabelBar
            label={tab === 'Diff' ? 'Baseline JSON (Left)' : 'Paste JSON below'}
            icon={FileText}
            htmlFor="json-string-textarea"
          >
            <SampleAction onClick={onLoadSample} />
            <PasteAction onClick={onPaste} />
            <DeleteAction onClick={onClear} disabled={isEmpty(input)} />
          </LabelBar>

          <Textarea
            ref={inputRef}
            id="json-string-textarea"
            value={input}
            onChange={onJsonStringChanged}
            rows={10}
            errorMessage={error}
            className="min-h-[280px] xl:h-[440px]"
            placeholder="Paste your JSON string (or messy JS object / trailing-comma JSON) here..."
          />

          {repairPreview && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200/80 bg-amber-50/80 px-3.5 py-2.5 text-xs text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/35 dark:text-amber-100">
              <div className="space-y-0.5">
                <div className="font-semibold">
                  Malformed JSON can be auto-repaired
                </div>
                {repairPreview.fixes.length > 0 && (
                  <div className="text-[11px] text-amber-700 dark:text-amber-300">
                    Detected: {repairPreview.fixes.join(' • ')}
                  </div>
                )}
              </div>
              <Button
                variant="primary"
                size="xs"
                rounded="lg"
                icon={Wrench}
                onClick={onAutoRepair}
              >
                Auto Fix JSON
              </Button>
            </div>
          )}

          <JsonTelemetryBar
            telemetry={telemetry}
            hasInput={!isEmpty(input.trim())}
            error={error}
          />

          {tab !== 'Diff' && (
            <ExecuteBar
              label={executeButtonLabel}
              disabled={isEmpty(input)}
              onClick={() => processJson()}
              text={input}
            />
          )}
        </div>

        {/* Right Col 7-12: Output / Tree / Schema / Diff */}
        <div className="space-y-4 text-left xl:col-span-6">
          {tab === 'Diff' ? (
            <>
              <LabelBar
                label="Target JSON (Right)"
                icon={GitCompareArrows}
                htmlFor="json-compare-textarea"
              >
                <Button
                  variant="outline"
                  size="xs"
                  rounded="lg"
                  onClick={onLoadDiffSample}
                >
                  Sample Diff
                </Button>
                <DeleteAction
                  onClick={onClearCompareInput}
                  disabled={isEmpty(compareInput)}
                />
              </LabelBar>

              <Textarea
                id="json-compare-textarea"
                value={compareInput}
                onChange={onCompareInputChanged}
                rows={7}
                errorMessage={compareError}
                className="min-h-[180px]"
                placeholder="Paste the second JSON payload to compare against the baseline..."
              />

              <JsonDiffView
                entries={diffEntries}
                compareReady={compareReady}
                compareError={compareError}
              />
            </>
          ) : (
            <>
              <LabelBar
                label={`Result ${tab !== 'Format' ? `(${tab})` : ''}`}
                icon={Braces}
                htmlFor="output"
              >
                {!!output && (
                  <>
                    <Button
                      variant="outline"
                      size="xs"
                      rounded="lg"
                      icon={Download}
                      onClick={onDownloadOutput}
                    >
                      Download
                    </Button>
                    <CopyAction
                      content={output}
                      disabled={isEmpty(output)}
                      successToast="Result copied to clipboard"
                    />
                  </>
                )}
              </LabelBar>

              {tab === 'Tree View' && parsedObject ? (
                <JsonTreeView data={parsedObject} />
              ) : output ? (
                <ProseMarkdown className="[&_pre>div>div:nth-child(2)]:max-h-[540px]">{`\`\`\`${syntaxLanguage}\n${output}\n\`\`\``}</ProseMarkdown>
              ) : (
                <InsetGroup rounded="2xl">
                  <EmptyState
                    icon={CodeXml}
                    title={`Ready for ${tab}`}
                    description={`Paste valid JSON on the left or click Sample to inspect ${tab} output.`}
                    className="h-80 xl:h-[520px]"
                  />
                </InsetGroup>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
