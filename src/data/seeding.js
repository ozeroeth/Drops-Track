import { supabase } from '../lib/supabase.js';
import {
  sampleAirdrops,
  sampleWallets,
  sampleWhitelists,
} from './sampleData.js';
import {
  airdropToRow,
  walletToRow,
  whitelistToRow,
} from '../lib/mappers.js';

// Seeds the three main collections with sampleData for a freshly onboarded
// user. The presence of a user_settings row doubles as the "already
// onboarded" flag - if it exists, we skip seeding so reloads don't re-seed.
//
// Errors are swallowed and logged to console.error: a broken seed must not
// block login or force-reseed from the Data tab.
//
// Atomicity: seedInitialDataIfEmpty writes user_settings ONLY after all
// three collection inserts succeed. If any insert throws, the caller sees
// the error, user_settings stays missing, and on the next login we retry
// the seed from scratch (preceded by best-effort cleanup of any partial
// rows we wrote). The fallback branch that stamps user_settings when data
// is already present (a pre-Supabase migration case) is gated on ALL three
// tables being non-empty, so a partial-seed user is never mis-identified
// as "already onboarded".

function arraysEmpty(...counts) {
  return counts.every((n) => n === 0);
}

function arraysFull(...counts) {
  return counts.every((n) => n > 0);
}

async function fetchCount(table, userId) {
  const { count, error } = await supabase
    .from(table)
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);
  if (error) throw error;
  return count || 0;
}

async function insertWalletsAndBuildMap(userId) {
  // Insert wallets one-by-one so we can correlate each seed id to its
  // server-assigned UUID. (A bulk insert would also work with a matching
  // order, but the per-row form is explicit and easier to reason about.)
  const map = new Map();
  for (const wallet of sampleWallets) {
    const row = walletToRow(wallet, userId);
    const { data, error } = await supabase
      .from('wallets')
      .insert(row)
      .select()
      .single();
    if (error) throw error;
    if (data && wallet.id) map.set(wallet.id, data.id);
  }
  return map;
}

function remapWalletId(obj, walletIdMap) {
  if (!obj || !obj.walletId) return obj;
  const mapped = walletIdMap.get(obj.walletId);
  if (!mapped) return obj;
  return { ...obj, walletId: mapped };
}

async function insertAirdrops(userId, walletIdMap) {
  const rows = sampleAirdrops
    .map((a) => airdropToRow(remapWalletId(a, walletIdMap), userId))
    .filter(Boolean);
  if (!rows.length) return;
  const { error } = await supabase.from('airdrops').insert(rows);
  if (error) throw error;
}

async function insertWhitelists(userId, walletIdMap) {
  const rows = sampleWhitelists
    .map((w) => whitelistToRow(remapWalletId(w, walletIdMap), userId))
    .filter(Boolean);
  if (!rows.length) return;
  const { error } = await supabase.from('whitelists').insert(rows);
  if (error) throw error;
}

async function upsertUserSettings(userId) {
  const { error } = await supabase
    .from('user_settings')
    .upsert(
      {
        user_id: userId,
        telegram_chat_id: null,
        telegram_notify_days_before: 3,
        notify_enabled: false,
      },
      { onConflict: 'user_id' },
    );
  if (error) throw error;
}

async function deleteAllUserRows(userId) {
  const tables = ['airdrops', 'whitelists', 'wallets'];
  for (const t of tables) {
    const { error } = await supabase.from(t).delete().eq('user_id', userId);
    if (error) throw error;
  }
}

// Best-effort cleanup of rows written during a failed seed attempt. Called
// from the catch block so the next login can retry from a clean slate.
async function cleanupPartialSeed(userId) {
  try {
    await deleteAllUserRows(userId);
  } catch (err) {
    console.error('[seeding] cleanupPartialSeed failed:', err);
  }
}

export async function seedInitialDataIfEmpty(userId) {
  if (!userId) return false;
  try {
    const { data: settingsRow, error: settingsError } = await supabase
      .from('user_settings')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();
    if (settingsError) throw settingsError;
    if (settingsRow) return false;

    const [airdropCount, whitelistCount, walletCount] = await Promise.all([
      fetchCount('airdrops', userId),
      fetchCount('whitelists', userId),
      fetchCount('wallets', userId),
    ]);

    // Only treat "data without settings" as an already-onboarded user when
    // ALL three collections are populated. If only some of them are, the
    // most likely cause is a partial-seed failure on a previous login; we
    // leave user_settings unset so the user isn't permanently locked into
    // that inconsistent state and the next login can retry.
    if (arraysFull(airdropCount, whitelistCount, walletCount)) {
      await upsertUserSettings(userId);
      return false;
    }

    if (!arraysEmpty(airdropCount, whitelistCount, walletCount)) {
      // Partial seed from a prior run. Wipe it and retry cleanly.
      console.warn(
        '[seeding] detected partial seed state; wiping and retrying',
      );
      await cleanupPartialSeed(userId);
    }

    const walletIdMap = await insertWalletsAndBuildMap(userId);
    await insertAirdrops(userId, walletIdMap);
    await insertWhitelists(userId, walletIdMap);
    // user_settings is written LAST so it acts as the commit marker: if
    // anything above threw, this row is never created and the next login
    // retries the whole seed.
    await upsertUserSettings(userId);
    return true;
  } catch (err) {
    console.error('[seeding] seedInitialDataIfEmpty failed:', err);
    // Roll back any partial writes so the next login starts clean.
    await cleanupPartialSeed(userId);
    return false;
  }
}

export async function forceSeedSampleData(userId) {
  if (!userId) return false;
  try {
    await deleteAllUserRows(userId);
    const walletIdMap = await insertWalletsAndBuildMap(userId);
    await insertAirdrops(userId, walletIdMap);
    await insertWhitelists(userId, walletIdMap);
    // Intentionally do NOT touch user_settings here: this path is invoked
    // from the Data tab's "Clear all data" button, and the confirm dialog
    // only mentions airdrops/whitelists/wallets. Wiping telegram_chat_id
    // or notify_enabled would silently reset Telegram config the user had
    // already configured. The initial-seed path above handles creating
    // the settings row for first-time users.
    return true;
  } catch (err) {
    console.error('[seeding] forceSeedSampleData failed:', err);
    return false;
  }
}

export default { seedInitialDataIfEmpty, forceSeedSampleData };
