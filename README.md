# DropTrack

A small, no-login, browser-only tracker for DeFi airdrops and NFT whitelist opportunities.

## Overview

DropTrack is a personal productivity tool for keeping tabs on DeFi/NFT airdrops and whitelist opportunities. It runs entirely in your browser and stores everything in `localStorage`, so there is no backend, no account, and no signup. You open the page, you get a dashboard, you add entries, and your data stays on your machine.

On first open, DropTrack seeds a handful of realistic sample airdrops, whitelists, and wallets so the dashboard is not empty while you learn the UI. Delete them whenever you're ready to use your own data. Export to CSV any time you want a backup you can keep outside the browser.

## Features

- Airdrop tracker with status, network, deadline, estimated value, per-task checklist, linked wallet, notes, and link.
- Whitelist tracker for NFT mints, token sales, and beta access, with application deadline and mint date.
- Dashboard overview with summary counts and deadline alerts (entries due within 3 days are highlighted).
- Wallet manager for labelling the addresses you apply with (EVM, Solana, or Other).
- CSV import and export for all three collections, so you can back up or move your data.
- Dark theme by default.
- Mobile responsive layout that collapses the card grid on small screens.

## Tech Stack

- React 18
- Vite 5
- Tailwind CSS 3
- Browser `localStorage` for persistence

No backend. No accounts. Your data never leaves your browser.

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

Everything DropTrack knows about you lives in your browser's `localStorage`, under these four keys:

- `droptrack.airdrops` - the list of airdrop entries
- `droptrack.whitelists` - the list of whitelist entries
- `droptrack.wallets` - the list of wallets
- `droptrack.seeded` - a flag that records whether sample data has been seeded, so it is only seeded once

Things to know:

- Clearing your browser data, using private/incognito mode, or switching browsers will wipe your DropTrack data. There is no cloud copy.
- Use the Data tab's **Export CSV** buttons to keep a backup outside the browser.
- Nothing is ever sent over the network. No analytics, no sync, no telemetry.

## CSV Import / Export Format

DropTrack exports and imports a separate CSV file per collection. The first row is always the header; the column order below is the exact order the app uses.

**Airdrops** (`airdrops.csv`)

```
id,name,logoUrl,network,status,deadline,estimatedValueUsd,walletId,tasks,notes,link,createdAt
```

The `tasks` column is a JSON-encoded array of `{ id, label, done }` objects. Keep it verbatim on import, quotes and all, or the checklist will fail to parse.

**Whitelists** (`whitelists.csv`)

```
id,name,type,status,applicationDeadline,mintDate,walletId,mintPrice,notes,link,createdAt
```

**Wallets** (`wallets.csv`)

```
id,label,address,chainType
```

Notes on importing:

- Importing a CSV **replaces the entire collection** for that file. It does not merge with what is already there. Export first if you want a backup.
- `walletId` values on airdrops and whitelists should match an `id` on the wallets file. Unknown ids still import, but the wallet label will not resolve in the UI.
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
8. **Click Deploy.** Leave environment variables empty (DropTrack does not need any).
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
6. Click **Deploy**. Netlify also auto-rebuilds on every push to `main`.

## Troubleshooting

- **`npm install` fails.** Make sure you're on Node.js 18 or newer. Run `node --version` to check. Older Node versions cannot install the packages this project uses.
- **Page is blank after deploy.** Double-check that the Output Directory is `dist`, not `build`. Vite writes to `dist/` by default.
- **My data disappeared.** Clearing browser data, using private/incognito mode, or switching browsers wipes `localStorage`. There is no server-side copy. Use the Data tab's Export CSV buttons to keep backups.
- **Tailwind classes are not applying.** Confirm `tailwind.config.js` has `content: ['./index.html', './src/**/*.{js,jsx}']`. If the glob does not include your files, Tailwind will strip the classes from the production build.
- **Sample data keeps coming back.** Sample data only seeds when `droptrack.seeded` is missing from `localStorage`. If you cleared everything and it seeded again, that's expected. Delete the entries you don't want and DropTrack will remember.

## License

MIT.
