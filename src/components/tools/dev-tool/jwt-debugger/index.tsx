'use client';

import { useCallback, useRef } from 'react';

import HeaderBlock from '@/components/tools/common/header-block';
import SectionGap from '@/components/tools/common/section-gap';
import useToolHotkeys, { TOOL_HOTKEYS } from '@/hooks/tools/use-tool-hotkeys';
import toast from '@/utils/toast';

import { useJwtDebugger } from './hooks/use-jwt-debugger';
import JwtInputBar from './jwt-input-bar';
import JwtSectionCard from './jwt-section-card';
import TimeClaimsCard from './time-claims-card';
import TokenStatusSummary from './token-status-summary';

export default function JwtDebugger() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    tokenInput,
    parsed,
    handleInputChange,
    handleLoadSample,
    handleClear,
    handleCopyPayload,
  } = useJwtDebugger();

  const handlePasteToken = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) {
        toast.warning('Clipboard is empty');
        return;
      }
      handleInputChange(text.trim());
      toast.success('Pasted token from clipboard');
    } catch {
      toast.error('Failed to read from clipboard');
    }
  }, [handleInputChange]);

  // Global hotkeys: Mod+Shift+C (Copy Payload), Mod+Shift+V (Paste Token), Esc (Clear when textarea focused)
  useToolHotkeys(
    {
      onCopy: handleCopyPayload,
      onPaste: handlePasteToken,
      onClear: handleClear,
    },
    {
      target: textareaRef,
    }
  );

  const formattedHeader = parsed.status.isValid
    ? JSON.stringify(parsed.header, null, 2)
    : '';

  const formattedPayload = parsed.status.isValid
    ? JSON.stringify(parsed.payload, null, 2)
    : '';

  return (
    <div>
      <HeaderBlock
        customShortcuts={[
          TOOL_HOTKEYS.paste,
          TOOL_HOTKEYS.copy,
          TOOL_HOTKEYS.clear,
          TOOL_HOTKEYS.help,
        ]}
      />

      {/* Input token textarea */}
      <JwtInputBar
        textareaRef={textareaRef}
        tokenInput={tokenInput}
        onInputChange={handleInputChange}
        onLoadSample={handleLoadSample}
        onClear={handleClear}
      />

      {/* Status summary banner */}
      <TokenStatusSummary
        status={parsed.status}
        tokenLength={tokenInput.trim().length}
      />

      <SectionGap size="sm" />

      {/* Main 2-column inspection layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column: Payload & Time Claims */}
        <div className="flex flex-col gap-6">
          <JwtSectionCard
            label="Payload"
            description="Decoded JSON payload containing claims and user data."
            content={formattedPayload}
            emptyFallbackText="Enter or paste a valid JWT to view decoded payload"
          />

          <TimeClaimsCard timeClaims={parsed.timeClaims} />
        </div>

        {/* Right Column: Header & Signature */}
        <div className="flex flex-col gap-6">
          <JwtSectionCard
            label="Header"
            description="Metadata specifying signing algorithm and token type."
            content={formattedHeader}
            emptyFallbackText="Enter or paste a valid JWT to view header"
          />

          <JwtSectionCard
            label={
              parsed.header.alg
                ? `Signature (${parsed.header.alg})`
                : 'Signature'
            }
            description="Cryptographic signature hashed by the identity provider."
            content={parsed.signature}
            emptyFallbackText="No signature available"
            type="secret"
          />
        </div>
      </div>
    </div>
  );
}
