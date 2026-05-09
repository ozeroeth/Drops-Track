import React, { useEffect, useState } from 'react';
import Modal from './Modal.jsx';
import TagInput from './TagInput.jsx';
import { WHITELIST_STATUSES, WHITELIST_TYPES } from '../constants/index.js';
import { generateId } from '../utils/id.js';
import { todayIsoLocal } from '../utils/date.js';

function emptyEntry() {
  return {
    id: '',
    name: '',
    type: WHITELIST_TYPES[0] || 'NFT mint',
    status: 'Applied',
    applicationDeadline: '',
    mintDate: '',
    walletId: '',
    mintPrice: '',
    tags: [],
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
    type: initial.type || WHITELIST_TYPES[0] || 'NFT mint',
    status: initial.status || 'Applied',
    applicationDeadline: initial.applicationDeadline || '',
    mintDate: initial.mintDate || '',
    walletId: initial.walletId || '',
    mintPrice: initial.mintPrice || '',
    tags: Array.isArray(initial.tags)
      ? initial.tags.filter((t) => typeof t === 'string' && t.trim() !== '')
      : [],
    notes: initial.notes || '',
    link: initial.link || '',
    createdAt: initial.createdAt || '',
  };
}

export default function WhitelistForm({ initial, wallets, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => fromInitial(initial));
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(fromInitial(initial));
    setError('');
  }, [initial]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) {
      setError('Name is required');
      return;
    }
    setError('');
    const now = todayIsoLocal();
    const entry = {
      id: form.id || generateId(),
      name,
      type: form.type,
      status: form.status,
      applicationDeadline: form.applicationDeadline || '',
      mintDate: form.mintDate || '',
      walletId: form.walletId || '',
      mintPrice: form.mintPrice.trim(),
      tags: Array.isArray(form.tags) ? form.tags.slice() : [],
      notes: form.notes,
      link: form.link.trim(),
      createdAt: form.createdAt || now,
    };
    onSubmit(entry);
  }

  const isEdit = !!form.id && !!initial;

  return (
    <Modal open onClose={onCancel} title={isEdit ? 'Edit whitelist' : 'Add whitelist'}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-300" htmlFor="wf-name">
            Name <span className="text-red-400">*</span>
          </label>
          <input
            id="wf-name"
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
            <label className="block text-xs font-medium text-slate-300" htmlFor="wf-type">
              Type
            </label>
            <select
              id="wf-type"
              value={form.type}
              onChange={(e) => update('type', e.target.value)}
              className="mt-1 w-full rounded-md border border-surface2 bg-surface px-3 py-2 text-sm text-slate-100 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
            >
              {WHITELIST_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300" htmlFor="wf-status">
              Status
            </label>
            <select
              id="wf-status"
              value={form.status}
              onChange={(e) => update('status', e.target.value)}
              className="mt-1 w-full rounded-md border border-surface2 bg-surface px-3 py-2 text-sm text-slate-100 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
            >
              {WHITELIST_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-slate-300" htmlFor="wf-apply">
              Application deadline
            </label>
            <input
              id="wf-apply"
              type="date"
              value={form.applicationDeadline}
              onChange={(e) => update('applicationDeadline', e.target.value)}
              className="mt-1 w-full rounded-md border border-surface2 bg-surface px-3 py-2 text-sm text-slate-100 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300" htmlFor="wf-mint">
              Mint date
            </label>
            <input
              id="wf-mint"
              type="date"
              value={form.mintDate}
              onChange={(e) => update('mintDate', e.target.value)}
              className="mt-1 w-full rounded-md border border-surface2 bg-surface px-3 py-2 text-sm text-slate-100 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-slate-300" htmlFor="wf-wallet">
              Wallet
            </label>
            <select
              id="wf-wallet"
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
            <label className="block text-xs font-medium text-slate-300" htmlFor="wf-price">
              Mint price
            </label>
            <input
              id="wf-price"
              type="text"
              value={form.mintPrice}
              onChange={(e) => update('mintPrice', e.target.value)}
              placeholder="e.g. 0.08 ETH"
              className="mt-1 w-full rounded-md border border-surface2 bg-surface px-3 py-2 text-sm text-slate-100 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300" htmlFor="wf-tags">
            Tags
          </label>
          <div className="mt-1">
            <TagInput
              id="wf-tags"
              value={form.tags}
              onChange={(tags) => update('tags', tags)}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300" htmlFor="wf-notes">
            Notes
          </label>
          <textarea
            id="wf-notes"
            rows={3}
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
            className="mt-1 w-full rounded-md border border-surface2 bg-surface px-3 py-2 text-sm text-slate-100 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300" htmlFor="wf-link">
            Link
          </label>
          <input
            id="wf-link"
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
            {isEdit ? 'Save changes' : 'Add whitelist'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
