import React, { useRef, useState } from 'react';
import ConfirmDialog from './ConfirmDialog.jsx';
import { exportToCSV, downloadCSV, parseCSV } from '../utils/csv.js';
import { generateId } from '../utils/id.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { forceSeedSampleData } from '../data/seeding.js';

const AIRDROP_HEADERS = [
  'id',
  'name',
  'logoUrl',
  'network',
  'status',
  'deadline',
  'estimatedValueUsd',
  'walletId',
  'tasks',
  'notes',
  'link',
  'createdAt',
  'tags',
  'twitterUrl',
];

const WHITELIST_HEADERS = [
  'id',
  'name',
  'type',
  'status',
  'applicationDeadline',
  'mintDate',
  'walletId',
  'mintPrice',
  'notes',
  'link',
  'createdAt',
  'tags',
  'twitterUrl',
];

const WALLET_HEADERS = ['id', 'label', 'address', 'chainType'];

function todayStamp() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

function serializeAirdrop(a) {
  return {
    id: a.id || '',
    name: a.name || '',
    logoUrl: a.logoUrl || '',
    network: a.network || '',
    status: a.status || '',
    deadline: a.deadline || '',
    estimatedValueUsd:
      typeof a.estimatedValueUsd === 'number' && !Number.isNaN(a.estimatedValueUsd)
        ? String(a.estimatedValueUsd)
        : '',
    walletId: a.walletId || '',
    tasks: JSON.stringify(Array.isArray(a.tasks) ? a.tasks : []),
    notes: a.notes || '',
    link: a.link || '',
    createdAt: a.createdAt || '',
    tags: JSON.stringify(Array.isArray(a.tags) ? a.tags : []),
    twitterUrl: a.twitterUrl || '',
  };
}

function serializeWhitelist(w) {
  return {
    id: w.id || '',
    name: w.name || '',
    type: w.type || '',
    status: w.status || '',
    applicationDeadline: w.applicationDeadline || '',
    mintDate: w.mintDate || '',
    walletId: w.walletId || '',
    mintPrice: w.mintPrice || '',
    notes: w.notes || '',
    link: w.link || '',
    createdAt: w.createdAt || '',
    tags: JSON.stringify(Array.isArray(w.tags) ? w.tags : []),
    twitterUrl: w.twitterUrl || '',
  };
}

function serializeWallet(w) {
  return {
    id: w.id || '',
    label: w.label || '',
    address: w.address || '',
    chainType: w.chainType || '',
  };
}

function parseTagsField(raw) {
  if (raw === undefined || raw === null || raw === '') return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((t) => typeof t === 'string')
      .map((t) => t.trim())
      .filter((t) => t !== '');
  } catch (err) {
    return [];
  }
}

function normalizeAirdropRow(row) {
  let tasks = [];
  if (row.tasks) {
    try {
      const parsed = JSON.parse(row.tasks);
      if (Array.isArray(parsed)) {
        tasks = parsed.map((t) => ({
          id: t && t.id ? t.id : generateId(),
          label: t && typeof t.label === 'string' ? t.label : '',
          done: !!(t && t.done),
        }));
      }
    } catch (err) {
      tasks = [];
    }
  }
  let estimatedValueUsd = null;
  if (row.estimatedValueUsd !== '' && row.estimatedValueUsd !== undefined) {
    const n = Number(row.estimatedValueUsd);
    estimatedValueUsd = Number.isFinite(n) ? n : null;
  }
  return {
    id: row.id || generateId(),
    name: row.name || '',
    logoUrl: row.logoUrl || '',
    network: row.network || '',
    status: row.status || 'Active',
    deadline: row.deadline || '',
    estimatedValueUsd,
    walletId: row.walletId || '',
    tasks,
    tags: parseTagsField(row.tags),
    notes: row.notes || '',
    link: row.link || '',
    twitterUrl: row.twitterUrl || '',
    createdAt: row.createdAt || '',
  };
}

function normalizeWhitelistRow(row) {
  return {
    id: row.id || generateId(),
    name: row.name || '',
    type: row.type || 'NFT mint',
    status: row.status || 'Applied',
    applicationDeadline: row.applicationDeadline || '',
    mintDate: row.mintDate || '',
    walletId: row.walletId || '',
    mintPrice: row.mintPrice || '',
    tags: parseTagsField(row.tags),
    notes: row.notes || '',
    link: row.link || '',
    twitterUrl: row.twitterUrl || '',
    createdAt: row.createdAt || '',
  };
}

function normalizeWalletRow(row) {
  return {
    id: row.id || generateId(),
    label: row.label || '',
    address: row.address || '',
    chainType: row.chainType || 'EVM',
  };
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('Read failed'));
    reader.readAsText(file);
  });
}

function Row({ title, description, onExport, onImport, exporting, importMessage }) {
  const inputRef = useRef(null);
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: 'rgba(13,17,23,0.85)',
        border: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <p className="mt-1 text-xs text-textSecondary">{description}</p>
          {importMessage ? (
            <p className="mt-2 text-xs text-white/80">{importMessage}</p>
          ) : null}
        </div>
        <div className="flex flex-none flex-wrap gap-2">
          <button
            type="button"
            onClick={onExport}
            disabled={exporting}
            className="rounded-lg border border-surfaceBorder px-3 py-1.5 text-sm text-textSecondary transition-colors hover:border-primary/40 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
          >
            Export CSV
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files && e.target.files[0];
              if (file) onImport(file);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current && inputRef.current.click()}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/40"
            style={{
              backgroundColor: 'rgba(247,147,26,0.15)',
              border: '1px solid rgba(247,147,26,0.3)',
            }}
          >
            Import CSV
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DataManager({
  airdrops,
  setAirdrops,
  whitelists,
  setWhitelists,
  wallets,
  setWallets,
  onForceReseed,
}) {
  const { user } = useAuth();
  const [pendingImport, setPendingImport] = useState(null);
  const [pendingReset, setPendingReset] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [lastMessage, setLastMessage] = useState({
    airdrops: '',
    whitelists: '',
    wallets: '',
  });

  function setMessage(kind, text) {
    setLastMessage((prev) => ({ ...prev, [kind]: text }));
  }

  function exportAirdrops() {
    const csv = exportToCSV(airdrops.map(serializeAirdrop), AIRDROP_HEADERS);
    downloadCSV(`droptrack-airdrops-${todayStamp()}.csv`, csv);
  }

  function exportWhitelists() {
    const csv = exportToCSV(
      whitelists.map(serializeWhitelist),
      WHITELIST_HEADERS,
    );
    downloadCSV(`droptrack-whitelists-${todayStamp()}.csv`, csv);
  }

  function exportWallets() {
    const csv = exportToCSV(wallets.map(serializeWallet), WALLET_HEADERS);
    downloadCSV(`droptrack-wallets-${todayStamp()}.csv`, csv);
  }

  async function stageImport(kind, file) {
    try {
      const text = await readFileAsText(file);
      const rawRows = parseCSV(text);
      let rows = [];
      if (kind === 'airdrops') rows = rawRows.map(normalizeAirdropRow);
      else if (kind === 'whitelists') rows = rawRows.map(normalizeWhitelistRow);
      else if (kind === 'wallets') rows = rawRows.map(normalizeWalletRow);
      setPendingImport({ kind, rows, fileName: file.name });
    } catch (err) {
      setMessage(kind, `Failed to read file: ${err && err.message ? err.message : 'unknown error'}`);
    }
  }

  function confirmImport() {
    if (!pendingImport) return;
    const { kind, rows, fileName } = pendingImport;
    if (kind === 'airdrops') setAirdrops(rows);
    else if (kind === 'whitelists') setWhitelists(rows);
    else if (kind === 'wallets') setWallets(rows);
    setMessage(kind, `Imported ${rows.length} row${rows.length === 1 ? '' : 's'} from ${fileName}.`);
    setPendingImport(null);
  }

  async function performReset() {
    if (resetting) return;
    setResetting(true);
    setAirdrops([]);
    setWhitelists([]);
    setWallets([]);
    try {
      if (user?.id) {
        await forceSeedSampleData(user.id);
      }
      if (typeof onForceReseed === 'function') {
        await onForceReseed();
      }
      setLastMessage({
        airdrops: 'All data cleared and sample data reseeded.',
        whitelists: '',
        wallets: '',
      });
    } catch (err) {
      setLastMessage({
        airdrops: `Reset failed: ${err && err.message ? err.message : 'unknown error'}`,
        whitelists: '',
        wallets: '',
      });
    } finally {
      setPendingReset(false);
      setResetting(false);
    }
  }

  const pendingCount = pendingImport ? pendingImport.rows.length : 0;
  const pendingKind = pendingImport ? pendingImport.kind : '';

  return (
    <div className="space-y-4">
      <Row
        title="Airdrops"
        description="Export all airdrops to CSV, or import a CSV to replace the current list."
        onExport={exportAirdrops}
        onImport={(file) => stageImport('airdrops', file)}
        importMessage={lastMessage.airdrops}
      />
      <Row
        title="Whitelists"
        description="Export all whitelists to CSV, or import a CSV to replace the current list."
        onExport={exportWhitelists}
        onImport={(file) => stageImport('whitelists', file)}
        importMessage={lastMessage.whitelists}
      />
      <Row
        title="Wallets"
        description="Export all wallets to CSV, or import a CSV to replace the current list."
        onExport={exportWallets}
        onImport={(file) => stageImport('wallets', file)}
        importMessage={lastMessage.wallets}
      />

      <div
        className="rounded-2xl p-5"
        style={{
          border: '1px solid rgba(255,71,87,0.3)',
          backgroundColor: 'rgba(255,71,87,0.05)',
        }}
      >
        <h3 className="text-sm font-semibold text-danger">Danger zone</h3>
        <p className="mt-1 text-xs text-danger/80">
          Clear all of your DropTrack data in Supabase and reseed the sample
          data. This only affects your account and cannot be undone.
        </p>
        <button
          type="button"
          onClick={() => setPendingReset(true)}
          disabled={resetting}
          className="mt-3 rounded-lg border border-danger/40 bg-danger/80 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-danger focus:outline-none focus:ring-2 focus:ring-danger/60 disabled:opacity-50"
        >
          {resetting ? 'Clearing...' : 'Clear all data'}
        </button>
      </div>

      <ConfirmDialog
        open={!!pendingImport}
        title={`Replace ${pendingKind}?`}
        body={
          pendingImport
            ? `This will replace all existing ${pendingKind} with ${pendingCount} row${pendingCount === 1 ? '' : 's'} from "${pendingImport.fileName}". Continue?`
            : ''
        }
        confirmLabel="Replace"
        onConfirm={confirmImport}
        onCancel={() => setPendingImport(null)}
      />

      <ConfirmDialog
        open={pendingReset}
        title="Clear all data?"
        body="This will wipe all of your airdrops, whitelists, and wallets in Supabase and reseed the sample data. Your Telegram notification settings are preserved. Other users are unaffected."
        confirmLabel="Clear and reseed"
        onConfirm={performReset}
        onCancel={() => setPendingReset(false)}
      />
    </div>
  );
}
