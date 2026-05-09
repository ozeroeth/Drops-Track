import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';
import Toast from './Toast.jsx';

const DAYS_OPTIONS = [1, 2, 3, 5, 7];

const inputClass =
  'w-full rounded-[10px] px-3 py-2 text-sm text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60';

const inputStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
};

const glassStyle = {
  background: 'rgba(13,17,23,0.85)',
  border: '1px solid rgba(255,255,255,0.06)',
  backdropFilter: 'blur(12px)',
};

export default function SettingsPage() {
  const { user, signOut } = useAuth();

  const [chatId, setChatId] = useState('');
  const [daysBefore, setDaysBefore] = useState(3);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [toast, setToast] = useState({ message: '', nonce: 0 });

  function showToast(message) {
    setToast((prev) => ({ message, nonce: prev.nonce + 1 }));
  }

  useEffect(() => {
    let cancelled = false;
    if (!user?.id) {
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }
    setLoading(true);
    supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          showToast(error.message || 'Could not load settings.');
          return;
        }
        if (data) {
          setChatId(data.telegram_chat_id || '');
          setDaysBefore(
            DAYS_OPTIONS.includes(data.telegram_notify_days_before)
              ? data.telegram_notify_days_before
              : 3,
          );
          setEnabled(!!data.notify_enabled);
        } else {
          setChatId('');
          setDaysBefore(3);
          setEnabled(false);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        showToast(err?.message || 'Could not load settings.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  async function handleSave(e) {
    e?.preventDefault?.();
    if (!user?.id || saving) return;
    setSaving(true);
    try {
      const trimmed = chatId.trim();
      const { error } = await supabase.from('user_settings').upsert(
        {
          user_id: user.id,
          telegram_chat_id: trimmed || null,
          telegram_notify_days_before: daysBefore,
          notify_enabled: enabled,
        },
        { onConflict: 'user_id' },
      );
      if (error) {
        showToast(error.message || 'Could not save settings.');
      } else {
        setChatId(trimmed);
        showToast('Settings saved!');
      }
    } catch (err) {
      showToast(err?.message || 'Could not save settings.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSendTest() {
    if (testing || saving) return;
    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        'send-test-notification',
      );
      if (error) {
        showToast(error.message || 'Could not send test notification.');
      } else if (data && data.error) {
        showToast(data.error);
      } else {
        showToast('Test notification sent!');
      }
    } catch (err) {
      showToast(err?.message || 'Could not send test notification.');
    } finally {
      setTesting(false);
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
    } catch (err) {
      showToast(err?.message || 'Sign out failed.');
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl p-5" style={glassStyle}>
        <h2 className="text-lg font-semibold text-white">
          Telegram notifications
        </h2>
        <p className="mt-2 text-sm text-textSecondary">
          Search <span className="font-mono text-white/80">@DropTrackBot</span>{' '}
          on Telegram, send <span className="font-mono text-white/80">/start</span>,
          and paste your Chat ID below. If the bot is not yet deployed, you can
          get your chat id from{' '}
          <span className="font-mono text-white/80">@userinfobot</span>.
        </p>

        <form onSubmit={handleSave} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="settings-chat-id"
              className="mb-1 block text-xs font-medium text-textSecondary"
            >
              Chat ID
            </label>
            <input
              id="settings-chat-id"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder="e.g. 123456789"
              disabled={loading || saving}
              className={inputClass}
              style={inputStyle}
            />
          </div>

          <div className="flex items-start gap-3">
            <input
              id="settings-enabled"
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              disabled={loading || saving}
              className="mt-0.5 h-4 w-4 cursor-pointer rounded border-surfaceBorder bg-surface text-primary accent-primary focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
            />
            <label
              htmlFor="settings-enabled"
              className="cursor-pointer select-none text-sm text-white/90"
            >
              Enable deadline notifications
            </label>
          </div>

          <div>
            <label
              htmlFor="settings-days-before"
              className="mb-1 block text-xs font-medium text-textSecondary"
            >
              Notify X days before deadline
            </label>
            <select
              id="settings-days-before"
              value={daysBefore}
              onChange={(e) => setDaysBefore(Number(e.target.value))}
              disabled={loading || saving}
              className={inputClass + ' sm:w-48'}
              style={inputStyle}
            >
              {DAYS_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'day' : 'days'}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="submit"
              disabled={loading || saving}
              className="rounded-xl px-4 py-1.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                background: 'linear-gradient(135deg, #F7931A, #E8820A)',
              }}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={handleSendTest}
              disabled={loading || saving || testing}
              className="rounded-lg border border-surfaceBorder px-3 py-1.5 text-sm font-medium text-textSecondary transition-colors hover:border-primary/40 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {testing ? 'Sending...' : 'Send test notification'}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl p-5" style={glassStyle}>
        <h2 className="text-lg font-semibold text-white">Account</h2>
        <p className="mt-2 text-sm text-textSecondary">
          Sign out of this device. Your data stays safe in Supabase and will be
          here when you sign back in.
        </p>
        <button
          type="button"
          onClick={handleSignOut}
          className="mt-4 rounded-lg border border-surfaceBorder px-3 py-1.5 text-sm font-medium text-textSecondary transition-colors hover:border-primary/40 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          Sign out
        </button>
      </section>

      <Toast message={toast.message} nonce={toast.nonce} />
    </div>
  );
}
