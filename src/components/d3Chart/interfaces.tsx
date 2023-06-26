export interface IChartData {
  pool_id: string;
  point: string;
  price?: string;
  price_r?: string;
  point_r?: string;
  price_r_close?: string;
  liquidity: string;
  token_x: string;
  token_y: string;
  order_x: string;
  order_y: string;
  order_liquidity: string;
  fee: string;
  total_liquidity: string;
  sort_number: number;
}

export interface IChartItemConfig {
  bin?: number;
  range?: number;
  colors?: string[];
  rangeGear?: number[];
}
export interface IChartConfig {
  [token_id: string]: IChartItemConfig;
}
export interface IBinDetail {
  feeApr?: string;
  token_x_amount?: string;
  token_x_amount_in_liquidity?: string;
  token_x_amount_in_order?: string;
  token_y_amount?: string;
  token_y_amount_in_liquidity?: string;
  token_y_amount_in_order?: string;
  price_by_token_x?: string;
  price_by_token_y?: string;
  color: string;
}

export interface IPoolChartConfig {
  svgWidth?: string | number;
  svgHeight?: string | number;
  disFromHoverBoxToPointer?: string | number;
  disFromPercentBoxToDragBar?: string | number;
  svgPaddingX?: string | number;
  defaultPercent?: string | number;
  whole_bars_background_padding?: string | number;
  controlHidden?: boolean;
  axisHidden?: boolean;
  currentBarHidden?: boolean;
  hoverBoxHidden?: boolean;
  radiusMode?: boolean;
  targetPoint?: number;
}
