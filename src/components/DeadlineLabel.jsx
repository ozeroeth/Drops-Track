import React from 'react';
import { formatDate, daysUntil, isExpiringSoon, isPast } from '../utils/date.js';

export default function DeadlineLabel({ iso, label = 'Deadline' }) {
  const days = daysUntil(iso);
  const formatted = formatDate(iso);

  let urgencyClass = 'sketch-urgency-default';
  let urgencyText = '\u2014';

  if (days === null) {
    urgencyText = '\u2014';
  } else if (isPast(iso)) {
    urgencyClass = 'sketch-urgency-red';
    urgencyText = 'Past';
  } else if (isExpiringSoon(iso)) {
    urgencyClass = 'sketch-urgency-orange';
    urgencyText = `${days}d left`;
  } else {
    urgencyClass = 'sketch-urgency-default';
    urgencyText = `${days}d left`;
  }

  return (
    <div className="flex flex-col gap-0.5 text-xs">
      <span className="uppercase tracking-wide font-bold" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-body" style={{ color: 'var(--text)' }}>{formatted}</span>
        <span className={'sketch-urgency ' + urgencyClass}>
          {urgencyText}
        </span>
      </div>
    </div>
  );
}
