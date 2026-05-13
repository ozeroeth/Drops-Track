import React, { useState, useRef, useEffect } from 'react';

export default function CardActionMenu({ onEdit, onDuplicate, onDelete }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const firstItemRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    function handleEscape(e) {
      if (e.key === 'Escape') {
        setOpen(false);
        if (triggerRef.current) triggerRef.current.focus();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  useEffect(() => {
    if (open && firstItemRef.current) {
      firstItemRef.current.focus();
    }
  }, [open]);

  function handleAction(cb) {
    setOpen(false);
    if (triggerRef.current) triggerRef.current.focus();
    if (typeof cb === 'function') cb();
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        ref={triggerRef}
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8892A4] transition-colors hover:text-white focus:outline-none"
        aria-label="Actions"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span className="text-sm">{'\u2699\uFE0F'}</span>
      </button>
      {open ? (
        <div
          role="menu"
          className="sketchy-card absolute right-0 top-full z-50 mt-1 min-w-[140px] rounded-[10px] py-1 shadow-xl"
        >
          <button
            type="button"
            ref={firstItemRef}
            role="menuitem"
            onClick={() => handleAction(onEdit)}
            className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-white/5"
            style={{color:'var(--text)'}}
          >
            <span>{'\u270F\uFE0F'}</span>
            <span>Edit</span>
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => handleAction(onDuplicate)}
            className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-white/5"
            style={{color:'var(--text)'}}
          >
            <span>{'\u{1F4CB}'}</span>
            <span>Duplicate</span>
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => handleAction(onDelete)}
            className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-white/5"
            style={{ color: '#FF4757' }}
          >
            <span>{'\u{1F5D1}\uFE0F'}</span>
            <span>Delete</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
