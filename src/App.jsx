import React, { useEffect, useRef, useState } from 'react';
import useLocalStorageState from './hooks/useLocalStorageState.js';
import { readJSON, writeJSON } from './utils/storage.js';
import { STORAGE_KEYS } from './constants/index.js';
import {
  sampleAirdrops,
  sampleWhitelists,
  sampleWallets,
} from './data/sampleData.js';
import Dashboard from './components/Dashboard.jsx';
import AirdropList from './components/AirdropList.jsx';
import WhitelistList from './components/WhitelistList.jsx';
import WalletManager from './components/WalletManager.jsx';
import DataManager from './components/DataManager.jsx';
import CrayonCharacter from './components/CrayonCharacter';

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'airdrops', label: 'Airdrops' },
  { id: 'whitelists', label: 'Whitelists' },
  { id: 'wallets', label: 'Wallets' },
  { id: 'data', label: 'Data' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('droptrack-theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('droptrack-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const [airdrops, setAirdrops] = useLocalStorageState(
    STORAGE_KEYS.airdrops,
    [],
  );
  const [whitelists, setWhitelists] = useLocalStorageState(
    STORAGE_KEYS.whitelists,
    [],
  );
  const [wallets, setWallets] = useLocalStorageState(STORAGE_KEYS.wallets, []);

  const seededRef = useRef(false);

  useEffect(() => {
    if (seededRef.current) return;
    seededRef.current = true;
    const seeded = readJSON(STORAGE_KEYS.seeded, null);
    if (seeded) return;
    setAirdrops(sampleAirdrops);
    setWhitelists(sampleWhitelists);
    setWallets(sampleWallets);
    writeJSON(STORAGE_KEYS.seeded, '1');
  }, [setAirdrops, setWhitelists, setWallets]);

  return (
    <div className="min-h-screen">
      <CrayonCharacter />
      <header className="sticky top-0 z-20" style={{ borderBottom: '2.5px solid var(--border)', background: 'var(--surface)' }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <h1 className="text-2xl font-bold">
            <span style={{ color: 'var(--accent)' }}>Drop</span>
            <span style={{ color: 'var(--text)' }}>Track</span>
          </h1>
          <button
            onClick={() => setIsDark(!isDark)}
            className="sketchy-btn-ghost"
            style={{ padding: '8px 12px', background: 'var(--surface)', color: 'var(--text)' }}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
        </div>
        <nav
          className="mx-auto flex max-w-6xl gap-1 overflow-x-auto whitespace-nowrap px-4 pb-3"
          aria-label="Primary"
        >
          {TABS.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                aria-current={isActive ? 'page' : undefined}
                className={
                  'sketchy-nav px-3 py-1.5' +
                  (isActive ? '' : '')
                }
                style={{
                  color: isActive ? 'var(--accent)' : 'var(--text)',
                  borderBottom: isActive ? '2.5px solid var(--accent)' : 'none',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        {activeTab === 'dashboard' ? (
          <Dashboard
            airdrops={airdrops}
            whitelists={whitelists}
            onJumpToAirdrops={() => setActiveTab('airdrops')}
            onJumpToWhitelists={() => setActiveTab('whitelists')}
          />
        ) : null}
        {activeTab === 'airdrops' ? (
          <AirdropList
            airdrops={airdrops}
            setAirdrops={setAirdrops}
            wallets={wallets}
          />
        ) : null}
        {activeTab === 'whitelists' ? (
          <WhitelistList
            whitelists={whitelists}
            setWhitelists={setWhitelists}
            wallets={wallets}
          />
        ) : null}
        {activeTab === 'wallets' ? (
          <WalletManager
            wallets={wallets}
            setWallets={setWallets}
            airdrops={airdrops}
            whitelists={whitelists}
          />
        ) : null}
        {activeTab === 'data' ? (
          <DataManager
            airdrops={airdrops}
            setAirdrops={setAirdrops}
            whitelists={whitelists}
            setWhitelists={setWhitelists}
            wallets={wallets}
            setWallets={setWallets}
          />
        ) : null}
      </main>
    </div>
  );
}
