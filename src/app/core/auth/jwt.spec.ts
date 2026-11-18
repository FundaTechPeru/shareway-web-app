import {fakeJwt, inMinutes} from '../../../testing/fake-jwt';
import {decodeJwtPayload, isExpired, parseAuthUser} from './jwt';

describe('jwt', () => {
  it('decodes a base64url payload', () => {
    expect(decodeJwtPayload(fakeJwt({sub: 'abc', n: 1}))).toEqual({sub: 'abc', n: 1});
  });

  it('returns null for malformed tokens', () => {
    expect(decodeJwtPayload('not-a-jwt')).toBeNull();
    expect(decodeJwtPayload('a.%%%.c')).toBeNull();
    expect(parseAuthUser('a.b')).toBeNull();
  });

  it('prefers the userId claim and converts exp to milliseconds', () => {
    const exp = inMinutes(60);
    const user = parseAuthUser(
      fakeJwt({sub: 'ana@b.pe', userId: 'uuid-1', email: 'ana@b.pe', role: 'DRIVER', exp}),
    );
    expect(user).toEqual({id: 'uuid-1', email: 'ana@b.pe', role: 'DRIVER', expiresAt: exp * 1000});
  });

  it('falls back to sub and accepts ROLE_ prefixed roles', () => {
    const user = parseAuthUser(fakeJwt({sub: 'uuid-2', role: 'ROLE_PASSENGER'}));
    expect(user?.id).toBe('uuid-2');
    expect(user?.role).toBe('PASSENGER');
    expect(user?.expiresAt).toBeNull();
  });

  it('rejects tokens without a known role', () => {
    expect(parseAuthUser(fakeJwt({sub: 'x', role: 'ROOT'}))).toBeNull();
  });

  it('detects expiration', () => {
    const user = parseAuthUser(fakeJwt({sub: 'x', role: 'ADMIN', exp: 100}))!;
    expect(isExpired(user, 99_000)).toBe(false);
    expect(isExpired(user, 100_000)).toBe(true);
  });
});
