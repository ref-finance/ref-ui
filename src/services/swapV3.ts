import { TokenMetadata, ftGetStorageBalance } from './ft-contract';

import { utils } from 'near-api-js';

import {
  refSwapV3ViewFunction,
  REF_UNI_V3_SWAP_CONTRACT_ID,
  ONE_YOCTO_NEAR,
  refSwapV3OldVersionViewFunction,
} from './near';
import {
  toNonDivisibleNumber,
  toReadableNumber,
  scientificNotationToString,
  ONLY_ZEROS,
} from '../utils/numbers';
import { getCurrentWallet } from '../utils/wallets-integration';
import _, { forEach } from 'lodash';
import Big from 'big.js';
import {
  Transaction,
  executeMultipleTransactions,
  refVeViewFunction,
} from './near';
import {
  storageDepositAction,
  STORAGE_TO_REGISTER_WITH_MFT,
  storageDepositForV3Action,
} from '../services/creators/storage';
import {
  currentStorageBalanceOfV3,
  currentStorageBalanceOfV3_old_version,
} from './account';
import { WRAP_NEAR_CONTRACT_ID, nearMetadata } from '../services/wrap-near';
import { registerAccountOnToken } from './creators/token';
import { nearDepositTransaction, nearWithdrawTransaction } from './wrap-near';
import { UserLiquidityInfo, getPointByPrice } from './commonV3';
import { toPrecision } from '../utils/numbers';
import { REF_DCL_POOL_CACHE_KEY } from '../state/swap';
import { REF_UNI_SWAP_CONTRACT_ID } from './near';
import {
  IAddLiquidityInfo,
  IBatchUpdateiquidityInfo,
  IRemoveLiquidityInfo,
} from '../pages/poolsV3/interfaces';
import getConfig from './config';
import de from 'date-fns/esm/locale/de/index.js';
const LOG_BASE = 1.0001;

export const V3_POOL_FEE_LIST = [100, 400, 2000, 10000];

const LETF_POINT_MIN = -800000;

const RIGHT_POINT_MAX = 800000;

export const V3_POOL_SPLITER = '|';

export const getV3PoolId = (tokenA: string, tokenB: string, fee: number) => {
  const tokenSeq = [tokenA, tokenB].sort().join('|');

  return `${tokenSeq}|${fee}`;
};

export const allPoolsThisPair = (tokenA: string, tokenB: string) => {
  return V3_POOL_FEE_LIST.map((fee) => getV3PoolId(tokenA, tokenB, fee));
};

export interface UserOrderInfo {
  order_id: string;
  owner_id: string;
  pool_id: string;
  point: number;
  sell_token: string;
  created_at: string;
  original_amount: string;
  remain_amount: string; // 0 means history order: ;
  cancel_amount: string;
  // amount through ft_transfer_call

  original_deposit_amount: string;
  // earn token amount through swap before actual place order

  swap_earn_amount: string;
  buy_token: string;
  unclaimed_amount: string; // claim will push it to inner account
  bought_amount: string; // accumalated amount into inner account
}
export const quote = async ({
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
  }).catch((e) => {
    return {
      amount: '0',
      tag: null,
    };
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

export const swapV3GetStorageBalance = (
  tokenId: string,
  accountId = getCurrentWallet().wallet.getAccountId()
) => {
  return refSwapV3ViewFunction({
    methodName: 'storage_balance_of',
    args: { account_id: accountId },
  });
};

export const priceToPoint = ({
  tokenA,
  tokenB,
  amountA,
  amountB,
  fee,
}: {
  tokenA: TokenMetadata;
  tokenB: TokenMetadata;
  amountA: string;
  amountB: string;
  fee: number;
}) => {
  const decimal_price_A_by_B = new Big(amountB).div(amountA);
  const undecimal_price_A_by_B = decimal_price_A_by_B
    .times(new Big(10).pow(tokenB.decimals))
    .div(new Big(10).pow(tokenA.decimals));

  const pointDelta = feeToPointDelta(fee);

  const price = decimal_price_A_by_B;

  const decimalRate = new Big(10)
    .pow(tokenB.decimals)
    .div(new Big(10).pow(tokenA.decimals))
    .toNumber();

  return getPointByPrice(
    pointDelta,
    scientificNotationToString(price.toString()),
    decimalRate
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

  return scientificNotationToString(decimal_price_A_by_B.toString());
};

export const regularizedPoint = (point: number, fee: number) => {
  const point_delta = feeToPointDelta(fee);

  return Math.floor(point / point_delta) * point_delta;
};

export const regularizedPrice = (
  price: string,
  tokenA: TokenMetadata,
  tokenB: TokenMetadata,
  fee: number,
  offset?: number
) => {
  const pointDelta = feeToPointDelta(fee);
  const decimalRate = new Big(10)
    .pow(tokenB.decimals)
    .div(new Big(10).pow(tokenA.decimals))
    .toNumber();

  const point =
    getPointByPrice(
      pointDelta,
      scientificNotationToString(price.toString()),
      decimalRate
    ) +
    (offset || 0) * pointDelta;

  return pointToPrice({
    tokenA,
    tokenB,
    point,
  });
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
  LimitOrderWithSwap?: {
    pool_id: string;
  };
}

export const v3Swap = async ({
  Swap,
  SwapByOutput,
  LimitOrderWithSwap,
  swapInfo,
}: V3Swap) => {
  const transactions: Transaction[] = [];
  const { tokenA, tokenB, amountA, amountB } = swapInfo;
  if (Swap) {
    const pool_ids = Swap.pool_ids;

    const tokenRegistered = await ftGetStorageBalance(tokenB.id).catch(() => {
      throw new Error(`${tokenB.id} doesn't exist.`);
    });

    if (tokenRegistered === null) {
      transactions.push({
        receiverId: tokenB.id,
        functionCalls: [registerAccountOnToken()],
      });
    }

    const output_token = tokenB.id;
    const min_output_amount = toPrecision(Swap.min_output_amount, 0);

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
    if (tokenB.id === WRAP_NEAR_CONTRACT_ID && tokenB.symbol == 'wNEAR') {
      transactions.push(
        nearDepositTransaction(
          toReadableNumber(nearMetadata.decimals, min_output_amount)
        )
      );
    }
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
    const tokenRegistered = await ftGetStorageBalance(tokenB.id).catch(() => {
      throw new Error(`${tokenB.id} doesn't exist.`);
    });

    if (tokenRegistered === null) {
      transactions.push({
        receiverId: tokenB.id,
        functionCalls: [registerAccountOnToken()],
      });
    }

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
  }
  if (LimitOrderWithSwap) {
    const pool_id = LimitOrderWithSwap.pool_id;

    const fee = Number(pool_id.split(V3_POOL_SPLITER)[2]);

    const buy_token = tokenB.id;
    const point = priceToPoint({
      amountA,
      amountB,
      tokenA,
      tokenB,
      fee,
    });

    const tokenRegistered = await ftGetStorageBalance(tokenB.id).catch(() => {
      throw new Error(`${tokenB.id} doesn't exist.`);
    });

    if (tokenRegistered === null) {
      transactions.push({
        receiverId: tokenB.id,
        functionCalls: [registerAccountOnToken()],
      });
    }
    const new_point =
      pool_id.split(V3_POOL_SPLITER)[0] === tokenA.id ? point : -point;

    const msg = JSON.stringify({
      LimitOrderWithSwap: {
        client_id: '',
        pool_id,
        buy_token,
        point: new_point,
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
          gas: '250000000000000',
          amount: ONE_YOCTO_NEAR,
        },
      ],
    });

    const neededStorage = await get_user_storage_detail({ size: 1 });
    if (!ONLY_ZEROS.test(neededStorage)) {
      transactions.unshift({
        receiverId: REF_UNI_V3_SWAP_CONTRACT_ID,
        functionCalls: [
          storageDepositAction({
            amount: neededStorage,
            registrationOnly: neededStorage == '0.5',
          }),
        ],
      });
    }
  }

  if (tokenA.id === WRAP_NEAR_CONTRACT_ID && tokenA.symbol == 'NEAR') {
    transactions.unshift(nearDepositTransaction(amountA));
  }

  if (tokenA.id === WRAP_NEAR_CONTRACT_ID) {
    const registered = await ftGetStorageBalance(WRAP_NEAR_CONTRACT_ID);
    if (registered === null) {
      transactions.unshift({
        receiverId: WRAP_NEAR_CONTRACT_ID,
        functionCalls: [registerAccountOnToken()],
      });
    }
  }

  return executeMultipleTransactions(transactions);
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

export const find_order = async ({
  pool_id,
  point,
}: {
  pool_id: string;
  point: number;
}) => {
  return refSwapV3ViewFunction({
    methodName: 'find_order',
    args: {
      account_id: getCurrentWallet().wallet.getAccountId(),
      pool_id,
      point,
    },
  }) as Promise<UserOrderInfo>;
};

export const cancel_order = ({
  order_id,
  undecimal_amount,
}: {
  order_id: string;
  undecimal_amount?: string;
}) => {
  const cancelCall = !!undecimal_amount
    ? {
        methodName: 'cancel_order',
        args: {
          order_id,
          amount: undecimal_amount,
        },
        gas: '180000000000000',
      }
    : {
        methodName: 'cancel_order',
        args: {
          order_id,
        },
        gas: '180000000000000',
      };

  const transactions: Transaction[] = [
    {
      receiverId: REF_UNI_V3_SWAP_CONTRACT_ID,
      functionCalls: [cancelCall],
    },
  ];

  return executeMultipleTransactions(transactions);
};

export const cancel_order_old = ({ order_id }: { order_id: string }) => {
  const transactions: Transaction[] = [
    {
      receiverId: REF_UNI_SWAP_CONTRACT_ID,
      functionCalls: [
        {
          methodName: 'cancel_order',
          args: {
            order_id,
            // amount: undecimal_amount,
          },
          gas: '180000000000000',
        },
      ],
    },
  ];

  return executeMultipleTransactions(transactions);
};

export const BLACK_POOL =
  'a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near|wrap.near|2000';

export const get_pool = async (pool_id: string, token0?: string) => {
  const [token_x, token_y, fee] = pool_id.split('|');

  const token_seq = [token_x, token_y].sort().join('|');

  const new_pool_id = `${token_seq}|${fee}`;

  const res = (await refSwapV3ViewFunction({
    methodName: 'get_pool',
    args: {
      pool_id: new_pool_id,
    },
  })) as PoolInfo;

  if (getConfig().DCL_POOL_BLACK_LIST.includes(res?.pool_id)) {
    return null;
  }

  return res;
};
export const get_pool_old_version = async (
  pool_id: string,
  token0?: string
) => {
  const [token_x, token_y, fee] = pool_id.split('|');

  const token_seq = [token_x, token_y].sort().join('|');

  const new_pool_id = `${token_seq}|${fee}`;

  return refSwapV3OldVersionViewFunction({
    methodName: 'get_pool',
    args: {
      pool_id: new_pool_id,
    },
  }) as Promise<PoolInfo>;
};

export const get_pool_from_cache = async (pool_id: string, token0?: string) => {
  const [token_x, token_y, fee] = pool_id.split('|');

  const token_seq = [token_x, token_y].sort().join('|');

  const new_pool_id = `${token_seq}|${fee}`;

  const cachedPools = localStorage.getItem(REF_DCL_POOL_CACHE_KEY);

  const foundPool =
    cachedPools &&
    JSON.parse(cachedPools).find((pool: any) => pool.pool_id === new_pool_id);

  if (foundPool) {
    return foundPool;
  }

  const res = (await refSwapV3ViewFunction({
    methodName: 'get_pool',
    args: {
      pool_id: new_pool_id,
    },
  })) as PoolInfo;

  if (getConfig().DCL_POOL_BLACK_LIST.includes(res?.pool_id)) {
    return null;
  }

  return res;
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
  return refSwapV3ViewFunction({
    methodName: 'get_pointorder_range',
    args: {
      pool_id,
      left_point: left_point || LETF_POINT_MIN,
      right_point: right_point || RIGHT_POINT_MAX,
    },
  });
};

export const getLimitOrderRangeCountAndPool = async ({
  pool_id,
  left_point,
  right_point,
  token0,
}: {
  pool_id: string;
  left_point?: number;
  right_point?: number;
  token0: string;
}) => {
  const pool = await get_pool(pool_id, token0);

  const rangeCount = !pool
    ? null
    : await get_pointorder_range({
        pool_id,
        left_point,
        right_point,
      });

  return {
    rangeCount,
    pool,
  };
};

export const create_pool = async ({
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
  const tokenIds = [token_a, token_b];
  const storageBalances = await Promise.all(
    tokenIds.map((id) => ftGetStorageBalance(id, REF_UNI_V3_SWAP_CONTRACT_ID))
  );

  const transactions: Transaction[] = storageBalances
    .reduce((acc, sb, i) => {
      if (!sb || sb.total === '0') acc.push(tokenIds[i]);
      return acc;
    }, [])
    .map((id) => ({
      receiverId: id,
      functionCalls: [storageDepositForV3Action()],
    }));
  transactions.push({
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
        gas: '180000000000000',
        amount: '0.1',
      },
    ],
  });
  return executeMultipleTransactions(transactions);
};
export const list_pools = async () => {
  const res = await refSwapV3ViewFunction({
    methodName: 'list_pools',
  });

  return res.filter(
    (p: any) => !getConfig().DCL_POOL_BLACK_LIST.includes(p?.pool_id)
  );
};

export interface UserStorageDetail {
  max_slots: number;
  cur_order_slots: number;
  cur_liquidity_slots: number;
  locked_near: string;
  storage_for_asset: string;
  slot_price: string;
  sponsor_id: string;
}

export const get_user_storage_detail = async ({ size }: { size: number }) => {
  const user_id = window.selectorAccountId;

  let deposit_fee = new Big(0);

  if (!user_id) {
    alert('sign in first');
    return;
  }

  const detail: UserStorageDetail = await refSwapV3ViewFunction({
    methodName: 'get_user_storage_detail',
    args: {
      user_id,
    },
  });
  // first register
  if (!detail) {
    return '0.5';
  }
  const {
    max_slots,
    cur_order_slots,
    cur_liquidity_slots,
    locked_near,
    storage_for_asset,
    slot_price,
  } = detail;

  if (size + cur_liquidity_slots + cur_order_slots > max_slots) {
    const need_num = size + cur_liquidity_slots + cur_order_slots - max_slots;
    const need_num_final = Math.max(need_num, 10);
    deposit_fee = deposit_fee.plus(new Big(slot_price).mul(need_num_final));
    if (user_id !== detail.sponsor_id) {
      deposit_fee = deposit_fee.plus(new Big(detail.locked_near));
    }
  }
  if (deposit_fee.eq(0)) {
    return '';
  }

  return utils.format.formatNearAmount(deposit_fee.toFixed(0));
};

export const add_liquidity = async ({
  pool_id,
  left_point,
  right_point,
  amount_x,
  amount_y,
  token_x,
  token_y,
}: {
  pool_id: string;
  left_point: number;
  right_point: number;
  amount_x: string;
  amount_y: string;
  token_x: TokenMetadata;
  token_y: TokenMetadata;
}) => {
  const transactions: Transaction[] = [
    {
      receiverId: REF_UNI_V3_SWAP_CONTRACT_ID,
      functionCalls: [
        {
          methodName: 'add_liquidity',
          args: {
            pool_id,
            left_point,
            right_point,
            amount_x,
            amount_y,
            min_amount_x: '0',
            min_amount_y: '0',
          },
          gas: '150000000000000',
        },
      ],
    },
  ];
  if (+amount_x > 0) {
    transactions.unshift({
      receiverId: token_x.id,
      functionCalls: [
        {
          methodName: 'ft_transfer_call',
          args: {
            receiver_id: REF_UNI_V3_SWAP_CONTRACT_ID,
            amount: amount_x,
            msg: '"Deposit"',
          },
          amount: ONE_YOCTO_NEAR,
          gas: '150000000000000',
        },
      ],
    });
  }
  if (+amount_y > 0) {
    transactions.unshift({
      receiverId: token_y.id,
      functionCalls: [
        {
          methodName: 'ft_transfer_call',
          args: {
            receiver_id: REF_UNI_V3_SWAP_CONTRACT_ID,
            amount: amount_y,
            msg: '"Deposit"',
          },
          amount: ONE_YOCTO_NEAR,
          gas: '150000000000000',
        },
      ],
    });
  }
  if (+amount_x > 0 && token_x.id == WRAP_NEAR_CONTRACT_ID) {
    transactions.unshift({
      receiverId: WRAP_NEAR_CONTRACT_ID,
      functionCalls: [
        {
          methodName: 'near_deposit',
          args: {},
          gas: '50000000000000',
          amount: toReadableNumber(token_x.decimals, amount_x),
        },
      ],
    });
  }
  if (+amount_y > 0 && token_y.id == WRAP_NEAR_CONTRACT_ID) {
    transactions.unshift({
      receiverId: WRAP_NEAR_CONTRACT_ID,
      functionCalls: [
        {
          methodName: 'near_deposit',
          args: {},
          gas: '50000000000000',
          amount: toReadableNumber(token_y.decimals, amount_y),
        },
      ],
    });
  }
  const ftBalance_x = await ftGetStorageBalance(token_x.id);
  if (!ftBalance_x) {
    transactions.unshift({
      receiverId: token_x.id,
      functionCalls: [
        storageDepositAction({
          registrationOnly: true,
          amount: STORAGE_TO_REGISTER_WITH_MFT,
        }),
      ],
    });
  }
  const ftBalance_y = await ftGetStorageBalance(token_y.id);
  if (!ftBalance_y) {
    transactions.unshift({
      receiverId: token_y.id,
      functionCalls: [
        storageDepositAction({
          registrationOnly: true,
          amount: STORAGE_TO_REGISTER_WITH_MFT,
        }),
      ],
    });
  }
  const neededStorage = await get_user_storage_detail({ size: 1 });
  if (!ONLY_ZEROS.test(neededStorage)) {
    transactions.unshift({
      receiverId: REF_UNI_V3_SWAP_CONTRACT_ID,
      functionCalls: [
        storageDepositAction({
          amount: neededStorage,
          registrationOnly: neededStorage == '0.5',
        }),
      ],
    });
  }
  return executeMultipleTransactions(transactions);
};

export const batch_add_liquidity = async ({
  liquidityInfos,
  token_x,
  token_y,
  amount_x,
  amount_y,
  selectedWalletId = window.selector?.store?.getState()?.selectedWalletId,
}: {
  liquidityInfos: IAddLiquidityInfo[];
  token_x: TokenMetadata;
  token_y: TokenMetadata;
  amount_x: string;
  amount_y: string;
  selectedWalletId: string;
}) => {
  let split_num = 10;
  let need_split = false;
  if (selectedWalletId == 'ledger') {
    split_num = 1;
    need_split = true;
  } else if (selectedWalletId == 'neth' || selectedWalletId == 'here-wallet') {
    split_num = 5;
    need_split = true;
  }
  const transactions: Transaction[] = [];
  const n = Math.ceil(liquidityInfos.length / split_num);
  for (let i = 0; i < n; i++) {
    const start_index = i * split_num;
    const end_index = start_index + split_num;
    const arr_i = liquidityInfos.slice(start_index, end_index);
    transactions.push({
      receiverId: REF_UNI_V3_SWAP_CONTRACT_ID,
      functionCalls: [
        {
          methodName: 'batch_add_liquidity',
          args: {
            add_liquidity_infos: arr_i,
          },
          gas: need_split ? '250000000000000' : '300000000000000',
        },
      ],
    });
  }
  if (+amount_x > 0) {
    transactions.unshift({
      receiverId: token_x.id,
      functionCalls: [
        {
          methodName: 'ft_transfer_call',
          args: {
            receiver_id: REF_UNI_V3_SWAP_CONTRACT_ID,
            amount: amount_x,
            msg: '"Deposit"',
          },
          amount: ONE_YOCTO_NEAR,
          gas: '150000000000000',
        },
      ],
    });
  }
  if (+amount_y > 0) {
    transactions.unshift({
      receiverId: token_y.id,
      functionCalls: [
        {
          methodName: 'ft_transfer_call',
          args: {
            receiver_id: REF_UNI_V3_SWAP_CONTRACT_ID,
            amount: amount_y,
            msg: '"Deposit"',
          },
          amount: ONE_YOCTO_NEAR,
          gas: '150000000000000',
        },
      ],
    });
  }
  if (+amount_x > 0 && token_x.id == WRAP_NEAR_CONTRACT_ID) {
    transactions.unshift({
      receiverId: WRAP_NEAR_CONTRACT_ID,
      functionCalls: [
        {
          methodName: 'near_deposit',
          args: {},
          gas: '50000000000000',
          amount: toReadableNumber(token_x.decimals, amount_x),
        },
      ],
    });
  }
  if (+amount_y > 0 && token_y.id == WRAP_NEAR_CONTRACT_ID) {
    transactions.unshift({
      receiverId: WRAP_NEAR_CONTRACT_ID,
      functionCalls: [
        {
          methodName: 'near_deposit',
          args: {},
          gas: '50000000000000',
          amount: toReadableNumber(token_y.decimals, amount_y),
        },
      ],
    });
  }
  const ftBalance_x = await ftGetStorageBalance(token_x.id);
  if (!ftBalance_x) {
    transactions.unshift({
      receiverId: token_x.id,
      functionCalls: [
        storageDepositAction({
          registrationOnly: true,
          amount: STORAGE_TO_REGISTER_WITH_MFT,
        }),
      ],
    });
  }
  const ftBalance_y = await ftGetStorageBalance(token_y.id);
  if (!ftBalance_y) {
    transactions.unshift({
      receiverId: token_y.id,
      functionCalls: [
        storageDepositAction({
          registrationOnly: true,
          amount: STORAGE_TO_REGISTER_WITH_MFT,
        }),
      ],
    });
  }
  const neededStorage = await get_user_storage_detail({ size: 9 });
  if (!ONLY_ZEROS.test(neededStorage)) {
    transactions.unshift({
      receiverId: REF_UNI_V3_SWAP_CONTRACT_ID,
      functionCalls: [
        storageDepositAction({
          amount: neededStorage,
          registrationOnly: neededStorage == '0.5',
        }),
      ],
    });
  }
  return executeMultipleTransactions(transactions);
};

export const append_liquidity = async ({
  lpt_id,
  mft_id,
  amount_x,
  amount_y,
  token_x,
  token_y,
}: {
  lpt_id: string;
  mft_id: string;
  amount_x: string;
  amount_y: string;
  token_x: TokenMetadata;
  token_y: TokenMetadata;
}) => {
  const functionCallsV3: any = [];
  if (mft_id) {
    functionCallsV3.push({
      methodName: 'burn_v_liquidity',
      args: {
        lpt_id,
      },
      gas: '100000000000000',
    });
  }
  functionCallsV3.push({
    methodName: 'append_liquidity',
    args: {
      lpt_id,
      amount_x,
      amount_y,
      min_amount_x: '0',
      min_amount_y: '0',
    },
    gas: '150000000000000',
  });
  const transactions: Transaction[] = [
    {
      receiverId: REF_UNI_V3_SWAP_CONTRACT_ID,
      functionCalls: functionCallsV3,
    },
  ];
  if (+amount_x > 0) {
    transactions.unshift({
      receiverId: token_x.id,
      functionCalls: [
        {
          methodName: 'ft_transfer_call',
          args: {
            receiver_id: REF_UNI_V3_SWAP_CONTRACT_ID,
            amount: amount_x,
            msg: '"Deposit"',
          },
          amount: ONE_YOCTO_NEAR,
          gas: '150000000000000',
        },
      ],
    });
  }
  if (+amount_y > 0) {
    transactions.unshift({
      receiverId: token_y.id,
      functionCalls: [
        {
          methodName: 'ft_transfer_call',
          args: {
            receiver_id: REF_UNI_V3_SWAP_CONTRACT_ID,
            amount: amount_y,
            msg: '"Deposit"',
          },
          amount: ONE_YOCTO_NEAR,
          gas: '150000000000000',
        },
      ],
    });
  }
  if (+amount_x > 0 && token_x.id == WRAP_NEAR_CONTRACT_ID) {
    transactions.unshift({
      receiverId: WRAP_NEAR_CONTRACT_ID,
      functionCalls: [
        {
          methodName: 'near_deposit',
          args: {},
          gas: '50000000000000',
          amount: toReadableNumber(token_x.decimals, amount_x),
        },
      ],
    });
  }
  if (+amount_y > 0 && token_y.id == WRAP_NEAR_CONTRACT_ID) {
    transactions.unshift({
      receiverId: WRAP_NEAR_CONTRACT_ID,
      functionCalls: [
        {
          methodName: 'near_deposit',
          args: {},
          gas: '50000000000000',
          amount: toReadableNumber(token_y.decimals, amount_y),
        },
      ],
    });
  }
  const ftBalance_x = await ftGetStorageBalance(token_x.id);
  if (!ftBalance_x) {
    transactions.unshift({
      receiverId: token_x.id,
      functionCalls: [
        storageDepositAction({
          registrationOnly: true,
          amount: STORAGE_TO_REGISTER_WITH_MFT,
        }),
      ],
    });
  }
  const ftBalance_y = await ftGetStorageBalance(token_y.id);
  if (!ftBalance_y) {
    transactions.unshift({
      receiverId: token_y.id,
      functionCalls: [
        storageDepositAction({
          registrationOnly: true,
          amount: STORAGE_TO_REGISTER_WITH_MFT,
        }),
      ],
    });
  }
  const neededStorage = await checkTokenNeedsStorageDeposit_v3();
  if (neededStorage) {
    transactions.unshift({
      receiverId: REF_UNI_V3_SWAP_CONTRACT_ID,
      functionCalls: [
        storageDepositAction({ amount: neededStorage, registrationOnly: true }),
      ],
    });
  }
  return executeMultipleTransactions(transactions);
};
export const remove_liquidity = async ({
  token_x,
  token_y,
  lpt_id,
  mft_id,
  amount,
  min_amount_x,
  min_amount_y,
  isLegacy,
}: {
  token_x: TokenMetadata;
  token_y: TokenMetadata;
  lpt_id: string;
  mft_id?: string;
  amount: string;
  min_amount_x: string;
  min_amount_y: string;
  isLegacy?: boolean;
}) => {
  const functionCallsV3: any = [];
  if (mft_id) {
    functionCallsV3.push({
      methodName: 'burn_v_liquidity',
      args: {
        lpt_id,
      },
      gas: '100000000000000',
    });
  }
  functionCallsV3.push({
    methodName: 'remove_liquidity',
    args: {
      lpt_id,
      amount,
      min_amount_x,
      min_amount_y,
    },
    gas: '150000000000000',
  });
  const transactions: Transaction[] = [
    {
      receiverId: isLegacy
        ? REF_UNI_SWAP_CONTRACT_ID
        : REF_UNI_V3_SWAP_CONTRACT_ID,
      functionCalls: functionCallsV3,
    },
  ];

  const ftBalance_x = await ftGetStorageBalance(token_x.id);
  if (!ftBalance_x) {
    transactions.unshift({
      receiverId: token_x.id,
      functionCalls: [
        storageDepositAction({
          registrationOnly: true,
          amount: STORAGE_TO_REGISTER_WITH_MFT,
        }),
      ],
    });
  }
  const ftBalance_y = await ftGetStorageBalance(token_y.id);
  if (!ftBalance_y) {
    transactions.unshift({
      receiverId: token_y.id,
      functionCalls: [
        storageDepositAction({
          registrationOnly: true,
          amount: STORAGE_TO_REGISTER_WITH_MFT,
        }),
      ],
    });
  }
  const check_fun = isLegacy
    ? checkTokenNeedsStorageDeposit_v3_old_version
    : checkTokenNeedsStorageDeposit_v3;
  const neededStorage = await check_fun();
  if (neededStorage) {
    transactions.unshift({
      receiverId: isLegacy
        ? REF_UNI_SWAP_CONTRACT_ID
        : REF_UNI_V3_SWAP_CONTRACT_ID,
      functionCalls: [
        storageDepositAction({ amount: neededStorage, registrationOnly: true }),
      ],
    });
  }
  return executeMultipleTransactions(transactions);
};
export const batch_remove_liquidity_contract = async ({
  token_x,
  token_y,
  batch_remove_liquidity,
  batch_update_liquidity,
  mint_liquidities,
  selectedWalletId = window.selector?.store?.getState()?.selectedWalletId,
}: {
  token_x: TokenMetadata;
  token_y: TokenMetadata;
  batch_remove_liquidity: IRemoveLiquidityInfo[];
  batch_update_liquidity: IBatchUpdateiquidityInfo;
  mint_liquidities: UserLiquidityInfo[];
  selectedWalletId: string;
}) => {
  let max_number = 10;
  let max_batch_update_number = 10;
  let need_split = false;
  if (selectedWalletId == 'ledger') {
    max_number = 2;
    max_batch_update_number = 1;
    need_split = true;
  } else if (selectedWalletId == 'neth') {
    max_number = 5;
    max_batch_update_number = 2;
    need_split = true;
  } else if (selectedWalletId == 'here-wallet') {
    max_number = 10;
    max_batch_update_number = 5;
    need_split = true;
  }
  const transactions: Transaction[] = [];
  if (mint_liquidities.length) {
    const lpt_ids: any[] = [];
    mint_liquidities.forEach((l: UserLiquidityInfo) => {
      lpt_ids.push(l.lpt_id);
    });
    transactions.push({
      receiverId: REF_UNI_V3_SWAP_CONTRACT_ID,
      functionCalls: [
        {
          methodName: 'batch_burn_v_liquidity',
          args: {
            lpt_ids,
          },
          gas: '250000000000000',
        },
      ],
    });
  }
  if (batch_remove_liquidity) {
    const length = batch_remove_liquidity.length;
    const ts_length = Math.ceil(length / max_number);
    for (let i = 0; i < ts_length; i++) {
      let batch_remove_liquidity_i;
      const startIndex = i * max_number;
      const endIndex = startIndex + max_number;
      batch_remove_liquidity_i = batch_remove_liquidity.slice(
        startIndex,
        endIndex
      );
      transactions.push({
        receiverId: REF_UNI_V3_SWAP_CONTRACT_ID,
        functionCalls: [
          {
            methodName: 'batch_remove_liquidity',
            args: {
              remove_liquidity_infos: batch_remove_liquidity_i,
            },
            gas: need_split ? '250000000000000' : '300000000000000',
          },
        ],
      });
    }
  }
  if (batch_update_liquidity) {
    const { add_liquidity_infos, remove_liquidity_infos } =
      batch_update_liquidity;
    const length = add_liquidity_infos.length;
    const ts_length = Math.ceil(length / max_batch_update_number);
    for (let i = 0; i < ts_length; i++) {
      let batch_update_liquidity_i;
      const startIndex = i * max_batch_update_number;
      const endIndex = startIndex + max_batch_update_number;
      batch_update_liquidity_i = {
        add_liquidity_infos: add_liquidity_infos.slice(startIndex, endIndex),
        remove_liquidity_infos: remove_liquidity_infos.slice(
          startIndex,
          endIndex
        ),
      };
      transactions.push({
        receiverId: REF_UNI_V3_SWAP_CONTRACT_ID,
        functionCalls: [
          {
            methodName: 'batch_update_liquidity',
            args: batch_update_liquidity_i,
            gas: need_split ? '250000000000000' : '300000000000000',
          },
        ],
      });
    }

    if (need_split) {
      transactions.push({
        receiverId: REF_UNI_V3_SWAP_CONTRACT_ID,
        functionCalls: [
          {
            methodName: 'withdraw_asset',
            args: { token_id: token_x.id },
            gas: '250000000000000',
          },
        ],
      });
      transactions.push({
        receiverId: REF_UNI_V3_SWAP_CONTRACT_ID,
        functionCalls: [
          {
            methodName: 'withdraw_asset',
            args: { token_id: token_y.id },
            gas: '250000000000000',
          },
        ],
      });
    } else {
      const widthdrawActions: any[] = [];
      widthdrawActions.push({
        methodName: 'withdraw_asset',
        args: { token_id: token_x.id },
        gas: '100000000000000',
      });
      widthdrawActions.push({
        methodName: 'withdraw_asset',
        args: { token_id: token_y.id },
        gas: '100000000000000',
      });
      transactions.push({
        receiverId: REF_UNI_V3_SWAP_CONTRACT_ID,
        functionCalls: widthdrawActions,
      });
    }
  }
  const ftBalance_x = await ftGetStorageBalance(token_x.id);
  if (!ftBalance_x) {
    transactions.unshift({
      receiverId: token_x.id,
      functionCalls: [
        storageDepositAction({
          registrationOnly: true,
          amount: STORAGE_TO_REGISTER_WITH_MFT,
        }),
      ],
    });
  }
  const ftBalance_y = await ftGetStorageBalance(token_y.id);
  if (!ftBalance_y) {
    transactions.unshift({
      receiverId: token_y.id,
      functionCalls: [
        storageDepositAction({
          registrationOnly: true,
          amount: STORAGE_TO_REGISTER_WITH_MFT,
        }),
      ],
    });
  }
  const neededStorage = await get_user_storage_detail({ size: 0 });
  if (neededStorage) {
    transactions.unshift({
      receiverId: REF_UNI_V3_SWAP_CONTRACT_ID,
      functionCalls: [
        storageDepositAction({
          amount: neededStorage,
          registrationOnly: neededStorage == '0.5',
        }),
      ],
    });
  }
  return executeMultipleTransactions(transactions);
};

export const claim_all_liquidity_fee = async ({
  token_x,
  token_y,
  lpt_ids,
}: {
  token_x: TokenMetadata;
  token_y: TokenMetadata;
  lpt_ids: string[];
}) => {
  const transactions: Transaction[] = [];
  lpt_ids.forEach((lpt_id: string) => {
    transactions.push({
      receiverId: REF_UNI_V3_SWAP_CONTRACT_ID,
      functionCalls: [
        {
          methodName: 'remove_liquidity',
          args: {
            lpt_id,
            amount: '0',
            min_amount_x: '0',
            min_amount_y: '0',
          },
          gas: '150000000000000',
        },
      ],
    });
  });

  const ftBalance_x = await ftGetStorageBalance(token_x.id);
  if (!ftBalance_x) {
    transactions.unshift({
      receiverId: token_x.id,
      functionCalls: [
        storageDepositAction({
          registrationOnly: true,
          amount: STORAGE_TO_REGISTER_WITH_MFT,
        }),
      ],
    });
  }
  const ftBalance_y = await ftGetStorageBalance(token_y.id);
  if (!ftBalance_y) {
    transactions.unshift({
      receiverId: token_y.id,
      functionCalls: [
        storageDepositAction({
          registrationOnly: true,
          amount: STORAGE_TO_REGISTER_WITH_MFT,
        }),
      ],
    });
  }

  const neededStorage = await get_user_storage_detail({ size: 0 });
  if (neededStorage) {
    transactions.unshift({
      receiverId: REF_UNI_V3_SWAP_CONTRACT_ID,
      functionCalls: [
        storageDepositAction({
          amount: neededStorage,
          registrationOnly: neededStorage == '0.5',
        }),
      ],
    });
  }
  return executeMultipleTransactions(transactions);
};

export const checkTokenNeedsStorageDeposit_v3 = async () => {
  let storageNeeded;
  const balance = await currentStorageBalanceOfV3(
    getCurrentWallet().wallet.getAccountId()
  );

  if (!balance) {
    storageNeeded = '0.5';
  }
  return storageNeeded;
};
export const checkTokenNeedsStorageDeposit_v3_old_version = async () => {
  let storageNeeded;
  const balance = await currentStorageBalanceOfV3_old_version(
    getCurrentWallet().wallet.getAccountId()
  );

  if (!balance) {
    storageNeeded = '0.5';
  }
  return storageNeeded;
};
export const list_liquidities = async () => {
  const res = await refSwapV3ViewFunction({
    methodName: 'list_liquidities',
    args: {
      account_id: getCurrentWallet()?.wallet?.getAccountId(),
    },
  });

  return res.filter(
    (item: any) => !getConfig().DCL_POOL_BLACK_LIST.includes(item.pool_id)
  );
};
export const list_liquidities_old_version = async () => {
  return refSwapV3OldVersionViewFunction({
    methodName: 'list_liquidities',
    args: {
      account_id: getCurrentWallet()?.wallet?.getAccountId(),
    },
  });
};
export const get_liquidity = async (lpt_id: string) => {
  return refSwapV3ViewFunction({
    methodName: 'get_liquidity',
    args: {
      lpt_id,
    },
  });
};
export const get_liquidity_old_version = async (lpt_id: string) => {
  return refSwapV3OldVersionViewFunction({
    methodName: 'get_liquidity',
    args: {
      lpt_id,
    },
  });
};

export const list_user_assets = async () => {
  const account_id = getCurrentWallet().wallet.getAccountId();

  if (!account_id) return;

  return refSwapV3ViewFunction({
    methodName: 'list_user_assets',
    args: {
      account_id,
    },
  });
};

export const get_pool_marketdepth = async (pool_id: string) => {
  return refSwapV3ViewFunction({
    methodName: 'get_marketdepth',
    args: {
      pool_id,
      depth: 100,
    },
  });
};
export const get_pool_marketdepth_old_version = async (pool_id: string) => {
  return refSwapV3OldVersionViewFunction({
    methodName: 'get_marketdepth',
    args: {
      pool_id,
      depth: 100,
    },
  });
};

export const listPools = async () => {
  const res = await refSwapV3ViewFunction({
    methodName: 'list_pools',
  });

  return res.filter(
    (p: any) => !getConfig().DCL_POOL_BLACK_LIST.includes(p?.pool_id)
  );
};

export const cacheAllDCLPools = async () => {
  const pools = await listPools();

  localStorage.setItem(REF_DCL_POOL_CACHE_KEY, JSON.stringify(pools));
};

export interface UserStorageDetail {
  max_slots: number;
  cur_order_slots: number;
  cur_liquidity_slots: number;
  locked_near: string;
  storage_for_asset: string;
  slot_price: string;
  sponsor_id: string;
}
// export const get_user_storage_detail = async ({ size }: { size: number }) => {
//   const user_id = window.selectorAccountId;

//   let deposit_fee = new Big(0);

//   if (!user_id) {
//     alert('sign in first');
//     return;
//   }

//   const detail: UserStorageDetail = await refSwapV3ViewFunction({
//     methodName: 'get_user_storage_detail',
//     args: {
//       user_id,
//     },
//   });
//   // first register
//   if (!detail) {
//     return '0.5';
//   }
//   const {
//     max_slots,
//     cur_order_slots,
//     cur_liquidity_slots,
//     locked_near,
//     storage_for_asset,
//     slot_price,
//   } = detail;

//   if (size + cur_liquidity_slots + cur_order_slots > max_slots) {
//     const need_num = size + cur_liquidity_slots + cur_order_slots - max_slots;
//     const need_num_final = Math.max(need_num, 10);
//     deposit_fee = deposit_fee.plus(new Big(slot_price).mul(need_num_final));
//     if (user_id !== detail.sponsor_id) {
//       deposit_fee = deposit_fee.plus(new Big(detail.locked_near));
//     }
//   }
//   if (deposit_fee.eq(0)) {
//     return '';
//   }

//   return utils.format.formatNearAmount(deposit_fee.toFixed(0));
// };

export const get_metadata = () => {
  return refSwapV3ViewFunction({
    methodName: 'get_metadata',
  });
};

export const dcl_mft_balance_of = (token_id: string) => {
  return refSwapV3ViewFunction({
    methodName: 'mft_balance_of',
    args: {
      token_id,
      account_id: getCurrentWallet()?.wallet?.getAccountId(),
    },
  });
};

export interface PoolInfo {
  pool_id?: string;
  token_x?: string;
  token_y?: string;
  fee: number;
  point_delta?: number;
  current_point?: number;
  state?: string; // running or paused
  total_liquidity?: string;
  liquidity?: string;
  liquidity_x?: string;
  max_liquidity_per_point?: string;
  percent?: string;
  total_x?: string;
  total_y?: string;
  tvl?: number;
  token_x_metadata?: TokenMetadata;
  token_y_metadata?: TokenMetadata;
  total_fee_x_charged?: string;
  total_fee_y_charged?: string;
  top_bin_apr?: string;
  top_bin_apr_display?: string;
  tvlUnreal?: boolean;
}
