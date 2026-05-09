import React, { useEffect, useMemo, useState } from 'react';
import SearchBar from './SearchBar.jsx';
import FilterBar from './FilterBar.jsx';
import EmptyState from './EmptyState.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import AirdropCard from './AirdropCard.jsx';
import AirdropForm from './AirdropForm.jsx';
import Toast from './Toast.jsx';
import { AIRDROP_STATUSES, NETWORKS } from '../constants/index.js';
import { daysUntil, todayIsoLocal } from '../utils/date.js';
import { generateId } from '../utils/id.js';

const DEFAULT_FILTERS = {
  status: 'All',
  network: 'All',
  tag: 'All',
  sortBy: 'deadlineAsc',
};

function collectTags(airdrops) {
  const set = new Set();
  for (const a of airdrops) {
    if (!Array.isArray(a.tags)) continue;
    for (const t of a.tags) {
      if (typeof t === 'string' && t.trim() !== '') set.add(t);
    }
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

function collectCustomNetworks(airdrops) {
  const defaultIds = new Set(NETWORKS.map((n) => n.id));
  const seen = new Set();
  const out = [];
  for (const a of airdrops) {
    const v = a && typeof a.network === 'string' ? a.network : '';
    if (!v) continue;
    if (defaultIds.has(v)) continue;
    const key = v.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(v);
  }
  out.sort((a, b) => a.localeCompare(b));
  return out;
}

function buildFilterOptions(airdrops) {
  const customNetworks = collectCustomNetworks(airdrops);
  return {
    status: [
      { value: 'All', label: 'Status: All' },
      ...AIRDROP_STATUSES.map((s) => ({ value: s, label: s })),
    ],
    network: [
      { value: 'All', label: 'Network: All' },
      ...NETWORKS.map((n) => ({ value: n.id, label: n.label })),
      ...customNetworks.map((label) => ({
        value: label,
        label: `${label} \u270F\uFE0F`,
      })),
    ],
    tag: [
      { value: 'All', label: 'Tag: All' },
      ...collectTags(airdrops).map((t) => ({ value: t, label: t })),
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
  const [toast, setToast] = useState({ message: '', nonce: 0 });

  const filterOptions = useMemo(() => buildFilterOptions(airdrops), [airdrops]);

  useEffect(() => {
    if (filters.tag === 'All') return;
    const tags = collectTags(airdrops);
    if (!tags.includes(filters.tag)) {
      setFilters((prev) => ({ ...prev, tag: 'All' }));
    }
  }, [airdrops, filters.tag]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    let out = airdrops.filter((a) => {
      if (filters.status !== 'All' && a.status !== filters.status) return false;
      if (filters.network !== 'All' && a.network !== filters.network) return false;
      if (filters.tag !== 'All') {
        const tags = Array.isArray(a.tags) ? a.tags : [];
        if (!tags.includes(filters.tag)) return false;
      }
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

  function handleDuplicate(source) {
    if (!source) return;
    const now = todayIsoLocal();
    const dup = {
      id: generateId(),
      name: `${source.name || ''} (Copy)`,
      logoUrl: source.logoUrl || '',
      network: source.network || '',
      status: 'Active',
      deadline: source.deadline || '',
      estimatedValueUsd:
        typeof source.estimatedValueUsd === 'number'
          ? source.estimatedValueUsd
          : source.estimatedValueUsd === null || source.estimatedValueUsd === undefined
            ? null
            : source.estimatedValueUsd,
      walletId: source.walletId || '',
      tasks: Array.isArray(source.tasks)
        ? source.tasks.map((t) => ({
            id: generateId(),
            label: t && t.label ? t.label : '',
            done: !!(t && t.done),
          }))
        : [],
      tags: Array.isArray(source.tags) ? source.tags.slice() : [],
      notes: source.notes || '',
      link: source.link || '',
      twitterUrl: source.twitterUrl || '',
      createdAt: now,
    };
    setAirdrops((prev) => [dup, ...prev]);
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
          + Add Airdrop
        </button>
      </div>

      {airdrops.length === 0 ? (
        <EmptyState
          title="No airdrops yet"
          hint="Click Add Airdrop to track your first opportunity."
          emoji={'\u{1F680}'}
        />
      ) : visible.length === 0 ? (
        <EmptyState
          title="No airdrops match your filters"
          hint="Try clearing filters or adjusting your search."
          emoji={'\u{1F50D}'}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((a, index) => (
            <div
              key={a.id}
              className="animate-card-entrance"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <AirdropCard
                airdrop={a}
                wallet={walletById.get(a.walletId) || null}
                onEdit={(entry) => setEditing(entry)}
                onDelete={(entry) => setPendingDelete(entry)}
                onDuplicate={handleDuplicate}
                onToggleTask={handleToggleTask}
              />
            </div>
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

      <Toast message={toast.message} nonce={toast.nonce} />
    </div>
  );
}
