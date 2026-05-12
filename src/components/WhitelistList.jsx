import React, { useMemo, useState } from 'react';
import SearchBar from './SearchBar.jsx';
import FilterBar from './FilterBar.jsx';
import EmptyState from './EmptyState.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import WhitelistCard from './WhitelistCard.jsx';
import WhitelistForm from './WhitelistForm.jsx';
import { WHITELIST_STATUSES, WHITELIST_TYPES } from '../constants/index.js';
import { daysUntil } from '../utils/date.js';

const DEFAULT_FILTERS = {
  status: 'All',
  type: 'All',
  sortBy: 'applicationAsc',
};

function buildFilterOptions() {
  return {
    status: [
      { value: 'All', label: 'Status: All' },
      ...WHITELIST_STATUSES.map((s) => ({ value: s, label: s })),
    ],
    type: [
      { value: 'All', label: 'Type: All' },
      ...WHITELIST_TYPES.map((t) => ({ value: t, label: t })),
    ],
    sortBy: [
      { value: 'applicationAsc', label: 'Sort: Application deadline asc' },
      { value: 'mintAsc', label: 'Sort: Mint date asc' },
      { value: 'createdDesc', label: 'Sort: Date added desc' },
    ],
  };
}

export default function WhitelistList({ whitelists, setWhitelists, wallets }) {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [editing, setEditing] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const filterOptions = useMemo(() => buildFilterOptions(), []);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    let out = whitelists.filter((w) => {
      if (filters.status !== 'All' && w.status !== filters.status) return false;
      if (filters.type !== 'All' && w.type !== filters.type) return false;
      if (q) {
        const name = (w.name || '').toLowerCase();
        const notes = (w.notes || '').toLowerCase();
        if (!name.includes(q) && !notes.includes(q)) return false;
      }
      return true;
    });
    out = out.slice();
    function sortByIso(pick) {
      out.sort((a, b) => {
        const da = daysUntil(pick(a));
        const db = daysUntil(pick(b));
        if (da === null && db === null) return 0;
        if (da === null) return 1;
        if (db === null) return -1;
        return da - db;
      });
    }
    if (filters.sortBy === 'applicationAsc') {
      sortByIso((w) => w.applicationDeadline);
    } else if (filters.sortBy === 'mintAsc') {
      sortByIso((w) => w.mintDate);
    } else if (filters.sortBy === 'createdDesc') {
      out.sort((a, b) => {
        const ac = a.createdAt || '';
        const bc = b.createdAt || '';
        if (ac < bc) return 1;
        if (ac > bc) return -1;
        return 0;
      });
    }
    return out;
  }, [whitelists, search, filters]);

  function handleSubmit(entry) {
    setWhitelists((prev) => {
      const idx = prev.findIndex((w) => w.id === entry.id);
      if (idx === -1) return [...prev, entry];
      const next = prev.slice();
      next[idx] = entry;
      return next;
    });
    setEditing(null);
  }

  function handleDeleteConfirm() {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    setWhitelists((prev) => prev.filter((w) => w.id !== id));
    setPendingDelete(null);
  }

  const walletById = useMemo(() => {
    const map = new Map();
    for (const w of wallets) map.set(w.id, w);
    return map;
  }, [wallets]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search name or notes..."
          />
          <FilterBar
            filters={filters}
            setFilters={setFilters}
            options={filterOptions}
            defaults={DEFAULT_FILTERS}
          />
        </div>
        <button
          type="button"
          onClick={() => setEditing('new')}
          className="sketch-btn sketch-btn-accent px-3 py-1.5 text-sm"
        >
          + Add Whitelist
        </button>
      </div>

      {whitelists.length === 0 ? (
        <EmptyState
          title="No whitelists yet"
          hint="Click Add Whitelist to track your first entry."
        />
      ) : visible.length === 0 ? (
        <EmptyState
          title="No whitelists match your filters"
          hint="Try clearing filters or adjusting your search."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((w) => (
            <WhitelistCard
              key={w.id}
              whitelist={w}
              wallet={walletById.get(w.walletId) || null}
              onEdit={(entry) => setEditing(entry)}
              onDelete={(entry) => setPendingDelete(entry)}
            />
          ))}
        </div>
      )}

      {editing ? (
        <WhitelistForm
          initial={editing === 'new' ? null : editing}
          wallets={wallets}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
        />
      ) : null}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete whitelist?"
        body={
          pendingDelete
            ? `This will permanently remove "${pendingDelete.name}" from your list.`
            : ''
        }
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
