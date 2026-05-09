import React from 'react';
import StatusBadge from './StatusBadge.jsx';
import DeadlineLabel from './DeadlineLabel.jsx';
import CardActionMenu from './CardActionMenu.jsx';
import { isExpiringSoon, isPast, daysUntil, primaryWhitelistDeadline } from '../utils/date.js';

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
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-white">
            {whitelist.name}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center rounded-full border border-surfaceBorder px-2 py-0.5 text-xs text-textSecondary"
            >
              {whitelist.type}
            </span>
            <StatusBadge status={whitelist.status} />
            {soon && dLeft !== null ? (
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: 'rgba(255,71,87,0.15)', color: '#FF4757' }}>
                {'\u{1F525}'} {dLeft}d left
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex-none">
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
        <DeadlineLabel iso={whitelist.applicationDeadline} label="Apply by" />
        <DeadlineLabel iso={whitelist.mintDate} label="Mint" />
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
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
        <div>
          <div className="uppercase tracking-wide text-textSecondary">Mint price</div>
          <div className="text-white/80">
            {whitelist.mintPrice || '\u2014'}
          </div>
        </div>
      </div>

      {whitelist.notes ? (
        <p
          className="text-xs text-textSecondary"
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

      {(whitelist.link || whitelist.twitterUrl) ? (
        <div className="flex flex-wrap items-center gap-3">
          {whitelist.link ? (
            <a
              href={whitelist.link}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium text-primary hover:text-primary/80 focus:outline-none"
            >
              Open official site
            </a>
          ) : null}
          {whitelist.twitterUrl ? (
            <a
              href={whitelist.twitterUrl}
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
