import {
  getOrderlyPublic,
  requestOrderly,
  tradingOrderly,
} from './off-chain-api';
import { SymbolFuture } from './type';
import { formateParams } from './utils';

interface FundingRate {
  success: boolean;
  data: Data;
  timestamp: number;
}

interface Data {
  rows: Row[];
}

interface Row {
  symbol: string;
  est_funding_rate: number;
  est_funding_rate_timestamp: number;
  last_funding_rate: number;
  last_funding_rate_timestamp: number;
  next_funding_time: number;
  sum_unitary_funding: number;
}

const getFundingRates = (): Promise<FundingRate> => {
  return getOrderlyPublic('/v1/public/funding_rates');
};

const getFundingRateSymbol = (symbol: string) => {
  return getOrderlyPublic(`/v1/public/funding_rate/${symbol}`);
};

const getUserAllPositions = (user: string) => {
  const url = `/v1/positions`;
  const res = requestOrderly({
    url,
    accountId: user,
  });

  return res;
};

const updateLeverage = async ({
  accountId,
  leverage,
}: {
  accountId: string;
  leverage: 1 | 2 | 3 | 4 | 5 | 10;
}) => {
  const body = {
    leverage,
  };

  return await tradingOrderly({
    accountId,
    url: '/v1/client/leverage',
    body,
    method: 'POST',
  });
};

const getFundingFeeHistory = async (props: {
  accountId: string;
  HistoryParam: {
    page?: number;
    size?: number;
    start_t?: number;
    end_t?: number;
    symbol: string;
  };
}) => {
  const url = `/v1/funding_fee/history?${formateParams(
    props.HistoryParam || {}
  )}`;

  const res = requestOrderly({
    url,
    accountId: props.accountId,
    ct: 'application/json;charset=utf-8',
  });

  return res;
};

const claimLiquidatedPositions = async ({
  liquidation_id,
  ratio_qty_request,
  extra_liquidation_ratio,
  accountId,
}: {
  liquidation_id: number;
  ratio_qty_request: number;
  extra_liquidation_ratio?: number;
  accountId: string;
}) => {
  const body = {
    liquidation_id,
    ratio_qty_request,
    extra_liquidation_ratio,
  };

  return await tradingOrderly({
    accountId,
    url: '/v1/liquidation',
    body,
    method: 'POST',
  });
};

const getLiquidationHistory = async (props: {
  accountId: string;
  HistoryParam: {
    page: number;
    size?: number;
  };
}) => {
  const url = `/v1/liquidations?${formateParams(props.HistoryParam)}`;

  const res = await requestOrderly({
    url,
    accountId: props.accountId,
    ct: 'application/json;charset=utf-8',
  });

  return res;
};

export {
  getFundingRates,
  getUserAllPositions,
  updateLeverage,
  getFundingFeeHistory,
  claimLiquidatedPositions,
  getFundingRateSymbol,
  getLiquidationHistory,
};
