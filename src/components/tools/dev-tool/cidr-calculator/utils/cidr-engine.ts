import type {
  CidrCalculationResult,
  IpScopeType,
  SubnetSplitItem,
} from '../types';

/**
 * Converts a dot-decimal IPv4 string (e.g. "192.168.1.1") to an unsigned 32-bit integer.
 * Returns null if the format or octet values are invalid.
 */
export function ipToUint32(ipStr: string): number | null {
  const parts = ipStr.trim().split('.');
  if (parts.length !== 4) return null;

  let result = 0;
  for (let i = 0; i < 4; i++) {
    const part = parts[i].trim();
    if (!/^\d{1,3}$/.test(part)) return null;

    const num = Number(part);
    if (num < 0 || num > 255) return null;
    // Disallow leading zeros unless single digit 0 (e.g. 01 is invalid)
    if (part.length > 1 && part.startsWith('0')) return null;

    result = ((result << 8) | num) >>> 0;
  }

  return result >>> 0;
}

/**
 * Converts an unsigned 32-bit integer to a dot-decimal IPv4 string.
 */
export function uint32ToIp(val: number): string {
  const safeVal = val >>> 0;
  const a = (safeVal >>> 24) & 255;
  const b = (safeVal >>> 16) & 255;
  const c = (safeVal >>> 8) & 255;
  const d = safeVal & 255;
  return `${a}.${b}.${c}.${d}`;
}

/**
 * Converts a prefix length (0-32) to an unsigned 32-bit netmask integer.
 */
export function prefixToNetmask(prefix: number): number {
  if (prefix <= 0) return 0;
  if (prefix >= 32) return 0xffffffff;
  return ~((1 << (32 - prefix)) - 1) >>> 0;
}

/**
 * Converts an unsigned 32-bit netmask integer to a prefix length (0-32).
 * Returns null if the netmask bit pattern is invalid (non-contiguous 1s).
 */
export function netmaskToPrefix(netmaskUint: number): number | null {
  const val = netmaskUint >>> 0;
  if (val === 0) return 0;

  // Inverted mask plus one must be a power of two
  const inverted = ~val >>> 0;
  if ((inverted & (inverted + 1)) !== 0) {
    return null;
  }

  // Count leading ones
  let count = 0;
  for (let i = 31; i >= 0; i--) {
    if (((val >>> i) & 1) === 1) {
      count++;
    } else {
      break;
    }
  }

  return count;
}

/**
 * Converts an unsigned 32-bit integer to dotted 8-bit binary representation.
 * E.g. "11111111.11111111.11111111.00000000"
 */
export function toBinaryDotted(val: number): string {
  const safeVal = val >>> 0;
  const octets: string[] = [];
  for (let i = 3; i >= 0; i--) {
    const octet = (safeVal >>> (i * 8)) & 255;
    octets.push(octet.toString(2).padStart(8, '0'));
  }
  return octets.join('.');
}

/**
 * Identifies the RFC scope and classification of an IPv4 address.
 */
export function detectIpScope(ipUint: number): {
  scope: IpScopeType;
  label: string;
} {
  const val = ipUint >>> 0;
  const a = (val >>> 24) & 255;
  const b = (val >>> 16) & 255;

  // 10.0.0.0/8 (RFC 1918)
  if (a === 10) {
    return { scope: 'private', label: 'RFC 1918 Private (10.0.0.0/8)' };
  }

  // 172.16.0.0/12 (RFC 1918: 172.16.0.0 - 172.31.255.255)
  if (a === 172 && b >= 16 && b <= 31) {
    return { scope: 'private', label: 'RFC 1918 Private (172.16.0.0/12)' };
  }

  // 192.168.0.0/16 (RFC 1918)
  if (a === 192 && b === 168) {
    return { scope: 'private', label: 'RFC 1918 Private (192.168.0.0/16)' };
  }

  // 127.0.0.0/8 (RFC 1122 Loopback)
  if (a === 127) {
    return { scope: 'loopback', label: 'RFC 1122 Loopback' };
  }

  // 169.254.0.0/16 (RFC 3927 Link-Local / APIPA)
  if (a === 169 && b === 254) {
    return { scope: 'link-local', label: 'RFC 3927 Link-Local (APIPA)' };
  }

  // 100.64.0.0/10 (RFC 6598 Carrier-Grade NAT: 100.64.0.0 - 100.127.255.255)
  if (a === 100 && b >= 64 && b <= 127) {
    return { scope: 'cgnat', label: 'RFC 6598 Carrier-Grade NAT' };
  }

  // 224.0.0.0/4 (RFC 5771 Multicast: 224 - 239)
  if (a >= 224 && a <= 239) {
    return { scope: 'multicast', label: 'RFC 5771 Multicast' };
  }

  // 240.0.0.0/4 (RFC 1112 Reserved: 240 - 255)
  if (a >= 240) {
    return { scope: 'reserved', label: 'RFC 1112 Reserved / Broadcast' };
  }

  // 0.0.0.0/8 (RFC 1122 This host/network)
  if (a === 0) {
    return { scope: 'reserved', label: 'RFC 1122 Current Network' };
  }

  return { scope: 'public', label: 'Public Internet' };
}

/**
 * Parses user input (CIDR notation or IP + netmask or plain IP) and computes all network attributes.
 */
export function calculateCidr(rawInput: string): CidrCalculationResult {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return {
      isValid: false,
      error: 'Please enter an IP address or CIDR block (e.g. 192.168.1.0/24)',
      ip: '',
      prefix: 24,
      cidr: '',
      netmask: '',
      wildcardMask: '',
      networkAddress: '',
      broadcastAddress: '',
      usableHostRange: '',
      firstUsableHost: '',
      lastUsableHost: '',
      totalHosts: 0,
      usableHosts: 0,
      binaryNetmask: '',
      binaryIp: '',
      integerIp: 0,
      hexIp: '',
      scope: 'private',
      scopeLabel: '',
    };
  }

  let ipPart = '';
  let prefix: number | null = null;

  // Format 1: CIDR notation (e.g. 192.168.1.100/24)
  if (trimmed.includes('/')) {
    const [ip, maskOrPrefix] = trimmed.split('/');
    ipPart = ip.trim();
    const cleanPrefix = maskOrPrefix.trim();

    if (/^\d{1,2}$/.test(cleanPrefix)) {
      const p = Number(cleanPrefix);
      if (p >= 0 && p <= 32) {
        prefix = p;
      } else {
        return createInvalidResult(
          'CIDR prefix length must be between 0 and 32'
        );
      }
    } else {
      // Possible subnet mask after slash (e.g. 192.168.1.1/255.255.255.0)
      const maskUint = ipToUint32(cleanPrefix);
      if (maskUint !== null) {
        const p = netmaskToPrefix(maskUint);
        if (p !== null) {
          prefix = p;
        } else {
          return createInvalidResult('Invalid subnet mask format');
        }
      } else {
        return createInvalidResult('Invalid prefix or netmask after slash');
      }
    }
  } else if (/\s+/.test(trimmed)) {
    // Format 2: Space separated (e.g. 192.168.1.1 255.255.255.0)
    const [ip, mask] = trimmed.split(/\s+/);
    ipPart = ip.trim();
    const maskUint = ipToUint32(mask.trim());
    if (maskUint !== null) {
      const p = netmaskToPrefix(maskUint);
      if (p !== null) {
        prefix = p;
      } else {
        return createInvalidResult('Invalid subnet mask');
      }
    } else {
      return createInvalidResult('Invalid subnet mask following IP address');
    }
  } else {
    // Format 3: Plain IP address (default to /24)
    ipPart = trimmed;
    prefix = 24;
  }

  const ipUint = ipToUint32(ipPart);
  if (ipUint === null) {
    return createInvalidResult(
      'Invalid IPv4 address. Each octet must be between 0 and 255'
    );
  }

  if (prefix === null) {
    prefix = 24;
  }

  // Bitwise computations
  const netmaskUint = prefixToNetmask(prefix);
  const wildcardUint = ~netmaskUint >>> 0;
  const networkUint = (ipUint & netmaskUint) >>> 0;
  const broadcastUint = (networkUint | wildcardUint) >>> 0;

  const networkAddress = uint32ToIp(networkUint);
  const broadcastAddress = uint32ToIp(broadcastUint);
  const netmask = uint32ToIp(netmaskUint);
  const wildcardMask = uint32ToIp(wildcardUint);

  const cidr = `${networkAddress}/${prefix}`;
  const totalHosts = prefix === 0 ? 4294967296 : Math.pow(2, 32 - prefix);

  let usableHosts = 0;
  let firstUsableHost = '';
  let lastUsableHost = '';
  let usableHostRange = '';

  if (prefix === 32) {
    usableHosts = 1;
    firstUsableHost = networkAddress;
    lastUsableHost = networkAddress;
    usableHostRange = `${networkAddress} (Single Host / Loopback)`;
  } else if (prefix === 31) {
    // RFC 3021 Point-to-Point links
    usableHosts = 2;
    firstUsableHost = networkAddress;
    lastUsableHost = broadcastAddress;
    usableHostRange = `${firstUsableHost} – ${lastUsableHost} (Point-to-Point)`;
  } else if (prefix === 0) {
    usableHosts = totalHosts - 2;
    firstUsableHost = '0.0.0.1';
    lastUsableHost = '255.255.255.254';
    usableHostRange = `${firstUsableHost} – ${lastUsableHost}`;
  } else {
    usableHosts = Math.max(0, totalHosts - 2);
    firstUsableHost = uint32ToIp(networkUint + 1);
    lastUsableHost = uint32ToIp(broadcastUint - 1);
    usableHostRange = `${firstUsableHost} – ${lastUsableHost}`;
  }

  const { scope, label: scopeLabel } = detectIpScope(ipUint);
  const binaryNetmask = toBinaryDotted(netmaskUint);
  const binaryIp = toBinaryDotted(ipUint);
  const hexIp = `0x${ipUint.toString(16).toUpperCase().padStart(8, '0')}`;

  return {
    isValid: true,
    ip: ipPart,
    prefix,
    cidr,
    netmask,
    wildcardMask,
    networkAddress,
    broadcastAddress,
    usableHostRange,
    firstUsableHost,
    lastUsableHost,
    totalHosts,
    usableHosts,
    binaryNetmask,
    binaryIp,
    integerIp: ipUint,
    hexIp,
    scope,
    scopeLabel,
  };
}

function createInvalidResult(error: string): CidrCalculationResult {
  return {
    isValid: false,
    error,
    ip: '',
    prefix: 24,
    cidr: '',
    netmask: '',
    wildcardMask: '',
    networkAddress: '',
    broadcastAddress: '',
    usableHostRange: '',
    firstUsableHost: '',
    lastUsableHost: '',
    totalHosts: 0,
    usableHosts: 0,
    binaryNetmask: '',
    binaryIp: '',
    integerIp: 0,
    hexIp: '',
    scope: 'private',
    scopeLabel: '',
  };
}

/**
 * Splits a network block into smaller subnets with targetPrefix.
 * Maximum split count is capped at 64 items to maintain snappy UI performance.
 */
export function splitSubnet(
  networkAddress: string,
  currentPrefix: number,
  targetPrefix: number
): SubnetSplitItem[] {
  if (targetPrefix <= currentPrefix || targetPrefix > 32) {
    return [];
  }

  const netUint = ipToUint32(networkAddress);
  if (netUint === null) return [];

  const splitBits = targetPrefix - currentPrefix;
  const numSubnets = Math.min(Math.pow(2, splitBits), 64);
  const subnetSize = Math.pow(2, 32 - targetPrefix);

  const results: SubnetSplitItem[] = [];

  for (let i = 0; i < numSubnets; i++) {
    const subNetUint = (netUint + i * subnetSize) >>> 0;
    const subMaskUint = prefixToNetmask(targetPrefix);
    const subWildcard = ~subMaskUint >>> 0;
    const subBcastUint = (subNetUint | subWildcard) >>> 0;

    const subNetStr = uint32ToIp(subNetUint);
    const subBcastStr = uint32ToIp(subBcastUint);
    const subCidr = `${subNetStr}/${targetPrefix}`;

    let usableHosts = 0;
    let usableRange = '';

    if (targetPrefix === 32) {
      usableHosts = 1;
      usableRange = subNetStr;
    } else if (targetPrefix === 31) {
      usableHosts = 2;
      usableRange = `${subNetStr} – ${subBcastStr}`;
    } else {
      usableHosts = Math.max(0, subnetSize - 2);
      usableRange = `${uint32ToIp(subNetUint + 1)} – ${uint32ToIp(subBcastUint - 1)}`;
    }

    results.push({
      cidr: subCidr,
      networkAddress: subNetStr,
      usableRange,
      broadcastAddress: subBcastStr,
      usableHosts,
    });
  }

  return results;
}
