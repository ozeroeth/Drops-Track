import React, { useCallback, useEffect, useRef, useState } from 'react';
import Dashboard from './components/Dashboard.jsx';
import AirdropList from './components/AirdropList.jsx';
import WhitelistList from './components/WhitelistList.jsx';
import WalletManager from './components/WalletManager.jsx';
import DataManager from './components/DataManager.jsx';
import Stats from './components/Stats.jsx';
import Calendar from './components/Calendar.jsx';
import LoginPage from './components/LoginPage.jsx';
import SettingsPage from './components/SettingsPage.jsx';
import BackgroundDecoration from './components/BackgroundDecoration.jsx';
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
import {
  LayoutDashboard,
  Droplets,
  ListChecks,
  CalendarDays,
  BarChart2,
  Wallet,
  Settings as SettingsIcon,
  Database,
} from './components/icons.jsx';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'airdrops', label: 'Airdrops', icon: Droplets },
  { id: 'whitelists', label: 'Whitelists', icon: ListChecks },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'stats', label: 'Stats', icon: BarChart2 },
  { id: 'wallets', label: 'Wallets', icon: Wallet },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
  { id: 'data', label: 'Data', icon: Database },
];

export default function App() {
  const { session, user, loading, signOut } = useAuth();

  const [activeTab, setActiveTab] = useState('dashboard');

  const enabled = !!user;
  const userId = user?.id || null;

  // Wallets is declared first so airdrops/whitelists can consult its
  // tempId -> real UUID resolver when serializing cross-collection
  // references. Without this, a wallet added in the same session as an
  // airdrop that picks it would persist its client tempId as the
  // airdrop's wallet_id, leaving the reference orphaned after reload.
  const [wallets, setWallets, walletsMeta] = useSupabaseCollection('wallets', {
    rowToObj: rowToWallet,
    objToRow: walletToRow,
    userId,
    enabled,
  });

  const resolveWalletId = walletsMeta.resolveTempId;
  const airdropToRowWithWallet = useCallback(
    (obj, uid) => airdropToRow(obj, uid, resolveWalletId),
    [resolveWalletId],
  );
  const whitelistToRowWithWallet = useCallback(
    (obj, uid) => whitelistToRow(obj, uid, resolveWalletId),
    [resolveWalletId],
  );

  const [airdrops, setAirdrops, airdropsMeta] = useSupabaseCollection(
    'airdrops',
    {
      rowToObj: rowToAirdrop,
      objToRow: airdropToRowWithWallet,
      userId,
      enabled,
    },
  );
  const [whitelists, setWhitelists, whitelistsMeta] = useSupabaseCollection(
    'whitelists',
    {
      rowToObj: rowToWhitelist,
      objToRow: whitelistToRowWithWallet,
      userId,
      enabled,
    },
  );

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
          <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-primary" />
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
    <div className="relative min-h-screen text-slate-100">
      <BackgroundDecoration />
      <header
        className="sticky top-0 z-20"
        style={{
          background: 'transparent',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
          <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight font-heading">
            <span className="text-primary">&#9670;</span>
            <span>
              <span className="text-primary">Drop</span><span className="text-white">Track</span>
            </span>
          </h1>
          <div className="flex items-center gap-2">
            {syncing ? (
              <span
                className="hidden rounded-full border border-[rgba(255,255,255,0.12)] px-3 py-1 text-xs text-textSecondary sm:inline-block"
                title="Syncing with Supabase"
              >
                Syncing...
              </span>
            ) : null}
            {user?.email ? (
              <span
                className="hidden max-w-[16rem] truncate rounded-full border border-[rgba(255,255,255,0.12)] px-3 py-1 text-xs text-textSecondary sm:inline-block"
                title={user.email}
              >
                {user.email}
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => signOut()}
              className="rounded-md border border-[rgba(255,255,255,0.12)] bg-transparent px-3 py-1.5 text-xs font-medium text-textSecondary transition-colors hover:border-[rgba(255,255,255,0.3)] hover:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              Sign out
            </button>
          </div>
        </div>
        {/* Desktop navigation */}
        <nav
          className="mx-auto hidden max-w-6xl gap-1 overflow-x-auto whitespace-nowrap px-4 pb-3 sm:flex"
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
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 ' +
                  (isActive
                    ? 'text-primary'
                    : 'text-textSecondary hover:text-white')
                }
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Mobile creator signature (just above the bottom nav) */}
      <div
        className="fixed inset-x-0 z-20 flex justify-center pointer-events-none sm:hidden"
        style={{ bottom: 'calc(env(safe-area-inset-bottom) + 60px)' }}
      >
        <span className="creator-signature pointer-events-auto">by ozero</span>
      </div>

      {/* Mobile bottom navigation */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around px-1 py-2 sm:hidden"
        style={{
          background: 'rgba(8,11,20,0.9)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
        aria-label="Primary"
      >
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className="flex flex-col items-center gap-0.5 px-1 py-1 focus:outline-none"
            >
              <Icon
                size={20}
                className={isActive ? 'text-[#F7931A]' : 'text-[#8892A4]'}
              />
              <span
                className={
                  'text-[10px] leading-tight transition-colors ' +
                  (isActive ? 'text-primary' : 'text-textSecondary')
                }
              >
                {tab.label}
              </span>
              {isActive ? (
                <span className="mt-0.5 h-1 w-1 rounded-full" style={{ background: '#F7931A' }} />
              ) : null}
            </button>
          );
        })}
      </nav>

      <main
        key={activeTab}
        className="relative z-10 mx-auto max-w-6xl px-4 py-6 pb-24 sm:pb-6 animate-fade-in-up"
      >
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

      {/* Desktop creator signature footer */}
      <footer className="hidden sm:flex justify-center pb-6">
        <span className="creator-signature">by ozero</span>
      </footer>
    </div>
  );
}
