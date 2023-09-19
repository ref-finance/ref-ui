export interface ParamTypes {
  id: string;
}
export interface UserLiquidityDetail {
  total_liqudities_price: string;
  total_fees_price: string;
  amount_x: string;
  amount_y: string;
  hashId: string;
  l_price: string;
  r_price: string;
  unclaimed_fee_y_amount?: string;
  unclaimed_fee_x_amount?: string;
}

export type RencentTabKey = 'swap' | 'liquidity' | 'limit_order';
