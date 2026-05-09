import React, { useEffect, useMemo, useState } from 'react';
import { NETWORKS } from '../constants/index.js';
import {
  addCustomNetwork,
  isCustomNetwork,
  loadCustomNetworks,
} from '../utils/networks.js';

const CUSTOM_SENTINEL = '__custom__';

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

  return (
    <div className="space-y-2">
      <select
        id={id}
        value={selectValue || ''}
        onChange={handleSelectChange}
        className="mt-1 w-full rounded-md border border-surface2 bg-surface px-3 py-2 text-sm text-slate-100 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
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
            className="flex-1 rounded-md border border-surface2 bg-surface px-3 py-2 text-sm text-slate-100 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
          />
          <button
            type="button"
            onClick={commitDraft}
            className="rounded-md border border-accent-500/40 bg-accent-500/20 px-2 py-1 text-xs font-medium text-accent-200 hover:bg-accent-500/30 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => {
              setShowDraft(false);
              setDraft('');
            }}
            className="rounded-md border border-surface2 bg-surface2 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
          >
            Cancel
          </button>
        </div>
      ) : null}
    </div>
  );
}
