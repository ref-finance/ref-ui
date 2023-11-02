import { UserLiquidityInfo } from '../../services/commonV3';
export interface IChartData {
  pool_id: string;
  point: number;
  token_x: string;
  token_y: string;
  liquidity: string;

  price_l?: string;
  price_r?: string;
  point_l?: number;
  point_r?: number;

  order_x?: string;
  order_y?: string;
  order_liquidity?: string;
  fee?: string;
  total_liquidity?: string;
  sort_number?: number;
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
  colors: string[];
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
  ticks?: number;
  smallChart?: boolean;
}

export interface IUserLiquiditiesDetail {
  total_value: string;
  min_price: string;
  max_price: string;
  total_x_amount: string;
  total_y_amount: string;
  apr_24: string;
  total_earned_fee: string;
}

export interface IDCLAccountFee {
  total_earned_fee: {
    total_fee_x: string;
    total_fee_y: string;
  };
  apr: {
    fee_data: {
      fee_x: string;
      fee_y: string;
    };
    user_token: {
      token_x: string;
      token_y: string;
      timestamp: number;
    };
    change_log_data: IDclLogData[];
  };
}

export interface IDclLogData {
  event_method?: string;
  token_x: string;
  token_y: string;
  timestamp: string;
}
export interface IProcessedLogData {
  total_value: string;
  distance_from_24: string;
}
export type IRMTYPE = 'round' | 'floor' | 'ceil';

export interface IDclChartProps {
  pool_id: string;
  leftPoint?: number;
  rightPoint?: number;
  setLeftPoint?: Function;
  setRightPoint?: Function;
  config?: IPoolChartConfig;
  chartType?: 'POOL' | 'USER';
  removeParams?: {
    fromLeft?: boolean;
    fromRight?: boolean;
    point?: number;
    all?: boolean;
  };
  newlyAddedLiquidities?: UserLiquidityInfo[];
  reverse?: boolean;
}
