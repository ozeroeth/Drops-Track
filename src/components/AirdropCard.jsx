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
        <div className="flex min-w-0 items-center gap-3">
          {airdrop.logoUrl && !imgFailed ? (
            <img
              src={airdrop.logoUrl}
              alt=""
              className="h-10 w-10 flex-none rounded-full border border-surface2 object-cover"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full border border-surface2 bg-surface2 text-sm font-semibold text-slate-300">
              {initials(airdrop.name)}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-slate-50">
              {airdrop.name}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-md border border-surface2 bg-surface2 px-2 py-0.5 text-xs text-slate-300">
                {networkLabel(airdrop.network)}
              </span>
              <StatusBadge status={airdrop.status} />
            </div>
          </div>
        </div>
        <div className="flex flex-none gap-1">
          <button
            type="button"
            onClick={() => onEdit(airdrop)}
            className="rounded-md border border-surface2 bg-surface2 px-2 py-1 text-xs text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(airdrop)}
            className="rounded-md border border-red-500/40 bg-red-500/10 px-2 py-1 text-xs text-red-300 hover:bg-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-400/60"
          >
            Delete
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <DeadlineLabel iso={airdrop.deadline} label="Deadline" />
        <div className="flex flex-col gap-0.5 text-xs">
          <span className="uppercase tracking-wide text-slate-500">
            Est. value
          </span>
          <span className="text-sm text-slate-200">
            {formatUsd(airdrop.estimatedValueUsd)}
          </span>
        </div>
      </div>

      <div className="text-xs text-slate-400">
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

      {airdrop.notes ? (
        <p
          className="text-xs text-slate-400"
          style={{
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
                className="mt-0.5 h-4 w-4 flex-none rounded border-surface2 bg-surface2 text-accent-500 focus:ring-2 focus:ring-accent-500/40"
              />
              <label
                htmlFor={`task-${airdrop.id}-${task.id}`}
                className={
                  task.done
                    ? 'text-slate-500 line-through'
                    : 'text-slate-200'
                }
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
          className="text-xs font-medium text-accent-400 hover:text-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
        >
          Open official site
        </a>
      ) : null}
    </article>
  );
}
