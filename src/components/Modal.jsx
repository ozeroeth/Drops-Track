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
      className="sketch-modal-overlay fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-4 py-8 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Dialog'}
      onClick={(e) => {
        if (e.target === e.currentTarget && typeof onClose === 'function') {
          onClose();
        }
      }}
    >
      <div className={'w-full ' + widthClass + ' sketch-modal'}>
        {title ? (
          <div className="flex items-center justify-between gap-3 px-5 py-3" style={{ borderBottom: '2.5px solid var(--border)' }}>
            <h2 className="font-sketch text-2xl font-bold" style={{ color: 'var(--text)' }}>{title}</h2>
            <button
              type="button"
              onClick={() => {
                if (typeof onClose === 'function') onClose();
              }}
              aria-label="Close dialog"
              className="sketch-toggle"
              style={{ width: 28, height: 28, fontSize: 16 }}
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
        ) : null}
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
