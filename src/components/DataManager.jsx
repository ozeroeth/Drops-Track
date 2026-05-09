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
    <div className="rounded-lg border border-surface2 bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
          <p className="mt-1 text-xs text-slate-400">{description}</p>
          {importMessage ? (
            <p className="mt-2 text-xs text-slate-300">{importMessage}</p>
          ) : null}
        </div>
        <div className="flex flex-none flex-wrap gap-2">
          <button
            type="button"
            onClick={onExport}
            disabled={exporting}
            className="rounded-md border border-surface2 bg-surface2 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-accent-500/40 disabled:opacity-50"
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
            className="rounded-md border border-accent-500/40 bg-accent-500/20 px-3 py-1.5 text-sm font-medium text-accent-200 hover:bg-accent-500/30 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
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
  const [pendingImport, setPendingImport] = useState(null); // { kind, rows, fileName }
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
    // Drop everything from local state first so the UI responds immediately.
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

      <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
        <h3 className="text-sm font-semibold text-red-300">Danger zone</h3>
        <p className="mt-1 text-xs text-red-200/80">
          Clear all of your DropTrack data in Supabase and reseed the sample
          data. This only affects your account and cannot be undone.
        </p>
        <button
          type="button"
          onClick={() => setPendingReset(true)}
          disabled={resetting}
          className="mt-3 rounded-md border border-red-500/40 bg-red-600/80 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400/60 disabled:opacity-50"
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
        body="This will wipe all of your airdrops, whitelists, and wallets in Supabase and reseed the sample data. Other users are unaffected."
        confirmLabel="Clear and reseed"
        onConfirm={performReset}
        onCancel={() => setPendingReset(false)}
      />
    </div>
  );
}
