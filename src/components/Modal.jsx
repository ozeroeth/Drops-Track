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
          ' rounded-lg border border-surface2 bg-surface shadow-xl'
        }
      >
        {title ? (
          <div className="border-b border-surface2 px-5 py-3">
            <h2 className="text-base font-semibold text-slate-100">{title}</h2>
          </div>
        ) : null}
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
