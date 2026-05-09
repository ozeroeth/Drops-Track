import React, { useEffect, useMemo, useState } from 'react';
import SearchBar from './SearchBar.jsx';
import FilterBar from './FilterBar.jsx';
import EmptyState from './EmptyState.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import WhitelistCard from './WhitelistCard.jsx';
import WhitelistForm from './WhitelistForm.jsx';
import Toast from './Toast.jsx';
import { WHITELIST_STATUSES, WHITELIST_TYPES } from '../constants/index.js';
import { daysUntil, todayIsoLocal } from '../utils/date.js';
import { generateId } from '../utils/id.js';

const DEFAULT_FILTERS = {
  status: 'All',
  type: 'All',
  tag: 'All',
  sortBy: 'applicationAsc',
};

function collectTags(whitelists) {
  const set = new Set();
  for (const w of whitelists) {
    if (!Array.isArray(w.tags)) continue;
    for (const t of w.tags) {
      if (typeof t === 'string' && t.trim() !== '') set.add(t);
    }
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

function buildFilterOptions(whitelists) {
  return {
    status: [
      { value: 'All', label: 'Status: All' },
      ...WHITELIST_STATUSES.map((s) => ({ value: s, label: s })),
    ],
    type: [
      { value: 'All', label: 'Type: All' },
      ...WHITELIST_TYPES.map((t) => ({ value: t, label: t })),
    ],
    tag: [
      { value: 'All', label: 'Tag: All' },
      ...collectTags(whitelists).map((t) => ({ value: t, label: t })),
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
  const [toast, setToast] = useState({ message: '', nonce: 0 });

  const filterOptions = useMemo(
    () => buildFilterOptions(whitelists),
    [whitelists],
  );

  useEffect(() => {
    if (filters.tag === 'All') return;
    const tags = collectTags(whitelists);
    if (!tags.includes(filters.tag)) {
      setFilters((prev) => ({ ...prev, tag: 'All' }));
    }
  }, [whitelists, filters.tag]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    let out = whitelists.filter((w) => {
      if (filters.status !== 'All' && w.status !== filters.status) return false;
      if (filters.type !== 'All' && w.type !== filters.type) return false;
      if (filters.tag !== 'All') {
        const tags = Array.isArray(w.tags) ? w.tags : [];
        if (!tags.includes(filters.tag)) return false;
      }
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

  function handleDuplicate(source) {
    if (!source) return;
    const now = todayIsoLocal();
    const dup = {
      id: generateId(),
      name: `${source.name || ''} (Copy)`,
      type: source.type || WHITELIST_TYPES[0] || 'NFT mint',
      status: 'Applied',
      applicationDeadline: source.applicationDeadline || '',
      mintDate: source.mintDate || '',
      walletId: source.walletId || '',
      mintPrice: source.mintPrice || '',
      tags: Array.isArray(source.tags) ? source.tags.slice() : [],
      notes: source.notes || '',
      link: source.link || '',
      twitterUrl: source.twitterUrl || '',
      createdAt: now,
    };
    setWhitelists((prev) => [dup, ...prev]);
    setToast((prev) => ({ message: 'Entry duplicated!', nonce: prev.nonce + 1 }));
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
          className="rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-primary/20"
          style={{
            background: 'linear-gradient(135deg, #F7931A, #E8820A)',
          }}
        >
          + Add Whitelist
        </button>
      </div>

      {whitelists.length === 0 ? (
        <EmptyState
          title="No whitelists yet"
          hint="Click Add Whitelist to track your first entry."
          emoji={'\u{1F3AF}'}
        />
      ) : visible.length === 0 ? (
        <EmptyState
          title="No whitelists match your filters"
          hint="Try clearing filters or adjusting your search."
          emoji={'\u{1F50D}'}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((w, index) => (
            <div
              key={w.id}
              className="animate-card-entrance"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <WhitelistCard
                whitelist={w}
                wallet={walletById.get(w.walletId) || null}
                onEdit={(entry) => setEditing(entry)}
                onDelete={(entry) => setPendingDelete(entry)}
                onDuplicate={handleDuplicate}
              />
            </div>
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

      <Toast message={toast.message} nonce={toast.nonce} />
    </div>
  );
}
