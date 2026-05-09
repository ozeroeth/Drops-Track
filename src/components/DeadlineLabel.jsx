import React from 'react';
import { formatDate, daysUntil, isExpiringSoon, isPast } from '../utils/date.js';

export default function DeadlineLabel({ iso, label = 'Deadline' }) {
  const days = daysUntil(iso);
  const formatted = formatDate(iso);

  let urgencyClass = 'text-slate-300 border-slate-500/30 bg-slate-500/10';
  let urgencyText = '\u2014';

  if (days === null) {
    urgencyText = '\u2014';
  } else if (isPast(iso)) {
    urgencyClass = 'text-red-300 border-red-500/30 bg-red-500/10';
    urgencyText = 'Past';
  } else if (isExpiringSoon(iso)) {
    urgencyClass = 'text-orange-300 border-orange-500/30 bg-orange-500/10';
    urgencyText = `${days}d left`;
  } else {
    urgencyClass = 'text-slate-300 border-slate-500/30 bg-slate-500/10';
    urgencyText = `${days}d left`;
  }

  return (
    <div className="flex flex-col gap-0.5 text-xs">
      <span className="uppercase tracking-wide text-slate-500">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-200">{formatted}</span>
        <span
          className={
            'inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium ' +
            urgencyClass
          }
        >
          {urgencyText}
        </span>
      </div>
    </div>
  );
}
