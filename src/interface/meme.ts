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
