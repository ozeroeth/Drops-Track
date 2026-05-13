import React from 'react';

export default function EmptyState({ title, hint, action }) {
  return (
    <div
      className="sketchy-card flex flex-col items-center justify-center gap-2 px-6 py-10 text-center"
      style={{ borderStyle: 'dashed' }}
    >
      <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{title}</p>
      {hint ? <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{hint}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
