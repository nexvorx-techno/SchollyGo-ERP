import crypto from 'crypto';

/**
 * Hash a password using PBKDF2 (Node.js built-in crypto)
 * @param {string} password 
 * @returns {string} The hashed password with salt
 */
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify a password against a stored hash
 * @param {string} password 
 * @param {string} storedHash (format: salt:hash)
 * @returns {boolean} True if password is valid
 */
export function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false;
  
  const [salt, originalHash] = storedHash.split(':');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  
  return hash === originalHash;
}
