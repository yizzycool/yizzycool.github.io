'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { capitalize } from 'lodash';

import { useToolsDB } from '@/hooks/tools/use-tools-db';
import useToolHotkeys from '@/hooks/tools/use-tool-hotkeys';

export type TransformAction =
  | 'upper'
  | 'lower'
  | 'title'
  | 'sentence'
  | 'camel'
  | 'kebab'
  | 'snake'
  | 'compact-spaces'
  | 'remove-blank-lines'
  | 'trim-lines'
  | 'unwrap'
  | 'remove-punc'
  | 'sort-asc'
  | 'sort-desc'
  | 'dedup-lines'
  | 'number-lines'
  | 'reverse-text';

const DRAFT_KEY = 'word-counter';

export default function useWordCounter() {
  const [text, setText] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { getValue, setValue, deleteValue } = useToolsDB();

  // Load draft from IndexedDB on mount
  useEffect(() => {
    let isMounted = true;

    getValue<string>('drafts', DRAFT_KEY)
      .then((savedDraft) => {
        if (
          isMounted &&
          typeof savedDraft === 'string' &&
          savedDraft.length > 0
        ) {
          setText(savedDraft);
        }
      })
      .catch((err) => {
        console.error('Failed to load draft from IndexedDB:', err);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoaded(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [getValue]);

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
        setSuccess('Draft saved successfully');
      } else {
        await deleteValue('drafts', DRAFT_KEY);
        setSuccess('Draft cleared');
      }
    } catch (err) {
      console.error('Failed to save draft:', err);
      setError('Failed to save draft');
    }
  }, [text, setValue, deleteValue]);

  const onCopy = useCallback(async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setSuccess('Content copied to clipboard');
    } catch (err) {
      console.error('Failed to copy text:', err);
      setError('Failed to copy to clipboard');
    }
  }, [text]);

  const onGlobalPaste = useCallback(async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        setText(clipText);
        setSuccess('Content pasted from clipboard');
      }
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  }, []);

  const onTransform = useCallback((actionType: TransformAction) => {
    setText((prev) => {
      if (!prev) return prev;
      switch (actionType) {
        case 'upper':
          return prev.toUpperCase();
        case 'lower':
          return prev.toLowerCase();
        case 'title':
          return prev.replace(/\w\S*/g, (txt) => capitalize(txt));
        case 'sentence':
          return prev
            .toLowerCase()
            .replace(
              /(^\s*|[.!?\n]\s*)([a-z\u00E0-\u00FC])/g,
              (_, prefix, letter) => prefix + letter.toUpperCase()
            );
        case 'camel':
          return prev
            .trim()
            .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
            .replace(/^[A-Z]/, (c) => c.toLowerCase());
        case 'kebab':
          return prev
            .trim()
            .replace(/([a-z\d])([A-Z])/g, '$1-$2')
            .replace(/[\s_]+/g, '-')
            .toLowerCase();
        case 'snake':
          return prev
            .trim()
            .replace(/([a-z\d])([A-Z])/g, '$1_$2')
            .replace(/[\s-]+/g, '_')
            .toLowerCase();
        case 'compact-spaces':
          return prev
            .split('\n')
            .map((line) => line.replace(/[^\S\r\n]+/g, ' ').trim())
            .join('\n');
        case 'remove-blank-lines':
          return prev
            .split(/\r?\n/)
            .filter((line) => line.trim().length > 0)
            .join('\n');
        case 'trim-lines':
          return prev
            .split(/\r?\n/)
            .map((line) => line.trim())
            .join('\n');
        case 'unwrap':
          return prev
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean)
            .join(' ');
        case 'remove-punc':
          return prev.replace(/[\p{P}\p{S}]/gu, '');
        case 'sort-asc':
          return prev
            .split(/\r?\n/)
            .sort((a, b) =>
              a.localeCompare(b, undefined, {
                numeric: true,
                sensitivity: 'base',
              })
            )
            .join('\n');
        case 'sort-desc':
          return prev
            .split(/\r?\n/)
            .sort((a, b) =>
              b.localeCompare(a, undefined, {
                numeric: true,
                sensitivity: 'base',
              })
            )
            .join('\n');
        case 'dedup-lines':
          return Array.from(new Set(prev.split(/\r?\n/))).join('\n');
        case 'number-lines':
          return prev
            .split(/\r?\n/)
            .map((line, idx) => `${idx + 1}. ${line}`)
            .join('\n');
        case 'reverse-text':
          return Array.from(prev).reverse().join('');
        default:
          return prev;
      }
    });
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
    success,
    setSuccess,
    error,
    setError,
    onInputChange,
    onClear,
    onSave,
    onCopy,
    onTransform,
  };
}
