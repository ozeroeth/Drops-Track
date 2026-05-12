import React from 'react';

export default function EmptyState({ title, hint, action }) {
  return (
    <div className="sketch-empty flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
      <p className="font-sketch text-xl font-bold" style={{ color: 'var(--text)' }}>{title}</p>
      {hint ? <p className="text-xs font-body" style={{ color: 'var(--text-muted)' }}>{hint}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
