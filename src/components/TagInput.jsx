import React, { useState } from 'react';
import { SUGGESTED_TAGS } from '../constants/index.js';
import TagChip from './TagChip.jsx';

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
            <span key={`${tag}-${i}`} className="inline-flex items-center gap-1">
              <TagChip>{tag}</TagChip>
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label={`Remove ${tag}`}
                className="rounded-full px-1 text-[11px] leading-none transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
                style={{ color: '#A78BFA' }}
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
        className="w-full rounded-[10px] px-3 py-2 text-sm text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/40"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      />
      {availableSuggestions.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {availableSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => commit(s)}
              className="inline-flex items-center rounded-full border border-surfaceBorder px-2 py-0.5 text-xs text-textSecondary transition-colors hover:border-primary/40 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
            >
              + {s}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
