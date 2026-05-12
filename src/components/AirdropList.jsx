import React, { useMemo, useState } from 'react';
import SearchBar from './SearchBar.jsx';
import FilterBar from './FilterBar.jsx';
import EmptyState from './EmptyState.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import AirdropCard from './AirdropCard.jsx';
import AirdropForm from './AirdropForm.jsx';
import { AIRDROP_STATUSES, NETWORKS } from '../constants/index.js';
import { daysUntil } from '../utils/date.js';

const DEFAULT_FILTERS = {
  status: 'All',
  network: 'All',
  sortBy: 'deadlineAsc',
};

function buildFilterOptions() {
  return {
    status: [
      { value: 'All', label: 'Status: All' },
      ...AIRDROP_STATUSES.map((s) => ({ value: s, label: s })),
    ],
    network: [
      { value: 'All', label: 'Network: All' },
      ...NETWORKS.map((n) => ({ value: n.id, label: n.label })),
    ],
    sortBy: [
      { value: 'deadlineAsc', label: 'Sort: Deadline asc' },
      { value: 'valueDesc', label: 'Sort: Estimated value desc' },
      { value: 'createdDesc', label: 'Sort: Date added desc' },
    ],
  };
}

export default function AirdropList({ airdrops, setAirdrops, wallets }) {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [editing, setEditing] = useState(null); // 'new' | airdrop | null
  const [pendingDelete, setPendingDelete] = useState(null);

  const filterOptions = useMemo(() => buildFilterOptions(), []);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    let out = airdrops.filter((a) => {
      if (filters.status !== 'All' && a.status !== filters.status) return false;
      if (filters.network !== 'All' && a.network !== filters.network) return false;
      if (q) {
        const name = (a.name || '').toLowerCase();
        const notes = (a.notes || '').toLowerCase();
        if (!name.includes(q) && !notes.includes(q)) return false;
      }
      return true;
    });
    out = out.slice();
    if (filters.sortBy === 'deadlineAsc') {
      out.sort((a, b) => {
        const da = daysUntil(a.deadline);
        const db = daysUntil(b.deadline);
        if (da === null && db === null) return 0;
        if (da === null) return 1;
        if (db === null) return -1;
        return da - db;
      });
    } else if (filters.sortBy === 'valueDesc') {
      out.sort((a, b) => {
        const av = typeof a.estimatedValueUsd === 'number' ? a.estimatedValueUsd : null;
        const bv = typeof b.estimatedValueUsd === 'number' ? b.estimatedValueUsd : null;
        if (av === null && bv === null) return 0;
        if (av === null) return 1;
        if (bv === null) return -1;
        return bv - av;
      });
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
  }, [airdrops, search, filters]);

  function handleSubmit(entry) {
    setAirdrops((prev) => {
      const idx = prev.findIndex((a) => a.id === entry.id);
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
    setAirdrops((prev) => prev.filter((a) => a.id !== id));
    setPendingDelete(null);
  }

  function handleToggleTask(airdropId, taskId) {
    setAirdrops((prev) =>
      prev.map((a) => {
        if (a.id !== airdropId) return a;
        const tasks = Array.isArray(a.tasks) ? a.tasks : [];
        return {
          ...a,
          tasks: tasks.map((t) =>
            t.id === taskId ? { ...t, done: !t.done } : t,
          ),
        };
      }),
    );
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
          + Add Airdrop
        </button>
      </div>

      {airdrops.length === 0 ? (
        <EmptyState
          title="No airdrops yet"
          hint="Click Add Airdrop to track your first opportunity."
        />
      ) : visible.length === 0 ? (
        <EmptyState
          title="No airdrops match your filters"
          hint="Try clearing filters or adjusting your search."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((a) => (
            <AirdropCard
              key={a.id}
              airdrop={a}
              wallet={walletById.get(a.walletId) || null}
              onEdit={(entry) => setEditing(entry)}
              onDelete={(entry) => setPendingDelete(entry)}
              onToggleTask={handleToggleTask}
            />
          ))}
        </div>
      )}

      {editing ? (
        <AirdropForm
          initial={editing === 'new' ? null : editing}
          wallets={wallets}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
        />
      ) : null}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete airdrop?"
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
