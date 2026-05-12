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
      // Silently ignore
    }
  }

  return (
    <article className="sketch-card flex flex-col gap-3 p-4">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-sketch text-xl font-bold" style={{ color: 'var(--text)' }}>
            {wallet.label}
          </h3>
          <span className="sketch-chip mt-1">{wallet.chainType}</span>
        </div>
        <div className="flex flex-none gap-1">
          <button
            type="button"
            onClick={() => onEdit(wallet)}
            className="sketch-btn sketch-btn-ghost px-2 py-1 text-xs"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(wallet)}
            className="sketch-btn sketch-btn-danger px-2 py-1 text-xs"
          >
            Delete
          </button>
        </div>
      </header>

      <div className="text-xs">
        <div className="uppercase tracking-wide font-bold" style={{ color: 'var(--text-muted)' }}>Address</div>
        <div className="mt-1 flex items-center gap-2">
          <span className="truncate font-mono" style={{ color: 'var(--text)' }} title={wallet.address}>
            {truncateAddress(wallet.address)}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="sketch-btn sketch-btn-ghost px-2 py-0.5 text-[11px]"
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
        <span>
          <span className="font-bold" style={{ color: 'var(--text)' }}>{airdropCount}</span> airdrops
        </span>
        <span>
          <span className="font-bold" style={{ color: 'var(--text)' }}>{whitelistCount}</span> whitelists
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
        <h2 className="font-sketch text-2xl font-bold" style={{ color: 'var(--text)' }}>Wallets</h2>
        <button
          type="button"
          onClick={() => setEditing('new')}
          className="sketch-btn sketch-btn-accent px-3 py-1.5 text-sm"
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
