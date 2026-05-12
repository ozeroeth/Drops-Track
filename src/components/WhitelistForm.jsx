import React, { useEffect, useState } from 'react';
import Modal from './Modal.jsx';
import { WHITELIST_STATUSES, WHITELIST_TYPES } from '../constants/index.js';
import { generateId } from '../utils/id.js';

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
    const now = new Date().toISOString().slice(0, 10);
    const entry = {
      id: form.id || generateId(),
      name,
      type: form.type,
      status: form.status,
      applicationDeadline: form.applicationDeadline || '',
      mintDate: form.mintDate || '',
      walletId: form.walletId || '',
      mintPrice: form.mintPrice.trim(),
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
          <label className="block text-xs font-medium" style={{ color: 'var(--text-muted)' }} htmlFor="wf-name">
            Name <span style={{ color: '#c62828' }}>*</span>
          </label>
          <input
            id="wf-name"
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
            <label className="block text-xs font-medium" style={{ color: 'var(--text-muted)' }} htmlFor="wf-type">
              Type
            </label>
            <select
              id="wf-type"
              value={form.type}
              onChange={(e) => update('type', e.target.value)}
              className="sketchy-input mt-1 w-full px-3 py-2 text-sm"
            >
              {WHITELIST_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium" style={{ color: 'var(--text-muted)' }} htmlFor="wf-status">
              Status
            </label>
            <select
              id="wf-status"
              value={form.status}
              onChange={(e) => update('status', e.target.value)}
              className="sketchy-input mt-1 w-full px-3 py-2 text-sm"
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
            <label className="block text-xs font-medium" style={{ color: 'var(--text-muted)' }} htmlFor="wf-apply">
              Application deadline
            </label>
            <input
              id="wf-apply"
              type="date"
              value={form.applicationDeadline}
              onChange={(e) => update('applicationDeadline', e.target.value)}
              className="sketchy-input mt-1 w-full px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium" style={{ color: 'var(--text-muted)' }} htmlFor="wf-mint">
              Mint date
            </label>
            <input
              id="wf-mint"
              type="date"
              value={form.mintDate}
              onChange={(e) => update('mintDate', e.target.value)}
              className="sketchy-input mt-1 w-full px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium" style={{ color: 'var(--text-muted)' }} htmlFor="wf-wallet">
              Wallet
            </label>
            <select
              id="wf-wallet"
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
            <label className="block text-xs font-medium" style={{ color: 'var(--text-muted)' }} htmlFor="wf-price">
              Mint price
            </label>
            <input
              id="wf-price"
              type="text"
              value={form.mintPrice}
              onChange={(e) => update('mintPrice', e.target.value)}
              placeholder="e.g. 0.08 ETH"
              className="sketchy-input mt-1 w-full px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium" style={{ color: 'var(--text-muted)' }} htmlFor="wf-notes">
            Notes
          </label>
          <textarea
            id="wf-notes"
            rows={3}
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
            className="sketchy-input mt-1 w-full px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium" style={{ color: 'var(--text-muted)' }} htmlFor="wf-link">
            Link
          </label>
          <input
            id="wf-link"
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
            {isEdit ? 'Save changes' : 'Add whitelist'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
