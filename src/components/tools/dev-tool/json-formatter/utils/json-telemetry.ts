export type JsonTelemetry = {
  bytes: number;
  nodeCount: number;
  maxDepth: number;
  rootType: string;
};

export type JsonPathEntry = {
  path: string;
  type: string;
  preview: string;
};

function appendKeyPath(base: string, key: string): string {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)
    ? `${base}.${key}`
    : `${base}[${JSON.stringify(key)}]`;
}

function describePreview(val: unknown): string {
  if (val === null) return 'null';
  if (Array.isArray(val)) return `Array(${val.length})`;
  if (typeof val === 'object') return `Object(${Object.keys(val).length})`;
  if (typeof val === 'string') {
    return val.length > 48 ? `"${val.slice(0, 48)}…"` : JSON.stringify(val);
  }
  return String(val);
}

/**
 * Measure UTF-8 payload size, total JSON nodes, and maximum nesting depth.
 */
export function computeJsonTelemetry(
  raw: string,
  parsed: unknown
): JsonTelemetry {
  const bytes = raw ? new TextEncoder().encode(raw).length : 0;

  if (parsed === null || parsed === undefined) {
    return {
      bytes,
      nodeCount: 0,
      maxDepth: 0,
      rootType: parsed === null ? 'null' : 'none',
    };
  }

  let nodeCount = 0;
  let maxDepth = 0;

  const visit = (node: unknown, depth: number) => {
    nodeCount++;
    if (depth > maxDepth) maxDepth = depth;

    if (Array.isArray(node)) {
      for (const item of node) {
        visit(item, depth + 1);
      }
    } else if (typeof node === 'object' && node !== null) {
      for (const val of Object.values(node)) {
        visit(val, depth + 1);
      }
    }
  };

  visit(parsed, 1);

  return {
    bytes,
    nodeCount,
    maxDepth,
    rootType: Array.isArray(parsed)
      ? 'Array'
      : typeof parsed === 'object'
        ? 'Object'
        : typeof parsed,
  };
}

/**
 * Flatten a parsed JSON tree into searchable `$.path` entries with type and preview.
 */
export function flattenJsonPaths(
  parsed: unknown,
  maxEntries = 300
): JsonPathEntry[] {
  if (parsed === undefined || parsed === null) return [];

  const entries: JsonPathEntry[] = [];

  const walk = (node: unknown, path: string) => {
    if (entries.length >= maxEntries) return;

    const type =
      node === null ? 'null' : Array.isArray(node) ? 'array' : typeof node;

    entries.push({
      path,
      type,
      preview: describePreview(node),
    });

    if (Array.isArray(node)) {
      for (let i = 0; i < node.length; i++) {
        walk(node[i], `${path}[${i}]`);
      }
    } else if (typeof node === 'object' && node !== null) {
      for (const [k, v] of Object.entries(node)) {
        walk(v, appendKeyPath(path, k));
      }
    }
  };

  walk(parsed, '$');
  return entries;
}
