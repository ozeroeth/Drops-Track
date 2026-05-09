import React from 'react';

const selectStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
};

function Select({ value, onChange, options, label }) {
  return (
    <label className="flex items-center gap-2 text-xs text-textSecondary">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="rounded-[10px] px-2 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
        style={selectStyle}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#F7931A';
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(247,147,26,0.1)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
          e.currentTarget.style.boxShadow = 'none';
        }}
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
      {options.tag ? (
        <Select
          label="Tag"
          value={filters.tag}
          onChange={(v) => update('tag', v)}
          options={options.tag}
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
          className="rounded-[10px] border border-[rgba(255,255,255,0.12)] bg-transparent px-2 py-1.5 text-xs text-textSecondary transition-colors hover:border-[rgba(255,255,255,0.3)] hover:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          Clear filters
        </button>
      ) : null}
    </div>
  );
}
