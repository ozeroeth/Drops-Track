import React from 'react';
import StatusBadge from './StatusBadge.jsx';
import DeadlineLabel from './DeadlineLabel.jsx';
import { isExpiringSoon, isPast, primaryWhitelistDeadline } from '../utils/date.js';

function truncateAddress(addr) {
  if (!addr || typeof addr !== 'string') return '';
  if (addr.length <= 14) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function WhitelistCard({ whitelist, wallet, onEdit, onDelete }) {
  const primaryIso = primaryWhitelistDeadline(whitelist);
  const overdue =
    isPast(primaryIso) &&
    (whitelist.status === 'Applied' || whitelist.status === 'Whitelisted');
  const soon = isExpiringSoon(primaryIso) && !overdue;

  let borderStyle = {};
  if (overdue) borderStyle = { borderColor: '#c62828' };
  else if (soon) borderStyle = { borderColor: '#f57c00' };

  return (
    <article className="sketch-card flex flex-col gap-3 p-4" style={borderStyle}>
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-sketch text-xl font-bold" style={{ color: 'var(--text)' }}>
            {whitelist.name}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="sketch-chip">{whitelist.type}</span>
            <StatusBadge status={whitelist.status} />
          </div>
        </div>
        <div className="flex flex-none gap-1">
          <button
            type="button"
            onClick={() => onEdit(whitelist)}
            className="sketch-btn sketch-btn-ghost px-2 py-1 text-xs"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(whitelist)}
            className="sketch-btn sketch-btn-danger px-2 py-1 text-xs"
          >
            Delete
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <DeadlineLabel iso={whitelist.applicationDeadline} label="Apply by" />
        <DeadlineLabel iso={whitelist.mintDate} label="Mint" />
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <div className="uppercase tracking-wide font-bold" style={{ color: 'var(--text-muted)' }}>Wallet</div>
          <div style={{ color: 'var(--text)' }}>
            {wallet ? (
              <span>
                {wallet.label}{' '}
                <span style={{ color: 'var(--text-muted)' }} title={wallet.address}>
                  ({truncateAddress(wallet.address)})
                </span>
              </span>
            ) : (
              <span className="italic" style={{ color: 'var(--text-muted)' }}>Unassigned</span>
            )}
          </div>
        </div>
        <div>
          <div className="uppercase tracking-wide font-bold" style={{ color: 'var(--text-muted)' }}>Mint price</div>
          <div style={{ color: 'var(--text)' }}>
            {whitelist.mintPrice || '\u2014'}
          </div>
        </div>
      </div>

      {whitelist.notes ? (
        <p
          className="text-xs"
          style={{
            color: 'var(--text-muted)',
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
          className="sketch-link text-xs"
        >
          Open official site
        </a>
      ) : null}
    </article>
  );
}
