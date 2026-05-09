# DropTrack

A small personal tracker for DeFi airdrops and NFT whitelist opportunities, with login, Supabase-backed storage, and optional Telegram deadline notifications.

## Overview

DropTrack is a personal productivity tool for keeping tabs on DeFi/NFT airdrops and whitelist opportunities. You sign in with Google or an email/password, and your entries sync to Supabase Postgres under Row Level Security, so only you can see them. On first login, DropTrack seeds a handful of realistic sample airdrops, whitelists, and wallets so the dashboard is not empty while you learn the UI. Delete them whenever you're ready to use your own data. Export to CSV any time you want a backup you can keep outside the database.

## Features

- Login with Google or email/password (Supabase Auth). Each user sees only their own data via Postgres RLS.
- Optional Telegram deadline notifications: set your chat ID on the Settings page and an edge function will DM you N days before each deadline.
- Airdrop tracker with status, network, deadline, estimated value, per-task checklist, linked wallet, notes, and link.
- Whitelist tracker for NFT mints, token sales, and beta access, with application deadline and mint date.
- Dashboard overview with summary counts and deadline alerts (entries due within 3 days are highlighted).
- Stats tab with total airdrops tracked, success rate, total value collected vs. potential value, best-performing network, most-used wallet, per-status breakdown bars for airdrops and whitelists, and a 12-month activity bar chart.
- Calendar tab with a month view, prev/next/today navigation, colored deadline dots (red for overdue, orange for due within 3 days, green for upcoming), and a per-day event list covering airdrop deadlines plus whitelist application and mint dates.
- Custom networks on airdrops: pick **Custom...** in the Network dropdown on the Airdrop form to add your own label. Saved labels show in the dropdown with a small pencil marker and are persisted across reloads.
- Duplicate entry: every Airdrop and Whitelist card has a Duplicate button that clones the row (fresh id, reset status, `(Copy)` suffix) and shows a short toast so you can quickly fork a template entry.
- Tag system: Airdrops and Whitelists both accept free-form tags plus a shortlist of suggested tags (`tier-1`, `confirmed`, `low-effort`, `high-risk`, `long-term`, `testnet`). Tags render as chips on each card, and both list pages have a Tag filter that unions the tags present in the collection.
- Wallet manager for labelling the addresses you apply with (EVM, Solana, or Other).
- CSV import and export for all three collections, so you can back up or move your data.
- Dark theme by default.
- Mobile responsive layout that collapses the card grid on small screens.

## Tech Stack

- React 18
- Vite 5
- Tailwind CSS 3
- Supabase (Postgres, Auth, Edge Functions) for data, login, and scheduled Telegram notifications

## Supabase Setup

DropTrack needs a Supabase project for authentication, data storage, and the Telegram notification edge functions. The steps below cover the full one-time setup.

### 1. Create a Supabase project

1. Sign up at [supabase.com](https://supabase.com/) and create a new project.
2. In **Project Settings > API**, copy the **Project URL** and the **anon / publishable** key. You'll paste them into `.env` in the next step.

### 2. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in:

```
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon-key>
```

The app throws at startup if either value is missing. Restart `npm run dev` after editing `.env` so Vite picks up the new values.

### 3. Run the SQL migration

The migration at `supabase/migrations/20250109120000_init.sql` creates the `airdrops`, `whitelists`, `wallets`, and `user_settings` tables, enables Row Level Security, installs the `auth.uid() = user_id` policies, and adds helpful indexes.

**SQL Editor path:** open the Supabase Dashboard, go to **SQL Editor**, paste the contents of `supabase/migrations/20250109120000_init.sql`, and click **Run**.

**CLI path:**

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

### 4. Enable Google OAuth

1. In the Supabase Dashboard, go to **Authentication > Providers > Google** and toggle it on. Note the callback URL Supabase displays, something like `https://<your-project-ref>.supabase.co/auth/v1/callback`.
2. In the [Google Cloud Console](https://console.cloud.google.com/), create (or reuse) a project, enable the **OAuth consent screen**, and under **APIs & Services > Credentials**, click **Create Credentials > OAuth client ID**.
3. Pick **Web application**. For **Authorized JavaScript origins**, add `http://localhost:5173` (for local dev) and your deployed origin (e.g. `https://your-app.vercel.app`). For **Authorized redirect URIs**, paste the Supabase callback URL from step 1 **exactly**.
4. Copy the generated **Client ID** and **Client Secret** back into the Supabase Google provider settings and save.

Email/password login is enabled out of the box; there is nothing extra to configure for it.

### 5. Deploy the Edge Functions

Both functions live under `supabase/functions/`. Deploy them with the Supabase CLI:

```bash
supabase functions deploy check-deadlines
supabase functions deploy send-test-notification
```

### 6. Set Edge Function secrets

The functions need two secrets. `SUPABASE_URL` and `SUPABASE_ANON_KEY` are injected automatically by the platform, so you do not set those yourself.

```bash
supabase secrets set TELEGRAM_BOT_TOKEN=<your-bot-http-api-token>
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<service-role-key-from-project-settings>
```

You can find the service role key under **Project Settings > API > service_role secret**. Treat it like a password, it bypasses RLS.

### 7. Schedule `check-deadlines`

In the Supabase Dashboard, open **Database > Cron Jobs** and create a new job that invokes the `check-deadlines` edge function over HTTP. A sensible default is once a day:

```
0 9 * * *
```

That runs at 09:00 UTC daily. Date comparisons inside the function happen in UTC, so users in non-UTC timezones may see a +/- 1 day shift relative to their local calendar.

**JWT verification is disabled** on `check-deadlines` via `supabase/config.toml`, because the scheduler calls it with no user session. If you do not deploy via the CLI and instead paste the function source into the dashboard, be sure to toggle **Verify JWT** to **off** for that function in the dashboard UI, or Supabase Cron Jobs will hit it with no Authorization header and get 401s every day silently. `send-test-notification` stays JWT-verified: it runs under the caller's session and uses that identity to look up the caller's chat id.

`check-deadlines` notifies on any airdrop whose deadline is exactly N days out with status `Active` or `Pending`. `Claimed` and `Missed` airdrops are skipped. For whitelists, it notifies on `application_deadline` (status `Applied`) and `mint_date` (status `Applied` or `Whitelisted`); if both dates fall on the same target day, the row receives a single message (the application-deadline one is preferred).

### 8. Telegram bot setup

1. Open Telegram and message **@BotFather**. Send `/newbot`, pick a name and a `@username`, and note the HTTP API token BotFather hands back. That token is the `TELEGRAM_BOT_TOKEN` you stored in step 6.
2. Each user then messages the bot with `/start`. Their chat id can be found a few ways:
   - Visit `https://api.telegram.org/bot<TOKEN>/getUpdates` in a browser after messaging the bot, and read `result[].message.chat.id`.
   - Or DM **@userinfobot** which replies with your numeric chat id.
3. On the DropTrack **Settings** page, paste the chat id, pick a days-before value, toggle **Enable deadline notifications**, click **Save**, then **Send test notification** to confirm the bot can reach you.

### Troubleshooting

- **Login button does nothing.** Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are set in `.env`, and that you restarted the dev server after editing `.env`. Vite only reads env files at startup.
- **OAuth redirect 404 / `redirect_uri_mismatch`.** The **Authorized redirect URI** in the Google Cloud Console must match the callback URL shown by Supabase exactly, character for character, including the trailing path.
- **No Telegram messages after the cron fires.** Confirm `TELEGRAM_BOT_TOKEN` is set (`supabase secrets list`), the cron job is enabled in Supabase Dashboard > Database > Cron Jobs, and the user actually has `notify_enabled = true` and a non-null `telegram_chat_id` in `user_settings`. Check the function logs under **Edge Functions > check-deadlines > Logs** for per-row errors. If the logs show 401s from the cron, the `verify_jwt = false` setting in `supabase/config.toml` was not applied; toggle **Verify JWT** to **off** for `check-deadlines` in the dashboard.
- **`Send test notification` returns `No Telegram chat ID configured`.** The user has not yet saved a chat id. Enter one in the Settings page and click **Save** first, then retry the test.

## Local Development

1. Install Node.js 18 or newer. You can grab it from [nodejs.org](https://nodejs.org/).
2. Clone the repo:
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
   cd YOUR_REPO
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:5173](http://localhost:5173) in your browser.

To build a production bundle locally, run `npm run build` (output goes to `dist/`). To preview that bundle, run `npm run preview`.

## Project Structure

```
.
├── index.html              # Vite entry HTML, loads /src/main.jsx
├── package.json            # scripts and dependencies
├── vite.config.js          # Vite + React plugin config
├── tailwind.config.js      # Tailwind theme and content globs
├── postcss.config.js       # Tailwind + Autoprefixer
└── src/
    ├── main.jsx            # React root; mounts <App/>
    ├── App.jsx             # top-level shell, tab routing, shared state
    ├── index.css           # Tailwind directives + base styles
    ├── components/         # UI components (Dashboard, cards, forms, dialogs, etc.)
    ├── hooks/              # custom React hooks (e.g. useLocalStorageState)
    ├── utils/              # storage, date, csv, and id helpers
    ├── constants/          # networks, statuses, types, and storage keys
    └── data/               # first-run sample seed data
```

## Data & Privacy

Your airdrops, whitelists, wallets, and notification settings live in a Supabase Postgres database under **Row Level Security**. Every table has `auth.uid() = user_id` policies on select/insert/update/delete, so even with a shared database, each user only ever sees their own rows.

One preference remains on the device: `droptrack.customNetworks` in `localStorage`, the list of user-added custom network labels (populated when you pick **Custom...** in the Network dropdown on the Airdrop form, and surfaced back in that dropdown with a pencil marker on later visits). It is not synced across browsers by design.

Things to know:

- Use the Data tab's **Export CSV** buttons to keep an offline backup outside the database. CSV export is still the recommended belt-and-suspenders backup.
- When you sign out, the app simply drops your session; your rows stay in Supabase and come back on your next login.
- If your Supabase project is paused or deleted, your DropTrack data goes with it. Keep an occasional CSV export if the data matters.
- No analytics or telemetry. The only outbound traffic is to Supabase (your project) and, if you opt in, to the Telegram Bot API via the edge function.

## CSV Import / Export Format

DropTrack exports and imports a separate CSV file per collection. The first row is always the header; the column order below is the exact order the app uses.

**Airdrops** (`airdrops.csv`)

```
id,name,logoUrl,network,status,deadline,estimatedValueUsd,walletId,tasks,notes,link,createdAt,tags
```

The `tasks` column is a JSON-encoded array of `{ id, label, done }` objects. Keep it verbatim on import, quotes and all, or the checklist will fail to parse.

The `tags` column follows the same pattern as `tasks`: a JSON-encoded array of strings (for example `["tier-1","confirmed"]`). Importing an older CSV that does not include a `tags` column still succeeds; every row simply loads with `tags` defaulting to an empty array.

**Whitelists** (`whitelists.csv`)

```
id,name,type,status,applicationDeadline,mintDate,walletId,mintPrice,notes,link,createdAt,tags
```

**Wallets** (`wallets.csv`)

```
id,label,address,chainType
```

Notes on importing:

- Importing a CSV **replaces the entire collection** for that file. It does not merge with what is already there. Export first if you want a backup.
- `walletId` values on airdrops and whitelists should match an `id` on the wallets file. After the Supabase migration these ids are UUIDs, but the app treats them as opaque strings, so older CSVs with `seed-wallet-*` ids still import. Unknown ids still import, but the wallet label will not resolve in the UI.
- Dates use ISO `YYYY-MM-DD`. `createdAt` is also `YYYY-MM-DD`.

## Deploy to Vercel (Step-by-Step)

Written for someone who has never deployed a site before. Follow the steps in order.

1. **Get a GitHub account.** If you don't already have one, sign up at [github.com](https://github.com/). It is free.
2. **Create a new empty repository** on GitHub. Click the green **New** button on the repositories page, give it a name (for example `droptrack`), leave it public or private, and do **not** check "Initialize with README" or add a `.gitignore` or license. You want an empty repo.
3. **Push your local project to that repo.** From the DropTrack project folder on your machine, run:
   ```bash
   git init
   git add .
   git commit -m 'Initial commit'
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```
   Replace `YOUR_USERNAME` and `YOUR_REPO` with your values. If git asks you to authenticate, follow the prompts (a browser window or a personal access token).
4. **Sign in to Vercel with GitHub.** Go to [vercel.com](https://vercel.com/) and click **Sign in**. Pick the **Continue with GitHub** option so Vercel can see your repos.
5. **Start a new project.** On the Vercel dashboard, click **Add New...** then **Project**.
6. **Import your DropTrack repo.** Find the repo you just pushed in the list and click **Import**. If you don't see it, click **Adjust GitHub App Permissions** and grant Vercel access to that repo.
7. **Confirm the build settings.** Vercel auto-detects Vite. Make sure the values match exactly:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
8. **Click Deploy.** Under **Environment Variables**, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` with the same values you put in your local `.env` (the app throws at startup if they're missing).
9. **Wait about a minute.** Vercel will install, build, and deploy. When it finishes you'll get a public URL that looks like `https://your-project.vercel.app`. Open it and DropTrack should load.
10. **Push to deploy updates.** From now on, any time you run `git push` to the `main` branch, Vercel automatically rebuilds and redeploys. No dashboard clicks required.

**Tip:** To use your own domain, open the project in Vercel, go to **Settings > Domains**, add your domain, and follow the DNS instructions Vercel shows you.

## Deploy to Netlify

If you prefer Netlify, the flow is similar.

1. Push your project to GitHub using the same `git init ... git push` steps as above.
2. Sign in to [app.netlify.com](https://app.netlify.com/) with GitHub.
3. Click **Add new site > Import an existing project**, then choose **GitHub**.
4. Pick your DropTrack repository.
5. Confirm the build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Under **Site settings > Environment variables**, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
7. Click **Deploy**. Netlify also auto-rebuilds on every push to `main`.

## Troubleshooting

- **`npm install` fails.** Make sure you're on Node.js 18 or newer. Run `node --version` to check. Older Node versions cannot install the packages this project uses.
- **Page is blank after deploy.** Double-check that the Output Directory is `dist`, not `build`. Vite writes to `dist/` by default.
- **My data disappeared.** Your data lives in Supabase, not the browser, so clearing browser data only logs you out. Sign back in to restore it. If you also lost data from the Supabase project (e.g. the project was paused, deleted, or a CSV import replaced a collection), restore from your latest CSV export via the Data tab.
- **Tailwind classes are not applying.** Confirm `tailwind.config.js` has `content: ['./index.html', './src/**/*.{js,jsx}']`. If the glob does not include your files, Tailwind will strip the classes from the production build.
- **Sample data keeps coming back.** Sample data only seeds for a freshly signed-in user whose `airdrops` / `whitelists` / `wallets` tables are all empty. If you cleared everything by emptying those tables, that's expected. Delete the entries you don't want and they stay deleted.

## License

MIT.
