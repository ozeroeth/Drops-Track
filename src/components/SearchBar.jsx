import React from 'react';

export default function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <input
      type="search"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="sketchy-input w-full text-sm sm:w-64"
      style={{}}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = '#F7931A';
        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(247,147,26,0.1)';
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = '';
        e.currentTarget.style.boxShadow = '';
      }}
    />
  );
}
