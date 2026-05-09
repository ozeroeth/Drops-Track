export function hasWindow() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function readJSON(key, fallback) {
  if (!hasWindow()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null || raw === undefined) return fallback;
    try {
      return JSON.parse(raw);
    } catch (parseErr) {
      return fallback;
    }
  } catch (err) {
    return fallback;
  }
}

export function writeJSON(key, value) {
  if (!hasWindow()) return false;
  try {
    const serialized = JSON.stringify(value);
    window.localStorage.setItem(key, serialized);
    return true;
  } catch (err) {
    return false;
  }
}

export function removeKey(key) {
  if (!hasWindow()) return false;
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (err) {
    return false;
  }
}
