function parseISODate(iso) {
  if (iso === null || iso === undefined) return null;
  if (typeof iso !== 'string') return null;
  const trimmed = iso.trim();
  if (trimmed === '') return null;
  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function startOfDay(date) {
  const d = new Date(date.getTime());
  d.setHours(0, 0, 0, 0);
  return d;
}

export function formatDate(iso) {
  const d = parseISODate(iso);
  if (!d) return '\u2014';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function daysUntil(iso) {
  const d = parseISODate(iso);
  if (!d) return null;
  const today = startOfDay(new Date());
  const target = startOfDay(d);
  const msPerDay = 24 * 60 * 60 * 1000;
  const diff = (target.getTime() - today.getTime()) / msPerDay;
  return Math.round(diff);
}

export function isExpiringSoon(iso) {
  const n = daysUntil(iso);
  if (n === null) return false;
  return n >= 0 && n <= 3;
}

export function isPast(iso) {
  const n = daysUntil(iso);
  if (n === null) return false;
  return n < 0;
}

/**
 * Pick the "primary" deadline for a whitelist entry based on its status.
 *
 * - Applied: the application deadline drives the card (fall back to mint date).
 * - Whitelisted: the application phase is done, so the mint date is the next
 *   actionable milestone (fall back to the application deadline).
 * - Minted: the mint date is the reference (fall back to the application date).
 * - Not Selected: the application deadline is the reference.
 *
 * Returns an ISO string or null/empty if neither date is set.
 */
export function primaryWhitelistDeadline(whitelist) {
  if (!whitelist) return null;
  const apply = whitelist.applicationDeadline || '';
  const mint = whitelist.mintDate || '';
  const status = whitelist.status;
  if (status === 'Whitelisted' || status === 'Minted') {
    return mint || apply || null;
  }
  return apply || mint || null;
}
