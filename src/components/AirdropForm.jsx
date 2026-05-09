import React, { useEffect, useState } from 'react';
import Modal from './Modal.jsx';
import { NETWORKS, AIRDROP_STATUSES } from '../constants/index.js';
import { generateId } from '../utils/id.js';

function emptyEntry() {
  return {
    id: '',
    name: '',
    logoUrl: '',
    network: NETWORKS[0] ? NETWORKS[0].id : 'other',
    status: 'Active',
    deadline: '',
    estimatedValueUsd: '',
    walletId: '',
    tasks: [],
    notes: '',
    link: '',
    createdAt: '',
  };
}

function fromInitial(initial) {
  if (!initial) return emptyEntry();
  return {
    id: initial.id || '',
    name: initial.name || '',
    logoUrl: initial.logoUrl || '',
    network: initial.network || (NETWORKS[0] ? NETWORKS[0].id : 'other'),
    status: initial.status || 'Active',
    deadline: initial.deadline || '',
    estimatedValueUsd:
      typeof initial.estimatedValueUsd === 'number'
        ? String(initial.estimatedValueUsd)
        : initial.estimatedValueUsd || '',
    walletId: initial.walletId || '',
    tasks: Array.isArray(initial.tasks)
      ? initial.tasks.map((t) => ({
          id: t.id || generateId(),
          label: t.label || '',
          done: !!t.done,
        }))
      : [],
    notes: initial.notes || '',
    link: initial.link || '',
    createdAt: initial.createdAt || '',
  };
}

export default function AirdropForm({ initial, wallets, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => fromInitial(initial));
  const [newTask, setNewTask] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(fromInitial(initial));
    setNewTask('');
    setError('');
  }, [initial]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function addTask() {
    const label = newTask.trim();
    if (!label) return;
    setForm((prev) => ({
      ...prev,
      tasks: [...prev.tasks, { id: generateId(), label, done: false }],
    }));
    setNewTask('');
  }

  function removeTask(id) {
    setForm((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id),
    }));
  }

  function toggleTaskDone(id) {
    setForm((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === id ? { ...t, done: !t.done } : t,
      ),
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) {
      setError('Name is required');
      return;
    }
    setError('');
    const estRaw = typeof form.estimatedValueUsd === 'string'
      ? form.estimatedValueUsd.trim()
      : form.estimatedValueUsd;
    let estimatedValueUsd = null;
    if (estRaw !== '' && estRaw !== null && estRaw !== undefined) {
      const n = Number(estRaw);
      estimatedValueUsd = Number.isFinite(n) ? n : null;
    }
    const now = new Date().toISOString().slice(0, 10);
    const entry = {
      id: form.id || generateId(),
      name,
      logoUrl: form.logoUrl.trim(),
      network: form.network,
      status: form.status,
      deadline: form.deadline || '',
      estimatedValueUsd,
      walletId: form.walletId || '',
      tasks: form.tasks.map((t) => ({
        id: t.id,
        label: t.label,
        done: !!t.done,
      })),
      notes: form.notes,
      link: form.link.trim(),
      createdAt: form.createdAt || now,
    };
    onSubmit(entry);
  }

  const isEdit = !!form.id && !!initial;

  return (
    <Modal open onClose={onCancel} title={isEdit ? 'Edit airdrop' : 'Add airdrop'}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-300" htmlFor="af-name">
            Name <span className="text-red-400">*</span>
          </label>
          <input
            id="af-name"
            type="text"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className="mt-1 w-full rounded-md border border-surface2 bg-surface px-3 py-2 text-sm text-slate-100 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
            autoFocus
          />
          {error ? <p className="mt-1 text-xs text-red-400">{error}</p> : null}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-slate-300" htmlFor="af-logo">
              Logo URL
            </label>
            <input
              id="af-logo"
              type="url"
              value={form.logoUrl}
              onChange={(e) => update('logoUrl', e.target.value)}
              className="mt-1 w-full rounded-md border border-surface2 bg-surface px-3 py-2 text-sm text-slate-100 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300" htmlFor="af-network">
              Network
            </label>
            <select
              id="af-network"
              value={form.network}
              onChange={(e) => update('network', e.target.value)}
              className="mt-1 w-full rounded-md border border-surface2 bg-surface px-3 py-2 text-sm text-slate-100 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
            >
              {NETWORKS.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-medium text-slate-300" htmlFor="af-status">
              Status
            </label>
            <select
              id="af-status"
              value={form.status}
              onChange={(e) => update('status', e.target.value)}
              className="mt-1 w-full rounded-md border border-surface2 bg-surface px-3 py-2 text-sm text-slate-100 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
            >
              {AIRDROP_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300" htmlFor="af-deadline">
              Deadline
            </label>
            <input
              id="af-deadline"
              type="date"
              value={form.deadline}
              onChange={(e) => update('deadline', e.target.value)}
              className="mt-1 w-full rounded-md border border-surface2 bg-surface px-3 py-2 text-sm text-slate-100 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300" htmlFor="af-value">
              Est. value (USD)
            </label>
            <input
              id="af-value"
              type="number"
              step="any"
              min="0"
              value={form.estimatedValueUsd}
              onChange={(e) => update('estimatedValueUsd', e.target.value)}
              className="mt-1 w-full rounded-md border border-surface2 bg-surface px-3 py-2 text-sm text-slate-100 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300" htmlFor="af-wallet">
            Wallet
          </label>
          <select
            id="af-wallet"
            value={form.walletId}
            onChange={(e) => update('walletId', e.target.value)}
            className="mt-1 w-full rounded-md border border-surface2 bg-surface px-3 py-2 text-sm text-slate-100 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
          >
            <option value="">{'\u2014 None \u2014'}</option>
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="block text-xs font-medium text-slate-300">Tasks</div>
          <div className="mt-1 space-y-1.5">
            {form.tasks.length === 0 ? (
              <p className="text-xs text-slate-500">No tasks yet.</p>
            ) : (
              form.tasks.map((t) => (
                <div key={t.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!t.done}
                    onChange={() => toggleTaskDone(t.id)}
                    className="h-4 w-4 flex-none rounded border-surface2 bg-surface2 text-accent-500 focus:ring-2 focus:ring-accent-500/40"
                  />
                  <input
                    type="text"
                    value={t.label}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        tasks: prev.tasks.map((x) =>
                          x.id === t.id ? { ...x, label: e.target.value } : x,
                        ),
                      }))
                    }
                    className="flex-1 rounded-md border border-surface2 bg-surface px-2 py-1 text-sm text-slate-100 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
                  />
                  <button
                    type="button"
                    onClick={() => removeTask(t.id)}
                    className="rounded-md border border-surface2 bg-surface2 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="New task..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTask();
                  }
                }}
                className="flex-1 rounded-md border border-surface2 bg-surface px-2 py-1 text-sm text-slate-100 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
              />
              <button
                type="button"
                onClick={addTask}
                className="rounded-md border border-accent-500/40 bg-accent-500/20 px-2 py-1 text-xs font-medium text-accent-200 hover:bg-accent-500/30 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300" htmlFor="af-notes">
            Notes
          </label>
          <textarea
            id="af-notes"
            rows={3}
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
            className="mt-1 w-full rounded-md border border-surface2 bg-surface px-3 py-2 text-sm text-slate-100 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300" htmlFor="af-link">
            Link
          </label>
          <input
            id="af-link"
            type="url"
            value={form.link}
            onChange={(e) => update('link', e.target.value)}
            className="mt-1 w-full rounded-md border border-surface2 bg-surface px-3 py-2 text-sm text-slate-100 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
          />
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-surface2 bg-surface2 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-md border border-accent-500/40 bg-accent-500 px-3 py-1.5 text-sm font-medium text-slate-900 hover:bg-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
          >
            {isEdit ? 'Save changes' : 'Add airdrop'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
