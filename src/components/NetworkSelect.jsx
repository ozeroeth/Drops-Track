import React, { useEffect, useMemo, useState } from 'react';
import { NETWORKS } from '../constants/index.js';
import {
  addCustomNetwork,
  isCustomNetwork,
  loadCustomNetworks,
} from '../utils/networks.js';

const CUSTOM_SENTINEL = '__custom__';

const inputStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
};

export default function NetworkSelect({ id, value, onChange }) {
  const [customList, setCustomList] = useState(() => loadCustomNetworks());
  const [draft, setDraft] = useState('');
  const [showDraft, setShowDraft] = useState(false);

  // If the stored value is custom but not yet in the list, register it so the
  // dropdown reflects it.
  useEffect(() => {
    if (!value) return;
    if (!isCustomNetwork(value)) return;
    const lower = value.toLowerCase();
    const alreadyCustom = customList.some((l) => l.toLowerCase() === lower);
    if (alreadyCustom) return;
    addCustomNetwork(value);
    setCustomList(loadCustomNetworks());
  }, [value, customList]);

  const customSet = useMemo(() => {
    const s = new Set();
    for (const l of customList) s.add(l.toLowerCase());
    return s;
  }, [customList]);

  function handleSelectChange(e) {
    const next = e.target.value;
    if (next === CUSTOM_SENTINEL) {
      setShowDraft(true);
      setDraft('');
      return;
    }
    setShowDraft(false);
    onChange(next);
  }

  function commitDraft() {
    const label = draft.trim();
    if (!label) {
      setShowDraft(false);
      return;
    }
    const stored = addCustomNetwork(label);
    setCustomList(loadCustomNetworks());
    setDraft('');
    setShowDraft(false);
    if (stored) onChange(stored);
  }

  function handleDraftKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitDraft();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowDraft(false);
      setDraft('');
    }
  }

  // Work out what value the <select> should show. If the current value is a
  // custom label, we match it by label (case-insensitive).
  let selectValue = value;
  if (value && isCustomNetwork(value)) {
    const match = customList.find(
      (l) => l.toLowerCase() === String(value).toLowerCase(),
    );
    selectValue = match || value;
  }

  // Make sure select has an option for the current value even when the saved
  // custom list is stale (e.g. hydrated from localStorage in another tab).
  const extraCustom =
    value && isCustomNetwork(value) && !customSet.has(String(value).toLowerCase())
      ? value
      : null;

  function handleFocus(e) {
    e.currentTarget.style.borderColor = '#F7931A';
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(247,147,26,0.1)';
  }

  function handleBlur(e) {
    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
    e.currentTarget.style.boxShadow = 'none';
  }

  return (
    <div className="space-y-2">
      <select
        id={id}
        value={selectValue || ''}
        onChange={handleSelectChange}
        className="mt-1 w-full rounded-[10px] px-3 py-2 text-sm text-white focus:outline-none"
        style={inputStyle}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        {NETWORKS.map((n) => (
          <option key={n.id} value={n.id}>
            {n.label}
          </option>
        ))}
        {customList.map((label) => (
          <option key={`custom-${label}`} value={label}>
            {`${label} \u270F\uFE0F`}
          </option>
        ))}
        {extraCustom ? (
          <option key={`extra-${extraCustom}`} value={extraCustom}>
            {`${extraCustom} \u270F\uFE0F`}
          </option>
        ) : null}
        <option value={CUSTOM_SENTINEL}>Custom...</option>
      </select>
      {showDraft ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleDraftKeyDown}
            placeholder="e.g. Berachain"
            autoFocus
            className="flex-1 rounded-[10px] px-3 py-2 text-sm text-white placeholder-[#4A5568] focus:outline-none"
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          <button
            type="button"
            onClick={commitDraft}
            className="rounded-[10px] px-2 py-1 text-xs font-medium text-white transition-colors hover:shadow-[0_0_10px_rgba(247,147,26,0.2)] focus:outline-none focus:ring-2 focus:ring-primary/40"
            style={{
              background: 'linear-gradient(135deg, #F7931A, #E8820A)',
            }}
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => {
              setShowDraft(false);
              setDraft('');
            }}
            className="rounded-[10px] border border-[rgba(255,255,255,0.12)] bg-transparent px-2 py-1 text-xs text-textSecondary transition-colors hover:border-[rgba(255,255,255,0.3)] hover:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            Cancel
          </button>
        </div>
      ) : null}
    </div>
  );
}
