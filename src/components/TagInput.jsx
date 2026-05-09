import React, { useState } from 'react';
import { SUGGESTED_TAGS } from '../constants/index.js';

const MAX_TAG_LENGTH = 32;

function normalizeTag(raw) {
  if (typeof raw !== 'string') return '';
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) return '';
  return trimmed.slice(0, MAX_TAG_LENGTH);
}

function hasTag(list, tag) {
  const lower = tag.toLowerCase();
  return list.some((t) => String(t).toLowerCase() === lower);
}

export default function TagInput({
  id,
  value,
  onChange,
  suggestions = SUGGESTED_TAGS,
}) {
  const [draft, setDraft] = useState('');
  const tags = Array.isArray(value) ? value : [];

  function commit(raw) {
    const tag = normalizeTag(raw);
    if (!tag) return;
    if (hasTag(tags, tag)) {
      setDraft('');
      return;
    }
    onChange([...tags, tag]);
    setDraft('');
  }

  function removeAt(index) {
    const next = tags.slice();
    next.splice(index, 1);
    onChange(next);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit(draft);
      return;
    }
    if (e.key === 'Backspace' && draft === '' && tags.length > 0) {
      e.preventDefault();
      removeAt(tags.length - 1);
    }
  }

  const availableSuggestions = suggestions.filter((s) => !hasTag(tags, s));

  return (
    <div className="space-y-2">
      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag, i) => (
            <span
              key={`${tag}-${i}`}
              className="inline-flex items-center gap-1 rounded-full border border-accent-500/30 bg-accent-500/10 px-2 py-0.5 text-xs text-accent-200"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label={`Remove ${tag}`}
                className="rounded-full px-1 text-accent-200/80 hover:bg-accent-500/20 hover:text-accent-100 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </span>
          ))}
        </div>
      ) : null}
      <input
        id={id}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          if (draft.trim()) commit(draft);
        }}
        placeholder="Add a tag and press Enter"
        maxLength={MAX_TAG_LENGTH}
        className="w-full rounded-md border border-surface2 bg-surface px-3 py-2 text-sm text-slate-100 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
      />
      {availableSuggestions.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {availableSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => commit(s)}
              className="inline-flex items-center rounded-full border border-surface2 bg-surface2 px-2 py-0.5 text-xs text-slate-300 hover:border-accent-500/40 hover:bg-accent-500/10 hover:text-accent-200 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
            >
              + {s}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
