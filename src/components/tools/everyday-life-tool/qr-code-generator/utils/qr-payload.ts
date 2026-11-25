export type QrPayloadType = 'text' | 'wifi' | 'vcard' | 'email';

export type WifiPayload = {
  ssid: string;
  password: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
  hidden: boolean;
};

export type VCardPayload = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  company: string;
  website: string;
};

export type EmailPayload = {
  to: string;
  subject: string;
  body: string;
};

export const DEFAULT_WIFI_PAYLOAD: WifiPayload = {
  ssid: '',
  password: '',
  encryption: 'WPA',
  hidden: false,
};

export const DEFAULT_VCARD_PAYLOAD: VCardPayload = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  company: '',
  website: '',
};

export const DEFAULT_EMAIL_PAYLOAD: EmailPayload = {
  to: '',
  subject: '',
  body: '',
};

function escapeWifiField(value: string): string {
  return value.replace(/([\\;,:"])/g, '\\$1');
}

/**
 * Build a standardized QR code payload string from structured template inputs.
 */
export function buildQrPayload(
  type: QrPayloadType,
  data: {
    text: string;
    wifi: WifiPayload;
    vcard: VCardPayload;
    email: EmailPayload;
  }
): string {
  if (type === 'text') {
    return data.text.trim();
  }

  if (type === 'wifi') {
    const ssid = data.wifi.ssid.trim();
    if (!ssid) return '';
    const enc = data.wifi.encryption;
    const pwd = enc === 'nopass' ? '' : escapeWifiField(data.wifi.password);
    const hidden = data.wifi.hidden ? 'H:true;' : '';
    return `WIFI:T:${enc};S:${escapeWifiField(ssid)};P:${pwd};${hidden};`;
  }

  if (type === 'vcard') {
    const { firstName, lastName, phone, email, company, website } = data.vcard;
    const fn = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ');
    if (!fn && !phone.trim() && !email.trim()) return '';
    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `N:${lastName.trim()};${firstName.trim()};;;`,
      ...(fn ? [`FN:${fn}`] : []),
      ...(company.trim() ? [`ORG:${company.trim()}`] : []),
      ...(phone.trim() ? [`TEL;TYPE=CELL:${phone.trim()}`] : []),
      ...(email.trim() ? [`EMAIL:${email.trim()}`] : []),
      ...(website.trim() ? [`URL:${website.trim()}`] : []),
      'END:VCARD',
    ];
    return lines.join('\n');
  }

  const to = data.email.to.trim();
  if (!to) return '';
  const params = new URLSearchParams();
  if (data.email.subject.trim())
    params.set('subject', data.email.subject.trim());
  if (data.email.body.trim()) params.set('body', data.email.body.trim());
  const qs = params.toString();
  return qs ? `mailto:${to}?${qs}` : `mailto:${to}`;
}

function parseHexChannel(hex: string): [number, number, number] | null {
  const clean = hex.replace('#', '').trim();
  if (!/^[0-9a-f]{3}([0-9a-f]{3})?$/i.test(clean)) return null;
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => `${c}${c}`)
          .join('')
      : clean;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/**
 * Compute WCAG 2.1 contrast ratio between foreground and background hex colors.
 */
export function getContrastRatio(fgHex: string, bgHex: string): number {
  const fg = parseHexChannel(fgHex);
  const bg = parseHexChannel(bgHex);
  if (!fg || !bg) return 21;
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}
