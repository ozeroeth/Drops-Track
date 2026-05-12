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
          <label className="block text-xs font-medium" style={{ color: 'var(--text-muted)' }} htmlFor="af-name">
            Name <span style={{ color: '#c62828' }}>*</span>
          </label>
          <input
            id="af-name"
            type="text"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className="sketchy-input mt-1 w-full px-3 py-2 text-sm"
            autoFocus
          />
          {error ? <p className="mt-1 text-xs" style={{ color: '#c62828' }}>{error}</p> : null}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium" style={{ color: 'var(--text-muted)' }} htmlFor="af-logo">
              Logo URL
            </label>
            <input
              id="af-logo"
              type="url"
              value={form.logoUrl}
              onChange={(e) => update('logoUrl', e.target.value)}
              className="sketchy-input mt-1 w-full px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium" style={{ color: 'var(--text-muted)' }} htmlFor="af-network">
              Network
            </label>
            <select
              id="af-network"
              value={form.network}
              onChange={(e) => update('network', e.target.value)}
              className="sketchy-input mt-1 w-full px-3 py-2 text-sm"
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
            <label className="block text-xs font-medium" style={{ color: 'var(--text-muted)' }} htmlFor="af-status">
              Status
            </label>
            <select
              id="af-status"
              value={form.status}
              onChange={(e) => update('status', e.target.value)}
              className="sketchy-input mt-1 w-full px-3 py-2 text-sm"
            >
              {AIRDROP_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium" style={{ color: 'var(--text-muted)' }} htmlFor="af-deadline">
              Deadline
            </label>
            <input
              id="af-deadline"
              type="date"
              value={form.deadline}
              onChange={(e) => update('deadline', e.target.value)}
              className="sketchy-input mt-1 w-full px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium" style={{ color: 'var(--text-muted)' }} htmlFor="af-value">
              Est. value (USD)
            </label>
            <input
              id="af-value"
              type="number"
              step="any"
              min="0"
              value={form.estimatedValueUsd}
              onChange={(e) => update('estimatedValueUsd', e.target.value)}
              className="sketchy-input mt-1 w-full px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium" style={{ color: 'var(--text-muted)' }} htmlFor="af-wallet">
            Wallet
          </label>
          <select
            id="af-wallet"
            value={form.walletId}
            onChange={(e) => update('walletId', e.target.value)}
            className="sketchy-input mt-1 w-full px-3 py-2 text-sm"
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
          <div className="block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Tasks</div>
          <div className="mt-1 space-y-1.5">
            {form.tasks.length === 0 ? (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No tasks yet.</p>
            ) : (
              form.tasks.map((t) => (
                <div key={t.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!t.done}
                    onChange={() => toggleTaskDone(t.id)}
                    className="h-4 w-4 flex-none rounded"
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
                    className="sketchy-input flex-1 px-2 py-1 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeTask(t.id)}
                    className="sketchy-btn"
                    style={{ padding: '4px 8px', fontSize: '12px', background: 'var(--surface)', color: 'var(--text)' }}
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
                className="sketchy-input flex-1 px-2 py-1 text-sm"
              />
              <button
                type="button"
                onClick={addTask}
                className="sketchy-btn"
                style={{ padding: '4px 8px', fontSize: '12px' }}
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium" style={{ color: 'var(--text-muted)' }} htmlFor="af-notes">
            Notes
          </label>
          <textarea
            id="af-notes"
            rows={3}
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
            className="sketchy-input mt-1 w-full px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium" style={{ color: 'var(--text-muted)' }} htmlFor="af-link">
            Link
          </label>
          <input
            id="af-link"
            type="url"
            value={form.link}
            onChange={(e) => update('link', e.target.value)}
            className="sketchy-input mt-1 w-full px-3 py-2 text-sm"
          />
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="sketchy-btn"
            style={{ background: 'var(--surface)', color: 'var(--text)' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="sketchy-btn"
          >
            {isEdit ? 'Save changes' : 'Add airdrop'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
