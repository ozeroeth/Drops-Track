import React from 'react';

const STATUS_STYLES = {
  Active: 'border-[#2e7d32] text-[#2e7d32] bg-[rgba(46,125,50,0.1)]',
  Whitelisted: 'border-[#2e7d32] text-[#2e7d32] bg-[rgba(46,125,50,0.1)]',
  Minted: 'border-[#1565c0] text-[#1565c0] bg-[rgba(21,101,192,0.1)]',
  Pending: 'border-[#f57c00] text-[#f57c00] bg-[rgba(245,124,0,0.1)]',
  Applied: 'border-[#f57c00] text-[#f57c00] bg-[rgba(245,124,0,0.1)]',
  Missed: 'border-[#c62828] text-[#c62828] bg-[rgba(198,40,40,0.1)]',
  'Not Selected': 'border-[#c62828] text-[#c62828] bg-[rgba(198,40,40,0.1)]',
  Claimed: 'border-[#1565c0] text-[#1565c0] bg-[rgba(21,101,192,0.1)]',
};

const FALLBACK_STYLE = 'border-[var(--text-muted)] text-[var(--text-muted)] bg-transparent';

export default function StatusBadge({ status }) {
  const label = status || 'Unknown';
  const style = STATUS_STYLES[status] || FALLBACK_STYLE;
  return (
    <span
      className={
        'inline-flex items-center rounded-full border-2 px-2 py-0.5 text-sm font-semibold ' +
        style
      }
    >
      {label}
    </span>
  );
}
