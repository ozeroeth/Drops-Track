import React, { useMemo, useState } from 'react';
import EmptyState from './EmptyState.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import WalletForm from './WalletForm.jsx';

function truncateAddress(addr) {
  if (!addr || typeof addr !== 'string') return '';
  if (addr.length <= 14) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function WalletCard({ wallet, airdropCount, whitelistCount, onEdit, onDelete }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      if (
        typeof navigator !== 'undefined' &&
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === 'function'
      ) {
        await navigator.clipboard.writeText(wallet.address);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    } catch (err) {
      // Silently ignore; UI feedback stays inert.
    }
  }

  return (
    <article
      className="flex flex-col gap-3 overflow-hidden rounded-2xl p-5 transition-all duration-200"
      style={{
        background: 'rgba(13,17,23,0.85)',
        border: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-white">
            {wallet.label}
          </h3>
          <span className="mt-1 inline-flex items-center rounded-full border border-surfaceBorder px-2 py-0.5 text-xs text-textSecondary">
            {wallet.chainType}
          </span>
        </div>
        <div className="flex flex-none gap-1">
          <button
            type="button"
            onClick={() => onEdit(wallet)}
            className="rounded-lg border border-surfaceBorder px-2.5 py-1 text-xs text-textSecondary transition-colors hover:border-primary/40 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(wallet)}
            className="rounded-lg border border-danger/30 px-2.5 py-1 text-xs text-danger transition-colors hover:bg-danger/10 focus:outline-none focus:ring-2 focus:ring-danger/40"
          >
            Delete
          </button>
        </div>
      </header>

      <div className="text-xs">
        <div className="uppercase tracking-wide text-textSecondary">Address</div>
        <div className="mt-1 flex items-center gap-2">
          <span
            className="truncate font-mono text-white/80"
            title={wallet.address}
          >
            {truncateAddress(wallet.address)}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-lg border border-surfaceBorder px-2 py-0.5 text-[11px] text-textSecondary transition-colors hover:border-primary/40 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-textSecondary">
        <span>
          <span className="font-semibold text-white">{airdropCount}</span> airdrops
        </span>
        <span>
          <span className="font-semibold text-white">{whitelistCount}</span> whitelists
        </span>
      </div>
    </article>
  );
}

export default function WalletManager({ wallets, setWallets, airdrops, whitelists }) {
  const [editing, setEditing] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const counts = useMemo(() => {
    const airMap = new Map();
    const wlMap = new Map();
    for (const a of airdrops) {
      if (!a.walletId) continue;
      airMap.set(a.walletId, (airMap.get(a.walletId) || 0) + 1);
    }
    for (const w of whitelists) {
      if (!w.walletId) continue;
      wlMap.set(w.walletId, (wlMap.get(w.walletId) || 0) + 1);
    }
    return { airMap, wlMap };
  }, [airdrops, whitelists]);

  function handleSubmit(entry) {
    setWallets((prev) => {
      const idx = prev.findIndex((w) => w.id === entry.id);
      if (idx === -1) return [...prev, entry];
      const next = prev.slice();
      next[idx] = entry;
      return next;
    });
    setEditing(null);
  }

  function handleDeleteConfirm() {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    setWallets((prev) => prev.filter((w) => w.id !== id));
    setPendingDelete(null);
  }

  const pendingAirCount = pendingDelete
    ? counts.airMap.get(pendingDelete.id) || 0
    : 0;
  const pendingWlCount = pendingDelete
    ? counts.wlMap.get(pendingDelete.id) || 0
    : 0;
  const pendingReferenced = pendingAirCount + pendingWlCount > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">Wallets</h2>
        <button
          type="button"
          onClick={() => setEditing('new')}
          className="rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-primary/20"
          style={{
            background: 'linear-gradient(135deg, #F7931A, #E8820A)',
          }}
        >
          + Add Wallet
        </button>
      </div>

      {wallets.length === 0 ? (
        <EmptyState
          title="No wallets yet"
          hint="Add at least one wallet to link airdrops and whitelists to it."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {wallets.map((w) => (
            <WalletCard
              key={w.id}
              wallet={w}
              airdropCount={counts.airMap.get(w.id) || 0}
              whitelistCount={counts.wlMap.get(w.id) || 0}
              onEdit={(entry) => setEditing(entry)}
              onDelete={(entry) => setPendingDelete(entry)}
            />
          ))}
        </div>
      )}

      {editing ? (
        <WalletForm
          initial={editing === 'new' ? null : editing}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
        />
      ) : null}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete wallet?"
        body={
          pendingDelete
            ? pendingReferenced
              ? `This wallet is used by ${pendingAirCount} airdrop${pendingAirCount === 1 ? '' : 's'} and ${pendingWlCount} whitelist${pendingWlCount === 1 ? '' : 's'}. They will keep the reference but the name will no longer resolve.`
              : `This will permanently remove "${pendingDelete.label}".`
            : ''
        }
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
