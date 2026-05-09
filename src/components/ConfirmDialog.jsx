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
        <div className="text-sm text-slate-300">{body}</div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-surface2 bg-surface2 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-md border border-red-500/40 bg-red-600/90 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400/60"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
