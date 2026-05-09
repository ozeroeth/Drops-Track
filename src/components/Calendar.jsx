import React, { useMemo, useState } from 'react';
import EmptyState from './EmptyState.jsx';
import DeadlineLabel from './DeadlineLabel.jsx';
import StatusBadge from './StatusBadge.jsx';
import { daysUntil, formatDate } from '../utils/date.js';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function pad2(n) {
  return String(n).padStart(2, '0');
}

function toDayIso(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function parseIsoDay(iso) {
  if (typeof iso !== 'string') return null;
  const trimmed = iso.trim();
  if (!trimmed) return null;
  const parts = trimmed.split('-');
  if (parts.length !== 3) return null;
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) {
    return null;
  }
  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) {
    return null;
  }
  const normalized = new Date(y, m - 1, d);
  if (Number.isNaN(normalized.getTime())) return null;
  // Normalize to local Y-M-D at midnight so we can bucket by day.
  return { iso: toDayIso(normalized), date: normalized };
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date, delta) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

function urgencyFor(iso) {
  const n = daysUntil(iso);
  if (n === null) return 'unknown';
  if (n < 0) return 'past';
  if (n <= 3) return 'soon';
  return 'future';
}

// Priority: past (red) > soon (orange) > future (green) > unknown (slate).
const URGENCY_RANK = { past: 0, soon: 1, future: 2, unknown: 3 };
const URGENCY_DOT_CLASS = {
  past: 'bg-red-500',
  soon: 'bg-orange-500',
  future: 'bg-emerald-500',
  unknown: 'bg-slate-500',
};

function mostUrgent(events) {
  let best = null;
  for (const ev of events) {
    if (best === null) {
      best = ev.urgency;
      continue;
    }
    if (URGENCY_RANK[ev.urgency] < URGENCY_RANK[best]) {
      best = ev.urgency;
    }
  }
  return best || 'unknown';
}

function buildEvents(airdrops, whitelists) {
  const safeAirdrops = Array.isArray(airdrops) ? airdrops : [];
  const safeWhitelists = Array.isArray(whitelists) ? whitelists : [];
  const byDay = new Map();

  const push = (iso, event) => {
    const parsed = parseIsoDay(iso);
    if (!parsed) return;
    const bucket = byDay.get(parsed.iso) || [];
    bucket.push({ ...event, iso: parsed.iso, urgency: urgencyFor(parsed.iso) });
    byDay.set(parsed.iso, bucket);
  };

  for (const a of safeAirdrops) {
    push(a.deadline, {
      kind: 'airdrop',
      id: a.id,
      name: a.name,
      status: a.status,
      source: a,
      label: 'Deadline',
    });
  }
  for (const w of safeWhitelists) {
    if (w.applicationDeadline) {
      push(w.applicationDeadline, {
        kind: 'whitelist-apply',
        id: w.id,
        name: w.name,
        status: w.status,
        source: w,
        label: 'Apply by',
      });
    }
    if (w.mintDate) {
      push(w.mintDate, {
        kind: 'whitelist-mint',
        id: w.id,
        name: w.name,
        status: w.status,
        source: w,
        label: 'Mint',
      });
    }
  }

  return byDay;
}

function KindLabel({ kind }) {
  let text = 'Airdrop';
  if (kind === 'whitelist-apply') text = 'Whitelist apply';
  else if (kind === 'whitelist-mint') text = 'Whitelist mint';
  return (
    <span className="inline-flex items-center rounded-full border border-surface2 bg-surface2/60 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-300">
      {text}
    </span>
  );
}

export default function Calendar({ airdrops, whitelists }) {
  const today = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }, []);
  const todayIso = useMemo(() => toDayIso(today), [today]);

  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(today));
  const [selectedIso, setSelectedIso] = useState(todayIso);

  const eventsByDay = useMemo(
    () => buildEvents(airdrops, whitelists),
    [airdrops, whitelists],
  );

  const grid = useMemo(() => {
    const firstOfMonth = startOfMonth(currentMonth);
    const weekday = firstOfMonth.getDay(); // 0 (Sun) .. 6 (Sat)
    const start = new Date(
      firstOfMonth.getFullYear(),
      firstOfMonth.getMonth(),
      firstOfMonth.getDate() - weekday,
    );
    const cells = [];
    for (let i = 0; i < 42; i += 1) {
      const cellDate = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate() + i,
      );
      const iso = toDayIso(cellDate);
      const events = eventsByDay.get(iso) || [];
      cells.push({
        date: cellDate,
        iso,
        inMonth:
          cellDate.getFullYear() === firstOfMonth.getFullYear() &&
          cellDate.getMonth() === firstOfMonth.getMonth(),
        isToday:
          cellDate.getFullYear() === today.getFullYear() &&
          cellDate.getMonth() === today.getMonth() &&
          cellDate.getDate() === today.getDate(),
        events,
      });
    }
    return cells;
  }, [currentMonth, eventsByDay, today]);

  const selectedEvents = useMemo(() => {
    return eventsByDay.get(selectedIso) || [];
  }, [eventsByDay, selectedIso]);

  const monthTitle = `${MONTH_LABELS[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;

  const goPrev = () => setCurrentMonth((m) => addMonths(m, -1));
  const goNext = () => setCurrentMonth((m) => addMonths(m, 1));
  const goToday = () => {
    setCurrentMonth(startOfMonth(today));
    setSelectedIso(todayIso);
  };

  const navButtonClass =
    'inline-flex items-center justify-center rounded-md border border-surface2 bg-surface2/60 px-2 py-1 text-sm text-slate-200 transition-colors hover:border-accent-500/60 hover:text-slate-50 focus:outline-none focus:ring-2 focus:ring-accent-500/40';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-100">Calendar</h2>
        <p className="text-xs text-slate-400">
          Airdrop deadlines and whitelist apply/mint dates laid out by day.
        </p>
      </div>

      <section className="rounded-lg border border-surface2 bg-surface p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goPrev}
              className={navButtonClass}
              aria-label="Previous month"
            >
              &larr;
            </button>
            <button
              type="button"
              onClick={goNext}
              className={navButtonClass}
              aria-label="Next month"
            >
              &rarr;
            </button>
          </div>
          <h3 className="text-sm font-semibold text-slate-100 sm:text-base">
            {monthTitle}
          </h3>
          <button
            type="button"
            onClick={goToday}
            className={navButtonClass}
            aria-label="Jump to today"
          >
            Today
          </button>
        </div>

        <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[10px] uppercase tracking-wide text-slate-500">
          {WEEKDAYS.map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {grid.map((cell) => {
            const isSelected = cell.iso === selectedIso;
            const hasEvents = cell.events.length > 0;
            const dotUrgency = hasEvents ? mostUrgent(cell.events) : null;
            const dotClass = dotUrgency
              ? URGENCY_DOT_CLASS[dotUrgency]
              : 'bg-transparent';

            const base =
              'flex h-16 flex-col justify-between rounded-md border px-1.5 py-1 text-left text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500/40 sm:h-20';
            let stateClasses;
            if (cell.isToday) {
              stateClasses =
                'border-accent-500/70 bg-surface2/70 text-slate-100 ring-1 ring-accent-500/40';
            } else if (isSelected) {
              stateClasses =
                'border-accent-500/60 bg-surface2/60 text-slate-100';
            } else if (cell.inMonth) {
              stateClasses =
                'border-surface2 bg-surface/70 text-slate-200 hover:border-accent-500/40 hover:bg-surface2/60';
            } else {
              stateClasses =
                'border-surface2/60 bg-surface/40 text-slate-500 hover:border-accent-500/30 hover:text-slate-300';
            }

            return (
              <button
                key={cell.iso}
                type="button"
                onClick={() => setSelectedIso(cell.iso)}
                aria-pressed={isSelected}
                aria-current={cell.isToday ? 'date' : undefined}
                aria-label={`${cell.iso}${
                  hasEvents
                    ? `, ${cell.events.length} event${cell.events.length === 1 ? '' : 's'}`
                    : ''
                }`}
                className={base + ' ' + stateClasses}
              >
                <span className="text-[11px] font-medium leading-none">
                  {cell.date.getDate()}
                </span>
                <span className="flex items-center gap-1">
                  {hasEvents ? (
                    <>
                      <span
                        className={
                          'inline-block h-2 w-2 rounded-full ' + dotClass
                        }
                        aria-hidden="true"
                      />
                      {cell.events.length > 1 ? (
                        <span className="rounded-full border border-surface2 bg-surface2/80 px-1 text-[9px] font-semibold text-slate-200">
                          {cell.events.length}
                        </span>
                      ) : null}
                    </>
                  ) : (
                    <span className="inline-block h-2 w-2" aria-hidden="true" />
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-wide text-slate-500">
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
            Past
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-orange-500" />
            Within 3 days
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            Upcoming
          </span>
        </div>
      </section>

      <section className="rounded-lg border border-surface2 bg-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-100">
            Events on {formatDate(selectedIso)}
          </h3>
          <span className="text-xs text-slate-500">
            {selectedEvents.length} event
            {selectedEvents.length === 1 ? '' : 's'}
          </span>
        </div>
        {selectedEvents.length === 0 ? (
          <EmptyState
            title="No events on this day"
            hint="Pick a different day or add entries with matching dates."
          />
        ) : (
          <ul className="space-y-2">
            {selectedEvents.map((ev, idx) => (
              <li
                key={`${ev.kind}-${ev.id}-${idx}`}
                className="flex flex-col gap-2 rounded-md border border-surface2 bg-surface/60 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-100">
                    {ev.name}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <KindLabel kind={ev.kind} />
                    {ev.status ? <StatusBadge status={ev.status} /> : null}
                  </div>
                </div>
                <DeadlineLabel iso={ev.iso} label={ev.label} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
