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
    twitterUrl: '',
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
      twitterUrl: form.twitterUrl.trim(),
      createdAt: form.createdAt || now,
    };
    onSubmit(entry);
  }

  const isEdit = !!form.id && !!initial;

  return (
    <Modal open onClose={onCancel} title={isEdit ? 'Edit whitelist' : 'Add whitelist'}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-textSecondary" htmlFor="wf-name">
            Name <span className="text-danger">*</span>
          </label>
          <input
            id="wf-name"
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
            <label className="block text-xs font-medium text-textSecondary" htmlFor="wf-type">
              Type
            </label>
            <select
              id="wf-type"
              value={form.type}
              onChange={(e) => update('type', e.target.value)}
              className={inputClass}
              style={inputStyle}
            >
              {WHITELIST_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-textSecondary" htmlFor="wf-status">
              Status
            </label>
            <select
              id="wf-status"
              value={form.status}
              onChange={(e) => update('status', e.target.value)}
              className={inputClass}
              style={inputStyle}
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
            <label className="block text-xs font-medium text-textSecondary" htmlFor="wf-apply">
              Application deadline
            </label>
            <input
              id="wf-apply"
              type="date"
              value={form.applicationDeadline}
              onChange={(e) => update('applicationDeadline', e.target.value)}
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-textSecondary" htmlFor="wf-mint">
              Mint date
            </label>
            <input
              id="wf-mint"
              type="date"
              value={form.mintDate}
              onChange={(e) => update('mintDate', e.target.value)}
              className={inputClass}
              style={inputStyle}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-textSecondary" htmlFor="wf-wallet">
              Wallet
            </label>
            <select
              id="wf-wallet"
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
            <label className="block text-xs font-medium text-textSecondary" htmlFor="wf-price">
              Mint price
            </label>
            <input
              id="wf-price"
              type="text"
              value={form.mintPrice}
              onChange={(e) => update('mintPrice', e.target.value)}
              placeholder="e.g. 0.08 ETH"
              className={inputClass}
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-textSecondary" htmlFor="wf-tags">
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
          <label className="block text-xs font-medium text-textSecondary" htmlFor="wf-notes">
            Notes
          </label>
          <textarea
            id="wf-notes"
            rows={3}
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
            className={inputClass}
            style={inputStyle}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-textSecondary" htmlFor="wf-link">
            Link
          </label>
          <input
            id="wf-link"
            type="url"
            value={form.link}
            onChange={(e) => update('link', e.target.value)}
            className={inputClass}
            style={inputStyle}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-textSecondary" htmlFor="wf-twitter">
            <span className="inline-flex items-center gap-1.5">
              <span style={{fontFamily: 'serif', fontWeight: 'bold'}}>&#x1D54F;</span> Twitter/X
            </span>
          </label>
          <input
            id="wf-twitter"
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
            {isEdit ? 'Save changes' : 'Add whitelist'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
