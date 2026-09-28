export type JwtHeader = {
  alg?: string;
  typ?: string;
  kid?: string;
  [key: string]: unknown;
};

export type JwtPayload = {
  iss?: string;
  sub?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  [key: string]: unknown;
};

export type TimeClaimInfo = {
  claim: 'exp' | 'iat' | 'nbf';
  label: string;
  timestamp: number;
  formattedLocal: string;
  formattedUtc: string;
  relativeTime: string;
  isExpired?: boolean;
};

export type TokenStatus = {
  isValid: boolean;
  errorMessage?: string;
  algorithm?: string;
  isExpired?: boolean;
  expirationRelative?: string;
  hasExpiration: boolean;
};

export type ParsedJwt = {
  header: JwtHeader;
  payload: JwtPayload;
  signature: string;
  rawHeader: string;
  rawPayload: string;
  timeClaims: TimeClaimInfo[];
  status: TokenStatus;
};
