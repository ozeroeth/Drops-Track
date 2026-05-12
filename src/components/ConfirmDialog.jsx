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
        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{body}</div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            autoFocus
            className="sketchy-btn"
            style={{ background: 'var(--surface)', color: 'var(--text)' }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="sketchy-btn"
            style={{ background: '#c62828', color: 'white', borderColor: '#c62828' }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
