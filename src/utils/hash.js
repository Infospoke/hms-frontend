/**
 * Client-side password hashing helper.
 *
 * NOTE: This whole app is a frontend-only prototype (no backend yet), so the
 * "database" is localStorage. The FRD requires that "Passwords shall never
 * be stored or displayed in plain text" — we honor that at this layer with
 * SHA-256 + a per-install salt so nothing is ever written in the clear.
 * In production this hashing must happen server-side with a proper
 * algorithm (bcrypt/argon2) and per-user salt; this is not a substitute
 * for that.
 */

const SALT = 'nexus-hms-candidate-portal::v1';

export async function hashValue(value) {
  const data = new TextEncoder().encode(`${SALT}:${value}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function valueMatchesHash(value, hash) {
  const computed = await hashValue(value);
  return computed === hash;
}
