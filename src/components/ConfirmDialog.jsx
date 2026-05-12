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
        <div className="text-sm font-body" style={{ color: 'var(--text)' }}>{body}</div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            autoFocus
            className="sketch-btn sketch-btn-ghost px-3 py-1.5 text-sm"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="sketch-btn sketch-btn-danger px-3 py-1.5 text-sm"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
