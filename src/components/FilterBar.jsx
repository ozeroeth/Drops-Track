import React from 'react';

function Select({ value, onChange, options, label }) {
  return (
    <label className="flex items-center gap-2 text-xs text-slate-400">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="rounded-md border border-surface2 bg-surface px-2 py-1.5 text-sm text-slate-100 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function isDefault(filters, defaults) {
  return Object.keys(defaults).every((k) => filters[k] === defaults[k]);
}

export default function FilterBar({ filters, setFilters, options, defaults }) {
  const effectiveDefaults = defaults || {};
  const atDefault = isDefault(filters, effectiveDefaults);

  function update(key, value) {
    setFilters({ ...filters, [key]: value });
  }

  function clearAll() {
    setFilters({ ...effectiveDefaults });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {options.status ? (
        <Select
          label="Status"
          value={filters.status}
          onChange={(v) => update('status', v)}
          options={options.status}
        />
      ) : null}
      {options.network ? (
        <Select
          label="Network"
          value={filters.network}
          onChange={(v) => update('network', v)}
          options={options.network}
        />
      ) : null}
      {options.type ? (
        <Select
          label="Type"
          value={filters.type}
          onChange={(v) => update('type', v)}
          options={options.type}
        />
      ) : null}
      {options.sortBy ? (
        <Select
          label="Sort by"
          value={filters.sortBy}
          onChange={(v) => update('sortBy', v)}
          options={options.sortBy}
        />
      ) : null}
      {!atDefault ? (
        <button
          type="button"
          onClick={clearAll}
          className="rounded-md border border-surface2 bg-surface px-2 py-1.5 text-xs text-slate-300 hover:bg-surface2 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
        >
          Clear filters
        </button>
      ) : null}
    </div>
  );
}
