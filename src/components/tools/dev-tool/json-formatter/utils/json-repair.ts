export type JsonRepairResult = {
  repaired: string;
  parsed: object | Array<unknown>;
  fixes: string[];
};

function stripCommentsAndNormalizeStrings(
  source: string,
  fixes: Set<string>
): string {
  let result = '';
  let i = 0;

  while (i < source.length) {
    const ch = source[i];
    const next = source[i + 1];

    // Double-quoted string: keep verbatim with escape handling
    if (ch === '"') {
      result += ch;
      i++;
      while (i < source.length) {
        const inner = source[i];
        result += inner;
        if (inner === '\\' && i + 1 < source.length) {
          result += source[i + 1];
          i += 2;
          continue;
        }
        i++;
        if (inner === '"') break;
      }
      continue;
    }

    // Single-quoted string -> double-quoted JSON string
    if (ch === "'") {
      fixes.add('Converted single quotes to double quotes');
      result += '"';
      i++;
      while (i < source.length) {
        const inner = source[i];
        if (inner === '\\' && i + 1 < source.length) {
          const escaped = source[i + 1];
          result += escaped === "'" ? "'" : `\\${escaped}`;
          i += 2;
          continue;
        }
        if (inner === '"') {
          result += '\\"';
          i++;
          continue;
        }
        if (inner === "'") {
          result += '"';
          i++;
          break;
        }
        result += inner;
        i++;
      }
      continue;
    }

    // Single-line // comment
    if (ch === '/' && next === '/') {
      fixes.add('Removed JS comments');
      i += 2;
      while (i < source.length && source[i] !== '\n') {
        i++;
      }
      continue;
    }

    // Multi-line /* ... */ comment
    if (ch === '/' && next === '*') {
      fixes.add('Removed JS comments');
      i += 2;
      while (
        i < source.length &&
        !(source[i] === '*' && source[i + 1] === '/')
      ) {
        i++;
      }
      i += 2;
      continue;
    }

    result += ch;
    i++;
  }

  return result;
}

function quoteUnquotedObjectKeys(source: string, fixes: Set<string>): string {
  // Match unquoted JS object keys preceded by `{` or `,` (outside string literals)
  let out = '';
  let i = 0;

  while (i < source.length) {
    const ch = source[i];

    if (ch === '"') {
      const start = i;
      i++;
      while (i < source.length) {
        if (source[i] === '\\' && i + 1 < source.length) {
          i += 2;
          continue;
        }
        i++;
        if (source[i - 1] === '"') break;
      }
      out += source.slice(start, i);
      continue;
    }

    if (ch === '{' || ch === ',') {
      out += ch;
      i++;
      const wsStart = i;
      while (i < source.length && /\s/.test(source[i])) {
        i++;
      }
      out += source.slice(wsStart, i);

      const keyMatch = /^([A-Za-z_$][A-Za-z0-9_$-]*)(\s*:)/.exec(
        source.slice(i)
      );
      if (keyMatch) {
        fixes.add('Quoted unquoted object keys');
        out += `"${keyMatch[1]}"${keyMatch[2]}`;
        i += keyMatch[0].length;
      }
      continue;
    }

    out += ch;
    i++;
  }

  return out;
}

function removeTrailingCommas(source: string, fixes: Set<string>): string {
  let out = '';
  let i = 0;

  while (i < source.length) {
    const ch = source[i];

    if (ch === '"') {
      const start = i;
      i++;
      while (i < source.length) {
        if (source[i] === '\\' && i + 1 < source.length) {
          i += 2;
          continue;
        }
        i++;
        if (source[i - 1] === '"') break;
      }
      out += source.slice(start, i);
      continue;
    }

    if (ch === ',') {
      let j = i + 1;
      while (j < source.length && /\s/.test(source[j])) {
        j++;
      }
      if (source[j] === '}' || source[j] === ']') {
        fixes.add('Removed trailing commas');
        i++;
        continue;
      }
    }

    out += ch;
    i++;
  }

  return out;
}

function replacePythonLiterals(source: string, fixes: Set<string>): string {
  let out = '';
  let i = 0;

  while (i < source.length) {
    const ch = source[i];

    if (ch === '"') {
      const start = i;
      i++;
      while (i < source.length) {
        if (source[i] === '\\' && i + 1 < source.length) {
          i += 2;
          continue;
        }
        i++;
        if (source[i - 1] === '"') break;
      }
      out += source.slice(start, i);
      continue;
    }

    const tail = source.slice(i);
    if (/^(True|False|None|undefined)(?![A-Za-z0-9_$])/.test(tail)) {
      const token = /^(True|False|None|undefined)/.exec(tail)?.[1];
      if (token === 'True') {
        fixes.add('Normalized Python/JS literals');
        out += 'true';
        i += 4;
        continue;
      }
      if (token === 'False') {
        fixes.add('Normalized Python/JS literals');
        out += 'false';
        i += 5;
        continue;
      }
      if (token === 'None') {
        fixes.add('Normalized Python/JS literals');
        out += 'null';
        i += 4;
        continue;
      }
      if (token === 'undefined') {
        fixes.add('Normalized Python/JS literals');
        out += 'null';
        i += 9;
        continue;
      }
    }

    out += ch;
    i++;
  }

  return out;
}

/**
 * Safely repair common malformed JSON issues (comments, trailing commas, single quotes,
 * unquoted object keys, Python booleans/None) without eval.
 */
export function tryRepairJson(raw: string): JsonRepairResult | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const fixes = new Set<string>();
  let candidate = stripCommentsAndNormalizeStrings(trimmed, fixes);
  candidate = quoteUnquotedObjectKeys(candidate, fixes);
  candidate = removeTrailingCommas(candidate, fixes);
  candidate = replacePythonLiterals(candidate, fixes);

  try {
    const parsed = JSON.parse(candidate) as unknown;
    if (typeof parsed !== 'object' || parsed === null) {
      return null;
    }
    return {
      repaired: JSON.stringify(parsed, null, 2),
      parsed: parsed as object | Array<unknown>,
      fixes: Array.from(fixes),
    };
  } catch {
    return null;
  }
}
