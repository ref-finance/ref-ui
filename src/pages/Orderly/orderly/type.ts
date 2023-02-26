export type orderStatus =
  | 'NEW'
  | 'CANCELLED'
  | 'REJECTED'
  | 'COMPLETED'
  | 'FILLED'
  | 'PARTIAL_FILLED'
  | 'INCOMPLETE';

export interface OrderlyOrder {
  symbol: string;
  client_order_id?: string;
  order_type: 'LIMIT' | 'MARKET' | 'IOC' | 'FOK' | 'POST_ONLY' | 'ASK' | 'BID';
  order_price?: string | number;
  order_quantity?: string | number;
  order_amount?: number;
  side: 'BUY' | 'SELL';
  broker_id?: string;
  visible_quantity?: number;
}

export interface MyOrder {
  order_id: number;
  user_id: number;
  price: number;
  type: 'LIMIT' | 'MARKET' | 'IOC' | 'FOK' | 'POST_ONLY' | 'ASK' | 'BID';
  quantity: number;
  amount?: any;
  executed: number;
  visible: number;
  symbol: string;
  side: 'BUY' | 'SELL';
  status: orderStatus;
  total_fee: number;
  fee_asset: string;
  client_order_id?: any;
  average_executed_price: number;
  broker_id: string;
  created_time: number;
  updated_time: number;
}

export interface EditOrderlyOrder extends OrderlyOrder {
  order_id: number;
}

export interface OrderlyWSConnection extends Record<string, any> {
  id?: string;
  event: 'ping' | 'auth' | 'request' | 'subscribe' | 'unsubscribe';
  topic?: string;
  params?: any;
}

export interface Orders {
  symbol: string;
  ts: number;
  asks: number[][];
  bids: number[][];
}

export interface MarketTrade {
  symbol: string;
  price: number;
  size: number;
  side: 'BUY' | 'SELL';
  ts: number;
}

interface Ask {
  price: number;
  quantity: number;
}
export interface RequestOrder {
  asks: Ask[];
  bids: Ask[];
  timestamp: number;
}

export interface Trade {
  symbol: string;
  side: 'BUY' | 'SELL';
  executed_price: number;
  executed_quantity: number;
  executed_timestamp: number;
}

export interface TokenMetadata {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  icon: string;
}

export interface Ticker {
  symbol: string;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  amount: number;
  count: number;
  symbol_from_token_meta?: TokenMetadata;
  symbol_to_token_meta?: TokenMetadata;
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

export interface ClientInfo {
  account_id: string;
  email: string;
  account_mode: string;
  tier: string;
  taker_fee_rate: number;
  maker_fee_rate: number;
  maintenance_cancel_orders: boolean;
}

export interface MarkPrice {
  symbol: string;
  price: number;
}

export interface Balance {
  holding: number;
  frozen: number;
  interest: number;
  pendingShortQty: number;
  pendingExposure: number;
  pendingLongQty: number;
  pendingLongExposure: number;
  version: number;
  staked: number;
  unbonding: number;
  vault: number;
  averageOpenPrice: number;
  pnl24H: number;
  fee24H: number;
  markPrice: number;
}

export interface OrderTrade {
  id: number;
  symbol: string;
  fee: number;
  fee_asset: string;
  side: string;
  order_id: number;
  executed_price: number;
  executed_quantity: number;
  executed_timestamp: number;
  is_maker: number;
}

export interface SymbolInfo {
  created_time: number;
  updated_time: number;
  symbol: string;
  quote_min: number;
  quote_max: number;
  quote_tick: number;
  base_min: number;
  base_max: number;
  base_tick: number;
  min_notional: number;
  price_range: number;
}
export interface OrderlyBalance {
  holding: number;
  frozen: number;
  interest: number;
  pendingShortQty: number;
  pendingExposure: number;
  pendingLongQty: number;
  pendingLongExposure: number;
  version: number;
  staked: number;
  unbonding: number;
  vault: number;
  averageOpenPrice: number;
  pnl24H: number;
  fee24H: number;
  markPrice: number;
}

export interface UserRecord {
  id: string;
  uuid: string;
  token: string;
  side: 'DEPOSIT' | 'WITHDRAW';
  amount: number;
  tx_id: string;
  fee: number;
  trans_status: string;
  created_time: number;
  updated_time: number;
}
