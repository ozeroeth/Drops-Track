import React from 'react';
import StatusBadge from './StatusBadge.jsx';
import DeadlineLabel from './DeadlineLabel.jsx';
import { isExpiringSoon, isPast, primaryWhitelistDeadline } from '../utils/date.js';

function truncateAddress(addr) {
  if (!addr || typeof addr !== 'string') return '';
  if (addr.length <= 14) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function WhitelistCard({ whitelist, wallet, onEdit, onDelete, onDuplicate }) {
  const primaryIso = primaryWhitelistDeadline(whitelist);
  const overdue =
    isPast(primaryIso) &&
    (whitelist.status === 'Applied' || whitelist.status === 'Whitelisted');
  const soon = isExpiringSoon(primaryIso) && !overdue;

  let borderClass = 'border-surface2';
  if (overdue) borderClass = 'border-red-500/70';
  else if (soon) borderClass = 'border-orange-500/70';

  return (
    <article
      className={
        'flex flex-col gap-3 rounded-lg border bg-surface p-4 ' + borderClass
      }
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-slate-50">
            {whitelist.name}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-md border border-surface2 bg-surface2 px-2 py-0.5 text-xs text-slate-300">
              {whitelist.type}
            </span>
            <StatusBadge status={whitelist.status} />
          </div>
        </div>
        <div className="flex flex-none gap-1">
          <button
            type="button"
            onClick={() => onEdit(whitelist)}
            className="rounded-md border border-surface2 bg-surface2 px-2 py-1 text-xs text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDuplicate && onDuplicate(whitelist)}
            aria-label="Duplicate"
            title="Duplicate"
            className="rounded-md border border-surface2 bg-surface2 px-2 py-1 text-xs text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
          >
            <span aria-hidden="true" className="mr-1">&#x29C9;</span>
            Duplicate
          </button>
          <button
            type="button"
            onClick={() => onDelete(whitelist)}
            className="rounded-md border border-red-500/40 bg-red-500/10 px-2 py-1 text-xs text-red-300 hover:bg-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-400/60"
          >
            Delete
          </button>
        </div>
      </header>

      {Array.isArray(whitelist.tags) && whitelist.tags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {whitelist.tags.map((tag, i) => (
            <span
              key={`${tag}-${i}`}
              className="inline-flex items-center rounded-full border border-accent-500/30 bg-accent-500/10 px-2 py-0.5 text-xs text-accent-300"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <DeadlineLabel iso={whitelist.applicationDeadline} label="Apply by" />
        <DeadlineLabel iso={whitelist.mintDate} label="Mint" />
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <div className="uppercase tracking-wide text-slate-500">Wallet</div>
          <div className="text-slate-300">
            {wallet ? (
              <span>
                {wallet.label}{' '}
                <span className="text-slate-500" title={wallet.address}>
                  ({truncateAddress(wallet.address)})
                </span>
              </span>
            ) : (
              <span className="italic text-slate-500">Unassigned</span>
            )}
          </div>
        </div>
        <div>
          <div className="uppercase tracking-wide text-slate-500">Mint price</div>
          <div className="text-slate-300">
            {whitelist.mintPrice || '\u2014'}
          </div>
        </div>
      </div>

      {whitelist.notes ? (
        <p
          className="text-xs text-slate-400"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {whitelist.notes}
        </p>
      ) : null}

      {whitelist.link ? (
        <a
          href={whitelist.link}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-medium text-accent-400 hover:text-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
        >
          Open official site
        </a>
      ) : null}
    </article>
  );
}
