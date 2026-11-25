'use client';

import type { TransformAction } from '../utils/text-transforms';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  clearTextHandoffQueryParam,
  consumeTextHandoff,
  hasTextHandoffQueryParam,
} from '@/components/tools/common/text-handoff';
import { useToolsDB } from '@/hooks/tools/use-tools-db';
import useToolHotkeys from '@/hooks/tools/use-tool-hotkeys';
import toast from '@/utils/toast';

import { applyTextTransform } from '../utils/text-transforms';

export type { TransformAction } from '../utils/text-transforms';

const DRAFT_KEY = 'word-counter';

export default function useWordCounter() {
  const [text, setText] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { getValue, setValue, deleteValue } = useToolsDB();

  // Load draft or cross-tool text handoff from IndexedDB on mount
  useEffect(() => {
    let isMounted = true;

    async function loadInitialText() {
      try {
        if (hasTextHandoffQueryParam()) {
          clearTextHandoffQueryParam();
          const handoffPayload = await consumeTextHandoff(
            getValue,
            deleteValue,
            'word-counter'
          );
          if (isMounted && handoffPayload) {
            setText(handoffPayload.text);
            await setValue('drafts', DRAFT_KEY, handoffPayload.text).catch(
              () => {}
            );
            toast.success('Loaded extracted text into Word Counter');
            return;
          }
        }

        const savedDraft = await getValue<string>('drafts', DRAFT_KEY);
        if (
          isMounted &&
          typeof savedDraft === 'string' &&
          savedDraft.length > 0
        ) {
          setText(savedDraft);
        }
      } catch (err) {
        console.error('Failed to load draft from IndexedDB:', err);
      } finally {
        if (isMounted) {
          setIsLoaded(true);
        }
      }
    }

    void loadInitialText();

    return () => {
      isMounted = false;
    };
  }, [getValue, setValue, deleteValue]);

  // Auto-save draft on change (debounced)
  useEffect(() => {
    if (!isLoaded) return;

    const timer = setTimeout(() => {
      if (text) {
        setValue('drafts', DRAFT_KEY, text).catch(() => {});
      } else {
        deleteValue('drafts', DRAFT_KEY).catch(() => {});
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [text, isLoaded, setValue, deleteValue]);

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setText(e.target.value);
    },
    []
  );

  const onClear = useCallback(() => {
    setText('');
    deleteValue('drafts', DRAFT_KEY).catch(() => {});
  }, [deleteValue]);

  const onSave = useCallback(async () => {
    try {
      if (text) {
        await setValue('drafts', DRAFT_KEY, text);
        toast.success('Draft saved successfully');
      } else {
        await deleteValue('drafts', DRAFT_KEY);
        toast.info('Draft cleared');
      }
    } catch (err) {
      console.error('Failed to save draft:', err);
      toast.error('Failed to save draft');
    }
  }, [text, setValue, deleteValue]);

  const onCopy = useCallback(async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Content copied to clipboard');
    } catch (err) {
      console.error('Failed to copy text:', err);
      toast.error('Failed to copy to clipboard');
    }
  }, [text]);

  const onGlobalPaste = useCallback(async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        setText(clipText);
        toast.success('Content pasted from clipboard');
      }
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  }, []);

  const onTransform = useCallback((actionType: TransformAction) => {
    setText((prev) => applyTextTransform(prev, actionType));
  }, []);

  useToolHotkeys(
    {
      onSave: onSave,
      onCopy: onCopy,
      onPaste: onGlobalPaste,
      onClear: onClear,
    },
    { target: inputRef }
  );

  return {
    text,
    setText,
    inputRef,
    onInputChange,
    onClear,
    onSave,
    onCopy,
    onTransform,
  };
}
