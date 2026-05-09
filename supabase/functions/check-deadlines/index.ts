// DropTrack: check-deadlines edge function
//
// Intended to be invoked on a daily cron (e.g. "0 9 * * *" UTC from Supabase
// Database > Cron Jobs). For every user who has notify_enabled = true and a
// telegram_chat_id configured, it looks at their airdrops and whitelists and
// sends one Telegram message per matching row whose deadline is exactly
// `telegram_notify_days_before` days from today (UTC).
//
// All date comparisons are done in UTC because the stored dates are plain
// YYYY-MM-DD strings with no timezone context. Users in non-UTC timezones may
// see notifications fire up to a day earlier or later than their local
// calendar; that's a known and documented trade-off.

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

function esc(v: unknown): string {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildMessage(args: {
  name: unknown;
  date: unknown;
  daysLeft: number;
  network: unknown;
  value: unknown;
}): string {
  const { name, date, daysLeft, network, value } = args;
  const networkText = network ? esc(network) : '-';
  const valueText =
    value === null || value === undefined || value === ''
      ? '-'
      : '$' + esc(value);
  return (
    '\u{1F6A8} <b>DropTrack Deadline Alert</b>\n' +
    `\u{1F4CC} Project: ${esc(name)}\n` +
    `\u{23F0} Deadline: ${esc(date)} (${daysLeft} day${daysLeft === 1 ? '' : 's'} left)\n` +
    `\u{1F310} Network: ${networkText}\n` +
    `\u{1F4B0} Est. Value: ${valueText}\n` +
    '\u{1F449} Open DropTrack to take action'
  );
}

function utcTargetDate(daysBefore: number): string {
  const target = new Date();
  target.setUTCHours(0, 0, 0, 0);
  target.setUTCDate(target.getUTCDate() + daysBefore);
  return target.toISOString().slice(0, 10);
}

async function sendTelegram(
  token: string,
  chatId: string,
  text: string,
): Promise<{ ok: boolean; body: string }> {
  const resp = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    },
  );
  const body = await resp.text();
  return { ok: resp.ok, body };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !TELEGRAM_BOT_TOKEN) {
      return json(
        {
          error:
            'Missing required environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, TELEGRAM_BOT_TOKEN.',
        },
        500,
      );
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const { data: settingsRows, error: settingsError } = await admin
      .from('user_settings')
      .select('*')
      .eq('notify_enabled', true)
      .not('telegram_chat_id', 'is', null);

    if (settingsError) {
      return json(
        { error: `Failed to load user_settings: ${settingsError.message}` },
        500,
      );
    }

    let usersChecked = 0;
    let messagesSent = 0;
    const errors: string[] = [];

    for (const settings of settingsRows || []) {
      usersChecked++;
      const userId: string = settings.user_id;
      const chatId: string = String(settings.telegram_chat_id || '').trim();
      if (!chatId) continue;
      const daysBefore: number =
        typeof settings.telegram_notify_days_before === 'number'
          ? settings.telegram_notify_days_before
          : 3;
      const targetISO = utcTargetDate(daysBefore);

      try {
        const { data: airdropRows, error: airdropErr } = await admin
          .from('airdrops')
          .select('*')
          .eq('user_id', userId)
          .eq('deadline', targetISO)
          .eq('status', 'Active');
        if (airdropErr) {
          errors.push(
            `airdrops lookup failed for user ${userId}: ${airdropErr.message}`,
          );
        } else {
          for (const row of airdropRows || []) {
            try {
              const text = buildMessage({
                name: row.name,
                date: row.deadline,
                daysLeft: daysBefore,
                network: row.network,
                value: row.estimated_value,
              });
              const { ok, body } = await sendTelegram(
                TELEGRAM_BOT_TOKEN,
                chatId,
                text,
              );
              if (ok) {
                messagesSent++;
              } else {
                errors.push(
                  `telegram sendMessage failed for airdrop ${row.id}: ${body}`,
                );
              }
            } catch (e) {
              errors.push(
                `airdrop ${row.id} notification threw: ${(e as Error).message}`,
              );
            }
          }
        }

        const { data: whitelistApplyRows, error: whitelistApplyErr } =
          await admin
            .from('whitelists')
            .select('*')
            .eq('user_id', userId)
            .eq('application_deadline', targetISO)
            .eq('status', 'Applied');
        if (whitelistApplyErr) {
          errors.push(
            `whitelists(application) lookup failed for user ${userId}: ${whitelistApplyErr.message}`,
          );
        } else {
          for (const row of whitelistApplyRows || []) {
            try {
              const text = buildMessage({
                name: row.name,
                date: row.application_deadline,
                daysLeft: daysBefore,
                network: row.type,
                value: row.mint_price,
              });
              const { ok, body } = await sendTelegram(
                TELEGRAM_BOT_TOKEN,
                chatId,
                text,
              );
              if (ok) {
                messagesSent++;
              } else {
                errors.push(
                  `telegram sendMessage failed for whitelist(application) ${row.id}: ${body}`,
                );
              }
            } catch (e) {
              errors.push(
                `whitelist ${row.id} application notification threw: ${(e as Error).message}`,
              );
            }
          }
        }

        const { data: whitelistMintRows, error: whitelistMintErr } = await admin
          .from('whitelists')
          .select('*')
          .eq('user_id', userId)
          .eq('mint_date', targetISO)
          .in('status', ['Applied', 'Whitelisted']);
        if (whitelistMintErr) {
          errors.push(
            `whitelists(mint) lookup failed for user ${userId}: ${whitelistMintErr.message}`,
          );
        } else {
          for (const row of whitelistMintRows || []) {
            try {
              const text = buildMessage({
                name: row.name,
                date: row.mint_date,
                daysLeft: daysBefore,
                network: row.type,
                value: row.mint_price,
              });
              const { ok, body } = await sendTelegram(
                TELEGRAM_BOT_TOKEN,
                chatId,
                text,
              );
              if (ok) {
                messagesSent++;
              } else {
                errors.push(
                  `telegram sendMessage failed for whitelist(mint) ${row.id}: ${body}`,
                );
              }
            } catch (e) {
              errors.push(
                `whitelist ${row.id} mint notification threw: ${(e as Error).message}`,
              );
            }
          }
        }
      } catch (e) {
        errors.push(
          `user ${userId} processing threw: ${(e as Error).message}`,
        );
      }
    }

    return json({ usersChecked, messagesSent, errors });
  } catch (e) {
    return json(
      { error: `Unhandled error: ${(e as Error).message}` },
      500,
    );
  }
});
