import React, { useEffect, useRef } from 'react';

export default function MobileMoreMenu({ open, onClose, activeTab, onSelect, tabs }) {
  const firstButtonRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    document.addEventListener('keydown', handleKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    firstButtonRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 animate-fade-in sm:hidden"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="More navigation"
        className="fixed inset-x-0 bottom-0 z-50 animate-slide-up pb-[env(safe-area-inset-bottom)] sm:hidden"
        style={{
          background: 'var(--surface)',
          borderTop: '2.5px solid var(--border)',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
      >
        <div
          className="mx-auto my-3 h-1 w-10 rounded-full"
          style={{ background: 'var(--text-muted)', opacity: 0.5 }}
          aria-hidden="true"
        />
        {tabs.map((tab, idx) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              ref={idx === 0 ? firstButtonRef : null}
              onClick={() => {
                onSelect(tab.id);
                onClose();
              }}
              aria-current={isActive ? 'page' : undefined}
              className={
                'flex w-full items-center gap-3 px-5 py-3.5 text-sm transition-colors focus:outline-none'
              }
              style={isActive ? { background: 'var(--surface)', color: 'var(--accent)' } : { color: 'var(--text)' }}
            >
              <Icon size={20} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
