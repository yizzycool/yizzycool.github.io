import type { WifiCardState } from '../types';

/**
 * Escapes reserved characters (`\`, `;`, `,`, `:`, `"`) per the ZXing Wi-Fi QR spec.
 */
export function escapeWifiField(value: string): string {
  return value.replace(/([\\;,:"])/g, '\\$1');
}

/**
 * Builds a standard `WIFI:T:<type>;S:<ssid>;P:<password>;[H:true;];` QR payload string.
 */
export function buildWifiQrPayload(
  state: Pick<WifiCardState, 'ssid' | 'password' | 'encryption' | 'hidden'>
): string {
  const ssid = state.ssid.trim();
  if (!ssid) return '';

  const enc = state.encryption;
  const pwd = enc === 'nopass' ? '' : escapeWifiField(state.password);
  const hidden = state.hidden ? 'H:true;' : '';

  return `WIFI:T:${enc};S:${escapeWifiField(ssid)};P:${pwd};${hidden};`;
}
