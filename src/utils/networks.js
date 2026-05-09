import { readJSON, writeJSON } from './storage.js';
import { NETWORKS, STORAGE_KEYS } from '../constants/index.js';

function dedupeLabels(list) {
  const seen = new Set();
  const out = [];
  for (const raw of list) {
    if (typeof raw !== 'string') continue;
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
  }
  return out;
}

export function loadCustomNetworks() {
  const raw = readJSON(STORAGE_KEYS.customNetworks, []);
  if (!Array.isArray(raw)) return [];
  return dedupeLabels(raw);
}

export function addCustomNetwork(label) {
  const trimmed = typeof label === 'string' ? label.trim() : '';
  if (!trimmed) return '';
  const lower = trimmed.toLowerCase();
  const existingDefault = NETWORKS.find(
    (n) => n.label.toLowerCase() === lower || n.id.toLowerCase() === lower,
  );
  if (existingDefault) return existingDefault.id;
  const current = loadCustomNetworks();
  const match = current.find((l) => l.toLowerCase() === lower);
  if (match) return match;
  const next = dedupeLabels([...current, trimmed]);
  writeJSON(STORAGE_KEYS.customNetworks, next);
  return trimmed;
}

export function resolveNetworkLabel(value) {
  if (!value || typeof value !== 'string') return 'Other';
  const match = NETWORKS.find((n) => n.id === value);
  if (match) return match.label;
  return value;
}

export function isCustomNetwork(value) {
  if (!value || typeof value !== 'string') return false;
  return !NETWORKS.some((n) => n.id === value);
}
