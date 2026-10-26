'use client';

import type { CidrCalculationResult, SubnetSplitItem } from './types';

import { GitFork } from 'lucide-react';

import { CopyAction } from '@/components/shared/action-button';
import LabelBar from '@/components/tools/common/label-bar';
import { PillTabs } from '@/components/ui/tabs/pill-tabs';

interface SubnetSplitSectionProps {
  result: CidrCalculationResult | null;
  splitPrefix: number;
  splitResults: SubnetSplitItem[];
  onChangeSplitPrefix: (prefix: number) => void;
}

export default function SubnetSplitSection({
  result,
  splitPrefix,
  splitResults,
  onChangeSplitPrefix,
}: SubnetSplitSectionProps) {
  const hasResult = Boolean(result && result.isValid);

  // Calculate available target prefixes (e.g. current + 1 up to min(32, current + 6))
  const targetPrefixes: number[] = [];
  if (hasResult && result && result.prefix < 32) {
    const maxTargetPrefix = Math.min(32, result.prefix + 6);
    for (let p = result.prefix + 1; p <= maxTargetPrefix; p++) {
      targetPrefixes.push(p);
    }
  }

  return (
    <div className="space-y-3">
      {/* Label and Split Prefix Selector */}
      <LabelBar icon={GitFork} label="Subnet Split / VLSM Breakdown" />

      {/* Target Split Prefix Selector */}
      {hasResult && targetPrefixes.length > 0 && result && (
        <SubnetSplitSelector
          currentPrefix={result.prefix}
          targetPrefixes={targetPrefixes}
          splitPrefix={splitPrefix}
          onChangeSplitPrefix={onChangeSplitPrefix}
        />
      )}

      {/* Subnets List Table */}
      <div className="shadow-2xs overflow-hidden rounded-2xl border border-neutral-200/80 bg-white/70 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/60">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-neutral-200/70 bg-neutral-100/50 text-xs font-medium text-slate-500 dark:border-neutral-800/60 dark:bg-neutral-800/30 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2.5 sm:px-4">Subnet CIDR</th>
                <th className="px-3 py-2.5 sm:px-4">Usable Range</th>
                <th className="hidden px-3 py-2.5 sm:px-4 md:table-cell">
                  Broadcast
                </th>
                <th className="px-3 py-2.5 text-right sm:px-4">Hosts</th>
                <th className="w-12 px-3 py-2.5 text-right sm:px-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200/70 font-mono text-xs dark:divide-neutral-800/60">
              {splitResults.length > 0 ? (
                splitResults.map((item) => (
                  <tr
                    key={item.cidr}
                    className="group transition-colors hover:bg-neutral-100/50 dark:hover:bg-neutral-800/40"
                  >
                    <td className="px-3 py-2 font-bold text-slate-800 sm:px-4 dark:text-slate-100">
                      {item.cidr}
                    </td>
                    <td className="px-3 py-2 text-slate-600 sm:px-4 dark:text-slate-400">
                      {item.usableRange}
                    </td>
                    <td className="hidden px-3 py-2 text-slate-600 sm:px-4 md:table-cell dark:text-slate-400">
                      {item.broadcastAddress}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-600 sm:px-4 dark:text-slate-400">
                      {item.usableHosts.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-right sm:px-4">
                      <CopyAction
                        display="icon"
                        variant="ghost"
                        size="xs"
                        rounded="md"
                        content={`${item.cidr} (Range: ${item.usableRange}, Broadcast: ${item.broadcastAddress})`}
                        ariaLabel={`Copy subnet details for ${item.cidr}`}
                        title="Copy subnet details"
                        successToast={`Copied ${item.cidr}!`}
                        className="text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200"
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center font-sans text-xs text-slate-400 dark:text-neutral-500"
                  >
                    {hasResult && result && result.prefix >= 32
                      ? 'Single host /32 cannot be split further.'
                      : 'Click "Calculate Subnet" to inspect sub-block splits and allocations.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

interface SubnetSplitSelectorProps {
  currentPrefix: number;
  targetPrefixes: number[];
  splitPrefix: number;
  onChangeSplitPrefix: (prefix: number) => void;
}

/**
 * Subnet Split Prefix Selector using PillTabs
 */
function SubnetSplitSelector({
  currentPrefix,
  targetPrefixes,
  splitPrefix,
  onChangeSplitPrefix,
}: SubnetSplitSelectorProps) {
  const tabs = targetPrefixes.map(String);
  const activeTab = String(splitPrefix);

  const tabLabels = (prefixStr: string) => {
    const p = Number(prefixStr);
    const numSubnets = Math.pow(2, p - currentPrefix);
    return `/${p} (${numSubnets} ${numSubnets === 1 ? 'subnet' : 'subnets'})`;
  };

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="font-medium text-slate-500 dark:text-slate-400">
        Split into:
      </span>
      <PillTabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={(val) => onChangeSplitPrefix(Number(val))}
        tabLabels={tabLabels}
        size="xs"
        variant="segment"
        className="font-mono text-xs"
      />
    </div>
  );
}
