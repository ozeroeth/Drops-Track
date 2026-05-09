import React from 'react';
import { formatDate, daysUntil, isExpiringSoon, isPast } from '../utils/date.js';

export default function DeadlineLabel({ iso, label = 'Deadline' }) {
  const days = daysUntil(iso);
  const formatted = formatDate(iso);

  let urgencyStyle = { bg: 'rgba(136,146,164,0.1)', border: 'rgba(136,146,164,0.3)', color: '#8892A4' };
  let urgencyText = '\u2014';

  if (days === null) {
    urgencyText = '\u2014';
  } else if (isPast(iso)) {
    urgencyStyle = { bg: 'rgba(255,71,87,0.1)', border: 'rgba(255,71,87,0.3)', color: '#FF4757' };
    urgencyText = 'Past';
  } else if (isExpiringSoon(iso)) {
    urgencyStyle = { bg: 'rgba(255,184,0,0.1)', border: 'rgba(255,184,0,0.3)', color: '#FFB800' };
    urgencyText = `${days}d left`;
  } else {
    urgencyText = `${days}d left`;
  }

  return (
    <div className="flex flex-col gap-0.5 text-xs">
      <span className="uppercase tracking-wide text-textSecondary">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm text-white/90">{formatted}</span>
        <span
          className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium"
          style={{
            background: urgencyStyle.bg,
            border: `1px solid ${urgencyStyle.border}`,
            color: urgencyStyle.color,
          }}
        >
          {urgencyText}
        </span>
      </div>
    </div>
  );
}
