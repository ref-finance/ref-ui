import { getOrderlyConfig } from '../config';
import {
  getPublicKey,
  generateRequestSignatureHeader,
  get_orderly_public_key_path,
  formateParamsNoSorting,
} from './utils';
import {
  OrderlyOrder,
  EditOrderlyOrder,
  ClientInfo,
  orderStatus,
  IOrderKeyInfo,
  MyOrder,
} from './type';
import { get_user_trading_key } from './on-chain-api';
import { ec } from 'elliptic';
import {
  generateOrderSignature,
  OFF_CHAIN_METHOD,
  formateParams,
  tradingKeyMap,
} from './utils';

// get

export const getOrderlyHeaders = async ({
  url,
  accountId,
  trading,
  method,
  param,
  contentType,
}: {
  url?: string;
  accountId: string;
  trading?: boolean;
  method: OFF_CHAIN_METHOD;
  param?: object;
  contentType?: string;
}) => {
  const time_stamp = Date.now();

  const headers: Record<string, any> = {
    'Content-Type': contentType || 'application/x-www-form-urlencoded',
    'orderly-timestamp': `${time_stamp}`,
    'orderly-account-id': accountId,
    'orderly-key': await getPublicKey(accountId),
    'orderly-signature': await generateRequestSignatureHeader({
      accountId,
      time_stamp,
      url: url || '',
      body: param || null,
      method,
    }),
  };

  if (trading) {
    const storedPublicKey = localStorage.getItem(get_orderly_public_key_path());

    const mapTradingKey = tradingKeyMap.get(get_orderly_public_key_path());

    if (!storedPublicKey && !mapTradingKey) {
      alert('not trading key');
    }

    headers['orderly-trading-key'] = storedPublicKey || mapTradingKey;
  }

  return headers;
};

export const requestOrderly = async ({
  ct,
  url,
  accountId,
  param,
}: {
  url?: string;
  accountId: string;
  param?: object;
  ct?: string;
}) => {
  const headers = await getOrderlyHeaders({
    url,
    accountId,
    trading: false,
    method: 'GET',
    param,
    contentType: ct,
  });

  return await fetch(`${getOrderlyConfig().OFF_CHAIN_END_POINT}${url || ''}`, {
    method: 'GET',

    headers,
  }).then((res) => {
    return res.json();
  });
};

export const tradingOrderly = async ({
  url,
  accountId,
  body,
  method,
}: {
  url?: string;
  accountId: string;
  body: object;
  method?: 'POST' | 'PUT';
}) => {
  const headers = await getOrderlyHeaders({
    url,
    accountId,
    trading: true,
    method: method || 'POST',
    param: body,
    contentType: 'application/json',
  });
  return await fetch(`${getOrderlyConfig().OFF_CHAIN_END_POINT}${url || ''}`, {
    method: method || 'POST',
    headers,
    body: JSON.stringify(body),
  }).then((res) => {
    return res.json();
  });
};

export const deleteOrderly = async ({
  url,
  accountId,
  param,
}: {
  url?: string;
  accountId: string;
  param?: object;
}) => {
  const headers = await getOrderlyHeaders({
    url,
    accountId,
    trading: true,
    method: 'DELETE',
    contentType: 'application/x-www-form-urlencoded',
  });
  return await fetch(`${getOrderlyConfig().OFF_CHAIN_END_POINT}${url || ''}`, {
    method: 'DELETE',
    headers,
  }).then((res) => {
    return res.json();
  });
};

export const createOrder = async (props: {
  accountId: string;
  orderlyProps: OrderlyOrder;
}) => {
  const { accountId } = props;

  const {
    symbol,
    client_order_id,
    order_type,
    order_price,
    order_quantity,
    order_amount,
    side,
    broker_id,
    visible_quantity,
  } = props.orderlyProps;

  const message = formateParams(props.orderlyProps);

  const signature = generateOrderSignature(message);

  const body = {
    symbol,
    client_order_id,
    order_type,
    order_price,
    order_quantity,
    order_amount,
    side,
    broker_id,
    visible_quantity,
    signature,
  };

  return await tradingOrderly({
    accountId,
    url: '/v1/order',
    body,
  });
};

export const getAccountInformation = async (props: {
  accountId: string;
}): Promise<ClientInfo> => {
  const url = '/v1/client/info';

  const res = await requestOrderly({
    url,
    accountId: props.accountId,
  });

  return res.data;
};
export const getAccountKeyInfo = async (props: {
  accountId: string;
}): Promise<IOrderKeyInfo[]> => {
  const url = '/v1/client/key_info';

  const res = await requestOrderly({
    url,
    accountId: props.accountId,
  });

  return res?.data?.rows || [];
};

export const getCurrentHolding = async (props: { accountId: string }) => {
  const url = '/v1/client/holding';

  const res = await requestOrderly({
    url,
    accountId: props.accountId,
  });

  const wbtcHolding = res?.data?.holding.find((h: any) => h.token === 'WBTC');

  if (wbtcHolding) {
    const btcholding = {
      ...wbtcHolding,
      token: 'BTC',
    };
    res.data.holding.push(btcholding);
  }

  return res;
};

export const getAssetHistory = async (props: {
  accountId: string;
  HistoryParam: {
    token?: string;
    side?: 'DEPOSIT' | 'WITHDRAW';
    status?: 'NEW' | 'CONFIRM' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    page: number;
    size?: number;
  };
}) => {
  const url = `/balance/asset/history?${formateParams(
    props.HistoryParam || {}
  )}`;

  const res = requestOrderly({
    url,
    accountId: props.accountId,
    ct: 'application/json;charset=utf-8',
  });

  return res;
};

export const getOpenOrders = async (props: { accountId: string }) => {
  const url = `/orderservice/v1/merge/orders/pending`;

  const res = requestOrderly({
    url,
    accountId: props.accountId,
    ct: 'application/json;charset=utf-8',
  });

  return res;
};

export const getOrderTrades = async (props: {
  accountId: string;
  order_id: string | number;
}) => {
  const url = `/v1/order/${props.order_id}/trades`;

  const res = requestOrderly({
    url,
    accountId: props.accountId,
  });

  return res;
};

export const getOrders = async (props: {
  accountId: string;
  OrderProps?: {
    symbol?: string;
    side?: 'BUY' | 'SELL';
    order_type?: 'LIMIT' | 'MARKET';
    order_tag?: string;
    status?: orderStatus;
    start_t?: number;
    end_t?: number;
    page?: number;
    size?: number;
    broker_id?: string;
  };
}) => {
  const url = `/v1/orders?${formateParams(props.OrderProps || {})}`;

  const res = await requestOrderly({
    url,
    accountId: props.accountId,
    ct: 'application/json;charset=utf-8',
  });

  if (res?.data?.rows) {
    res.data.rows.forEach((r: any) => {
      if (!r?.broker_name) {
        r.broker_name = '';
      }
    });
  }

  return res;
};

// TODOX pageOne.data.rows
export const getAllOrders = async (props: {
  accountId: string;
  OrderProps?: {
    symbol?: string;
    // side?: 'BUY' | 'SELL';
    // order_type?: 'LIMIT' | 'MARKET';
    // order_tag?: string;
    // status?: 'NEW' | 'CANCELLED' | 'REJECTED' | 'COMPLETED' | 'FILLED' | 'PARTIAL_FILLED' | 'INCOMPLETE';
    // start_t?: number;
    // end_t?: number;
    page?: number;
    size?: number;
    broker_id?: string;
  };
}) => {
  const curPage = await getOrders({
    accountId: props.accountId,
    OrderProps: {
      ...props.OrderProps,
      page: props?.OrderProps?.page || 1,
      size: props?.OrderProps?.size || 500,
    },
  });

  const total = curPage.data.meta.total;

  // const pageSize = Math.ceil(total / 500);

  // const pages = Array.from({ length: pageSize }, (v, k) => k + 1);

  // pages.shift();

  // const leftOrders = await Promise.all(
  //   pages.map(async (page) => {
  //     const res = await getOrders({
  //       accountId: props.accountId,
  //       OrderProps: {
  //         ...props.OrderProps,
  //         page,
  //         size: 500,
  //       },
  //     });

  //     return res.data.rows;
  //   })
  // );

  // const allOrders = pageOne.data.rows.concat(...leftOrders);

  // return allOrders;
  return { data: curPage.data.rows, total };
};

export const getOrderByClientId = async (props: {
  accountId: string;
  client_order_id: string;
}) => {
  const url = `/v1/client/order/${props.client_order_id}`;

  const res = requestOrderly({
    url,
    accountId: props.accountId,
  });

  return res;
};

export const getOrderByOrderId = async (props: {
  accountId: string;
  order_id: number;
}) => {
  const url = `/v1/order/${props.order_id}`;

  const res = requestOrderly({
    url,
    accountId: props.accountId,
  });

  return res;
};

export const getKline = async (props: {
  accountId: string;
  KlineParams: {
    symbol: string;
    type:
      | '1m'
      | '5m'
      | '15m'
      | '30m'
      | '1h'
      | '4h'
      | '12h'
      | '1d'
      | '1w'
      | '1mon'
      | '1y';
    limit?: number; //Maximum of 1000 klines.
  };
}) => {
  const url = `/v1/kline?${formateParams(props.KlineParams)}`;

  const res = requestOrderly({
    url,
    accountId: props.accountId,
  });

  return res;
};

export const getOrderBook = async (props: {
  accountId: string;
  symbol: string;
}) => {
  const url = `/v1/orderbook/${props.symbol}`;

  const res = requestOrderly({
    url,
    accountId: props.accountId,
  });

  return res;
};

export const cancelOrder = async (props: {
  accountId: string;
  DeleteParams: {
    symbol: string;
    order_id: number;
  };
}) => {
  const { accountId, DeleteParams } = props;

  const message = formateParams(DeleteParams);

  const signature = generateOrderSignature(message);

  const url = `/v1/order?${message}&signature=${signature}`;

  return deleteOrderly({
    url,
    accountId,
  });
};

export const cancelOrders = async (props: {
  accountId: string;
  DeleteParams: {
    symbol: string;
  };
}) => {
  const { accountId, DeleteParams } = props;

  const message = formateParams(DeleteParams);

  const signature = generateOrderSignature(message);

  const url = `/v1/orders?${message}&signature=${signature}`;

  return deleteOrderly({
    url,
    accountId,
  });
};

export const cancelOrderByClientId = async (props: {
  accountId: string;
  DeleteParams: {
    symbol: string;
    client_order_id: string;
  };
}) => {
  const { accountId, DeleteParams } = props;

  const message = formateParams(DeleteParams);

  const signature = generateOrderSignature(message);

  const url = `/v1/client/order?${message}&signature=${signature}`;

  return deleteOrderly({
    url,
    accountId,
  });
};

export const editOrder = async (props: {
  order: MyOrder;
  accountId: string;
  orderlyProps: EditOrderlyOrder;
}) => {
  const { accountId, order } = props;

  const {
    symbol,
    client_order_id,
    order_type,
    order_price,
    order_quantity,
    order_amount,
    side,
    broker_id,
    order_id,
    visible_quantity,
    reduce_only,
  } = props.orderlyProps;

  const sendParams = {
    symbol,
    client_order_id,
    order_type,
    order_price,
    order_quantity,
    order_amount,
    side,
    broker_id,
    order_id,
    visible_quantity:
      visible_quantity !== order.quantity ? visible_quantity : '',
    reduce_only,
  };

  const message = formateParams(sendParams);

  const signature = generateOrderSignature(message);

  const body = {
    ...sendParams,

    signature,
  };

  return await tradingOrderly({
    accountId,
    url: '/v1/order',
    body,
    method: 'PUT',
  });
};

export const batchCreateOrder = async (props: {
  accountId: string;
  orderlyProps: OrderlyOrder[];
}) => {
  const { accountId } = props;

  //Note for DELETE requests, the parameters are not in the json body.
  // const message = Object.entries(props.orderlyProps)
  //   .filter(([k, v], i) => {
  //     return v !== undefined && v !== null;
  //   })
  //   .map(([k, v], i) => {
  //     if (typeof v === 'number') {
  //       return `${k}=${parseFloat(v.toString())}`;
  //     }
  //     return `${k}=${v}`;
  //   })
  //   .sort()
  //   .join('&');

  const messages = props.orderlyProps.map((p: OrderlyOrder) =>
    formateParams(p)
  );

  const body = messages.map((message, i) => {
    const signature = generateOrderSignature(message);

    return {
      ...props.orderlyProps[i],
      signature,
    };
  });

  return await tradingOrderly({
    accountId,
    url: '/v1/batch-order',
    body: {
      orders: body,
    },
    method: 'POST',
  });
};

export const getOrderlyPublic = async (url?: string) => {
  return await fetch(`${getOrderlyConfig().OFF_CHAIN_END_POINT}${url || ''}`, {
    method: 'GET',
  })
    .then((res) => {
      return res.json();
    })
    .catch((e) => {
      return e;
    });
};

export interface OrderlySystemInfo {
  success: boolean;
  data: Data;
  timestamp: number;
}

interface Data {
  status: number;
  msg: string;
}

export const getOrderlySystemInfo = async (): Promise<OrderlySystemInfo> => {
  try {
    return await getOrderlyPublic('/v1/public/system_info');
  } catch (error) {
    return new Promise((resolve) => {
      const res = { data: { status: 2 } } as any;
      resolve(res);
    });
  }
};

export const getMarketTrades = async ({
  symbol,
  limit,
}: {
  symbol: string;
  limit: number;
}) => {
  return await getOrderlyPublic(
    `/v1/public/market_trades?symbol=${symbol}&limit=${limit}`
  );
};

export const getFundingFee = async ({
  page = 1,
  accountId,
}: {
  accountId: string;
  page: number;
}) => {
  const url = `/v1/funding_fee/history?size=10&page=${page}`;

  const res = requestOrderly({
    url,
    accountId,
  });

  return res;
};

export const getPortfolioAssetHistory = async ({
  page = 1,
  side,
  accountId,
}: {
  accountId: string;
  side: string;
  page: number;
}) => {
  const url = `/v1/asset/history?size=10&page=${page}&side=${side}`;

  const res = requestOrderly({
    url,
    accountId,
  });

  return res;
};

export const getPortfolioSettlements = async ({
  page = 1,
  accountId,
}: {
  accountId: string;
  page: number;
}) => {
  const url = `/v1/pnl_settlement/history?size=10&page=${page}`;

  const res = requestOrderly({
    url,
    accountId,
  });

  return res;
};

export const getPortfolioPosition = async ({
  accountId,
}: {
  accountId: string;
}) => {
  const url = `/v1/positions`;

  const res = await requestOrderly({
    url,
    accountId,
  });

  if (res?.data?.rows) {
    const newRows = res.data.rows.map((r: any) => {
      return {
        ...r,
        display_est_liq_price: r.est_liq_price,
      };
    });
    res.data.rows = newRows;
  }

  return res;
};

export const getPortfolioAllOrders = async (props: {
  accountId: string;
  OrderProps?: {
    symbol?: string;
    page?: number;
    size?: number;
    status?:
      | 'NEW'
      | 'CANCELLED'
      | 'PARTIAL_FILLED'
      | 'FILLED'
      | 'REJECTED'
      | 'INCOMPLETE'
      | 'COMPLETED';
    broker_id?: string;
    side?: 'BUY' | 'SELL';
  };
}) => {
  const res = await getOrders({
    accountId: props.accountId,
    OrderProps: {
      ...props.OrderProps,
    },
  });

  return res;
};
