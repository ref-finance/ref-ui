import { TokenMetadata } from '~src/services/ft-contract';

export interface IReward {
  account_id: string;
  amount: string;
  token_id: string;
}

export interface IUiReward {
  meta: TokenMetadata;
  amount: string;
}

export interface INFT_metadata {
  base_uri: string;
  icon: string;
  name: string;
  reference: any;
  reference_hash: any;
  spec: string;
  symbol: string;
}

export interface IStakeItem {
  total_value: string;
  wallet: string;
  token_list: any[];
}

export type ILEVEL = '0' | '1' | '2' | '3';
