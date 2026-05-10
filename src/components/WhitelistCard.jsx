import React from 'react';
import StatusBadge from './StatusBadge.jsx';
import DeadlineLabel from './DeadlineLabel.jsx';
import CardActionMenu from './CardActionMenu.jsx';
import TagChip from './TagChip.jsx';
import { Globe, TwitterX } from './icons.jsx';
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
      className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl p-4 md:p-5 transition-all duration-200"
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
      <header className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-bold text-white max-w-[calc(100%-48px)] truncate md:font-semibold md:max-w-none">
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
        <div className="absolute top-0 right-0 flex-none md:static">
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
        <p className="text-xs text-textSecondary line-clamp-2 md:line-clamp-3">
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
