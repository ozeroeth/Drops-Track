export const NETWORKS = [
  { id: 'ethereum', label: 'Ethereum' },
  { id: 'solana', label: 'Solana' },
  { id: 'base', label: 'Base' },
  { id: 'arbitrum', label: 'Arbitrum' },
  { id: 'optimism', label: 'Optimism' },
  { id: 'polygon', label: 'Polygon' },
  { id: 'bnb', label: 'BNB Chain' },
  { id: 'avalanche', label: 'Avalanche' },
  { id: 'zksync', label: 'zkSync' },
  { id: 'starknet', label: 'Starknet' },
  { id: 'other', label: 'Other' },
];

export const AIRDROP_STATUSES = ['Active', 'Pending', 'Claimed', 'Missed'];

export const WHITELIST_STATUSES = [
  'Applied',
  'Whitelisted',
  'Not Selected',
  'Minted',
];

export const WHITELIST_TYPES = ['NFT mint', 'Token sale', 'Beta access'];

export const STORAGE_KEYS = {
  airdrops: 'droptrack.airdrops',
  whitelists: 'droptrack.whitelists',
  wallets: 'droptrack.wallets',
  seeded: 'droptrack.seeded',
};
