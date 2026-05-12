// DropTrack: send-test-notification edge function
//
// Invoked by the Settings page "Send test notification" button. Verifies the
// caller's JWT, looks up their saved telegram_chat_id, and posts a fixed
// message to Telegram so the user can confirm their chat id and bot token
// are wired up correctly.

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !TELEGRAM_BOT_TOKEN) {
      return json(
        {
          error:
            'Missing required environment variables: SUPABASE_URL, SUPABASE_ANON_KEY, TELEGRAM_BOT_TOKEN.',
        },
        500,
      );
    }

    const authHeader = req.headers.get('Authorization') || '';
    if (!authHeader) {
      return json({ error: 'Missing Authorization header.' }, 401);
    }

    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });

    const {
      data: { user },
      error: userError,
    } = await client.auth.getUser();

    if (userError || !user) {
      return json({ error: 'Not authenticated.' }, 401);
    }

    const { data: settings, error: settingsError } = await client
      .from('user_settings')
      .select('telegram_chat_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (settingsError) {
      return json(
        { error: `Could not load settings: ${settingsError.message}` },
        500,
      );
    }

    const chatId =
      settings && settings.telegram_chat_id
        ? String(settings.telegram_chat_id).trim()
        : '';
    if (!chatId) {
      return json(
        {
          error:
            'No Telegram chat ID configured. Save your chat ID first.',
        },
        400,
      );
    }

    const resp = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: 'DropTrack: test notification received! Your setup is working.',
          parse_mode: 'HTML',
        }),
      },
    );

    if (!resp.ok) {
      const body = await resp.text();
      return json(
        { error: `Telegram sendMessage failed: ${body}` },
        500,
      );
    }

    return json({ ok: true });
  } catch (e) {
    return json(
      { error: `Unhandled error: ${(e as Error).message}` },
      500,
    );
  }
});
