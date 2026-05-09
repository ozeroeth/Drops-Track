function pad(n) {
  return String(n).padStart(2, '0');
}

function isoDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function daysFromToday(n) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return isoDate(d);
}

const TODAY_ISO = daysFromToday(0);

export const sampleWallets = [
  {
    id: 'seed-wallet-1',
    label: 'Main EVM',
    address: '0x1111111111111111111111111111111111111111',
    chainType: 'EVM',
  },
  {
    id: 'seed-wallet-2',
    label: 'Burner 1',
    address: '0x2222222222222222222222222222222222222222',
    chainType: 'EVM',
  },
  {
    id: 'seed-wallet-3',
    label: 'Solana Main',
    address: 'So1anaMainWa11etAddressExampleForSeeding1234',
    chainType: 'Solana',
  },
];

export const sampleAirdrops = [
  {
    id: 'seed-airdrop-1',
    name: 'LayerZero',
    logoUrl: '',
    network: 'ethereum',
    status: 'Active',
    deadline: daysFromToday(2),
    estimatedValueUsd: 500,
    walletId: 'seed-wallet-1',
    tasks: [
      { id: 'seed-task-1a', label: 'Bridge ETH to Arbitrum', done: true },
      { id: 'seed-task-1b', label: 'Swap on Stargate', done: true },
      { id: 'seed-task-1c', label: 'Claim when live', done: false },
    ],
    tags: ['tier-1', 'confirmed'],
    notes: 'High conviction. Deadline within 2 days.',
    link: 'https://layerzero.network',
    createdAt: TODAY_ISO,
  },
  {
    id: 'seed-airdrop-2',
    name: 'zkSync Era',
    logoUrl: '',
    network: 'zksync',
    status: 'Pending',
    deadline: daysFromToday(21),
    estimatedValueUsd: 300,
    walletId: 'seed-wallet-2',
    tasks: [
      { id: 'seed-task-2a', label: 'Interact with Mute.io', done: true },
      { id: 'seed-task-2b', label: 'Interact with SyncSwap', done: false },
    ],
    tags: ['long-term'],
    notes: 'Waiting for snapshot announcement.',
    link: 'https://zksync.io',
    createdAt: TODAY_ISO,
  },
  {
    id: 'seed-airdrop-3',
    name: 'Jupiter',
    logoUrl: '',
    network: 'solana',
    status: 'Claimed',
    deadline: daysFromToday(-10),
    estimatedValueUsd: 1200,
    walletId: 'seed-wallet-3',
    tasks: [
      { id: 'seed-task-3a', label: 'Check eligibility', done: true },
      { id: 'seed-task-3b', label: 'Claim JUP', done: true },
    ],
    notes: 'Claimed successfully.',
    link: 'https://jup.ag',
    createdAt: TODAY_ISO,
  },
  {
    id: 'seed-airdrop-4',
    name: 'Arbitrum Odyssey',
    logoUrl: '',
    network: 'arbitrum',
    status: 'Missed',
    deadline: daysFromToday(-45),
    estimatedValueUsd: null,
    walletId: 'seed-wallet-1',
    tasks: [
      { id: 'seed-task-4a', label: 'Complete week 1 quests', done: false },
    ],
    notes: 'Missed the deadline last month.',
    link: 'https://arbitrum.foundation',
    createdAt: TODAY_ISO,
  },
  {
    id: 'seed-airdrop-5',
    name: 'Base Summer',
    logoUrl: '',
    network: 'base',
    status: 'Active',
    deadline: daysFromToday(14),
    estimatedValueUsd: 150,
    walletId: 'seed-wallet-1',
    tasks: [
      { id: 'seed-task-5a', label: 'Bridge to Base', done: true },
      { id: 'seed-task-5b', label: 'Mint Base NFT', done: false },
      { id: 'seed-task-5c', label: 'Swap on Aerodrome', done: false },
    ],
    tags: ['low-effort'],
    notes: 'Multiple tasks still open.',
    link: 'https://base.org',
    createdAt: TODAY_ISO,
  },
];

export const sampleWhitelists = [
  {
    id: 'seed-whitelist-1',
    name: 'Pudgy Penguins Pengu Pass',
    type: 'NFT mint',
    status: 'Whitelisted',
    applicationDeadline: daysFromToday(-7),
    mintDate: daysFromToday(3),
    walletId: 'seed-wallet-1',
    mintPrice: '0.08 ETH',
    tags: ['confirmed'],
    notes: 'Got on the WL. Mint in 3 days.',
    link: 'https://pudgypenguins.com',
    createdAt: TODAY_ISO,
  },
  {
    id: 'seed-whitelist-2',
    name: 'Monad Public Sale',
    type: 'Token sale',
    status: 'Applied',
    applicationDeadline: daysFromToday(10),
    mintDate: daysFromToday(30),
    walletId: 'seed-wallet-2',
    mintPrice: '$0.10 per MON',
    tags: ['tier-1', 'long-term'],
    notes: 'KYC pending.',
    link: 'https://monad.xyz',
    createdAt: TODAY_ISO,
  },
  {
    id: 'seed-whitelist-3',
    name: 'Farcaster Frames Beta',
    type: 'Beta access',
    status: 'Not Selected',
    applicationDeadline: daysFromToday(-20),
    mintDate: '',
    walletId: 'seed-wallet-1',
    mintPrice: '',
    notes: 'Did not make the cut this round.',
    link: 'https://warpcast.com',
    createdAt: TODAY_ISO,
  },
  {
    id: 'seed-whitelist-4',
    name: 'Magic Eden Genesis',
    type: 'NFT mint',
    status: 'Minted',
    applicationDeadline: daysFromToday(-30),
    mintDate: daysFromToday(-14),
    walletId: 'seed-wallet-3',
    mintPrice: '2 SOL',
    notes: 'Minted and flipped half.',
    link: 'https://magiceden.io',
    createdAt: TODAY_ISO,
  },
];
