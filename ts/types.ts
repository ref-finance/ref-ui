interface CoinForSwap {
  id: string;
  spec: string;
  name: string;
  symbol: string;
  icon: string | null;
  reference: string | null;
  reference_hash: string | null;
  decimals: number;
}

interface PoolInfo {
  token_account_ids: string[];
  amounts: number[];
  total_fee: number;
  shares_total_supply: number;
}
