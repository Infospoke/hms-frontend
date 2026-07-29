/**
 * Minimal JWT payload decoder. We only need to *read* the claims the
 * candidate API puts in the login token (firstName, lastName, candidateId,
 * sub/email, exp) — verification happens server-side, this is just for
 * driving the UI (who's logged in, has the session expired).
 */
export function decodeJwt(token) {
  if (typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const json = decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join(''),
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** exp is in seconds since epoch (standard JWT claim); Date.now() is ms. */
export function isTokenExpired(payload) {
  if (!payload?.exp) return false;
  return Date.now() >= payload.exp * 1000;
}
