import type { JwtPayload, TimeClaimInfo } from '../types';

/**
 * Format a UNIX timestamp (seconds) into relative humanized string
 */
export function getRelativeTimeDescription(
  timestampSeconds: number,
  nowSeconds = Math.floor(Date.now() / 1000)
): { relative: string; isPast: boolean } {
  const diff = timestampSeconds - nowSeconds;
  const isPast = diff < 0;
  const absDiff = Math.abs(diff);

  const seconds = absDiff;
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  let timeUnit = '';
  if (years > 0) {
    timeUnit = `${years} year${years > 1 ? 's' : ''}`;
  } else if (months > 0) {
    timeUnit = `${months} month${months > 1 ? 's' : ''}`;
  } else if (days > 0) {
    timeUnit = `${days} day${days > 1 ? 's' : ''}`;
  } else if (hours > 0) {
    timeUnit = `${hours} hour${hours > 1 ? 's' : ''}`;
  } else if (minutes > 0) {
    timeUnit = `${minutes} minute${minutes > 1 ? 's' : ''}`;
  } else {
    timeUnit = 'a few seconds';
  }

  const relative = isPast ? `${timeUnit} ago` : `in ${timeUnit}`;
  return { relative, isPast };
}

/**
 * Extract and analyze standard time claims (exp, iat, nbf)
 */
export function extractTimeClaims(payload: JwtPayload): TimeClaimInfo[] {
  const claims: TimeClaimInfo[] = [];
  const now = Math.floor(Date.now() / 1000);

  const timeClaimMeta: Array<{
    key: 'exp' | 'iat' | 'nbf';
    label: string;
  }> = [
    { key: 'exp', label: 'Expiration Time (exp)' },
    { key: 'nbf', label: 'Not Before (nbf)' },
    { key: 'iat', label: 'Issued At (iat)' },
  ];

  for (const meta of timeClaimMeta) {
    const rawVal = payload[meta.key];
    if (typeof rawVal === 'number' && Number.isFinite(rawVal)) {
      const date = new Date(rawVal * 1000);
      const { relative, isPast } = getRelativeTimeDescription(rawVal, now);

      claims.push({
        claim: meta.key,
        label: meta.label,
        timestamp: rawVal,
        formattedLocal: date.toLocaleString(undefined, {
          dateStyle: 'medium',
          timeStyle: 'medium',
        }),
        formattedUtc: date.toISOString(),
        relativeTime: relative,
        isExpired: meta.key === 'exp' ? isPast : undefined,
      });
    }
  }

  return claims;
}
