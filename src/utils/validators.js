/**
 * Validation helpers shared by Signup, Login, Forgot/Reset Password and
 * Change Password screens — kept in one place so the rules in the FRD
 * ("Candidate Authentication") are enforced consistently everywhere.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Loose E.164-ish check: 7-15 digits, optional leading +.
const PHONE_RE = /^\+?[0-9]{7,15}$/;

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 64;

export function isValidEmail(email) {
  return EMAIL_RE.test(String(email || '').trim());
}

export function isValidPhone(phone) {
  return PHONE_RE.test(String(phone || '').replace(/[\s-()]/g, ''));
}

/**
 * FRD rule: "minimum 8 characters, maximum length as per industry standards,
 * and complexity (mix of uppercase, lowercase, numeric, and special characters)".
 * Returns a list of human-readable problems; empty array = passes.
 */
export function getPasswordIssues(password) {
  const value = String(password || '');
  const issues = [];

  if (value.length < PASSWORD_MIN_LENGTH) {
    issues.push(`At least ${PASSWORD_MIN_LENGTH} characters`);
  }
  if (value.length > PASSWORD_MAX_LENGTH) {
    issues.push(`No more than ${PASSWORD_MAX_LENGTH} characters`);
  }
  if (!/[a-z]/.test(value)) issues.push('A lowercase letter');
  if (!/[A-Z]/.test(value)) issues.push('An uppercase letter');
  if (!/[0-9]/.test(value)) issues.push('A number');
  if (!/[^A-Za-z0-9]/.test(value)) issues.push('A special character');

  return issues;
}

export function isPasswordStrong(password) {
  return getPasswordIssues(password).length === 0;
}

/** Simple 0-4 strength score, purely for the UI meter. */
export function passwordScore(password) {
  const value = String(password || '');
  let score = 0;
  if (value.length >= PASSWORD_MIN_LENGTH) score += 1;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
  if (/[0-9]/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  return score;
}
