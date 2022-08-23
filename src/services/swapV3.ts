import { TokenMetadata } from './ft-contract';
import {
  refSwapV3ViewFunction,
  REF_UNI_V3_SWAP_CONTRACT_ID,
  ONE_YOCTO_NEAR,
} from './near';
import { toNonDivisibleNumber } from '../utils/numbers';
import { getCurrentWallet } from '../utils/sender-wallet';
import _ from 'lodash';
import Big from 'big.js';
import {
  Transaction,
  executeMultipleTransactions,
  refVeViewFunction,
} from './near';

const LOG_BASE = 1.0001;

export const getV3PoolId = (tokenA: string, tokenB: string, fee: number) => {
  return `${tokenA}|${tokenB}|${fee}`;
};

export interface UserOrderInfo {
  order_id: string;
  owner_id: string;
  pool_id: string;
  point: number;
  sell_token: string;
  orginal_amount: string;
  remain_amount: string; // 0 means history order: ;
  cancel_amount: string;
  buy_token: string;
  unclaimed_amount: string; // claim will push it to inner account
  bought_amount: string; // accumalated amount into inner account
}

export interface PoolInfoV3 {
  pool_id: string;
  token_x: string;
  token_y: string;
  fee: number;
  point_delta: number;
  current_point: number;
  state: string; // running or paused
}

export const quote = ({
  pool_ids,
  input_amount,
  input_token,
  output_token,
  tag,
}: {
  pool_ids: string[];
  input_token: TokenMetadata;
  output_token: TokenMetadata;
  input_amount: string;
  tag?: string;
}) => {
  return refSwapV3ViewFunction({
    methodName: 'quote',
    args: {
      pool_ids,
      input_token: input_token.id,
      output_token: output_token.id,
      input_amount: toNonDivisibleNumber(input_token.decimals, input_amount),
      tag,
    },
  });
};

export const feeToPointDelta = (fee: number) => {
  switch (fee) {
    case 100:
      return 1;
    case 400:
      return 8;
    case 2000:
      return 40;
    case 10000:
      return 200;
  }
};

export const priceToPoint = ({
  tokenA,
  tokenB,
  amountA,
  amountB,
}: {
  tokenA: TokenMetadata;
  tokenB: TokenMetadata;
  amountA: string;
  amountB: string;
}) => {
  const decimal_price_A_by_B = new Big(amountB).div(amountA);
  const undecimal_price_A_by_B = decimal_price_A_by_B
    .times(new Big(10).pow(tokenB.decimals))
    .div(new Big(10).pow(tokenA.decimals));

  return (
    Math.floor(
      Math.log(undecimal_price_A_by_B.toNumber()) / Math.log(LOG_BASE) / 40
    ) * 40
  );
};

export const pointToPrice = ({
  tokenA,
  tokenB,
  point,
}: {
  tokenA: TokenMetadata;
  tokenB: TokenMetadata;
  point: number;
}) => {
  const undecimal_price = Math.pow(LOG_BASE, point);
  const decimal_price_A_by_B = new Big(undecimal_price)
    .times(new Big(10).pow(tokenA.decimals))
    .div(new Big(10).pow(tokenB.decimals));

  return decimal_price_A_by_B.toFixed();
};

export const quote_by_output = ({
  pool_ids,
  output_amount,
  input_token,
  output_token,
}: {
  pool_ids: string[];
  input_token: TokenMetadata;
  output_token: TokenMetadata;
  output_amount: string;
}) => {
  return refSwapV3ViewFunction({
    methodName: 'quote_by_output',
    args: {
      pool_ids,
      input_token: input_token.id,
      output_token: output_token.id,
      output_amount: toNonDivisibleNumber(output_token.decimals, output_amount),
    },
  });
};

interface SwapInfo {
  tokenA: TokenMetadata;
  tokenB: TokenMetadata;
  amountA: string;
  amountB: string;
}

interface V3Swap {
  swapInfo: SwapInfo;
  Swap?: {
    pool_ids: string[];
    min_output_amount: string;
  };
  SwapByOutput?: {
    pool_ids: string[];
    output_amount: string;
  };
  LimitOrder?: {
    pool_id: string;
  };
}

export const v3Swap = ({
  Swap,
  SwapByOutput,
  LimitOrder,
  swapInfo,
}: V3Swap) => {
  const transactions: Transaction[] = [];

  const { tokenA, tokenB, amountA, amountB } = swapInfo;

  console.log(Swap, tokenA, tokenB, amountA, amountB);

  if (Swap) {
    const pool_ids = Swap.pool_ids;

    const output_token = tokenB.id;
    const min_output_amount = toNonDivisibleNumber(
      tokenB.decimals,
      Swap.min_output_amount
    );

    const msg = JSON.stringify({
      Swap: {
        pool_ids,
        output_token,
        min_output_amount,
      },
    });

    transactions.push({
      receiverId: tokenA.id,
      functionCalls: [
        {
          methodName: 'ft_transfer_call',
          args: {
            receiver_id: REF_UNI_V3_SWAP_CONTRACT_ID,
            amount: toNonDivisibleNumber(tokenA.decimals, amountA),
            msg,
          },
          gas: '180000000000000',
          amount: ONE_YOCTO_NEAR,
        },
      ],
    });
    return executeMultipleTransactions(transactions);
  }

  if (SwapByOutput) {
    const pool_ids = Swap.pool_ids;
    const output_token = tokenB.id;
    const output_amount = toNonDivisibleNumber(tokenB.decimals, amountB);
    const msg = JSON.stringify({
      SwapByOutput: {
        pool_ids,
        output_token,
        output_amount,
      },
    });

    transactions.push({
      receiverId: tokenA.id,
      functionCalls: [
        {
          methodName: 'ft_transfer_call',
          args: {
            receiver_id: REF_UNI_V3_SWAP_CONTRACT_ID,
            amount: toNonDivisibleNumber(tokenA.decimals, amountA),
            msg,
          },
          gas: '180000000000000',
          amount: ONE_YOCTO_NEAR,
        },
      ],
    });

    return executeMultipleTransactions(transactions);
  }

  if (LimitOrder) {
    const pool_id = LimitOrder.pool_id;
    const buy_token = tokenB.id;
    const point = priceToPoint({
      amountA,
      amountB,
      tokenA,
      tokenB,
    });

    const msg = JSON.stringify({
      LimitOrder: {
        pool_id,
        buy_token,
        point,
      },
    });

    transactions.push({
      receiverId: tokenA.id,
      functionCalls: [
        {
          methodName: 'ft_transfer_call',
          args: {
            receiver_id: REF_UNI_V3_SWAP_CONTRACT_ID,
            amount: toNonDivisibleNumber(tokenA.decimals, amountA),
            msg,
          },
          gas: '180000000000000',
          amount: ONE_YOCTO_NEAR,
        },
      ],
    });

    return executeMultipleTransactions(transactions);
  }
};

export const list_history_orders = () => {
  return refSwapV3ViewFunction({
    methodName: 'list_history_orders',
    args: {
      account_id: getCurrentWallet()?.wallet?.getAccountId(),
    },
  });
};

export const list_active_orders = () => {
  return refSwapV3ViewFunction({
    methodName: 'list_active_orders',
    args: {
      account_id: getCurrentWallet()?.wallet?.getAccountId(),
    },
  });
};

export const get_order = (order_id: string) => {
  return refSwapV3ViewFunction({
    methodName: 'get_order',
    args: {
      order_id,
    },
  });
};

export const find_order = ({
  pool_id,
  swapInfo,
}: {
  pool_id: string;
  swapInfo: SwapInfo;
}) => {
  const point = priceToPoint(swapInfo);

  return refSwapV3ViewFunction({
    methodName: 'find_order',
    args: {
      account_id: getCurrentWallet().wallet.getAccountId(),
      pool_id,
      point,
    },
  });
};

export const cancel_order = ({
  order_id,
  amount,
  output_token,
}: {
  order_id: string;
  amount: string;
  output_token: TokenMetadata;
}) => {
  const undecimal_amount = toNonDivisibleNumber(output_token.decimals, amount);
  const transactions: Transaction[] = [
    {
      receiverId: REF_UNI_V3_SWAP_CONTRACT_ID,
      functionCalls: [
        {
          methodName: 'cancel_order',
          args: {
            order_id,
            amount: undecimal_amount,
          },
          gas: '180000000000000',
          amount: ONE_YOCTO_NEAR,
        },
      ],
    },
  ];

  return executeMultipleTransactions(transactions);
};

export const get_pool = (pool_id: string) => {
  return refSwapV3ViewFunction({
    methodName: 'get_pool',
    args: {
      pool_id,
    },
  });
};

export const get_pointorder_range = ({
  pool_id,
  left_point,
  right_point,
}: {
  pool_id: string;
  left_point?: number;
  right_point?: number;
}) => {
  return refVeViewFunction({
    methodName: 'get_pointorder_range',
    args: {
      pool_id,
      left_point: left_point || -800000,
      right_point: right_point || 800000,
    },
  });
};

export const create_pool = ({
  token_a,
  token_b,
  fee,
  init_point,
}: {
  token_a: string;
  token_b: string;
  fee: number;
  init_point: number;
}) => {
  const transactions: Transaction[] = [
    {
      receiverId: REF_UNI_V3_SWAP_CONTRACT_ID,
      functionCalls: [
        {
          methodName: 'create_pool',
          args: {
            token_a,
            token_b,
            fee,
            init_point,
          },
          amount: ONE_YOCTO_NEAR,
          gas: '180000000000000',
        },
      ],
    },
  ];

  return executeMultipleTransactions(transactions);
};
