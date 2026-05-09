import React, { useEffect, useState } from 'react';

const DEFAULT_DURATION_MS = 2000;

export default function Toast({ message, nonce, duration = DEFAULT_DURATION_MS }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) {
      setVisible(false);
      return undefined;
    }
    setVisible(true);
    const t = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(t);
  // nonce lets the parent reshow the same message by bumping a counter
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message, nonce, duration]);

  if (!visible || !message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
    >
      <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-accent-500/40 bg-surface/95 px-4 py-2 text-sm text-slate-100 shadow-lg backdrop-blur">
        {message}
      </div>
    </div>
  );
}
