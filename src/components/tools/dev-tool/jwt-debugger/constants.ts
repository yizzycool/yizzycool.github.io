/**
 * Sample JWT for demonstration purposes:
 * Header: { "alg": "HS256", "typ": "JWT" }
 * Payload: {
 *   "sub": "user_1234567890",
 *   "name": "Alex Vance",
 *   "admin": true,
 *   "iat": 1727400000,
 *   "exp": 1758950000
 * }
 */
export const SAMPLE_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJzdWIiOiJ1c2VyXzEyMzQ1Njc4OTAiLCJuYW1lIjoiQm9iIiwiYWRtaW4iOnRydWUsImlhdCI6MTcyNzQwMDAwMCwiZXhwIjoxNzU4OTUwMDAwfQ.' +
  '1zfx0Cv1Bq4KSbPnA1qwf_G-nhyvVWCUW_TIzim65GU';

export const EMPTY_TOKEN_STATUS = {
  isValid: false,
  hasExpiration: false,
};
