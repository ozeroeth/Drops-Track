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
          <label className="block text-xs font-bold" style={{ color: 'var(--text)' }} htmlFor="wallet-label">
            Label <span style={{ color: 'var(--accent)' }}>*</span>
          </label>
          <input
            id="wallet-label"
            type="text"
            value={form.label}
            onChange={(e) => update('label', e.target.value)}
            className="sketch-input mt-1 w-full px-3 py-2 text-sm"
            autoFocus
          />
          {errors.label ? (
            <p className="mt-1 text-xs" style={{ color: 'var(--accent)' }}>{errors.label}</p>
          ) : null}
        </div>

        <div>
          <label className="block text-xs font-bold" style={{ color: 'var(--text)' }} htmlFor="wallet-address">
            Address <span style={{ color: 'var(--accent)' }}>*</span>
          </label>
          <input
            id="wallet-address"
            type="text"
            value={form.address}
            onChange={(e) => update('address', e.target.value)}
            className="sketch-input mt-1 w-full px-3 py-2 font-mono text-xs"
          />
          {errors.address ? (
            <p className="mt-1 text-xs" style={{ color: 'var(--accent)' }}>{errors.address}</p>
          ) : null}
        </div>

        <div>
          <label className="block text-xs font-bold" style={{ color: 'var(--text)' }} htmlFor="wallet-chain">
            Chain type
          </label>
          <select
            id="wallet-chain"
            value={form.chainType}
            onChange={(e) => update('chainType', e.target.value)}
            className="sketch-select mt-1 w-full px-3 py-2 text-sm"
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
            className="sketch-btn sketch-btn-ghost px-3 py-1.5 text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="sketch-btn sketch-btn-accent px-3 py-1.5 text-sm"
          >
            {isEdit ? 'Save changes' : 'Add wallet'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
