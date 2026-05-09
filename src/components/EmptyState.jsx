import React from 'react';

export default function EmptyState({ title, hint, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-surface2 bg-surface/40 px-6 py-10 text-center">
      <p className="text-sm font-semibold text-slate-200">{title}</p>
      {hint ? <p className="text-xs text-slate-400">{hint}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
