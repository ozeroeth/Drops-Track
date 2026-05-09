import React from 'react';

const STATUS_STYLES = {
  Active:
    'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
  Whitelisted:
    'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
  Minted:
    'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
  Pending:
    'bg-yellow-500/15 text-yellow-300 border border-yellow-500/30',
  Applied:
    'bg-yellow-500/15 text-yellow-300 border border-yellow-500/30',
  Missed: 'bg-red-500/15 text-red-300 border border-red-500/30',
  'Not Selected':
    'bg-red-500/15 text-red-300 border border-red-500/30',
  Claimed: 'bg-blue-500/15 text-blue-300 border border-blue-500/30',
};

const FALLBACK_STYLE =
  'bg-slate-500/15 text-slate-300 border border-slate-500/30';

export default function StatusBadge({ status }) {
  const label = status || 'Unknown';
  const style = STATUS_STYLES[status] || FALLBACK_STYLE;
  return (
    <span
      className={
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ' +
        style
      }
    >
      {label}
    </span>
  );
}
