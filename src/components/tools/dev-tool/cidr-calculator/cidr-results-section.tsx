'use client';

import type { CidrCalculationResult } from './types';

import { Activity } from 'lucide-react';

import { InsetGroup } from '@/components/tools/common/inset-group';
import LabelBar from '@/components/tools/common/label-bar';
import { PropertyRow } from '@/components/tools/common/property-row';

interface CidrResultsSectionProps {
  result: CidrCalculationResult | null;
}

export default function CidrResultsSection({
  result,
}: CidrResultsSectionProps) {
  // Determine badge variant for IP scope
  const getScopeBadgeVariant = () => {
    if (!result) return 'neutral';
    switch (result.scope) {
      case 'private':
        return 'success';
      case 'public':
        return 'primary';
      case 'loopback':
        return 'amber';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="space-y-3">
      {/* Label and Summary Bar */}
      <LabelBar icon={Activity} label="Subnet & IP Properties" />

      {/* Inset Grouped Container */}
      <InsetGroup rounded="2xl">
        {/* 1. IP Address & Mask */}
        <PropertyRow
          label="IP Address & Mask"
          badge={result ? `/${result.prefix}` : '---'}
          value={result ? `${result.ip} / ${result.netmask}` : '---'}
          copyable={Boolean(result?.ip)}
          grouped
          hoverAction
        />

        {/* 2. 32-Bit Binary Allocation (Binary format of the input IP) */}
        <PropertyRow
          label="IP Address Binary Format"
          badge={
            result ? `${result.prefix} Net / ${32 - result.prefix} Host` : '---'
          }
          value={result?.binaryIp || '---'}
          copyable={Boolean(result?.binaryIp)}
          grouped
          hoverAction
        />

        {/* 3. CIDR Block */}
        <PropertyRow
          label="CIDR Block"
          badge={result ? `/${result.prefix}` : '---'}
          value={result?.cidr || '---'}
          copyable={Boolean(result?.cidr)}
          grouped
          hoverAction
        />

        {/* 4. Scope & Classification */}
        <PropertyRow
          label="IP Scope & Classification"
          badge={result ? result.scope.toUpperCase() : '---'}
          badgeVariant={getScopeBadgeVariant()}
          value={result?.scopeLabel || '---'}
          copyable={Boolean(result?.scopeLabel)}
          grouped
          hoverAction
        />

        {/* 5. Usable Host Range */}
        <PropertyRow
          label="Usable Host Range"
          badge={
            result ? `${result.usableHosts.toLocaleString()} hosts` : '---'
          }
          value={result?.usableHostRange || '---'}
          copyable={Boolean(result?.usableHostRange)}
          grouped
          hoverAction
        />

        {/* 6. Host Counts */}
        <PropertyRow
          label="Total / Usable Hosts"
          badge={
            result
              ? result.prefix === 31
                ? 'RFC 3021'
                : result.prefix === 32
                  ? 'Single Host'
                  : 'Classless'
              : '---'
          }
          value={
            result
              ? `${result.usableHosts.toLocaleString()} usable (${result.totalHosts.toLocaleString()} total)`
              : '---'
          }
          copyable={Boolean(result)}
          grouped
          hoverAction
        />

        {/* 7. Subnet Netmask */}
        <PropertyRow
          label="Subnet Netmask"
          badge="Dotted Decimal"
          value={result?.netmask || '---'}
          copyable={Boolean(result?.netmask)}
          grouped
          hoverAction
        />

        {/* 8. Wildcard Mask */}
        <PropertyRow
          label="Wildcard Mask (Inverse)"
          badge="Cisco / ACL"
          value={result?.wildcardMask || '---'}
          copyable={Boolean(result?.wildcardMask)}
          grouped
          hoverAction
        />

        {/* 9. Network Address */}
        <PropertyRow
          label="Network Address"
          badge="First IP (Route ID)"
          value={result?.networkAddress || '---'}
          copyable={Boolean(result?.networkAddress)}
          grouped
          hoverAction
        />

        {/* 10. Broadcast Address */}
        <PropertyRow
          label="Broadcast Address"
          badge="Last IP (Broadcast)"
          value={result?.broadcastAddress || '---'}
          copyable={Boolean(result?.broadcastAddress)}
          grouped
          hoverAction
        />

        {/* 11. Binary Subnet Mask */}
        <PropertyRow
          label="Binary Subnet Mask"
          badge="32 Bits"
          value={result?.binaryNetmask || '---'}
          copyable={Boolean(result?.binaryNetmask)}
          grouped
          hoverAction
        />

        {/* 12. Decimal & Hex IP */}
        <PropertyRow
          label="Decimal & Hexadecimal IP"
          badge="Integer / Hex"
          value={result ? `${result.integerIp} (${result.hexIp})` : '---'}
          copyable={Boolean(result)}
          grouped
          hoverAction
        />
      </InsetGroup>
    </div>
  );
}
