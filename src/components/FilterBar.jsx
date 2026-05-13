import React from 'react';

const selectStyle = {};

function Select({ value, onChange, options, label }) {
  return (
    <label className="flex items-center gap-2 text-xs" style={{color:'var(--text-muted)'}}>
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="sketchy-input rounded-[10px] px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        style={selectStyle}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#F7931A';
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(247,147,26,0.1)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = '';
          e.currentTarget.style.boxShadow = '';
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
          className="sketchy-btn-ghost rounded-[10px] px-2 py-1.5 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40"
          style={{color:'var(--text-muted)'}}
        >
          Clear filters
        </button>
      ) : null}
    </div>
  );
}
