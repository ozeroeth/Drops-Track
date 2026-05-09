// Row <-> object mappers for the Supabase-backed data layer.
//
// The UI works in camelCase (logoUrl, estimatedValueUsd, walletId,
// applicationDeadline, mintDate, mintPrice, chainType, createdAt) while the
// database uses snake_case per the user's SQL spec. These helpers bridge the
// two shapes so existing components never see snake_case and the DB never
// sees camelCase.
//
// toRow helpers also strip non-UUID ids so that legacy seed ids like
// "seed-wallet-1" or client-generated "id-<ts>-<rand>" strings don't leak
// into the DB - Postgres will then assign a real UUID via gen_random_uuid().

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value) {
  return typeof value === 'string' && UUID_RE.test(value);
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function parseNumericOrNull(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

// airdrops -------------------------------------------------------------------

export function rowToAirdrop(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name || '',
    logoUrl: row.logo_url || '',
    network: row.network || '',
    customNetwork: row.custom_network || '',
    status: row.status || '',
    deadline: row.deadline || '',
    estimatedValueUsd: parseNumericOrNull(row.estimated_value),
    walletId: row.wallet_id || '',
    tasks: ensureArray(row.tasks),
    notes: row.notes || '',
    link: row.link || '',
    tags: ensureArray(row.tags),
    createdAt: row.created_at || '',
  };
}

export function airdropToRow(obj, userId) {
  if (!obj) return null;
  const row = {
    user_id: userId,
    name: obj.name || '',
    logo_url: obj.logoUrl || null,
    network: obj.network || null,
    custom_network: null,
    status: obj.status || null,
    deadline: obj.deadline ? obj.deadline : null,
    estimated_value:
      typeof obj.estimatedValueUsd === 'number' &&
      Number.isFinite(obj.estimatedValueUsd)
        ? obj.estimatedValueUsd
        : null,
    wallet_id: obj.walletId || null,
    tasks: ensureArray(obj.tasks),
    notes: obj.notes || null,
    link: obj.link || null,
    tags: ensureArray(obj.tags),
  };
  if (isUuid(obj.id)) row.id = obj.id;
  if (obj.createdAt) row.created_at = obj.createdAt;
  return row;
}

// whitelists -----------------------------------------------------------------

export function rowToWhitelist(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name || '',
    type: row.type || '',
    status: row.status || '',
    applicationDeadline: row.application_deadline || '',
    mintDate: row.mint_date || '',
    walletId: row.wallet_id || '',
    mintPrice: row.mint_price || '',
    notes: row.notes || '',
    link: row.link || '',
    tags: ensureArray(row.tags),
    createdAt: row.created_at || '',
  };
}

export function whitelistToRow(obj, userId) {
  if (!obj) return null;
  const row = {
    user_id: userId,
    name: obj.name || '',
    type: obj.type || null,
    status: obj.status || null,
    application_deadline: obj.applicationDeadline ? obj.applicationDeadline : null,
    mint_date: obj.mintDate ? obj.mintDate : null,
    wallet_id: obj.walletId || null,
    mint_price: obj.mintPrice || null,
    notes: obj.notes || null,
    link: obj.link || null,
    tags: ensureArray(obj.tags),
  };
  if (isUuid(obj.id)) row.id = obj.id;
  if (obj.createdAt) row.created_at = obj.createdAt;
  return row;
}

// wallets --------------------------------------------------------------------

export function rowToWallet(row) {
  if (!row) return null;
  return {
    id: row.id,
    label: row.label || '',
    address: row.address || '',
    chainType: row.network_type || '',
    createdAt: row.created_at || '',
  };
}

export function walletToRow(obj, userId) {
  if (!obj) return null;
  const row = {
    user_id: userId,
    label: obj.label || '',
    address: obj.address || '',
    network_type: obj.chainType || null,
  };
  if (isUuid(obj.id)) row.id = obj.id;
  if (obj.createdAt) row.created_at = obj.createdAt;
  return row;
}
