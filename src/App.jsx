import React, { useState } from 'react';

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'airdrops', label: 'Airdrops' },
  { id: 'whitelists', label: 'Whitelists' },
  { id: 'wallets', label: 'Wallets' },
  { id: 'data', label: 'Data' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const activeLabel =
    TABS.find((tab) => tab.id === activeTab)?.label ?? 'Dashboard';

  return (
    <div className="min-h-screen bg-bg text-slate-100">
      <header className="border-b border-surface2 bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-semibold tracking-tight">
            <span className="text-accent-400">Drop</span>Track
          </h1>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 pb-3">
          {TABS.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors ' +
                  (isActive
                    ? 'bg-accent-500 text-slate-900'
                    : 'text-slate-300 hover:bg-surface2 hover:text-slate-100')
                }
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <p className="text-slate-300">
          Active tab: <span className="font-semibold">{activeLabel}</span>
        </p>
      </main>
    </div>
  );
}
