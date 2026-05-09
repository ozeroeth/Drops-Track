import React, { useEffect, useRef, useState } from 'react';
import Dashboard from './components/Dashboard.jsx';
import AirdropList from './components/AirdropList.jsx';
import WhitelistList from './components/WhitelistList.jsx';
import WalletManager from './components/WalletManager.jsx';
import DataManager from './components/DataManager.jsx';
import Stats from './components/Stats.jsx';
import Calendar from './components/Calendar.jsx';
import LoginPage from './components/LoginPage.jsx';
import SettingsPage from './components/SettingsPage.jsx';
import { useAuth } from './contexts/AuthContext.jsx';
import useSupabaseCollection from './hooks/useSupabaseCollection.js';
import {
  rowToAirdrop,
  airdropToRow,
  rowToWhitelist,
  whitelistToRow,
  rowToWallet,
  walletToRow,
} from './lib/mappers.js';
import {
  seedInitialDataIfEmpty,
} from './data/seeding.js';

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'airdrops', label: 'Airdrops' },
  { id: 'whitelists', label: 'Whitelists' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'stats', label: 'Stats' },
  { id: 'wallets', label: 'Wallets' },
  { id: 'settings', label: 'Settings' },
  { id: 'data', label: 'Data' },
];

export default function App() {
  const { session, user, loading, signOut } = useAuth();

  const [activeTab, setActiveTab] = useState('dashboard');

  const enabled = !!user;
  const userId = user?.id || null;

  const [airdrops, setAirdrops, airdropsMeta] = useSupabaseCollection(
    'airdrops',
    {
      rowToObj: rowToAirdrop,
      objToRow: airdropToRow,
      userId,
      enabled,
    },
  );
  const [whitelists, setWhitelists, whitelistsMeta] = useSupabaseCollection(
    'whitelists',
    {
      rowToObj: rowToWhitelist,
      objToRow: whitelistToRow,
      userId,
      enabled,
    },
  );
  const [wallets, setWallets, walletsMeta] = useSupabaseCollection('wallets', {
    rowToObj: rowToWallet,
    objToRow: walletToRow,
    userId,
    enabled,
  });

  const seededForUserRef = useRef(null);

  useEffect(() => {
    if (!userId) {
      seededForUserRef.current = null;
      return;
    }
    if (seededForUserRef.current === userId) return;
    seededForUserRef.current = userId;
    seedInitialDataIfEmpty(userId)
      .then((seeded) => {
        if (!seeded) return;
        airdropsMeta.refresh().catch(() => {});
        whitelistsMeta.refresh().catch(() => {});
        walletsMeta.refresh().catch(() => {});
      })
      .catch(() => {});
  }, [userId, airdropsMeta, whitelistsMeta, walletsMeta]);

  async function handleForceReseed() {
    // DataManager has already called forceSeedSampleData(user.id) directly;
    // this callback exists so App can re-pull the authoritative rows after
    // the server-side reset completes.
    await Promise.all([
      airdropsMeta.refresh().catch(() => {}),
      whitelistsMeta.refresh().catch(() => {}),
      walletsMeta.refresh().catch(() => {}),
    ]);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg text-slate-300">
        <div className="flex items-center gap-3 text-sm">
          <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-accent-400" />
          <span>Loading DropTrack...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return <LoginPage />;
  }

  const syncing =
    airdropsMeta.loading || whitelistsMeta.loading || walletsMeta.loading;

  return (
    <div className="min-h-screen bg-bg text-slate-100">
      <header className="sticky top-0 z-20 border-b border-surface2 bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
          <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-accent-400" />
            <span>
              <span className="text-accent-400">Drop</span>Track
            </span>
          </h1>
          <div className="flex items-center gap-2">
            {syncing ? (
              <span
                className="hidden rounded-full border border-surface2 bg-surface2/60 px-3 py-1 text-xs text-slate-400 sm:inline-block"
                title="Syncing with Supabase"
              >
                Syncing...
              </span>
            ) : null}
            {user?.email ? (
              <span
                className="hidden max-w-[16rem] truncate rounded-full border border-surface2 bg-surface2/60 px-3 py-1 text-xs text-slate-400 sm:inline-block"
                title={user.email}
              >
                {user.email}
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => signOut()}
              className="rounded-md border border-surface2 bg-surface2 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-surface2/70 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
            >
              Sign out
            </button>
          </div>
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
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500/40 ' +
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
        {activeTab === 'calendar' ? (
          <Calendar airdrops={airdrops} whitelists={whitelists} />
        ) : null}
        {activeTab === 'stats' ? (
          <Stats
            airdrops={airdrops}
            whitelists={whitelists}
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
        {activeTab === 'settings' ? <SettingsPage /> : null}
        {activeTab === 'data' ? (
          <DataManager
            airdrops={airdrops}
            setAirdrops={setAirdrops}
            whitelists={whitelists}
            setWhitelists={setWhitelists}
            wallets={wallets}
            setWallets={setWallets}
            onForceReseed={handleForceReseed}
          />
        ) : null}
      </main>
    </div>
  );
}
