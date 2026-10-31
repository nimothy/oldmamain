/**
 * The label maker is kept a little hidden behind a password.
 *
 * GitHub Pages is static, so this is a light gate, not real security: only the
 * SHA-256 of the password is in the site, and a determined visitor reading the
 * page source can still get past it. To change the password, replace the hash:
 *   printf '%s' 'new password' | shasum -a 256
 */
export const LABELS_PASSWORD_SHA256 = 'e2d60a8a0a19f63bab64e9ee04b5073386009208428fb4615e29e5df70560c06';

/** localStorage key that remembers an unlocked browser. */
export const LABELS_UNLOCK_KEY = 'oldmamain:labels-unlocked';

/** Attribute set on <html> once unlocked; CSS shows the label maker only then. */
export const LABELS_UNLOCKED_ATTR = 'data-labels-unlocked';
