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

const URGENCY_RANK = { past: 0, soon: 1, future: 2, unknown: 3 };
const URGENCY_DOT_CLASS = {
  past: 'bg-danger',
  soon: 'bg-warning',
  future: 'bg-success',
  unknown: 'bg-textSecondary',
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
    <span className="inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] uppercase tracking-wide" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
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
    const weekday = firstOfMonth.getDay();
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
    'sketchy-btn-ghost px-2.5 py-1.5 text-sm';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Calendar</h2>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Airdrop deadlines and whitelist apply/mint dates laid out by day.
        </p>
      </div>

      <section className="sketchy-card p-5">
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
          <h3 className="text-sm font-semibold sm:text-base" style={{ color: 'var(--text)' }}>
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

        <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
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
              'flex h-16 flex-col justify-between rounded-lg border px-1.5 py-1 text-left text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 sm:h-20';
            let stateClasses;
            if (cell.isToday) {
              stateClasses =
                'border-primary bg-surface text-white ring-1 ring-primary/40';
            } else if (isSelected) {
              stateClasses =
                'border-primary/60 bg-surfaceBorder text-white';
            } else if (cell.inMonth) {
              stateClasses =
                'border-surfaceBorder bg-surface text-white/80 hover:border-primary/40 hover:bg-surfaceBorder';
            } else {
              stateClasses =
                'border-surfaceBorder/60 bg-bg text-textSecondary hover:border-primary/30 hover:text-white/70';
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
                        <span className="rounded-full border border-surfaceBorder px-1 text-[9px] font-semibold text-white/80">
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

        <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-danger" />
            Past
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-warning" />
            Within 3 days
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-success" />
            Upcoming
          </span>
        </div>
      </section>

      <section className="sketchy-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
            Events on {formatDate(selectedIso)}
          </h3>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
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
                className="flex flex-col gap-2 rounded-xl px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                style={{ background: 'var(--surface)', border: '2.5px solid var(--border)' }}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium" style={{ color: 'var(--text)' }}>
                    {ev.name}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
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
