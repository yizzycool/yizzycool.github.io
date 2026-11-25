export type TextStats = {
  totalChars: number;
  charsNoSpaces: number;
  lines: number;
  paragraphs: number;
  sentences: number;
  numbers: number;
  chineseChars: number;
  chinesePunc: number;
  englishLetters: number;
  englishPunc: number;
  englishWords: number;
  smartWords: number;
  bytes: number;
  readingMinutes: number;
  speakingMinutes: number;
};

export type KeywordDensityItem = {
  term: string;
  count: number;
  percentage: number;
};

export type PlatformLimit = {
  id: string;
  name: string;
  maxChars: number;
  category: 'Social' | 'SEO';
};

export const PLATFORM_LIMITS: PlatformLimit[] = [
  { id: 'seo-title', name: 'Google SEO Title', maxChars: 60, category: 'SEO' },
  {
    id: 'seo-meta',
    name: 'Google Meta Description',
    maxChars: 160,
    category: 'SEO',
  },
  { id: 'x-post', name: 'X (Twitter) Post', maxChars: 280, category: 'Social' },
  { id: 'threads', name: 'Threads Post', maxChars: 500, category: 'Social' },
  {
    id: 'instagram',
    name: 'Instagram Caption',
    maxChars: 2200,
    category: 'Social',
  },
];

const ENGLISH_STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'but',
  'by',
  'for',
  'from',
  'has',
  'have',
  'he',
  'her',
  'his',
  'i',
  'in',
  'is',
  'it',
  'its',
  'me',
  'my',
  'not',
  'of',
  'on',
  'or',
  'our',
  'she',
  'so',
  'that',
  'the',
  'their',
  'them',
  'they',
  'this',
  'to',
  'us',
  'was',
  'we',
  'were',
  'with',
  'you',
  'your',
]);

/**
 * Compute comprehensive character, word, sentence, paragraph, byte, and reading-time stats.
 */
export function computeTextStats(text: string): TextStats {
  if (!text) {
    return {
      totalChars: 0,
      charsNoSpaces: 0,
      lines: 0,
      paragraphs: 0,
      sentences: 0,
      numbers: 0,
      chineseChars: 0,
      chinesePunc: 0,
      englishLetters: 0,
      englishPunc: 0,
      englishWords: 0,
      smartWords: 0,
      bytes: 0,
      readingMinutes: 0,
      speakingMinutes: 0,
    };
  }

  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const chinesePunc = (
    text.match(
      /[\u3000-\u303f\uff01-\uff0f\uff1a-\uff20\uff3b-\uff40\uff5b-\uff65]/g
    ) || []
  ).length;
  const englishLetters = (text.match(/[a-zA-Z]/g) || []).length;
  const englishPunc = (
    text.match(/[!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]/g) || []
  ).length;
  const numbers = (text.match(/\d/g) || []).length;
  const englishWords = (text.match(/[a-zA-Z0-9']+/g) || []).length;

  const trimmed = text.trim();
  const lines = trimmed === '' ? 0 : text.split('\n').length;
  const paragraphs =
    trimmed === ''
      ? 0
      : trimmed
          .split(/\r?\n\s*\r?\n/)
          .filter((block) => block.trim().length > 0).length;
  const sentenceMatches =
    trimmed === ''
      ? []
      : trimmed.split(/[.!?。！？]+/).filter((part) => part.trim().length > 0);
  const sentences = sentenceMatches.length;

  const totalChars = text.length;
  const charsNoSpaces = text.replace(/\s/g, '').length;
  const smartWords = englishWords + chineseChars;
  const bytes = new TextEncoder().encode(text).length;

  // Reading: ~220 EN wpm / ~350 CJK cpm; Speaking: ~135 EN wpm / ~220 CJK cpm
  const readingMinutes = englishWords / 220 + chineseChars / 350;
  const speakingMinutes = englishWords / 135 + chineseChars / 220;

  return {
    totalChars,
    charsNoSpaces,
    lines,
    paragraphs,
    sentences,
    numbers,
    chineseChars,
    chinesePunc,
    englishLetters,
    englishPunc,
    englishWords,
    smartWords,
    bytes,
    readingMinutes,
    speakingMinutes,
  };
}

/**
 * Format fractional minutes into a crisp human-readable duration badge string.
 */
export function formatMinutesLabel(minutes: number): string {
  if (minutes <= 0) return '0s';
  const totalSeconds = Math.max(1, Math.round(minutes * 60));
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

/**
 * Compute top 1-gram / 2-gram / 3-gram keyword frequencies across Latin words and CJK spans.
 */
export function computeKeywordDensity(
  text: string,
  nGram: 1 | 2 | 3,
  limit = 10
): KeywordDensityItem[] {
  if (!text.trim()) return [];

  const tokens: string[] = [];
  const rawSegments = text.match(/[\u4e00-\u9fa5]+|[a-zA-Z0-9']+/g) || [];

  for (const segment of rawSegments) {
    if (/^[\u4e00-\u9fa5]+$/.test(segment)) {
      for (const ch of segment) {
        tokens.push(ch);
      }
    } else {
      const lower = segment.toLowerCase();
      if (lower.length > 0) {
        tokens.push(lower);
      }
    }
  }

  if (tokens.length < nGram) return [];

  const counts = new Map<string, number>();
  let totalValid = 0;

  for (let i = 0; i <= tokens.length - nGram; i++) {
    const slice = tokens.slice(i, i + nGram);

    if (nGram === 1) {
      const token = slice[0];
      const isCjk = /^[\u4e00-\u9fa5]$/.test(token);
      if (!isCjk && (token.length < 2 || ENGLISH_STOP_WORDS.has(token))) {
        continue;
      }
    } else if (
      slice.every((t) => ENGLISH_STOP_WORDS.has(t)) ||
      slice.some((t) => t.length === 1 && !/^[\u4e00-\u9fa5]$/.test(t))
    ) {
      continue;
    }

    const allCjk = slice.every((t) => /^[\u4e00-\u9fa5]$/.test(t));
    const term = allCjk ? slice.join('') : slice.join(' ');
    counts.set(term, (counts.get(term) ?? 0) + 1);
    totalValid++;
  }

  if (totalValid === 0) return [];

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([term, count]) => ({
      term,
      count,
      percentage: (count / totalValid) * 100,
    }));
}
