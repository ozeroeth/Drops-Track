import React, { useEffect, useState } from 'react';
import StatusBadge from './StatusBadge.jsx';
import DeadlineLabel from './DeadlineLabel.jsx';
import CardActionMenu from './CardActionMenu.jsx';
import TagChip from './TagChip.jsx';
import { Globe, TwitterX } from './icons.jsx';
import { isExpiringSoon, isPast, daysUntil, primaryWhitelistDeadline } from '../utils/date.js';

function initials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

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
  const dLeft = daysUntil(primaryIso);

  const [collapsed, setCollapsed] = useState(false);

  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [whitelist.logoUrl]);

  return (
    <article
      className="sketchy-card group relative flex flex-col gap-3 rounded-2xl p-4 md:p-5 transition-all duration-200"
      style={{
        borderLeft: soon ? '3px solid var(--accent)' : undefined,
        maxHeight: collapsed ? '120px' : '1000px',
        overflow: 'hidden',
        transition: 'max-height 0.3s ease',
      }}
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
          {whitelist.logoUrl && !imgFailed ? (
            <img
              src={whitelist.logoUrl}
              alt=""
              className="h-10 w-10 flex-none rounded-full object-cover"
              style={{borderColor:'var(--border)'}}
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full text-sm font-semibold" style={{border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text-muted)'}}>
              {initials(whitelist.name)}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="text-base font-bold max-w-[calc(100%-48px)] truncate md:font-semibold md:max-w-none" style={{color:'var(--text)'}}>
              {whitelist.name}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <span
                className="whitespace-nowrap inline-flex items-center rounded-full px-2 py-0.5 text-xs"
                style={{border:'1px solid var(--border)', color:'var(--text-muted)'}}
              >
                {whitelist.type}
              </span>
              <StatusBadge status={whitelist.status} />
              {soon && dLeft !== null ? (
                <span className="whitespace-nowrap inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: 'rgba(255,71,87,0.15)', color: '#FF4757' }}>
                  {'\u{1F525}'} {dLeft}d left
                </span>
              ) : null}
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 flex-none md:static flex items-center gap-1">
          <button
            onClick={() => setCollapsed(c => !c)}
            aria-label={collapsed ? 'Expand card' : 'Collapse card'}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.3s ease',
              transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)',
              color: 'var(--text-muted)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          <CardActionMenu
            onEdit={() => onEdit(whitelist)}
            onDuplicate={() => onDuplicate && onDuplicate(whitelist)}
            onDelete={() => onDelete(whitelist)}
          />
        </div>
      </header>

      {Array.isArray(whitelist.tags) && whitelist.tags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {whitelist.tags.map((tag, i) => (
            <TagChip key={`${tag}-${i}`}>{tag}</TagChip>
          ))}
        </div>
      ) : null}

      <div>
        <DeadlineLabel iso={whitelist.mintDate} label="Mint" />
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
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
        <div>
          <div className="uppercase tracking-wide" style={{color:'var(--text-muted)'}}>Mint price</div>
          <div style={{color:'var(--text)'}}>
            {whitelist.mintPrice || '\u2014'}
          </div>
        </div>
      </div>

      {whitelist.notes ? (
        <p className="text-xs line-clamp-2 md:line-clamp-3" style={{color:'var(--text-muted)'}}>
          {whitelist.notes}
        </p>
      ) : null}

      {(whitelist.link || whitelist.twitterUrl) ? (
        <div className="flex items-center gap-3">
          {whitelist.link ? (
            <a
              href={whitelist.link}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Open official site"
              className="icon-link text-xs font-medium text-primary hover:text-primary/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm"
            >
              <Globe size={16} />
              <span className="hidden md:inline">Open official site</span>
            </a>
          ) : null}
          {whitelist.twitterUrl ? (
            <a
              href={whitelist.twitterUrl}
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
    </article>
  );
}
