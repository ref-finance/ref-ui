export interface BalanceType {
  meta: TokenMetadata;
  holding: number;
  wallet_balance: string;
  id: string;
  name: string;
  'in-order': number;
}

export interface TokenWithDecimals {
  id: string;
  decimals: number;
}
export interface TokenInfo {
  token: string;
  token_account_id: string;
  decimals: number;
  minimum_increment: number;
}
export interface Holding {
  token: string;
  holding: number;
  frozen: number;
  pending_short: number;
  updated_time: number;
}
export interface TokenMetadata {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  icon: string;
}
export interface IBalance {
  near: string | number;
  'in-order': string | number;
  available: string | number;
  tokenMeta: TokenMetadata;
}
