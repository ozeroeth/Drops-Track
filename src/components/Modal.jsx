import React, { useEffect } from 'react';

export default function Modal({ open, onClose, title, children, widthClass = 'max-w-lg' }) {
  useEffect(() => {
    if (!open) return undefined;
    function handleKey(e) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        if (typeof onClose === 'function') onClose();
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 px-4 py-8 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Dialog'}
      onClick={(e) => {
        if (e.target === e.currentTarget && typeof onClose === 'function') {
          onClose();
        }
      }}
    >
      <div
        className={
          'w-full ' +
          widthClass +
          ' sketchy-card'
        }
      >
        {title ? (
          <div className="flex items-center justify-between gap-3 px-5 py-3" style={{ borderBottom: '2.5px solid var(--border)' }}>
            <h2 className="font-sketch text-lg font-semibold" style={{ color: 'var(--text)' }}>{title}</h2>
            <button
              type="button"
              onClick={() => {
                if (typeof onClose === 'function') onClose();
              }}
              aria-label="Close dialog"
              className="flex h-7 w-7 flex-none items-center justify-center rounded-md"
              style={{ color: 'var(--text-muted)' }}
            >
              <span aria-hidden="true" className="text-lg leading-none">&times;</span>
            </button>
          </div>
        ) : null}
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
