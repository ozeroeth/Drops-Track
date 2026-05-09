import React, { useMemo } from 'react';
import StatusBadge from './StatusBadge.jsx';
import DeadlineLabel from './DeadlineLabel.jsx';
import EmptyState from './EmptyState.jsx';
import { daysUntil, isExpiringSoon } from '../utils/date.js';
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
  const base =
    'rounded-lg border border-surface2 bg-surface p-4 text-left transition-colors';
  const interactive = onClick
    ? ' hover:border-accent-500/60 hover:bg-surface2 focus:outline-none focus:ring-2 focus:ring-accent-500/40'
    : '';
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={base + interactive}
    >
      <p className="text-xs uppercase tracking-wide text-slate-400">{title}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-50">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </Tag>
  );
}

function UpcomingItem({ title, subtitle, iso, label, highlight }) {
  const borderClass = highlight
    ? 'border-orange-500/60'
    : 'border-surface2';
  return (
    <li
      className={
        'flex items-center justify-between gap-3 rounded-md border bg-surface/60 px-3 py-2 ' +
        borderClass
      }
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-100">{title}</p>
        <div className="mt-0.5 text-xs text-slate-400">{subtitle}</div>
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
      const iso = w.applicationDeadline || w.mintDate;
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
      .filter((w) => (w.applicationDeadline || w.mintDate))
      .sort((a, b) => {
        const ai = a.applicationDeadline || a.mintDate;
        const bi = b.applicationDeadline || b.mintDate;
        const da = daysUntil(ai);
        const db = daysUntil(bi);
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
        <section className="rounded-lg border border-surface2 bg-surface p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-100">
              Upcoming Airdrop Deadlines
            </h3>
            <button
              type="button"
              onClick={onJumpToAirdrops}
              className="text-xs text-accent-400 hover:text-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
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

        <section className="rounded-lg border border-surface2 bg-surface p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-100">
              Upcoming Whitelist Mints
            </h3>
            <button
              type="button"
              onClick={onJumpToWhitelists}
              className="text-xs text-accent-400 hover:text-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
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
                const iso = w.applicationDeadline || w.mintDate;
                const label = w.applicationDeadline ? 'Apply by' : 'Mint';
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
