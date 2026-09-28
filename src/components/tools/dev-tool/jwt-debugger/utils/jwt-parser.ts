import type { JwtHeader, JwtPayload, ParsedJwt, TokenStatus } from '../types';

import {
  extractTimeClaims,
  getRelativeTimeDescription,
} from './time-formatter';

/**
 * Decode a Base64URL-encoded string into UTF-8 text.
 * Safely handles multi-byte Unicode characters (Chinese, Japanese, Emoji, etc.).
 */
export function decodeBase64Url(base64Url: string): string {
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const mod4 = base64.length % 4;
  if (mod4 > 0) {
    base64 += '='.repeat(4 - mod4);
  }

  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return new TextDecoder('utf-8').decode(bytes);
}

/**
 * Parse and validate a raw JWT string
 */
export function parseJwt(rawInput: string): ParsedJwt {
  const cleanInput = rawInput.trim();
  // Strip Bearer prefix if user copied full Authorization header
  const token = cleanInput.replace(/^Bearer\s+/i, '').trim();

  if (!token) {
    return {
      header: {},
      payload: {},
      signature: '',
      rawHeader: '',
      rawPayload: '',
      timeClaims: [],
      status: {
        isValid: false,
        hasExpiration: false,
      },
    };
  }

  const parts = token.split('.');

  if (parts.length !== 3) {
    return {
      header: {},
      payload: {},
      signature: '',
      rawHeader: '',
      rawPayload: '',
      timeClaims: [],
      status: {
        isValid: false,
        errorMessage: `Invalid JWT format: A valid token must contain exactly 3 dot-separated parts (found ${parts.length}).`,
        hasExpiration: false,
      },
    };
  }

  const [headerPart, payloadPart, signaturePart] = parts;
  let rawHeader = '';
  let rawPayload = '';
  let header: JwtHeader = {};
  let payload: JwtPayload = {};

  try {
    rawHeader = decodeBase64Url(headerPart);
  } catch {
    return {
      header: {},
      payload: {},
      signature: signaturePart,
      rawHeader: '',
      rawPayload: '',
      timeClaims: [],
      status: {
        isValid: false,
        errorMessage: 'Malformed Base64URL string in Header part.',
        hasExpiration: false,
      },
    };
  }

  try {
    header = JSON.parse(rawHeader);
  } catch {
    return {
      header: {},
      payload: {},
      signature: signaturePart,
      rawHeader,
      rawPayload: '',
      timeClaims: [],
      status: {
        isValid: false,
        errorMessage: 'Header is not a valid JSON object.',
        hasExpiration: false,
      },
    };
  }

  try {
    rawPayload = decodeBase64Url(payloadPart);
  } catch {
    return {
      header,
      payload: {},
      signature: signaturePart,
      rawHeader,
      rawPayload: '',
      timeClaims: [],
      status: {
        isValid: false,
        errorMessage: 'Malformed Base64URL string in Payload part.',
        hasExpiration: false,
      },
    };
  }

  try {
    payload = JSON.parse(rawPayload);
  } catch {
    return {
      header,
      payload: {},
      signature: signaturePart,
      rawHeader,
      rawPayload,
      timeClaims: [],
      status: {
        isValid: false,
        errorMessage: 'Payload is not a valid JSON object.',
        hasExpiration: false,
      },
    };
  }

  const timeClaims = extractTimeClaims(payload);

  const status: TokenStatus = {
    isValid: true,
    algorithm: header.alg || 'None',
    hasExpiration: typeof payload.exp === 'number',
  };

  if (typeof payload.exp === 'number') {
    const { relative, isPast } = getRelativeTimeDescription(payload.exp);
    status.isExpired = isPast;
    status.expirationRelative = relative;
  }

  return {
    header,
    payload,
    signature: signaturePart,
    rawHeader,
    rawPayload,
    timeClaims,
    status,
  };
}
