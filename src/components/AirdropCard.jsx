import React, { useEffect, useRef, useState } from 'react';
import StatusBadge from './StatusBadge.jsx';
import DeadlineLabel from './DeadlineLabel.jsx';
import CardActionMenu from './CardActionMenu.jsx';
import TagChip from './TagChip.jsx';
import { Globe, TwitterX } from './icons.jsx';
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
  const [cardHeight, setCardHeight] = useState(null);
  const [isResizing, setIsResizing] = useState(false);
  const cardRef = useRef(null);
  useEffect(() => {
    setImgFailed(false);
  }, [airdrop.logoUrl]);

  const overdue = isPast(airdrop.deadline) && airdrop.status === 'Active';
  const soon = isExpiringSoon(airdrop.deadline) && !overdue;

  const networkColor = getNetworkColor(airdrop.network);
  const dLeft = daysUntil(airdrop.deadline);

  const handleResizeStart = (e) => {
    e.preventDefault();
    setIsResizing(true);
    const startY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
    const startHeight = cardRef.current.offsetHeight;

    const handleMove = (moveEvent) => {
      const currentY = moveEvent.type === 'touchmove' ? moveEvent.touches[0].clientY : moveEvent.clientY;
      const newHeight = Math.max(120, Math.min(800, startHeight + (currentY - startY)));
      setCardHeight(newHeight);
    };

    const handleEnd = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd);
  };

  return (
    <article
      ref={cardRef}
      className="sketchy-card group relative flex flex-col gap-3 overflow-hidden rounded-2xl p-4 md:p-5 transition-all duration-200"
      style={{borderLeft: soon ? '3px solid var(--accent)' : undefined, height: cardHeight ? `${cardHeight}px` : 'auto', overflow: 'hidden', transition: isResizing ? 'none' : 'height 0.2s ease', willChange: isResizing ? 'height' : undefined}}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(247,147,26,0.3)';
        e.currentTarget.style.boxShadow = '0 0 20px rgba(247,147,26,0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      <header className="relative flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {airdrop.logoUrl && !imgFailed ? (
            <img
              src={airdrop.logoUrl}
              alt=""
              className="h-10 w-10 flex-none rounded-full object-cover"
              style={{borderColor:'var(--border)'}}
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full text-sm font-semibold" style={{border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text-muted)'}}>
              {initials(airdrop.name)}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="text-base font-bold max-w-[calc(100%-48px)] truncate md:font-semibold md:max-w-none" style={{color:'var(--text)'}}>
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
        <div className="absolute top-0 right-0 flex-none md:static">
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
            <TagChip key={`${tag}-${i}`}>{tag}</TagChip>
          ))}
        </div>
      ) : null}

      <div className="flex items-start justify-between gap-3 md:grid md:grid-cols-2 md:items-stretch">
        <DeadlineLabel iso={airdrop.deadline} label="Deadline" />
        <div className="flex flex-col gap-0.5 text-xs">
          <span className="uppercase tracking-wide" style={{color:'var(--text-muted)'}}>
            Est. value
          </span>
          <span className="text-sm" style={{color:'var(--text)'}}>
            {formatUsd(airdrop.estimatedValueUsd)}
          </span>
        </div>
      </div>

      <div className="text-xs" style={{color:'var(--text-muted)'}}>
        <div className="uppercase tracking-wide" style={{color:'var(--text-muted)'}}>Wallet</div>
        <div style={{color:'var(--text)'}}>
          {wallet ? (
            <span>
              {wallet.label}{' '}
              <span style={{color:'var(--text-muted)'}} title={wallet.address}>
                ({truncateAddress(wallet.address)})
              </span>
            </span>
          ) : (
            <span className="italic" style={{color:'var(--text-muted)'}}>Unassigned</span>
          )}
        </div>
      </div>

      {airdrop.notes ? (
        <p className="text-xs line-clamp-2 md:line-clamp-3" style={{color:'var(--text-muted)'}}>
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
                className="mt-0.5 h-4 w-4 flex-none rounded text-primary focus:ring-2 focus:ring-primary/40"
                style={{borderColor:'var(--border)', background:'var(--surface)'}}
              />
              <label
                htmlFor={`task-${airdrop.id}-${task.id}`}
                className={
                  task.done
                    ? 'line-through'
                    : ''
                }
                style={{color: task.done ? 'var(--text-muted)' : 'var(--text)'}}
              >
                {task.label}
              </label>
            </li>
          ))}
        </ul>
      ) : null}

      {(airdrop.link || airdrop.twitterUrl) ? (
        <div className="flex items-center gap-3">
          {airdrop.link ? (
            <a
              href={airdrop.link}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Open official site"
              className="icon-link text-xs font-medium text-primary hover:text-primary/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm"
            >
              <Globe size={16} />
              <span className="hidden md:inline">Open official site</span>
            </a>
          ) : null}
          {airdrop.twitterUrl ? (
            <a
              href={airdrop.twitterUrl}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Twitter / X"
              className="icon-link text-xs font-medium text-textSecondary hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm"
            >
              <TwitterX size={16} />
              <span className="hidden md:inline">Twitter / X</span>
            </a>
          ) : null}
        </div>
      ) : null}

      <div
        onMouseDown={handleResizeStart}
        onTouchStart={handleResizeStart}
        style={{
          height: '20px',
          cursor: 'row-resize',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          touchAction: 'none',
          userSelect: 'none',
          opacity: 0.4,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.7'; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.4'; }}
      >
        <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: 'var(--border)' }} />
      </div>
    </article>
  );
}
