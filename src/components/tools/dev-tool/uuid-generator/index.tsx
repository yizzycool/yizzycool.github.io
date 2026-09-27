'use client';

import { TOOL_HOTKEYS } from '@/hooks/tools/use-tool-hotkeys';

import HeaderBlock from '../../common/header-block';
import SectionGap from '../../common/section-gap';
import BatchConfigSection from './batch-config-section';
import BatchResultsSection from './batch-results-section';
import GeneratorControlsBar from './generator-controls-bar';
import { useIdentifierGenerator } from './hooks/use-identifier-generator';
import OverviewResultsSection from './overview-results-section';

export default function UuidGenerator() {
  const {
    mode,
    setMode,
    overviewItems,
    regenerateSingleOverviewItem,
    batchOptions,
    updateBatchOptions,
    batchList,
    generateCurrent,
    batchExporter,
  } = useIdentifierGenerator();

  return (
    <>
      <HeaderBlock
        customShortcuts={[
          { ...TOOL_HOTKEYS.process, label: 'Generate New' },
          TOOL_HOTKEYS.help,
        ]}
      />

      <SectionGap />

      {/* Mode Controls Bar */}
      <GeneratorControlsBar
        mode={mode}
        onModeChange={setMode}
        onGenerate={generateCurrent}
      />

      <SectionGap />

      {/* Main Mode View */}
      {mode === 'overview' ? (
        <OverviewResultsSection
          items={overviewItems}
          onRegenerateSingle={regenerateSingleOverviewItem}
        />
      ) : (
        <div className="space-y-6">
          <BatchConfigSection
            options={batchOptions}
            onChange={updateBatchOptions}
          />
          <BatchResultsSection
            items={batchList}
            formattedContent={batchExporter.getFormattedContent()}
            onCopyAll={batchExporter.copyAll}
          />
        </div>
      )}
    </>
  );
}
