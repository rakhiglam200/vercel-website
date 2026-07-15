const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

const attempts = new Map<string, { count: number; firstAttemptAt: number }>();

function normalize(email: string): string {
  return email.trim().toLowerCase();
}

export function isLockedOut(email: string): boolean {
  const entry = attempts.get(normalize(email));
  if (!entry) return false;
  if (Date.now() - entry.firstAttemptAt > WINDOW_MS) {
    attempts.delete(normalize(email));
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

export function recordFailedLogin(email: string): void {
  const key = normalize(email);
  const entry = attempts.get(key);
  if (!entry || Date.now() - entry.firstAttemptAt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAttemptAt: Date.now() });
    return;
  }
  entry.count += 1;
}

export function clearLoginAttempts(email: string): void {
  attempts.delete(normalize(email));
}
