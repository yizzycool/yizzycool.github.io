'use client';

import type usePhotoEditorEngine from './hooks/use-photo-editor-engine';
import type { InspectorTabId } from './types/studio';

import {
  History,
  Layers,
  SlidersHorizontal,
  Sparkles,
  SunMedium,
} from 'lucide-react';

import { PillTabs } from '@/components/ui/tabs';

import InspectorAdjustTab from './inspector-adjust-tab';
import InspectorAiTab from './inspector-ai-tab';
import InspectorDesignTab from './inspector-design-tab';
import InspectorHistoryTab from './inspector-history-tab';
import InspectorLayersTab from './inspector-layers-tab';

type StudioEngine = ReturnType<typeof usePhotoEditorEngine>;

type Props = {
  activeTab: InspectorTabId;
  onTabChange: (tab: InspectorTabId) => void;
  engine: StudioEngine;
  layerSearchRef: React.RefObject<HTMLInputElement | null>;
  onRequestClearAiCache: () => void;
};

const TABS: InspectorTabId[] = ['design', 'layers', 'adjust', 'ai', 'history'];

/**
 * Right dockable inspector housing Design, Layers, Adjust, AI, and History tabs.
 */
export default function InspectorPanel({
  activeTab,
  onTabChange,
  engine,
  layerSearchRef,
  onRequestClearAiCache,
}: Props) {
  const { states, history, ai } = engine;
  const isImageSelected = states.selectedProps?.kind === 'image';
  const isTextSelected = states.selectedProps?.kind === 'text';

  return (
    <aside
      aria-label="Studio Inspector"
      className="hidden w-[320px] shrink-0 flex-col border-l border-neutral-200/80 bg-white/95 lg:flex dark:border-neutral-800/80 dark:bg-neutral-900/95"
    >
      <div className="border-b border-neutral-200/80 p-2 dark:border-neutral-800/80">
        <PillTabs<InspectorTabId>
          tabs={TABS}
          activeTab={activeTab}
          onChange={onTabChange}
          tabLabels={{
            design: 'Design',
            layers: 'Layers',
            adjust: 'Adjust',
            ai: 'AI',
            history: 'History',
          }}
          tabIcons={{
            design: SlidersHorizontal,
            layers: Layers,
            adjust: SunMedium,
            ai: Sparkles,
            history: History,
          }}
          size="xs"
          className="scrollbar-thin w-full gap-1"
          tabClassName="shrink-0 whitespace-nowrap px-3"
        />
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto p-3.5">
        {activeTab === 'design' && (
          <InspectorDesignTab
            docConfig={states.docConfig}
            selectedProps={states.selectedProps}
            customFonts={states.customFonts}
            onUpdateDocument={engine.updateDocumentConfig}
            onUpdateProp={engine.updateSelectedProp}
            onUpdateBlendMode={engine.updateSelectedBlendMode}
            onUpdateShadow={engine.updateSelectedShadow}
            onUpdateClipShape={engine.updateSelectedClipShape}
            onTogglePathNodeEditing={engine.togglePathNodeEditing}
            onRunBooleanOp={(op) => void engine.runBooleanOp(op)}
            onUpdateTextCurve={engine.updateTextCurve}
            onLoadCustomFont={(file) => void engine.loadCustomFont(file)}
            onConvertTextToOutlines={() =>
              void engine.convertSelectedTextToOutlines()
            }
            onAddLayerMask={() => void engine.addLayerMask()}
            onPaintLayerMask={() => engine.setActiveTool('mask')}
            onInvertLayerMask={() => void engine.invertSelectedMask()}
            onRemoveLayerMask={engine.removeSelectedMask}
            onToggleClipToBelow={() => void engine.toggleClipToLayerBelow()}
            onAlign={engine.alignSelected}
            onDuplicate={() => void engine.duplicateSelected()}
            onDelete={engine.deleteSelected}
          />
        )}

        {activeTab === 'layers' && (
          <InspectorLayersTab
            layers={states.layers}
            hasSelection={Boolean(states.selectedProps)}
            canGroup={Boolean(states.selectedProps?.canGroup)}
            canUngroup={Boolean(states.selectedProps?.canUngroup)}
            searchInputRef={layerSearchRef}
            onSelectLayer={engine.selectLayerById}
            onToggleVisibility={engine.toggleLayerVisibility}
            onToggleLock={engine.toggleLayerLock}
            onRenameLayer={engine.renameLayer}
            onDeleteLayer={engine.deleteLayerById}
            onReorderLayers={engine.reorderVisualLayers}
            onOrderSelected={engine.reorderSelectedOrder}
            onGroup={engine.groupSelected}
            onUngroup={engine.ungroupSelected}
          />
        )}

        {activeTab === 'adjust' && (
          <InspectorAdjustTab
            isImageSelected={isImageSelected}
            filterValues={states.filterValues}
            activeImageEl={states.activeImageEl}
            filterRevision={states.filterRevision}
            onUpdateFilters={engine.updateSelectedFilters}
            onLoadCubeLut={engine.loadCubeLutFile}
          />
        )}

        {activeTab === 'ai' && (
          <InspectorAiTab
            isImageSelected={isImageSelected}
            isTextSelected={isTextSelected}
            activeLayerId={states.selectedProps?.id ?? null}
            activeDepthMap={states.activeDepthMap}
            cacheStatus={ai.cacheStatus}
            totalCachedBytes={ai.totalCachedBytes}
            activeLoadedModel={ai.activeLoadedModel}
            activeBackend={ai.activeBackend}
            preferredBackend={ai.preferredBackend}
            chromeAiPreview={states.chromeAiPreview}
            onRefreshCache={() => void ai.refreshCacheStatus()}
            onRemoveBackground={(q) => void engine.applyRemoveBackground(q)}
            onGenerateDepthMap={() => void engine.generateDepthMap()}
            onApplyDepthBokeh={(f, b) => void engine.applyDepthBokeh(f, b)}
            onApplyTextBehindSubject={(c) =>
              void engine.applyTextBehindSubject(c)
            }
            onUpscale2x={() => void engine.applyAiUpscale2x()}
            onSelectMagicTool={(tool) => engine.setActiveTool(tool)}
            onFacePrivacyMosaic={() => void engine.applyFacePrivacyMosaic()}
            onSmartFaceCrop={() => void engine.applySmartFaceCrop()}
            onExtractTextOcr={() => void engine.extractOcrTextLayers()}
            onRunChromeAiCopy={(action) => void engine.runChromeAiCopy(action)}
            onApplyChromeAiPreview={(m) => engine.applyChromeAiPreview(m)}
            onDiscardChromeAiPreview={engine.discardChromeAiPreview}
            onUnloadGpu={() => void ai.unloadGpuMemory()}
            onRequestClearCache={onRequestClearAiCache}
          />
        )}

        {activeTab === 'history' && (
          <InspectorHistoryTab
            entries={history.entries}
            activeIndex={history.activeIndex}
            canUndo={history.canUndo}
            canRedo={history.canRedo}
            onUndo={() => void history.undo()}
            onRedo={() => void history.redo()}
            onJumpTo={(idx) => void history.jumpToHistory(idx)}
          />
        )}
      </div>
    </aside>
  );
}
