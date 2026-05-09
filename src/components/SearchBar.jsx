import React from 'react';

export default function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <input
      type="search"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-[10px] px-3 py-2 text-sm text-white placeholder-[#4A5568] focus:outline-none sm:w-64"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = '#F7931A';
        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(247,147,26,0.1)';
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    />
  );
}
