import React from 'react';

export default function EmptyState({ title, hint, action, emoji }) {
  return (
    <div className="sketchy-card flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-8 py-12 text-center" style={{borderColor:'var(--border)', background:'var(--surface)'}}>
      {emoji ? <span className="mb-3 text-5xl">{emoji}</span> : null}
      <p className="text-base font-semibold" style={{color:'var(--text)'}}>{title}</p>
      {hint ? <p className="text-sm" style={{color:'var(--text-muted)'}}>{hint}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
