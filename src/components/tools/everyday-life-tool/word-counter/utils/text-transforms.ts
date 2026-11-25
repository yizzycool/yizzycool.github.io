import { capitalize } from 'lodash';

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
  | 'pangu-spacing'
  | 'to-halfwidth'
  | 'to-fullwidth'
  | 'strip-markdown'
  | 'sort-asc'
  | 'sort-desc'
  | 'dedup-lines'
  | 'number-lines'
  | 'reverse-text';

const CJK_CHAR = '[\u4e00-\u9fff\u3400-\u4dbf\u3040-\u30ff\uac00-\ud7af]';
const CJK_TO_ANS = new RegExp(`(${CJK_CHAR})([A-Za-z0-9@#&])`, 'g');
const ANS_TO_CJK = new RegExp(`([A-Za-z0-9!%])(${CJK_CHAR})`, 'g');

function applyPanguSpacing(text: string): string {
  return text.replace(CJK_TO_ANS, '$1 $2').replace(ANS_TO_CJK, '$1 $2');
}

function convertToHalfwidth(text: string): string {
  return text
    .replace(/\u3000/g, ' ')
    .replace(/[\uff01-\uff5e]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) - 0xfee0)
    );
}

function convertToFullwidth(text: string): string {
  return text.replace(/[\x21-\x7e]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) + 0xfee0)
  );
}

function stripMarkdownSyntax(text: string): string {
  return text
    .replace(/```[a-zA-Z0-9_-]*\r?\n([\s\S]*?)```/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s{0,3}>\s?/gm, '')
    .replace(/^\s*([-*_]){3,}\s*$/gm, '')
    .replace(/^\s*[-*+]\s+\[[ xX]\]\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/~~(.*?)~~/g, '$1');
}

/**
 * Apply a deterministic text transformation action to the input string.
 */
export function applyTextTransform(
  prev: string,
  actionType: TransformAction
): string {
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
    case 'pangu-spacing':
      return applyPanguSpacing(prev);
    case 'to-halfwidth':
      return convertToHalfwidth(prev);
    case 'to-fullwidth':
      return convertToFullwidth(prev);
    case 'strip-markdown':
      return stripMarkdownSyntax(prev);
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
}
