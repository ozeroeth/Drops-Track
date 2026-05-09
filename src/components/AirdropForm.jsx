import React, { useEffect, useState } from 'react';
import Modal from './Modal.jsx';
import NetworkSelect from './NetworkSelect.jsx';
import TagInput from './TagInput.jsx';
import { NETWORKS, AIRDROP_STATUSES } from '../constants/index.js';
import { generateId } from '../utils/id.js';
import { todayIsoLocal } from '../utils/date.js';

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
    tags: [],
    notes: '',
    link: '',
    twitterUrl: '',
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
    tags: Array.isArray(initial.tags)
      ? initial.tags.filter((t) => typeof t === 'string' && t.trim() !== '')
      : [],
    notes: initial.notes || '',
    link: initial.link || '',
    twitterUrl: initial.twitterUrl || '',
    createdAt: initial.createdAt || '',
  };
}

const inputClass =
  'mt-1 w-full rounded-[10px] border px-3 py-2 text-sm text-white placeholder-[#4A5568] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

const inputStyle = {
  background: 'rgba(255,255,255,0.04)',
  borderColor: 'rgba(255,255,255,0.08)',
};

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
    const now = todayIsoLocal();
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
      tags: Array.isArray(form.tags) ? form.tags.slice() : [],
      notes: form.notes,
      link: form.link.trim(),
      twitterUrl: form.twitterUrl.trim(),
      createdAt: form.createdAt || now,
    };
    onSubmit(entry);
  }

  const isEdit = !!form.id && !!initial;

  return (
    <Modal open onClose={onCancel} title={isEdit ? 'Edit airdrop' : 'Add airdrop'}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-textSecondary" htmlFor="af-name">
            Name <span className="text-danger">*</span>
          </label>
          <input
            id="af-name"
            type="text"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className={inputClass}
            style={inputStyle}
            autoFocus
          />
          {error ? <p className="mt-1 text-xs text-danger">{error}</p> : null}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-textSecondary" htmlFor="af-logo">
              Logo URL
            </label>
            <input
              id="af-logo"
              type="url"
              value={form.logoUrl}
              onChange={(e) => update('logoUrl', e.target.value)}
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-textSecondary" htmlFor="af-network">
              Network
            </label>
            <NetworkSelect
              id="af-network"
              value={form.network}
              onChange={(v) => update('network', v)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-medium text-textSecondary" htmlFor="af-status">
              Status
            </label>
            <select
              id="af-status"
              value={form.status}
              onChange={(e) => update('status', e.target.value)}
              className={inputClass}
              style={inputStyle}
            >
              {AIRDROP_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-textSecondary" htmlFor="af-deadline">
              Deadline
            </label>
            <input
              id="af-deadline"
              type="date"
              value={form.deadline}
              onChange={(e) => update('deadline', e.target.value)}
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-textSecondary" htmlFor="af-value">
              Est. value (USD)
            </label>
            <input
              id="af-value"
              type="number"
              step="any"
              min="0"
              value={form.estimatedValueUsd}
              onChange={(e) => update('estimatedValueUsd', e.target.value)}
              className={inputClass}
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-textSecondary" htmlFor="af-wallet">
            Wallet
          </label>
          <select
            id="af-wallet"
            value={form.walletId}
            onChange={(e) => update('walletId', e.target.value)}
            className={inputClass}
            style={inputStyle}
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
          <label className="block text-xs font-medium text-textSecondary" htmlFor="af-tags">
            Tags
          </label>
          <div className="mt-1">
            <TagInput
              id="af-tags"
              value={form.tags}
              onChange={(tags) => update('tags', tags)}
            />
          </div>
        </div>

        <div>
          <div className="block text-xs font-medium text-textSecondary">Tasks</div>
          <div className="mt-1 space-y-1.5">
            {form.tasks.length === 0 ? (
              <p className="text-xs text-textSecondary">No tasks yet.</p>
            ) : (
              form.tasks.map((t) => (
                <div key={t.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!t.done}
                    onChange={() => toggleTaskDone(t.id)}
                    className="h-4 w-4 flex-none rounded border-surfaceBorder bg-surface text-primary focus:ring-2 focus:ring-primary/20"
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
                    className="flex-1 rounded-[10px] border px-2 py-1 text-sm text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    onClick={() => removeTask(t.id)}
                    className="rounded-[10px] border px-2 py-1 text-xs text-textSecondary hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)' }}
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
                className="flex-1 rounded-[10px] border px-2 py-1 text-sm text-white placeholder-[#4A5568] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                style={inputStyle}
              />
              <button
                type="button"
                onClick={addTask}
                className="rounded-[10px] border border-primary/40 bg-primary/20 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-textSecondary" htmlFor="af-notes">
            Notes
          </label>
          <textarea
            id="af-notes"
            rows={3}
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
            className={inputClass}
            style={inputStyle}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-textSecondary" htmlFor="af-link">
            Link
          </label>
          <input
            id="af-link"
            type="url"
            value={form.link}
            onChange={(e) => update('link', e.target.value)}
            className={inputClass}
            style={inputStyle}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-textSecondary" htmlFor="af-twitter">
            <span className="inline-flex items-center gap-1.5">
              <span style={{fontFamily: 'serif', fontWeight: 'bold'}}>&#x1D54F;</span> Twitter/X
            </span>
          </label>
          <input
            id="af-twitter"
            type="url"
            value={form.twitterUrl}
            onChange={(e) => update('twitterUrl', e.target.value)}
            placeholder="https://x.com/..."
            className={inputClass}
            style={inputStyle}
          />
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border px-3 py-1.5 text-sm text-textSecondary transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            style={{ borderColor: 'rgba(255,255,255,0.12)', background: 'transparent' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-xl px-4 py-1.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-[0_4px_20px_rgba(247,147,26,0.3)] focus:outline-none focus:ring-2 focus:ring-primary/20"
            style={{ background: 'linear-gradient(135deg, #F7931A, #E8820A)' }}
          >
            {isEdit ? 'Save changes' : 'Add airdrop'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
