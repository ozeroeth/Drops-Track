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
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-4 py-8 sm:items-center"
      style={{ background: 'rgba(0,0,0,0.8)' }}
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
          ' rounded-2xl shadow-2xl'
        }
        style={{
          background: 'rgba(13,17,23,0.95)',
          border: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        {title ? (
          <div
            className="flex items-center justify-between gap-3 px-6 py-4"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <h2 className="text-base font-semibold text-white">{title}</h2>
            <button
              type="button"
              onClick={() => {
                if (typeof onClose === 'function') onClose();
              }}
              aria-label="Close dialog"
              className="flex h-7 w-7 flex-none items-center justify-center rounded-lg text-textSecondary transition-colors hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <span aria-hidden="true" className="text-lg leading-none">&times;</span>
            </button>
          </div>
        ) : null}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
