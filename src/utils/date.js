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
 * - Applied: the application deadline drives the card, falling back to the
 *   mint date if apply is empty (both dates are still potentially informative).
 * - Whitelisted: the application phase is done, so the mint date is the next
 *   actionable milestone, falling back to the application deadline if empty.
 * - Minted: terminal status; only the mint date is meaningful, so return
 *   `mint || null` with no cross-fallback to the apply date.
 * - Not Selected: terminal status; only the apply date is meaningful, so
 *   return `apply || null` with no cross-fallback to the mint date.
 *
 * Returns an ISO string or null if the relevant date is not set.
 */
export function primaryWhitelistDeadline(whitelist) {
  if (!whitelist) return null;
  const apply = whitelist.applicationDeadline || '';
  const mint = whitelist.mintDate || '';
  const status = whitelist.status;
  if (status === 'Minted') {
    return mint || null;
  }
  if (status === 'Not Selected') {
    return apply || null;
  }
  if (status === 'Whitelisted') {
    return mint || apply || null;
  }
  return apply || mint || null;
}
