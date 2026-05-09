import React, { useMemo } from 'react';
import EmptyState from './EmptyState.jsx';
import { AIRDROP_STATUSES, WHITELIST_STATUSES } from '../constants/index.js';
import { resolveNetworkLabel } from '../utils/networks.js';

// Tailwind color mapping aligned with StatusBadge.jsx:
//   Active/Whitelisted/Minted -> emerald
//   Pending/Applied           -> yellow
//   Missed/Not Selected       -> red
//   Claimed                   -> blue
// We duplicate a small map here rather than altering StatusBadge so the
// badge component stays a pure visual primitive.
const STATUS_BAR_COLORS = {
  Active: 'bg-emerald-500',
  Whitelisted: 'bg-emerald-500',
  Minted: 'bg-emerald-500',
  Pending: 'bg-yellow-500',
  Applied: 'bg-yellow-500',
  Missed: 'bg-red-500',
  'Not Selected': 'bg-red-500',
  Claimed: 'bg-blue-500',
};

const FALLBACK_BAR_COLOR = 'bg-slate-500';

const MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

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

function pad2(n) {
  return String(n).padStart(2, '0');
}

function monthKey(year, monthIndex) {
  return `${year}-${pad2(monthIndex + 1)}`;
}

function SummaryTile({ title, value, hint }) {
  return (
    <div className="rounded-lg border border-surface2 bg-surface p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">{title}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-50">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

function StatusRow({ status, count, total }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  const pctLabel = total > 0 ? `${pct.toFixed(1)}%` : '0.0%';
  const barColor = STATUS_BAR_COLORS[status] || FALLBACK_BAR_COLOR;
  return (
    <li className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-200">{status}</span>
        <span className="text-slate-400">
          <span className="text-slate-200">{count}</span>
          <span className="mx-1 text-slate-500">/</span>
          <span>{total}</span>
          <span className="ml-2 text-slate-500">{pctLabel}</span>
        </span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-surface2"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
        aria-label={`${status} share`}
      >
        <div
          className={'h-full rounded-full ' + barColor}
          style={{ width: `${pct}%` }}
        />
      </div>
    </li>
  );
}

export default function Stats({ airdrops, whitelists, wallets }) {
  const safeAirdrops = Array.isArray(airdrops) ? airdrops : [];
  const safeWhitelists = Array.isArray(whitelists) ? whitelists : [];
  const safeWallets = Array.isArray(wallets) ? wallets : [];

  const summary = useMemo(() => {
    const totalAirdrops = safeAirdrops.length;
    const claimed = safeAirdrops.filter((a) => a.status === 'Claimed');
    const missed = safeAirdrops.filter((a) => a.status === 'Missed');
    const active = safeAirdrops.filter((a) => a.status === 'Active');

    const claimedCount = claimed.length;
    const missedCount = missed.length;
    const successDenominator = claimedCount + missedCount;
    const successRate =
      successDenominator > 0
        ? (claimedCount / successDenominator) * 100
        : null;

    const sumValue = (arr) =>
      arr.reduce((sum, a) => {
        const v = a.estimatedValueUsd;
        if (typeof v === 'number' && !Number.isNaN(v)) return sum + v;
        return sum;
      }, 0);

    return {
      totalAirdrops,
      successRate,
      collected: sumValue(claimed),
      potential: sumValue(active),
      claimedCount,
      missedCount,
    };
  }, [safeAirdrops]);

  const bestNetwork = useMemo(() => {
    const counts = new Map();
    for (const a of safeAirdrops) {
      if (a.status !== 'Claimed') continue;
      const key = typeof a.network === 'string' ? a.network : '';
      if (!key) continue;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    if (counts.size === 0) return null;
    let bestKey = null;
    let bestCount = -1;
    for (const [key, count] of counts.entries()) {
      if (count > bestCount) {
        bestKey = key;
        bestCount = count;
      }
    }
    return { key: bestKey, count: bestCount };
  }, [safeAirdrops]);

  const mostUsedWallet = useMemo(() => {
    const counts = new Map();
    const tally = (entries) => {
      for (const e of entries) {
        const id = e && typeof e.walletId === 'string' ? e.walletId : '';
        if (!id) continue;
        counts.set(id, (counts.get(id) || 0) + 1);
      }
    };
    tally(safeAirdrops);
    tally(safeWhitelists);
    if (counts.size === 0) return null;
    let bestId = null;
    let bestCount = -1;
    for (const [id, count] of counts.entries()) {
      if (count > bestCount) {
        bestId = id;
        bestCount = count;
      }
    }
    const wallet = safeWallets.find((w) => w.id === bestId);
    const label = wallet && wallet.label ? wallet.label : bestId;
    return { id: bestId, count: bestCount, label };
  }, [safeAirdrops, safeWhitelists, safeWallets]);

  const airdropStatusBreakdown = useMemo(() => {
    const total = safeAirdrops.length;
    return AIRDROP_STATUSES.map((status) => ({
      status,
      count: safeAirdrops.filter((a) => a.status === status).length,
      total,
    }));
  }, [safeAirdrops]);

  const whitelistStatusBreakdown = useMemo(() => {
    const total = safeWhitelists.length;
    return WHITELIST_STATUSES.map((status) => ({
      status,
      count: safeWhitelists.filter((w) => w.status === status).length,
      total,
    }));
  }, [safeWhitelists]);

  const monthlyActivity = useMemo(() => {
    const now = new Date();
    const anchor = new Date(now.getFullYear(), now.getMonth(), 1);
    const buckets = [];
    const index = new Map();
    for (let i = 11; i >= 0; i -= 1) {
      const d = new Date(anchor.getFullYear(), anchor.getMonth() - i, 1);
      const key = monthKey(d.getFullYear(), d.getMonth());
      const entry = {
        key,
        label: MONTH_SHORT[d.getMonth()],
        year: d.getFullYear(),
        month: d.getMonth(),
        count: 0,
      };
      buckets.push(entry);
      index.set(key, entry);
    }
    const bumpFrom = (iso) => {
      if (typeof iso !== 'string' || !iso.trim()) return;
      const parts = iso.trim().split('-');
      if (parts.length !== 3) return;
      const y = Number(parts[0]);
      const m = Number(parts[1]);
      const d = Number(parts[2]);
      if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) {
        return;
      }
      if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) {
        return;
      }
      const parsed = new Date(y, m - 1, d);
      if (Number.isNaN(parsed.getTime())) return;
      const key = monthKey(parsed.getFullYear(), parsed.getMonth());
      const bucket = index.get(key);
      if (bucket) bucket.count += 1;
    };
    for (const a of safeAirdrops) bumpFrom(a.createdAt);
    for (const w of safeWhitelists) bumpFrom(w.createdAt);
    const total = buckets.reduce((sum, b) => sum + b.count, 0);
    const maxCount = buckets.reduce(
      (m, b) => (b.count > m ? b.count : m),
      0,
    );
    return { buckets, total, maxCount };
  }, [safeAirdrops, safeWhitelists]);

  const successRateLabel =
    summary.successRate === null
      ? '\u2014'
      : `${summary.successRate.toFixed(0)}%`;

  const bestNetworkLabel = bestNetwork
    ? resolveNetworkLabel(bestNetwork.key)
    : '\u2014';
  const bestNetworkHint = bestNetwork
    ? `${bestNetwork.count} claimed airdrop${bestNetwork.count === 1 ? '' : 's'}`
    : 'No claimed airdrops yet';

  const mostUsedWalletLabel = mostUsedWallet
    ? mostUsedWallet.label || '\u2014'
    : '\u2014';
  const mostUsedWalletHint = mostUsedWallet
    ? `${mostUsedWallet.count} entr${mostUsedWallet.count === 1 ? 'y' : 'ies'} across airdrops and whitelists`
    : 'No wallet usage recorded yet';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-100">Stats</h2>
        <p className="text-xs text-slate-400">
          Read-only analytics across your tracked airdrops and whitelists.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryTile
          title="Total airdrops tracked"
          value={summary.totalAirdrops}
          hint="All statuses combined"
        />
        <SummaryTile
          title="Success rate"
          value={successRateLabel}
          hint={
            summary.successRate === null
              ? 'No claimed or missed airdrops yet'
              : `${summary.claimedCount} claimed / ${summary.claimedCount + summary.missedCount} decided`
          }
        />
        <SummaryTile
          title="Total value collected"
          value={formatUsd(summary.collected)}
          hint="Sum of Claimed airdrop values"
        />
        <SummaryTile
          title="Total potential value"
          value={formatUsd(summary.potential)}
          hint="Sum of Active airdrop values"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-surface2 bg-surface p-4">
          <h3 className="text-sm font-semibold text-slate-100">
            Best performing network
          </h3>
          <p className="mt-2 text-2xl font-semibold text-slate-50">
            {bestNetworkLabel}
          </p>
          <p className="mt-1 text-xs text-slate-500">{bestNetworkHint}</p>
        </section>
        <section className="rounded-lg border border-surface2 bg-surface p-4">
          <h3 className="text-sm font-semibold text-slate-100">
            Most used wallet
          </h3>
          <p className="mt-2 truncate text-2xl font-semibold text-slate-50">
            {mostUsedWalletLabel}
          </p>
          <p className="mt-1 text-xs text-slate-500">{mostUsedWalletHint}</p>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-surface2 bg-surface p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-100">
              Airdrops by status
            </h3>
            <span className="text-xs text-slate-500">
              {safeAirdrops.length} total
            </span>
          </div>
          {safeAirdrops.length === 0 ? (
            <EmptyState
              title="No airdrops yet"
              hint="Add an airdrop to see the status breakdown."
            />
          ) : (
            <ul className="space-y-3">
              {airdropStatusBreakdown.map((row) => (
                <StatusRow
                  key={row.status}
                  status={row.status}
                  count={row.count}
                  total={row.total}
                />
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg border border-surface2 bg-surface p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-100">
              Whitelists by status
            </h3>
            <span className="text-xs text-slate-500">
              {safeWhitelists.length} total
            </span>
          </div>
          {safeWhitelists.length === 0 ? (
            <EmptyState
              title="No whitelists yet"
              hint="Add a whitelist to see the status breakdown."
            />
          ) : (
            <ul className="space-y-3">
              {whitelistStatusBreakdown.map((row) => (
                <StatusRow
                  key={row.status}
                  status={row.status}
                  count={row.count}
                  total={row.total}
                />
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-lg border border-surface2 bg-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-100">
            Monthly activity
          </h3>
          <span className="text-xs text-slate-500">
            Entries added per month, last 12 months
          </span>
        </div>
        {monthlyActivity.total === 0 ? (
          <EmptyState
            title="No entries in the last 12 months"
            hint="Add airdrops or whitelists to populate this chart."
          />
        ) : (
          <div>
            <div className="flex h-40 items-end gap-1">
              {monthlyActivity.buckets.map((b) => {
                const pct =
                  monthlyActivity.maxCount > 0
                    ? (b.count / monthlyActivity.maxCount) * 100
                    : 0;
                return (
                  <div
                    key={b.key}
                    className="flex h-full flex-1 items-end"
                    title={`${b.label} ${b.year}: ${b.count} entr${b.count === 1 ? 'y' : 'ies'}`}
                  >
                    <div className="flex h-full w-full flex-col justify-end rounded-sm bg-surface2/60">
                      <div
                        className="w-full rounded-sm bg-accent-400"
                        style={{ height: `${pct}%` }}
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 flex gap-1">
              {monthlyActivity.buckets.map((b) => {
                const yearSuffix = String(b.year).slice(-2);
                const label =
                  b.month === 0 ? `${b.label} '${yearSuffix}` : b.label;
                return (
                  <div
                    key={b.key + '-label'}
                    className="flex-1 text-center text-[10px] uppercase tracking-wide text-slate-500"
                  >
                    {label}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
