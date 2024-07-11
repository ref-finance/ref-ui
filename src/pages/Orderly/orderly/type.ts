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
  order_amount?: number | string;
  side: 'BUY' | 'SELL';
  broker_id?: string;
  visible_quantity?: number;
  reduce_only?: boolean;
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
  broker_name: string;
  created_time: number;
  updated_time: number;
  reduce_only?: boolean;
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
  max_leverage: number;
  tier: string;
  taker_fee_rate: number;
  maker_fee_rate: number;
  futures_taker_fee_rate: number;
  futures_maker_fee_rate: number;
  imr_factor: any;
  maintenance_cancel_orders: boolean;
}

export interface MarkPrice {
  symbol: string;
  price: number;
}

export interface IndexPrice {
  symbol: string;
  price: number;
}

export interface EstFundingrate {
  fundingRate: number;
  fundingTs: number;
  symbol: string;
}

interface Position {
  symbol: string;
  positionQty: number;
  costPosition: number;
  lastSumUnitaryFunding: number;
  sumUnitaryFundingVersion: number;
  pendingLongQty: number;
  pendingShortQty: number;
  settlePrice: number;
  averageOpenPrice: number;
  unsettledPnl: number;
  pnl24H: number;
  fee24H: number;
  markPrice: number;
  estLiqPrice: number;
  version: number;
  imrwithOrders: number;
  mmrwithOrders: number;
  mmr: number;
  imr: number;
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
  symbol: string;
  quote_min: number;
  quote_max: number;
  quote_tick: number;
  base_min: number;
  base_max: number;
  base_tick: number;
  min_notional: number;
  price_range: number;
  price_scope: number;
  std_liquidation_fee: number;
  liquidator_fee: number;
  claim_insurance_fund_discount: number;
  funding_period: number;
  cap_funding: number;
  floor_funding: number;
  interest_rate: number;
  created_time: number;
  updated_time: number;
  imr_factor: number;
  base_mmr: number;
  base_imr: number;
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

export interface SymbolFuture {
  symbol: string;
  index_price: number;
  mark_price: number;
  sum_unitary_funding: number;
  est_funding_rate: number;
  last_funding_rate: number;
  next_funding_time: number;
  open_interest?: number | null;
  '24h_open': number;
  '24h_close': number;
  '24h_high': number;
  '24h_low': number;
  '24h_volumn': number;
  '24h_amount': number;
}

export interface OpenInterest {
  symbol: string;
  openInterest: number;
}

export interface PositionsType {
  current_margin_ratio_with_orders: number;
  free_collateral: number;
  initial_margin_ratio: number;
  initial_margin_ratio_with_orders: number;
  maintenance_margin_ratio: number;
  maintenance_margin_ratio_with_orders: number;
  margin_ratio: number;
  open_margin_ratio: number;
  rows: PositionsRow[];
  total_collateral_value: number;
  total_pnl_24_h: number;
  timestamp?: number;
}

interface PositionsRow {
  IMR_withdraw_orders: number;
  MMR_with_orders: number;
  average_open_price: number;
  cost_position: number;
  est_liq_price: number;
  fee_24_h: number;
  imr: number;
  last_sum_unitary_funding: number;
  mark_price: number;
  mmr: number;
  pending_long_qty: number;
  pending_short_qty: number;
  pnl_24_h: number;
  position_qty: number;
  settle_price: number;
  symbol: string;
  timestamp: number;
  unsettled_pnl: number;
  display_est_liq_price?: number;
}

export interface PositionPushType {
  symbol: string;
  positionQty: number;
  costPosition: number;
  lastSumUnitaryFunding: number;
  sumUnitaryFundingVersion: number;
  pendingLongQty: number;
  pendingShortQty: number;
  settlePrice: number;
  averageOpenPrice: number;
  unsettledPnl: number;
  pnl24H: number;
  fee24H: number;
  markPrice: number;
  estLiqPrice: number;
  version: number;
  imrwithOrders: number;
  mmrwithOrders: number;
  mmr: number;
  imr: number;
}

export interface LiquidationPushType {
  liquidationId: number;
  timestamp: number;
  type: string;
  positionsByPerp: PositionsByPerp[];
}

interface PositionsByPerp {
  symbol: string;
  positionQty: number;
  costPositionTransfer: number;
  transferPrice: number;
  liquidatorFee: number;
  absLiquidatorFee: number;
}

export interface LiquidationType {
  liquidation_id: number;
  timestamp: number;
  transfer_amount_to_insurance_fund: number;
  positions_by_perp: {
    abs_liquidation_fee: number;
    cost_position_transfer: number;
    liquidator_fee: number;
    position_qty: number;
    symbol: string;
    transfer_price: number;
    insurance_fund_fee: number;
  }[];
}
// portfolio
export interface PortfolioTable {
  title: string;
  tabs: {
    id: string;
    default: string;
    rightComp?: (state: boolean) => JSX.Element;
    defaultSort?: string | string[];
    columns?: PortfolioTableColumns[];
    tableRowType?: string;
    tableRowEmpty?: string;
    mobileKey?: string;
    tableTopComponent?: JSX.Element;
    pagination?: boolean;
    setFilteredPaginateData?: (params: any) => void;
    setFilteredData?: (params: any) => void;
    filteredData?: any;
    filter?: boolean;
    getData?: (params: any) => any;
    mobileHeader?: JSX.Element;
    mobileRender?: (row: any, secondData?: any) => any;
    mobileRenderCustom?: boolean;
    mobileFooter?: JSX.Element;
  }[];
}

export interface PortfolioTableColumns {
  key: string;
  sortKey?: string | string[];
  header: string;
  mobileHeaderKey?: string;
  type?: string;
  customRender?: boolean;
  render?: (row: any) => any;
  CustomComponent?: JSX.Element;
  headerRender?: () => any;
  selectList?: string[];
  extras?: string | string[];
  icon?: any;
  suffix?: any;
  colSpan?: number;
  select?: any;
  setSelect?: (input: any) => void;
  list?: {
    text: string | JSX.Element;
    textId: string;
    className?: string;
  }[];
  textColor?: string;
  headerType?: string;
}
export interface IOrderKeyInfo {
  ip_restriction_list: any[];
  ip_restriction_status: string;
  key_status: 'ACTIVE' | 'REMOVING' | 'REMOVED';
  orderly_key: string;
  trading_key: string;
}
