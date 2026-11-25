export type DiffKind = 'added' | 'removed' | 'changed';

export type JsonDiffEntry = {
  path: string;
  kind: DiffKind;
  leftValue?: unknown;
  rightValue?: unknown;
};

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function appendKeyPath(base: string, key: string): string {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)
    ? `${base}.${key}`
    : `${base}[${JSON.stringify(key)}]`;
}

function walkDiff(
  left: unknown,
  right: unknown,
  path: string,
  entries: JsonDiffEntry[]
): void {
  if (Object.is(left, right)) return;

  if (Array.isArray(left) && Array.isArray(right)) {
    const maxLen = Math.max(left.length, right.length);
    for (let i = 0; i < maxLen; i++) {
      const itemPath = `${path}[${i}]`;
      if (i >= left.length) {
        entries.push({ path: itemPath, kind: 'added', rightValue: right[i] });
      } else if (i >= right.length) {
        entries.push({ path: itemPath, kind: 'removed', leftValue: left[i] });
      } else {
        walkDiff(left[i], right[i], itemPath, entries);
      }
    }
    return;
  }

  if (isObjectRecord(left) && isObjectRecord(right)) {
    const keys = Array.from(
      new Set([...Object.keys(left), ...Object.keys(right)])
    );
    for (const key of keys) {
      const childPath = appendKeyPath(path, key);
      const hasLeft = Object.prototype.hasOwnProperty.call(left, key);
      const hasRight = Object.prototype.hasOwnProperty.call(right, key);

      if (!hasLeft && hasRight) {
        entries.push({
          path: childPath,
          kind: 'added',
          rightValue: right[key],
        });
      } else if (hasLeft && !hasRight) {
        entries.push({
          path: childPath,
          kind: 'removed',
          leftValue: left[key],
        });
      } else {
        walkDiff(left[key], right[key], childPath, entries);
      }
    }
    return;
  }

  entries.push({
    path,
    kind: 'changed',
    leftValue: left,
    rightValue: right,
  });
}

/**
 * Compare two parsed JSON values recursively and return structured JSONPath diff entries.
 */
export function computeJsonDiff(
  left: unknown,
  right: unknown
): JsonDiffEntry[] {
  const entries: JsonDiffEntry[] = [];
  walkDiff(left, right, '$', entries);
  return entries;
}
