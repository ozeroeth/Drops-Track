import React, { useMemo } from 'react';
import StatusBadge from './StatusBadge.jsx';
import DeadlineLabel from './DeadlineLabel.jsx';
import EmptyState from './EmptyState.jsx';
import { daysUntil, isExpiringSoon, primaryWhitelistDeadline } from '../utils/date.js';
import { NETWORKS } from '../constants/index.js';

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

function networkLabel(id) {
  const match = NETWORKS.find((n) => n.id === id);
  return match ? match.label : id || '';
}

function SummaryCard({ title, value, hint, onClick }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className="sketchy-card p-4 text-left"
    >
      <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{title}</p>
      <p className="mt-1 font-sketch text-2xl font-bold" style={{ color: 'var(--text)' }}>{value}</p>
      {hint ? <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>{hint}</p> : null}
    </Tag>
  );
}

function UpcomingItem({ title, subtitle, iso, label, highlight }) {
  const borderStyle = highlight ? { borderColor: '#f57c00' } : {};
  return (
    <li
      className="sketchy-card flex items-center justify-between gap-3 px-3 py-2"
      style={{ ...borderStyle, boxShadow: '2px 2px 0 var(--shadow)', borderWidth: '2px' }}
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium" style={{ color: 'var(--text)' }}>{title}</p>
        <div className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>{subtitle}</div>
      </div>
      <DeadlineLabel iso={iso} label={label} />
    </li>
  );
}

export default function Dashboard({
  airdrops,
  whitelists,
  onJumpToAirdrops,
  onJumpToWhitelists,
}) {
  const stats = useMemo(() => {
    const activeAirdrops = airdrops.filter((a) => a.status === 'Active');
    const whitelisted = whitelists.filter(
      (w) => w.status === 'Whitelisted' || w.status === 'Minted',
    );
    const totalValue = activeAirdrops.reduce((sum, a) => {
      return typeof a.estimatedValueUsd === 'number' && !Number.isNaN(a.estimatedValueUsd)
        ? sum + a.estimatedValueUsd
        : sum;
    }, 0);
    const airdropsThisWeek = airdrops.filter((a) => {
      const d = daysUntil(a.deadline);
      return d !== null && d >= 0 && d <= 7;
    }).length;
    const whitelistsThisWeek = whitelists.filter((w) => {
      if (w.status !== 'Applied' && w.status !== 'Whitelisted') return false;
      const iso = primaryWhitelistDeadline(w);
      const d = daysUntil(iso);
      return d !== null && d >= 0 && d <= 7;
    }).length;
    return {
      activeAirdrops: activeAirdrops.length,
      whitelisted: whitelisted.length,
      totalValue,
      deadlinesThisWeek: airdropsThisWeek + whitelistsThisWeek,
    };
  }, [airdrops, whitelists]);

  const upcomingAirdrops = useMemo(() => {
    return airdrops
      .filter((a) => a.status === 'Active')
      .filter((a) => daysUntil(a.deadline) !== null)
      .slice()
      .sort((a, b) => {
        const da = daysUntil(a.deadline);
        const db = daysUntil(b.deadline);
        if (da === null && db === null) return 0;
        if (da === null) return 1;
        if (db === null) return -1;
        return da - db;
      })
      .slice(0, 5);
  }, [airdrops]);

  const upcomingWhitelists = useMemo(() => {
    return whitelists
      .slice()
      .filter((w) => w.status === 'Applied' || w.status === 'Whitelisted')
      .filter((w) => {
        const iso = primaryWhitelistDeadline(w);
        const d = daysUntil(iso);
        return d !== null && d >= 0;
      })
      .sort((a, b) => {
        const da = daysUntil(primaryWhitelistDeadline(a));
        const db = daysUntil(primaryWhitelistDeadline(b));
        if (da === null && db === null) return 0;
        if (da === null) return 1;
        if (db === null) return -1;
        return da - db;
      })
      .slice(0, 5);
  }, [whitelists]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Active Airdrops"
          value={stats.activeAirdrops}
          hint="Click to open Airdrops tab"
          onClick={onJumpToAirdrops}
        />
        <SummaryCard
          title="Whitelisted"
          value={stats.whitelisted}
          hint="Whitelisted or Minted"
          onClick={onJumpToWhitelists}
        />
        <SummaryCard
          title="Estimated Total Value"
          value={formatUsd(stats.totalValue)}
          hint="Active airdrops only"
        />
        <SummaryCard
          title="Deadlines This Week"
          value={stats.deadlinesThisWeek}
          hint="Airdrops + whitelists, next 7 days"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="sketchy-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-sketch text-base font-semibold" style={{ color: 'var(--text)' }}>
              Upcoming Airdrop Deadlines
            </h3>
            <button
              type="button"
              onClick={onJumpToAirdrops}
              className="text-xs font-sketch font-semibold"
              style={{ color: 'var(--accent)' }}
            >
              View all
            </button>
          </div>
          {upcomingAirdrops.length === 0 ? (
            <EmptyState
              title="No active airdrops"
              hint="Add an airdrop from the Airdrops tab to see deadlines here."
            />
          ) : (
            <ul className="space-y-2">
              {upcomingAirdrops.map((a) => (
                <UpcomingItem
                  key={a.id}
                  title={a.name}
                  subtitle={
                    <span className="flex items-center gap-2">
                      <span>{networkLabel(a.network)}</span>
                      <StatusBadge status={a.status} />
                    </span>
                  }
                  iso={a.deadline}
                  label="Deadline"
                  highlight={isExpiringSoon(a.deadline)}
                />
              ))}
            </ul>
          )}
        </section>

        <section className="sketchy-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-sketch text-base font-semibold" style={{ color: 'var(--text)' }}>
              Upcoming Whitelist Mints
            </h3>
            <button
              type="button"
              onClick={onJumpToWhitelists}
              className="text-xs font-sketch font-semibold"
              style={{ color: 'var(--accent)' }}
            >
              View all
            </button>
          </div>
          {upcomingWhitelists.length === 0 ? (
            <EmptyState
              title="No whitelist entries"
              hint="Add a whitelist from the Whitelists tab to see upcoming mints."
            />
          ) : (
            <ul className="space-y-2">
              {upcomingWhitelists.map((w) => {
                const iso = primaryWhitelistDeadline(w);
                const label =
                  w.status === 'Whitelisted' || w.status === 'Minted'
                    ? 'Mint'
                    : 'Apply by';
                return (
                  <UpcomingItem
                    key={w.id}
                    title={w.name}
                    subtitle={
                      <span className="flex items-center gap-2">
                        <span>{w.type}</span>
                        <StatusBadge status={w.status} />
                      </span>
                    }
                    iso={iso}
                    label={label}
                    highlight={isExpiringSoon(iso)}
                  />
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
