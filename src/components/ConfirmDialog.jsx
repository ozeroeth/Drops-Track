import React from 'react';
import Modal from './Modal.jsx';

export default function ConfirmDialog({
  open,
  title,
  body,
  onConfirm,
  onCancel,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
}) {
  return (
    <Modal open={open} onClose={onCancel} title={title} widthClass="max-w-md">
      <div className="space-y-4">
        <div className="text-sm" style={{color:'var(--text)'}}>{body}</div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            autoFocus
            className="sketchy-btn-ghost rounded-md px-3 py-1.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40"
            style={{color:'var(--text-muted)'}}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="sketchy-btn rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-danger/40"
            style={{
              background: 'rgba(255,71,87,0.1)',
              border: '1px solid rgba(255,71,87,0.3)',
              color: '#FF4757',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,71,87,0.2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,71,87,0.1)'; }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
