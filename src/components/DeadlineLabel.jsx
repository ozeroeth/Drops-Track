import React from 'react';
import { formatDate, daysUntil, isExpiringSoon, isPast } from '../utils/date.js';

export default function DeadlineLabel({ iso, label = 'Deadline' }) {
  const days = daysUntil(iso);
  const formatted = formatDate(iso);

  let urgencyClass = 'text-[var(--text-muted)] border-[var(--text-muted)] bg-transparent';
  let urgencyText = '\u2014';

  if (days === null) {
    urgencyText = '\u2014';
  } else if (isPast(iso)) {
    urgencyClass = 'text-[#c62828] border-[#c62828] bg-[rgba(198,40,40,0.1)]';
    urgencyText = 'Past';
  } else if (isExpiringSoon(iso)) {
    urgencyClass = 'text-[#f57c00] border-[#f57c00] bg-[rgba(245,124,0,0.1)]';
    urgencyText = `${days}d left`;
  } else {
    urgencyClass = 'text-[var(--text-muted)] border-[var(--text-muted)] bg-transparent';
    urgencyText = `${days}d left`;
  }

  return (
    <div className="flex flex-col gap-0.5 text-xs">
      <span className="uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm" style={{ color: 'var(--text)' }}>{formatted}</span>
        <span
          className={
            'inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ' +
            urgencyClass
          }
        >
          {urgencyText}
        </span>
      </div>
    </div>
  );
}
