import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabase.js';

// Generic Supabase-backed collection hook.
//
// Returns a [rows, setRows, meta] tuple that mimics React.useState so the
// existing components (AirdropList, WhitelistList, WalletManager,
// DataManager) can keep calling `setRows(prev => ...)` or `setRows(newArray)`
// unchanged. Under the hood setRows diffs old vs new by `id` and translates
// the difference into Supabase insert/update/delete calls.
//
// Diff rules:
//   - id in next but not in prev  -> insert (objToRow strips non-UUID ids so
//                                    Postgres assigns a fresh UUID)
//   - id in prev but not in next  -> delete (by the prev id)
//   - id in both, JSON differs    -> update
//
// State is updated optimistically before the network calls fire. After all
// writes resolve we trigger a refresh() so the local rows pick up any
// server-assigned UUIDs for newly inserted records (inserts made locally
// with a client-generated non-UUID id like `id-<ts>-<rand>` will be
// replaced by their real UUID equivalents on refresh).
//
// Signature:
//   useSupabaseCollection(table, { rowToObj, objToRow, userId, enabled })
//
// Arguments:
//   table      - table name (e.g. 'airdrops').
//   rowToObj   - (row) => uiObject
//   objToRow   - (obj, userId) => dbRow  (strips non-UUID ids, adds user_id)
//   userId     - the auth.uid() of the current user; null/undefined disables
//                mutations and leaves rows = [].
//   enabled    - boolean; when false the hook is a no-op (rows=[], loading=false).

function indexById(list) {
  const map = new Map();
  if (!Array.isArray(list)) return map;
  for (const item of list) {
    if (item && item.id !== undefined && item.id !== null) {
      map.set(item.id, item);
    }
  }
  return map;
}

function diffById(prev, next) {
  const prevMap = indexById(prev);
  const nextMap = indexById(next);
  const inserts = [];
  const updates = [];
  const deletes = [];
  for (const [id, obj] of nextMap) {
    if (!prevMap.has(id)) {
      inserts.push(obj);
    } else {
      const before = prevMap.get(id);
      if (JSON.stringify(before) !== JSON.stringify(obj)) {
        updates.push({ id, obj });
      }
    }
  }
  for (const [id] of prevMap) {
    if (!nextMap.has(id)) deletes.push(id);
  }
  return { inserts, updates, deletes };
}

export default function useSupabaseCollection(
  table,
  { rowToObj, objToRow, userId, enabled } = {},
) {
  const [rows, setRowsState] = useState([]);
  const [loading, setLoading] = useState(!!enabled);
  const [error, setError] = useState(null);

  // Refs so setRows can reach the latest values without re-creating its
  // closure on every render, and so async writes don't race stale state.
  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  const userIdRef = useRef(userId);
  userIdRef.current = userId;

  const objToRowRef = useRef(objToRow);
  objToRowRef.current = objToRow;

  const rowToObjRef = useRef(rowToObj);
  rowToObjRef.current = rowToObj;

  const tableRef = useRef(table);
  tableRef.current = table;

  const refresh = useCallback(async () => {
    if (!enabled || !userId) {
      setRowsState([]);
      setLoading(false);
      return [];
    }
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from(table)
      .select('*')
      .order('created_at', { ascending: true });
    if (fetchError) {
      setError(fetchError);
      setLoading(false);
      return [];
    }
    const mapped = Array.isArray(data)
      ? data.map((r) => rowToObjRef.current(r)).filter(Boolean)
      : [];
    setRowsState(mapped);
    setLoading(false);
    return mapped;
  }, [table, userId, enabled]);

  useEffect(() => {
    if (!enabled || !userId) {
      setRowsState([]);
      setLoading(false);
      return;
    }
    refresh().catch((err) => {
      setError(err);
      setLoading(false);
    });
  }, [enabled, userId, refresh]);

  const setRows = useCallback(
    (updater) => {
      const prev = rowsRef.current;
      const next =
        typeof updater === 'function' ? updater(prev) : updater;
      const safeNext = Array.isArray(next) ? next : [];

      // Optimistic local update first so the UI responds immediately.
      rowsRef.current = safeNext;
      setRowsState(safeNext);

      const uid = userIdRef.current;
      if (!uid) return;

      const { inserts, updates, deletes } = diffById(prev, safeNext);
      if (!inserts.length && !updates.length && !deletes.length) return;

      const tbl = tableRef.current;
      const toRow = objToRowRef.current;

      const ops = [];
      if (inserts.length) {
        const payload = inserts
          .map((obj) => toRow(obj, uid))
          .filter(Boolean);
        if (payload.length) {
          ops.push(
            supabase
              .from(tbl)
              .insert(payload)
              .then((res) => {
                if (res.error) throw res.error;
                return res;
              }),
          );
        }
      }
      for (const { id, obj } of updates) {
        const row = toRow(obj, uid);
        if (!row) continue;
        // Don't try to overwrite the id on update.
        delete row.id;
        ops.push(
          supabase
            .from(tbl)
            .update(row)
            .eq('id', id)
            .then((res) => {
              if (res.error) throw res.error;
              return res;
            }),
        );
      }
      if (deletes.length) {
        ops.push(
          supabase
            .from(tbl)
            .delete()
            .in('id', deletes)
            .then((res) => {
              if (res.error) throw res.error;
              return res;
            }),
        );
      }

      Promise.all(ops)
        .then(() => {
          // If any inserts happened, the DB assigned new UUIDs that aren't
          // in our optimistic local state; refresh to pick them up.
          if (inserts.length) {
            refresh().catch((err) => setError(err));
          }
        })
        .catch((err) => {
          setError(err);
          // Best-effort reconciliation: pull the authoritative server state
          // back into local so the UI doesn't stay wedged on a failed write.
          refresh().catch(() => {});
        });
    },
    [refresh],
  );

  const meta = useMemo(
    () => ({ loading, error, refresh }),
    [loading, error, refresh],
  );

  return [rows, setRows, meta];
}
