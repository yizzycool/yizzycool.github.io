export type ParsedBarcodePayload =
  | {
      kind: 'url';
      href: string;
      displayUrl: string;
    }
  | {
      kind: 'wifi';
      ssid: string;
      password: string;
      security: string;
      hidden: boolean;
    }
  | {
      kind: 'email';
      address: string;
      href: string;
    }
  | {
      kind: 'phone';
      number: string;
      href: string;
    }
  | {
      kind: 'text';
      value: string;
    };

function unescapeWifiField(value: string): string {
  return value.replace(/\\([\\;,:"])/g, '$1');
}

function parseWifiPayload(
  rawValue: string
): Extract<ParsedBarcodePayload, { kind: 'wifi' }> | null {
  if (!/^WIFI:/i.test(rawValue)) return null;

  const body = rawValue.slice(5);
  let ssid = '';
  let password = '';
  let security = 'Open';
  let hidden = false;

  const tokens = body.match(/(?:\\.|[^;])+/g) || [];
  for (const token of tokens) {
    const colonIdx = token.indexOf(':');
    if (colonIdx === -1) continue;
    const key = token.slice(0, colonIdx).toUpperCase();
    const val = unescapeWifiField(token.slice(colonIdx + 1));

    if (key === 'S') ssid = val;
    else if (key === 'P') password = val;
    else if (key === 'T') security = val || 'Open';
    else if (key === 'H') hidden = val.toLowerCase() === 'true';
  }

  if (!ssid && !password) return null;

  return {
    kind: 'wifi',
    ssid: ssid || '(Unnamed Network)',
    password,
    security,
    hidden,
  };
}

/**
 * Parse a decoded barcode / QR string into structured semantic actions.
 */
export function parseBarcodePayload(rawValue: string): ParsedBarcodePayload {
  const trimmed = rawValue.trim();

  const wifi = parseWifiPayload(trimmed);
  if (wifi) return wifi;

  if (/^https?:\/\/\S+$/i.test(trimmed)) {
    return {
      kind: 'url',
      href: trimmed,
      displayUrl: trimmed.replace(/^https?:\/\//i, ''),
    };
  }

  if (/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+/i.test(trimmed)) {
    const address = trimmed.replace(/^mailto:/i, '').split('?')[0];
    return {
      kind: 'email',
      address,
      href: trimmed,
    };
  }

  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return {
      kind: 'email',
      address: trimmed,
      href: `mailto:${trimmed}`,
    };
  }

  if (/^tel:[+\d().\-\s]{4,}$/i.test(trimmed)) {
    return {
      kind: 'phone',
      number: trimmed.replace(/^tel:/i, '').trim(),
      href: trimmed,
    };
  }

  return {
    kind: 'text',
    value: rawValue,
  };
}
