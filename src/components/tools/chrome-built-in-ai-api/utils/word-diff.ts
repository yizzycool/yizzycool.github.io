export type DiffSegmentType = 'equal' | 'delete' | 'insert';

export type DiffSegment = {
  type: DiffSegmentType;
  value: string;
};

export type DiffStats = {
  added: number;
  removed: number;
};

const MAX_DP_CELLS = 250_000;

function tokenizeWords(text: string): string[] {
  return text.match(/(\s+|[^\s]+)/g) ?? [];
}

function tokenizeLines(text: string): string[] {
  if (!text) return [];
  return text.split(/(\n)/);
}

function computeLcsDiff(a: string[], b: string[]): DiffSegment[] {
  const m = a.length;
  const n = b.length;

  // Flat typed array keeps memory compact and cache-friendly for medium documents
  const dp = new Uint32Array((m + 1) * (n + 1));
  const width = n + 1;

  for (let i = m - 1; i >= 0; i--) {
    const rowOffset = i * width;
    const nextRowOffset = (i + 1) * width;
    for (let j = n - 1; j >= 0; j--) {
      if (a[i] === b[j]) {
        dp[rowOffset + j] = dp[nextRowOffset + j + 1] + 1;
      } else {
        const down = dp[nextRowOffset + j];
        const right = dp[rowOffset + j + 1];
        dp[rowOffset + j] = down >= right ? down : right;
      }
    }
  }

  const raw: DiffSegment[] = [];
  let i = 0;
  let j = 0;

  while (i < m && j < n) {
    if (a[i] === b[j]) {
      raw.push({ type: 'equal', value: a[i] });
      i++;
      j++;
    } else if (dp[(i + 1) * width + j] >= dp[i * width + j + 1]) {
      raw.push({ type: 'delete', value: a[i] });
      i++;
    } else {
      raw.push({ type: 'insert', value: b[j] });
      j++;
    }
  }

  while (i < m) {
    raw.push({ type: 'delete', value: a[i] });
    i++;
  }

  while (j < n) {
    raw.push({ type: 'insert', value: b[j] });
    j++;
  }

  return raw;
}

function mergeAdjacentSegments(raw: DiffSegment[]): DiffSegment[] {
  const merged: DiffSegment[] = [];
  for (const seg of raw) {
    if (!seg.value) continue;
    const last = merged[merged.length - 1];
    if (last && last.type === seg.type) {
      last.value += seg.value;
    } else {
      merged.push({ ...seg });
    }
  }
  return merged;
}

function countNonWhitespaceTokens(
  segments: DiffSegment[],
  type: DiffSegmentType
) {
  let count = 0;
  for (const seg of segments) {
    if (seg.type !== type) continue;
    const tokens = seg.value.match(/[^\s]+/g);
    if (tokens) count += tokens.length;
  }
  return count;
}

/**
 * Computes a word-level LCS diff between original and modified strings.
 * Falls back to line-level LCS for huge documents to keep runtime bounded.
 */
export function computeWordDiff(
  original: string,
  modified: string
): { segments: DiffSegment[]; stats: DiffStats } {
  if (original === modified) {
    return {
      segments: original ? [{ type: 'equal', value: original }] : [],
      stats: { added: 0, removed: 0 },
    };
  }

  const origWords = tokenizeWords(original);
  const modWords = tokenizeWords(modified);

  let rawSegments: DiffSegment[];

  if (origWords.length * modWords.length <= MAX_DP_CELLS) {
    rawSegments = computeLcsDiff(origWords, modWords);
  } else {
    const origLines = tokenizeLines(original);
    const modLines = tokenizeLines(modified);

    if (origLines.length * modLines.length <= MAX_DP_CELLS) {
      rawSegments = computeLcsDiff(origLines, modLines);
    } else {
      rawSegments = [
        ...(original ? [{ type: 'delete' as const, value: original }] : []),
        ...(modified ? [{ type: 'insert' as const, value: modified }] : []),
      ];
    }
  }

  const segments = mergeAdjacentSegments(rawSegments);
  return {
    segments,
    stats: {
      added: countNonWhitespaceTokens(segments, 'insert'),
      removed: countNonWhitespaceTokens(segments, 'delete'),
    },
  };
}
