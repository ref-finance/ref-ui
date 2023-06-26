export interface IAddLiquidityInfo {
  pool_id: string;
  left_point: number;
  right_point: number;
  amount_x: string;
  amount_y: string;
  min_amount_x: string;
  min_amount_y: string;
}
export interface IaddLiquidityInfoHelp {
  [key: number]: {
    left_point: number;
    right_point: number;
    const_value: string;
  };
}

export type LiquidityShape = 'Spot' | 'Curve' | 'BidAsk';
export type PriceRangeModeType = 'by_range' | 'by_radius';
