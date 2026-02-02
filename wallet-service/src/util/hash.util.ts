import * as crypto from 'crypto';

/**
 * Generates a deterministic SHA-256 hash for a request within a deduplication window.
 * Only string, number, and Date values are included in the fingerprint.
 *
 * @template T
 * @param request - Request object to fingerprint.
 * @param deduplicationWindowSeconds - Window size in seconds used to bucket requests.
 * @returns Hex-encoded SHA-256 hash.
 */
export const generateRequestHash = <T extends Record<string, any>>(
  request: T,
  deduplicationWindowSeconds: number,
): string => {
  const now = new Date();
  const windowMs = deduplicationWindowSeconds * 1000;
  const windowStart = new Date(Math.floor(now.getTime() / windowMs) * windowMs);

  const primitiveEntries = Object.entries(request)
    .filter(([, value]) => {
      if (value instanceof Date) return true;
      return typeof value === 'string' || typeof value === 'number';
    })
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => {
      if (value instanceof Date) {
        return `${key}=${value.toISOString()}`;
      }
      return `${key}=${value.toString()}`;
    });

  // Unique Fingerprint
  const fingerprint = [
    ...primitiveEntries,
    `windowStart=${windowStart.toISOString()}`,
  ].join('|');

  return crypto.createHash('sha256').update(fingerprint).digest('hex');
};
