import React from 'react';
import { formatDate, daysUntil } from '../utils/date.js';

export default function DeadlineLabel({ iso, label = 'Deadline' }) {
  const days = daysUntil(iso);
  const formatted = formatDate(iso);

  let pill = null;
  if (days !== null) {
    let background;
    let border;
    let color;
    let text;
    if (days <= 3) {
      background = 'rgba(255,71,87,0.15)';
      border = '1px solid rgba(255,71,87,0.3)';
      color = '#FF4757';
      text = days < 0 ? 'Past' : `${days}d left`;
    } else if (days <= 7) {
      background = 'rgba(255,184,0,0.15)';
      border = '1px solid rgba(255,184,0,0.3)';
      color = '#FFB800';
      text = `${days}d left`;
    } else {
      background = 'rgba(255,255,255,0.08)';
      border = '1px solid rgba(255,255,255,0.12)';
      color = '#E2E8F0';
      text = `${days}d left`;
    }
    pill = (
      <span
        className="inline-flex items-center"
        style={{
          background,
          border,
          color,
          fontSize: '11px',
          padding: '2px 8px',
          borderRadius: '100px',
          fontWeight: 500,
          lineHeight: 1,
          whiteSpace: 'nowrap',
        }}
      >
        {text}
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-0.5 text-xs">
      <span className="uppercase tracking-wide text-textSecondary">{label}</span>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-white/90">{formatted}</span>
        {pill}
      </div>
    </div>
  );
}
