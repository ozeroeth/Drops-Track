import React, { useEffect, useState } from 'react';
import StatusBadge from './StatusBadge.jsx';
import DeadlineLabel from './DeadlineLabel.jsx';
import CardActionMenu from './CardActionMenu.jsx';
import { isExpiringSoon, isPast, daysUntil } from '../utils/date.js';
import { resolveNetworkLabel } from '../utils/networks.js';

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

const NETWORK_COLORS = {
  ethereum: '#627EEA',
  solana: '#9945FF',
  base: '#0052FF',
  arbitrum: '#12AAFF',
  optimism: '#FF0420',
  bnb: '#F3BA2F',
  polygon: '#8247E5',
};

function getNetworkColor(network) {
  if (!network) return '#8892A4';
  const key = String(network).toLowerCase();
  return NETWORK_COLORS[key] || '#8892A4';
}

export default function AirdropCard({
  airdrop,
  wallet,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleTask,
}) {
  const [imgFailed, setImgFailed] = useState(false);
  useEffect(() => {
    setImgFailed(false);
  }, [airdrop.logoUrl]);

  const overdue = isPast(airdrop.deadline) && airdrop.status === 'Active';
  const soon = isExpiringSoon(airdrop.deadline) && !overdue;

  const networkColor = getNetworkColor(airdrop.network);
  const dLeft = daysUntil(airdrop.deadline);

  return (
    <article
      className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl p-5 transition-all duration-200"
      style={{
        background: 'rgba(13,17,23,0.85)',
        border: soon
          ? '1px solid rgba(247,147,26,0.3)'
          : '1px solid rgba(255,255,255,0.06)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(12px)',
        borderLeft: soon ? '3px solid #FF4757' : undefined,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(247,147,26,0.3)';
        e.currentTarget.style.boxShadow = '0 0 20px rgba(247,147,26,0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = soon
          ? 'rgba(247,147,26,0.3)'
          : 'rgba(255,255,255,0.06)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {airdrop.logoUrl && !imgFailed ? (
            <img
              src={airdrop.logoUrl}
              alt=""
              className="h-10 w-10 flex-none rounded-full border border-surfaceBorder object-cover"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full border border-surfaceBorder bg-surface text-sm font-semibold text-textSecondary">
              {initials(airdrop.name)}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-white">
              {airdrop.name}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: `${networkColor}26`,
                  color: networkColor,
                }}
              >
                {resolveNetworkLabel(airdrop.network)}
              </span>
              <StatusBadge status={airdrop.status} />
              {soon && dLeft !== null ? (
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: 'rgba(255,71,87,0.15)', color: '#FF4757' }}>
                  {'\u{1F525}'} {dLeft}d left
                </span>
              ) : null}
            </div>
          </div>
        </div>
        <div className="flex-none">
          <CardActionMenu
            onEdit={() => onEdit(airdrop)}
            onDuplicate={() => onDuplicate && onDuplicate(airdrop)}
            onDelete={() => onDelete(airdrop)}
          />
        </div>
      </header>

      {Array.isArray(airdrop.tags) && airdrop.tags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {airdrop.tags.map((tag, i) => (
            <span
              key={`${tag}-${i}`}
              className="inline-flex items-center rounded-full px-2 py-0.5 text-xs"
              style={{
                backgroundColor: 'rgba(247,147,26,0.1)',
                border: '1px solid rgba(247,147,26,0.2)',
                color: 'rgba(247,147,26,0.8)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <DeadlineLabel iso={airdrop.deadline} label="Deadline" />
        <div className="flex flex-col gap-0.5 text-xs">
          <span className="uppercase tracking-wide text-textSecondary">
            Est. value
          </span>
          <span className="text-sm text-white">
            {formatUsd(airdrop.estimatedValueUsd)}
          </span>
        </div>
      </div>

      <div className="text-xs text-textSecondary">
        <div className="uppercase tracking-wide text-textSecondary">Wallet</div>
        <div className="text-white/80">
          {wallet ? (
            <span>
              {wallet.label}{' '}
              <span className="text-textSecondary" title={wallet.address}>
                ({truncateAddress(wallet.address)})
              </span>
            </span>
          ) : (
            <span className="italic text-textSecondary">Unassigned</span>
          )}
        </div>
      </div>

      {airdrop.notes ? (
        <p
          className="text-xs text-textSecondary"
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
                className="mt-0.5 h-4 w-4 flex-none rounded border-surfaceBorder bg-surface text-primary focus:ring-2 focus:ring-primary/40"
              />
              <label
                htmlFor={`task-${airdrop.id}-${task.id}`}
                className={
                  task.done
                    ? 'text-textSecondary line-through'
                    : 'text-white/90'
                }
              >
                {task.label}
              </label>
            </li>
          ))}
        </ul>
      ) : null}

      {(airdrop.link || airdrop.twitterUrl) ? (
        <div className="flex flex-wrap items-center gap-3">
          {airdrop.link ? (
            <a
              href={airdrop.link}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium text-primary hover:text-primary/80 focus:outline-none"
            >
              Open official site
            </a>
          ) : null}
          {airdrop.twitterUrl ? (
            <a
              href={airdrop.twitterUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium text-textSecondary hover:text-white focus:outline-none"
            >
              <span style={{fontFamily: 'serif', fontWeight: 'bold'}}>{'\u{1D54F}'}</span> Twitter/X
            </a>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
