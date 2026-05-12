import React, { useEffect, useState } from 'react';
import StatusBadge from './StatusBadge.jsx';
import DeadlineLabel from './DeadlineLabel.jsx';
import { isExpiringSoon, isPast } from '../utils/date.js';
import { NETWORKS } from '../constants/index.js';

function networkLabel(id) {
  const match = NETWORKS.find((n) => n.id === id);
  return match ? match.label : id || 'Other';
}

function formatUsd(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '\u2014';
  try {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    });
  } catch (err) {
    return `$${Math.round(value)}`;
  }
}

function truncateAddress(addr) {
  if (!addr || typeof addr !== 'string') return '';
  if (addr.length <= 14) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function initials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function AirdropCard({
  airdrop,
  wallet,
  onEdit,
  onDelete,
  onToggleTask,
}) {
  const [imgFailed, setImgFailed] = useState(false);
  useEffect(() => {
    setImgFailed(false);
  }, [airdrop.logoUrl]);

  const overdue = isPast(airdrop.deadline) && airdrop.status === 'Active';
  const soon = isExpiringSoon(airdrop.deadline) && !overdue;

  let borderStyle = {};
  if (overdue) borderStyle = { borderColor: '#c62828' };
  else if (soon) borderStyle = { borderColor: '#f57c00' };

  return (
    <article className="sketch-card flex flex-col gap-3 p-4" style={borderStyle}>
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {airdrop.logoUrl && !imgFailed ? (
            <img
              src={airdrop.logoUrl}
              alt=""
              className="h-10 w-10 flex-none rounded-full object-cover"
              style={{ border: '2.5px solid var(--border)' }}
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div
              className="flex h-10 w-10 flex-none items-center justify-center rounded-full font-sketch text-lg font-bold"
              style={{ border: '2.5px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
            >
              {initials(airdrop.name)}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="truncate font-sketch text-xl font-bold" style={{ color: 'var(--text)' }}>
              {airdrop.name}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="sketch-chip">{networkLabel(airdrop.network)}</span>
              <StatusBadge status={airdrop.status} />
            </div>
          </div>
        </div>
        <div className="flex flex-none gap-1">
          <button
            type="button"
            onClick={() => onEdit(airdrop)}
            className="sketch-btn sketch-btn-ghost px-2 py-1 text-xs"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(airdrop)}
            className="sketch-btn sketch-btn-danger px-2 py-1 text-xs"
          >
            Delete
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <DeadlineLabel iso={airdrop.deadline} label="Deadline" />
        <div className="flex flex-col gap-0.5 text-xs">
          <span className="uppercase tracking-wide font-bold" style={{ color: 'var(--text-muted)' }}>Est. value</span>
          <span className="font-sketch text-2xl font-bold" style={{ color: 'var(--text)' }}>
            {formatUsd(airdrop.estimatedValueUsd)}
          </span>
        </div>
      </div>

      <div className="text-xs">
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

      {airdrop.notes ? (
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
          {airdrop.notes}
        </p>
      ) : null}

      {Array.isArray(airdrop.tasks) && airdrop.tasks.length > 0 ? (
        <ul className="space-y-1.5">
          {airdrop.tasks.map((task) => (
            <li key={task.id} className="flex items-start gap-2 text-sm">
              <input
                id={`task-${airdrop.id}-${task.id}`}
                type="checkbox"
                checked={!!task.done}
                onChange={() => onToggleTask(airdrop.id, task.id)}
                className="sketch-checkbox mt-0.5"
              />
              <label
                htmlFor={`task-${airdrop.id}-${task.id}`}
                style={{ color: task.done ? 'var(--text-muted)' : 'var(--text)' }}
                className={task.done ? 'line-through' : ''}
              >
                {task.label}
              </label>
            </li>
          ))}
        </ul>
      ) : null}

      {airdrop.link ? (
        <a
          href={airdrop.link}
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
