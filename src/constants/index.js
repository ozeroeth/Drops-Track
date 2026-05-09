export const NETWORKS = [
  { id: 'ethereum', label: 'Ethereum' },
  { id: 'base', label: 'Base' },
  { id: 'arbitrum', label: 'Arbitrum' },
  { id: 'optimism', label: 'Optimism' },
  { id: 'solana', label: 'Solana' },
  { id: 'bnb', label: 'BNB Chain' },
  { id: 'polygon', label: 'Polygon' },
  { id: 'sui', label: 'Sui' },
  { id: 'aptos', label: 'Aptos' },
  { id: 'starknet', label: 'Starknet' },
  { id: 'zksync', label: 'zkSync' },
  { id: 'scroll', label: 'Scroll' },
  { id: 'linea', label: 'Linea' },
  { id: 'ton', label: 'TON' },
  { id: 'near', label: 'Near' },
  { id: 'cosmos', label: 'Cosmos' },
  { id: 'avalanche', label: 'Avalanche' },
  { id: 'fantom', label: 'Fantom' },
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

export const SUGGESTED_TAGS = [
  'tier-1',
  'confirmed',
  'low-effort',
  'high-risk',
  'long-term',
  'testnet',
];

export const STORAGE_KEYS = {
  airdrops: 'droptrack.airdrops',
  whitelists: 'droptrack.whitelists',
  wallets: 'droptrack.wallets',
  seeded: 'droptrack.seeded',
  customNetworks: 'droptrack.customNetworks',
};
