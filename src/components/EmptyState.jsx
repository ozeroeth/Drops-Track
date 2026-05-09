import React from 'react';

export default function EmptyState({ title, hint, action, emoji }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-surfaceBorder/50 bg-surface/40 px-8 py-12 text-center">
      {emoji ? <span className="mb-3 text-5xl">{emoji}</span> : null}
      <p className="text-base font-semibold text-white">{title}</p>
      {hint ? <p className="text-sm text-textSecondary">{hint}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
