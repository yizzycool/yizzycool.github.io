export type IpScopeType =
  | 'private'
  | 'public'
  | 'loopback'
  | 'link-local'
  | 'cgnat'
  | 'multicast'
  | 'reserved';

export interface CidrCalculationResult {
  isValid: boolean;
  error?: string;
  ip: string;
  prefix: number;
  cidr: string;
  netmask: string;
  wildcardMask: string;
  networkAddress: string;
  broadcastAddress: string;
  usableHostRange: string;
  firstUsableHost: string;
  lastUsableHost: string;
  totalHosts: number;
  usableHosts: number;
  binaryNetmask: string;
  binaryIp: string;
  integerIp: number;
  hexIp: string;
  scope: IpScopeType;
  scopeLabel: string;
}

export interface SubnetSplitItem {
  cidr: string;
  networkAddress: string;
  usableRange: string;
  broadcastAddress: string;
  usableHosts: number;
}

export interface CidrHistoryData {
  input: string;
  cidr: string;
  usableRange: string;
  timestamp: number;
}
