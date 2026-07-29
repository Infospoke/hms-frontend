
import { hashValue, valueMatchesHash } from '../utils/hash.js';

const USERS_KEY = 'nexus.candidatePortal.users';
const ATTEMPTS_KEY = 'nexus.candidatePortal.loginAttempts';
const RESET_KEY = 'nexus.candidatePortal.resetTokens';
const SESSION_KEY = 'nexus.candidatePortal.session';

export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MS = 2 * 60 * 1000; // 2 minutes, per FRD business rule
export const RESET_TOKEN_TTL_MS = 15 * 60 * 1000; // "time-limited" temporary password

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}


export async function createUser({ fullName, email, phone, password }) {
  const users = await getUsers();
  const normalizedEmail = normalizeEmail(email);

  if (users.some((u) => u.email === normalizedEmail)) {
    return { ok: false, error: 'duplicate-email' };
  }

  const [firstName, ...rest] = String(fullName || '').trim().split(/\s+/);
  const lastName = rest.join(' ');
  const initials =
    `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase() || 'NA';

  const user = {
    email: normalizedEmail,
    passwordHash: await hashValue(password),
    firstName: firstName || fullName,
    lastName,
    phone,
    initials,
    createdAt: new Date().toISOString(),
  };

  saveUsers([...users, user]);
  return { ok: true, user };
}






function readAttempts() {
  return readJSON(ATTEMPTS_KEY, {});
}

function writeAttempts(map) {
  writeJSON(ATTEMPTS_KEY, map);
}

export function getLockoutRemainingMs(email) {
  const map = readAttempts();
  const entry = map[normalizeEmail(email)];
  if (!entry?.lockedUntil) return 0;
  const remaining = entry.lockedUntil - Date.now();
  return remaining > 0 ? remaining : 0;
}

export function recordFailedAttempt(email) {
  const key = normalizeEmail(email);
  const map = readAttempts();
  const entry = map[key] || { count: 0, lockedUntil: 0 };

  if (entry.lockedUntil && entry.lockedUntil <= Date.now()) {
    entry.count = 0;
    entry.lockedUntil = 0;
  }

  entry.count += 1;
  if (entry.count >= MAX_LOGIN_ATTEMPTS) {
    entry.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
    entry.count = 0;
  }

  map[key] = entry;
  writeAttempts(map);
  return entry;
}

export function clearAttempts(email) {
  const map = readAttempts();
  delete map[normalizeEmail(email)];
  writeAttempts(map);
}

function readResetTokens() {
  return readJSON(RESET_KEY, {});
}

function writeResetTokens(map) {
  writeJSON(RESET_KEY, map);
}

export async function requestPasswordReset(email) {
  const user = await findUserByEmail(email);
  const map = readResetTokens();
  const key = normalizeEmail(email);

  if (!user) {
    return { exists: false, tempPassword: null };
  }

  const tempPassword = generateTempPassword();
  map[key] = {
    tempPasswordHash: await hashValue(tempPassword),
    expiresAt: Date.now() + RESET_TOKEN_TTL_MS,
    used: false,
  };
  writeResetTokens(map);

  return { exists: true, tempPassword, expiresInMs: RESET_TOKEN_TTL_MS };
}



export function getSession() {
  return readJSON(SESSION_KEY, null);
}

/** @param {{ token: string, user: object }} session */
export function setSession(session) {
  writeJSON(SESSION_KEY, session);
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
