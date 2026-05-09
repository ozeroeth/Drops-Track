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
// Write serialization
// -------------------
// All setRows invocations are funnelled through a per-hook promise queue
// (writeQueueRef). A new setRows call chains onto the tail of the queue and
// does not start until the previous mutation has fully resolved. This
// serializes writes in call order and closes the lost-update race where a
// mutation fired during an in-flight write could race with it.
//
// Temp-id reconciliation
// ----------------------
// Rows added with a client-generated non-UUID id land in the DB via
// `.insert(...).select()`. The returned server rows carry the authoritative
// UUID, which we record in tempIdMapRef as `tempId -> realId`. We
// intentionally do NOT swap the id in local React state: doing so would
// break code paths that captured the tempId in a click handler closure
// (e.g. "toggle a task on the row I just added"). Instead, we translate
// tempId -> realId on outgoing UPDATE and DELETE queries, so those writes
// hit the correct server row while local state keeps working with the
// original tempId. The tempId is naturally replaced on the next refresh().
//
// Fetch generation
// ----------------
// Each refresh() increments fetchGenRef; when a fetch resolves we only
// apply it if its captured gen still matches. This prevents a slow initial
// fetch (fired right after login) from overwriting post-seed state
// produced by a later fetch.
//
// Signature:
//   useSupabaseCollection(table, { rowToObj, objToRow, userId, enabled })

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

  // Per-hook write queue. Every setRows invocation .then()s onto this chain
  // so writes serialize in call order. Errors are caught inside the chained
  // job so a single failure doesn't permanently break the queue.
  const writeQueueRef = useRef(Promise.resolve());

  // Temp client id -> real server UUID, populated when an insert completes.
  // Update/delete queries consult this map so they target the correct row
  // even when local state still carries the temp id.
  const tempIdMapRef = useRef(new Map());

  // Monotonic fetch generation. refresh() captures the current gen; when the
  // fetch resolves we only apply the result if our gen is still the latest.
  const fetchGenRef = useRef(0);

  const refresh = useCallback(async () => {
    if (!enabled || !userId) {
      setRowsState([]);
      setLoading(false);
      return [];
    }
    const gen = ++fetchGenRef.current;
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from(table)
      .select('*')
      .order('created_at', { ascending: true });
    // If another refresh started while we were awaiting, this response is
    // stale: drop it on the floor.
    if (gen !== fetchGenRef.current) return [];
    if (fetchError) {
      setError(fetchError);
      setLoading(false);
      return [];
    }
    const mapped = Array.isArray(data)
      ? data.map((r) => rowToObjRef.current(r)).filter(Boolean)
      : [];
    rowsRef.current = mapped;
    setRowsState(mapped);
    setLoading(false);
    // A refresh brings local state back to server shape (real UUIDs); any
    // tempId -> realId mappings are now represented directly in state, so
    // the map can be cleared.
    tempIdMapRef.current.clear();
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
      // Enqueue this mutation behind any in-flight ones. The queue is a
      // promise chain; we attach the new job with .then so it waits for
      // the previous job's resolution, and the job's own errors are caught
      // at the end so subsequent calls continue to run.
      const job = writeQueueRef.current.then(async () => {
        const prev = rowsRef.current;
        const nextRaw = typeof updater === 'function' ? updater(prev) : updater;
        const safeNext = Array.isArray(nextRaw) ? nextRaw : [];

        // Invalidate any in-flight fetch so its stale response can't
        // overwrite the optimistic local state we're about to set. A fetch
        // that landed before this write began shouldn't clobber our new
        // rows with its pre-write snapshot.
        fetchGenRef.current++;

        // Optimistic local update first so the UI responds immediately.
        rowsRef.current = safeNext;
        setRowsState(safeNext);

        const uid = userIdRef.current;
        if (!uid) return;

        const { inserts, updates, deletes } = diffById(prev, safeNext);
        if (!inserts.length && !updates.length && !deletes.length) return;

        const tbl = tableRef.current;
        const toRow = objToRowRef.current;

        // ---- INSERTS ----
        // .insert().select() returns the server rows (with real UUIDs) in
        // the same order as the payload. Capture the mapping from temp
        // client id to real server UUID so later updates/deletes targeting
        // the temp id hit the correct row on the server.
        if (inserts.length) {
          const tempIds = [];
          const payload = [];
          for (const obj of inserts) {
            const row = toRow(obj, uid);
            if (!row) continue;
            tempIds.push(obj.id);
            payload.push(row);
          }
          if (payload.length) {
            const { data, error: insertErr } = await supabase
              .from(tbl)
              .insert(payload)
              .select();
            if (insertErr) throw insertErr;
            if (Array.isArray(data)) {
              for (let i = 0; i < data.length && i < tempIds.length; i++) {
                const serverRow = data[i];
                if (!serverRow || !serverRow.id) continue;
                const tempId = tempIds[i];
                if (tempId && tempId !== serverRow.id) {
                  tempIdMapRef.current.set(tempId, serverRow.id);
                }
              }
            }
          }
        }

        // ---- UPDATES ----
        for (const { id, obj } of updates) {
          const realId = tempIdMapRef.current.get(id) || id;
          const row = toRow(obj, uid);
          if (!row) continue;
          // Don't try to overwrite the id on update.
          delete row.id;
          const { error: updateErr } = await supabase
            .from(tbl)
            .update(row)
            .eq('id', realId);
          if (updateErr) throw updateErr;
        }

        // ---- DELETES ----
        if (deletes.length) {
          const realDeletes = deletes.map(
            (id) => tempIdMapRef.current.get(id) || id,
          );
          const { error: deleteErr } = await supabase
            .from(tbl)
            .delete()
            .in('id', realDeletes);
          if (deleteErr) throw deleteErr;
          // Drop any reconciled temp-id mappings that no longer correspond
          // to a live row, so the map doesn't grow unbounded.
          for (const id of deletes) tempIdMapRef.current.delete(id);
        }
      });

      // Catch the job's errors at the tail so the chain keeps flowing, but
      // preserve them on `error` state and best-effort-reconcile with the
      // server.
      writeQueueRef.current = job.catch((err) => {
        setError(err);
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
