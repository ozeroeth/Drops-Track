import React, { useEffect, useState } from 'react';
import Modal from './Modal.jsx';
import { generateId } from '../utils/id.js';

const CHAIN_TYPES = ['EVM', 'Solana', 'Other'];

function emptyEntry() {
  return { id: '', label: '', address: '', chainType: 'EVM' };
}

function fromInitial(initial) {
  if (!initial) return emptyEntry();
  return {
    id: initial.id || '',
    label: initial.label || '',
    address: initial.address || '',
    chainType: initial.chainType || 'EVM',
  };
}

export default function WalletForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => fromInitial(initial));
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(fromInitial(initial));
    setErrors({});
  }, [initial]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const label = form.label.trim();
    const address = form.address.trim();
    const next = {};
    if (!label) next.label = 'Label is required';
    if (!address) next.address = 'Address is required';
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }
    setErrors({});
    const entry = {
      id: form.id || generateId(),
      label,
      address,
      chainType: form.chainType,
    };
    onSubmit(entry);
  }

  const isEdit = !!form.id && !!initial;

  return (
    <Modal open onClose={onCancel} title={isEdit ? 'Edit wallet' : 'Add wallet'} widthClass="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-300" htmlFor="wallet-label">
            Label <span className="text-red-400">*</span>
          </label>
          <input
            id="wallet-label"
            type="text"
            value={form.label}
            onChange={(e) => update('label', e.target.value)}
            className="mt-1 w-full rounded-md border border-surface2 bg-surface px-3 py-2 text-sm text-slate-100 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
            autoFocus
          />
          {errors.label ? (
            <p className="mt-1 text-xs text-red-400">{errors.label}</p>
          ) : null}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300" htmlFor="wallet-address">
            Address <span className="text-red-400">*</span>
          </label>
          <input
            id="wallet-address"
            type="text"
            value={form.address}
            onChange={(e) => update('address', e.target.value)}
            className="mt-1 w-full rounded-md border border-surface2 bg-surface px-3 py-2 font-mono text-xs text-slate-100 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
          />
          {errors.address ? (
            <p className="mt-1 text-xs text-red-400">{errors.address}</p>
          ) : null}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300" htmlFor="wallet-chain">
            Chain type
          </label>
          <select
            id="wallet-chain"
            value={form.chainType}
            onChange={(e) => update('chainType', e.target.value)}
            className="mt-1 w-full rounded-md border border-surface2 bg-surface px-3 py-2 text-sm text-slate-100 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
          >
            {CHAIN_TYPES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
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
            {isEdit ? 'Save changes' : 'Add wallet'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
