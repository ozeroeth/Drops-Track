import React, { useEffect } from 'react';

// Accessibility note: Esc and overlay-click dismiss the modal, and the header
// now renders a visible close button. A full focus trap, autofocus for
// ConfirmDialog, and focus restore to the invoking element are not implemented;
// keyboard users can still Tab out of the dialog into the page behind, and
// focus lands on document.body after close.
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
          <div className="flex items-center justify-between gap-3 border-b border-surface2 px-5 py-3">
            <h2 className="text-base font-semibold text-slate-100">{title}</h2>
            <button
              type="button"
              onClick={() => {
                if (typeof onClose === 'function') onClose();
              }}
              aria-label="Close dialog"
              className="flex h-7 w-7 flex-none items-center justify-center rounded-md text-slate-400 hover:bg-surface2 hover:text-slate-100 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
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
