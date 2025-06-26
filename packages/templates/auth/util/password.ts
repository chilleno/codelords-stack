import crypto from 'crypto';

/**
 * Encrypts a password using pbkdf2Sync with a random salt.
 * @param password - The plain text password to encrypt.
 * @returns A string containing salt and hash separated by colon.
 */
export function encryptPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
    .toString('hex');

  return `${salt}:${hash}`;
}

/**
 * Verifies a password against an encrypted (salt:hash) string.
 * @param password - The plain text password to verify.
 * @param encrypted - The stored encrypted password (salt:hash).
 * @returns True if the password is correct, false otherwise.
 */
export function verifyPassword(password: string, encrypted: string): boolean {
  const [salt, originalHash] = encrypted.split(':');
  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
    .toString('hex');

  return hash === originalHash;
}