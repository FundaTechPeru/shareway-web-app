/** Builds an unsigned JWT with the given claims, for tests only. */
export function fakeJwt(claims: Record<string, unknown>): string {
  const encode = (value: object) =>
    btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${encode({alg: 'HS256', typ: 'JWT'})}.${encode(claims)}.signature`;
}

/** Epoch seconds `minutes` from now. */
export function inMinutes(minutes: number): number {
  return Math.floor(Date.now() / 1000) + minutes * 60;
}
