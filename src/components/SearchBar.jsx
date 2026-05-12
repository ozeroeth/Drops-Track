import React from 'react';

export default function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <input
      type="search"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="sketch-input w-full px-3 py-2 text-sm sm:w-64"
    />
  );
}
