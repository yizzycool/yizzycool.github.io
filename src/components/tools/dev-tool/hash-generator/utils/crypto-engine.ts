import type { HashAlgorithm, HashResultItem } from '../types';

import { HASH_ALGORITHMS } from '../constants';
import { bytesToBase64, bytesToHex } from './formatters';
import { computeHmacMD5Digest, computeMD5Digest } from './md5-engine';

const WEB_CRYPTO_MAP: Record<Exclude<HashAlgorithm, 'MD5'>, string> = {
  'SHA-1': 'SHA-1',
  'SHA-256': 'SHA-256',
  'SHA-384': 'SHA-384',
  'SHA-512': 'SHA-512',
};

function toArrayBuffer(uint8: Uint8Array): ArrayBuffer {
  return uint8.buffer.slice(
    uint8.byteOffset,
    uint8.byteOffset + uint8.byteLength
  ) as ArrayBuffer;
}

/**
 * Computes a single hash digest using Web Crypto API or internal MD5 engine.
 */
export async function computeSingleHash(
  algorithm: HashAlgorithm,
  data: Uint8Array,
  isHmac = false,
  hmacKeyBytes?: Uint8Array
): Promise<Uint8Array> {
  if (algorithm === 'MD5') {
    if (isHmac) {
      const key =
        hmacKeyBytes && hmacKeyBytes.length > 0
          ? hmacKeyBytes
          : new Uint8Array(0);
      return computeHmacMD5Digest(key, data);
    }
    return computeMD5Digest(data);
  }

  const webCryptoAlgo = WEB_CRYPTO_MAP[algorithm];

  if (isHmac) {
    const key =
      hmacKeyBytes && hmacKeyBytes.length > 0
        ? hmacKeyBytes
        : new Uint8Array(0);
    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      toArrayBuffer(key),
      { name: 'HMAC', hash: { name: webCryptoAlgo } },
      false,
      ['sign']
    );

    const signature = await window.crypto.subtle.sign(
      'HMAC',
      cryptoKey,
      toArrayBuffer(data)
    );
    return new Uint8Array(signature);
  }

  const digest = await window.crypto.subtle.digest(
    webCryptoAlgo,
    toArrayBuffer(data)
  );
  return new Uint8Array(digest);
}

/**
 * Computes all supported hash algorithms in parallel.
 */
export async function computeAllHashes(
  data: Uint8Array,
  isHmac = false,
  hmacKeyBytes?: Uint8Array
): Promise<HashResultItem[]> {
  const promises = HASH_ALGORITHMS.map(
    async (meta): Promise<HashResultItem> => {
      try {
        const digest = await computeSingleHash(
          meta.id,
          data,
          isHmac,
          hmacKeyBytes
        );
        return {
          algorithm: meta.id,
          bitLength: meta.bitLength,
          hex: bytesToHex(digest),
          base64: bytesToBase64(digest),
        };
      } catch (err) {
        return {
          algorithm: meta.id,
          bitLength: meta.bitLength,
          hex: '',
          base64: '',
          error: (err as Error)?.message || 'Computation failed',
        };
      }
    }
  );

  return Promise.all(promises);
}
