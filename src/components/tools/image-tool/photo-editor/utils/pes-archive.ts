import type { DocumentConfig } from '../types/studio';

import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate';

type JsonRecord = Record<string, unknown>;

function walkCanvasJsonObjects(
  node: unknown,
  visitor: (obj: JsonRecord) => void
): void {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    for (const item of node) {
      walkCanvasJsonObjects(item, visitor);
    }
    return;
  }

  const rec = node as JsonRecord;
  visitor(rec);

  if (Array.isArray(rec.objects)) {
    walkCanvasJsonObjects(rec.objects, visitor);
  }
}

/**
 * Collect all unique `_assetId` strings referenced anywhere in serialized Fabric JSON.
 */
export function collectAssetIdsFromJson(canvasJson: JsonRecord): Set<string> {
  const ids = new Set<string>();
  walkCanvasJsonObjects(canvasJson.objects, (obj) => {
    if (typeof obj._assetId === 'string' && obj._assetId.length > 0) {
      ids.add(obj._assetId);
    }
  });
  return ids;
}

/**
 * Return a deep-cloned Fabric JSON tree with image `src` URLs replaced via `resolveSrc`.
 */
export function rewriteAssetUrlsInJson(
  canvasJson: JsonRecord,
  resolveSrc: (assetId: string, currentSrc: string) => string
): JsonRecord {
  const cloned = structuredClone(canvasJson);
  walkCanvasJsonObjects(cloned.objects, (obj) => {
    if (typeof obj._assetId === 'string' && typeof obj.src === 'string') {
      obj.src = resolveSrc(obj._assetId, obj.src);
    }
  });
  return cloned;
}

/**
 * Pack DocumentConfig, Fabric JSON, and deduplicated binary assets into a portable `.pes` ZIP archive.
 */
export async function packPesArchive(
  docConfig: DocumentConfig,
  canvasJson: JsonRecord,
  assets: Record<string, Blob>
): Promise<Blob> {
  const portableJson = rewriteAssetUrlsInJson(
    canvasJson,
    (assetId, currentSrc) =>
      assets[assetId] ? `pes-asset://${assetId}` : currentSrc
  );

  const manifest = {
    version: 1,
    format: 'photo-editor-studio',
    savedAt: Date.now(),
    docConfig,
    canvasJson: portableJson,
  };

  const files: Record<string, Uint8Array> = {
    'document.json': strToU8(JSON.stringify(manifest)),
  };

  for (const [assetId, blob] of Object.entries(assets)) {
    const buffer = await blob.arrayBuffer();
    files[`assets/${assetId}`] = new Uint8Array(buffer);
  }

  const zipped = zipSync(files, { level: 6 });
  const copy = new Uint8Array(zipped.byteLength);
  copy.set(zipped);
  return new Blob([copy], { type: 'application/zip' });
}

/**
 * Unpack a `.pes` ZIP archive into DocumentConfig, Fabric JSON, and asset Blobs.
 */
export async function unpackPesArchive(file: File): Promise<{
  docConfig: DocumentConfig;
  canvasJson: JsonRecord;
  assets: Record<string, Blob>;
}> {
  const buffer = await file.arrayBuffer();
  const unzipped = unzipSync(new Uint8Array(buffer));

  const docEntry = unzipped['document.json'];
  if (!docEntry) {
    throw new Error('Invalid .pes project file: missing document.json');
  }

  const parsed = JSON.parse(strFromU8(docEntry)) as {
    docConfig?: DocumentConfig;
    canvasJson?: JsonRecord;
  };

  if (!parsed.docConfig || !parsed.canvasJson) {
    throw new Error('Invalid .pes project structure');
  }

  const assets: Record<string, Blob> = {};
  for (const [entryPath, data] of Object.entries(unzipped)) {
    if (entryPath.startsWith('assets/') && entryPath.length > 7) {
      const assetId = entryPath.slice(7);
      const copy = new Uint8Array(data.byteLength);
      copy.set(data);
      assets[assetId] = new Blob([copy]);
    }
  }

  return {
    docConfig: parsed.docConfig,
    canvasJson: parsed.canvasJson,
    assets,
  };
}
