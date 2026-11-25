function toPascalCase(key: string): string {
  const cleaned = key
    .replace(/[^A-Za-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

  if (!cleaned) return 'Item';
  return /^[0-9]/.test(cleaned) ? `N${cleaned}` : cleaned;
}

function formatPropertyKey(key: string): string {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? key : JSON.stringify(key);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

type InterfaceDef = {
  name: string;
  fields: Array<{
    key: string;
    optional: boolean;
    tsType: string;
    zodType: string;
  }>;
};

function uniqueTypeName(base: string, used: Set<string>): string {
  const candidate = toPascalCase(base);
  if (!used.has(candidate)) {
    used.add(candidate);
    return candidate;
  }
  let idx = 2;
  while (used.has(`${candidate}${idx}`)) {
    idx++;
  }
  const resolved = `${candidate}${idx}`;
  used.add(resolved);
  return resolved;
}

function inferPair(
  value: unknown,
  hintName: string,
  defs: InterfaceDef[],
  usedNames: Set<string>
): { tsType: string; zodType: string } {
  if (value === null) {
    return { tsType: 'null', zodType: 'z.null()' };
  }
  if (typeof value === 'string') {
    return { tsType: 'string', zodType: 'z.string()' };
  }
  if (typeof value === 'number') {
    return {
      tsType: 'number',
      zodType: Number.isInteger(value) ? 'z.number().int()' : 'z.number()',
    };
  }
  if (typeof value === 'boolean') {
    return { tsType: 'boolean', zodType: 'z.boolean()' };
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return { tsType: 'unknown[]', zodType: 'z.array(z.unknown())' };
    }

    const nonNull = value.filter((v) => v !== null);
    const hasNull = nonNull.length !== value.length;

    if (nonNull.length > 0 && nonNull.every(isPlainObject)) {
      const itemName = hintName.endsWith('s')
        ? hintName.slice(0, -1) || 'Item'
        : `${hintName}Item`;
      const mergedType = buildObjectDef(nonNull, itemName, defs, usedNames);
      return {
        tsType: hasNull ? `(${mergedType} | null)[]` : `${mergedType}[]`,
        zodType: hasNull
          ? `z.array(${mergedType}Schema.nullable())`
          : `z.array(${mergedType}Schema)`,
      };
    }

    const elementPairs = value.map((item) =>
      inferPair(item, `${hintName}Item`, defs, usedNames)
    );
    const uniqueTs = Array.from(new Set(elementPairs.map((p) => p.tsType)));
    const uniqueZod = Array.from(new Set(elementPairs.map((p) => p.zodType)));

    const tsElem =
      uniqueTs.length === 1 ? uniqueTs[0] : `(${uniqueTs.join(' | ')})`;
    const zodElem =
      uniqueZod.length === 1
        ? uniqueZod[0]
        : `z.union([${uniqueZod.join(', ')}])`;

    return {
      tsType: `${tsElem}[]`,
      zodType: `z.array(${zodElem})`,
    };
  }

  if (isPlainObject(value)) {
    const objName = buildObjectDef([value], hintName, defs, usedNames);
    return { tsType: objName, zodType: `${objName}Schema` };
  }

  return { tsType: 'unknown', zodType: 'z.unknown()' };
}

function buildObjectDef(
  objects: Array<Record<string, unknown>>,
  hintName: string,
  defs: InterfaceDef[],
  usedNames: Set<string>
): string {
  const name = uniqueTypeName(hintName, usedNames);
  const keyValues = new Map<string, unknown[]>();
  const keyPresence = new Map<string, number>();

  for (const obj of objects) {
    for (const [key, val] of Object.entries(obj)) {
      const list = keyValues.get(key) ?? [];
      list.push(val);
      keyValues.set(key, list);
      keyPresence.set(key, (keyPresence.get(key) ?? 0) + 1);
    }
  }

  const fields: InterfaceDef['fields'] = [];
  for (const [key, values] of keyValues.entries()) {
    const optional = (keyPresence.get(key) ?? 0) < objects.length;
    const pairs = values.map((v) => inferPair(v, key, defs, usedNames));
    const uniqueTs = Array.from(new Set(pairs.map((p) => p.tsType)));
    const uniqueZod = Array.from(new Set(pairs.map((p) => p.zodType)));

    const tsType = uniqueTs.join(' | ');
    const zodType =
      uniqueZod.length === 1
        ? uniqueZod[0]
        : `z.union([${uniqueZod.join(', ')}])`;

    fields.push({ key, optional, tsType, zodType });
  }

  defs.push({ name, fields });
  return name;
}

/**
 * Generate clean TypeScript interfaces/types from any parsed JSON value.
 */
export function generateTypeScript(data: unknown, rootName = 'Root'): string {
  const defs: InterfaceDef[] = [];
  const usedNames = new Set<string>();
  const root = inferPair(data, rootName, defs, usedNames);

  const blocks = defs.map((def) => {
    if (def.fields.length === 0) {
      return `export type ${def.name} = Record<string, unknown>;`;
    }
    const lines = def.fields.map(
      (f) =>
        `  ${formatPropertyKey(f.key)}${f.optional ? '?' : ''}: ${f.tsType};`
    );
    return `export interface ${def.name} {\n${lines.join('\n')}\n}`;
  });

  if (defs.length === 0 || defs[defs.length - 1]?.name !== root.tsType) {
    blocks.push(`export type ${toPascalCase(rootName)} = ${root.tsType};`);
  }

  return blocks.join('\n\n');
}

/**
 * Generate a Zod validation schema + inferred TypeScript type from any parsed JSON value.
 */
export function generateZodSchema(data: unknown, rootName = 'Root'): string {
  const defs: InterfaceDef[] = [];
  const usedNames = new Set<string>();
  const root = inferPair(data, rootName, defs, usedNames);

  const blocks: string[] = ["import { z } from 'zod';"];

  for (const def of defs) {
    if (def.fields.length === 0) {
      blocks.push(
        `export const ${def.name}Schema = z.record(z.string(), z.unknown());`
      );
      continue;
    }

    const lines = def.fields.map((f) => {
      const schemaExpr = f.optional ? `${f.zodType}.optional()` : f.zodType;
      return `  ${formatPropertyKey(f.key)}: ${schemaExpr},`;
    });

    blocks.push(
      `export const ${def.name}Schema = z.object({\n${lines.join('\n')}\n});`
    );
  }

  const rootSchemaName = `${toPascalCase(rootName)}Schema`;
  if (
    defs.length === 0 ||
    `${defs[defs.length - 1]?.name}Schema` !== rootSchemaName
  ) {
    blocks.push(`export const ${rootSchemaName} = ${root.zodType};`);
  }

  blocks.push(
    `export type ${toPascalCase(rootName)} = z.infer<typeof ${rootSchemaName}>;`
  );

  return blocks.join('\n\n');
}
