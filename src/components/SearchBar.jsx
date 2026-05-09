import React from 'react';

export default function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <input
      type="search"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-md border border-surface2 bg-surface px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/40 sm:w-64"
    />
  );
}
