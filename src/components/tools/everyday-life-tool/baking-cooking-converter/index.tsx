'use client';

import type { ConverterMode } from './types';

import { Beaker, Scale } from 'lucide-react';

import { Tabs } from '@/components/ui/tabs';

import HeaderBlock from '../../common/header-block';
import { PropertyResultSection } from '../../common/property-row';
import SectionGap from '../../common/section-gap';
import {
  CONVERTER_MODE_ICONS,
  CONVERTER_MODE_LABELS,
  CONVERTER_MODE_TABS,
} from './constants';
import ConverterInputs from './converter-inputs';
import { useBakingConverter } from './hooks/use-baking-converter';
import IngredientSelector from './ingredient-selector';
import OvenConverter from './oven-converter';

/**
 * Ingredient density & baking measurement converter (Archetype A: Frameless Flow + InsetGroup).
 */
export default function BakingCookingConverter() {
  const {
    mode,
    setMode,
    category,
    setCategory,
    searchQuery,
    setSearchQuery,
    filteredIngredients,
    selectedIngredient,
    setSelectedIngredientId,
    amountInput,
    setAmountInput,
    amountInputRef,
    unit,
    setUnit,
    scaleMultiplier,
    setScaleMultiplier,
    conversionResult,
    ovenValue,
    setOvenValue,
    ovenUnit,
    handleSelectOvenUnit,
    ovenResult,
    handleReset,
    handleCopyAllSummary,
    customShortcuts,
  } = useBakingConverter();

  return (
    <>
      <HeaderBlock customShortcuts={customShortcuts} />

      <SectionGap />

      <div className="space-y-8 text-left">
        {/* Mode Switcher */}
        <Tabs<ConverterMode>
          tabs={CONVERTER_MODE_TABS}
          activeTab={mode}
          onChange={setMode}
          tabLabels={CONVERTER_MODE_LABELS}
          tabIcons={CONVERTER_MODE_ICONS}
          size="sm"
          variant="segment"
        />

        {mode === 'ingredients' ? (
          <div className="space-y-8">
            <IngredientSelector
              category={category}
              onSelectCategory={setCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              ingredients={filteredIngredients}
              selectedIngredient={selectedIngredient}
              onSelectIngredient={setSelectedIngredientId}
            />

            <ConverterInputs
              amountInput={amountInput}
              onAmountChange={setAmountInput}
              amountInputRef={amountInputRef}
              unit={unit}
              onUnitChange={setUnit}
              scaleMultiplier={scaleMultiplier}
              onScaleChange={setScaleMultiplier}
              onReset={handleReset}
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <PropertyResultSection
                title="Weight Equivalents"
                titleIcon={Scale}
                grouped
                columns={1}
                count={conversionResult.weightItems.length}
                countBadgeText={`${scaleMultiplier}× Batch`}
                items={conversionResult.weightItems}
                onCopyAll={handleCopyAllSummary}
              />

              <PropertyResultSection
                title="Volume Equivalents"
                titleIcon={Beaker}
                grouped
                columns={1}
                count={conversionResult.volumeItems.length}
                countBadgeText={selectedIngredient.name}
                items={conversionResult.volumeItems}
                onCopyAll={handleCopyAllSummary}
              />
            </div>
          </div>
        ) : (
          <OvenConverter
            ovenValue={ovenValue}
            onOvenValueChange={setOvenValue}
            ovenUnit={ovenUnit}
            onSelectOvenUnit={handleSelectOvenUnit}
            ovenResult={ovenResult}
            onCopyAll={handleCopyAllSummary}
          />
        )}
      </div>
    </>
  );
}
