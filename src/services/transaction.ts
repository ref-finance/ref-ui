import { ftGetTokenMetadata, TokenMetadata } from '../services/ft-contract';
import { toReadableNumber } from '../utils/numbers';
import { getPoolDetails } from '../services/pool';
import { useIntl } from 'react-intl';
import getConfig from '../services/config';
import {
  LP_TOKEN_DECIMALS,
  LP_STABLE_TOKEN_DECIMALS,
} from '../services/m-token';
import { XREF_TOKEN_DECIMALS } from '../services/xref';
import BigNumber from 'bignumber.js';
import { ParserDependencies } from 'mathjs';
const config = getConfig();
const STABLE_POOL_ID = config.STABLE_POOL_ID;
const STABLE_POOL_IDS = config.STABLE_POOL_IDS;

export const parseAction = async (
  methodName: string,
  params: any,
  tokenId?: string,
  amount?: string
) => {
  switch (methodName) {
    case 'swap': {
      return await parseSwap(params);
    }
    case 'withdraw': {
      return await parseWithdraw(params);
    }
    case 'register_tokens': {
      return parseRegisterTokens(params);
    }
    case 'add_liquidity': {
      return await parseAddLiquidity(params);
    }
    case 'remove_liquidity': {
      return await parseRemoveLiquidity(params);
    }
    case 'add_simple_pool': {
      return await parseAddSimplePool(params);
    }
    case 'storage_deposit': {
      return await parseStorageDeposit();
    }
    case 'mft_transfer_call': {
      return await parseMtfTransferCall(params);
    }
    case 'withdraw_seed': {
      return await parseWithdrawSeed(params);
    }
    case 'claim_reward_by_farm': {
      return await parseClaimRewardByFarm(params);
    }
    case 'claim_reward_by_seed': {
      return await parseClaimRewardBySeed(params);
    }
    case 'withdraw_reward': {
      return await parseWithdrawReward(params);
    }
    case 'near_deposit': {
      return await parseNearDeposit();
    }
    case 'ft_transfer_call': {
      return await parseFtTransferCall(params, tokenId);
    }
    case 'near_withdraw': {
      return await parseNearWithdraw(params);
    }
    case 'add_stable_liquidity': {
      return await parseAddStableLiquidity(params);
    }
    case 'remove_liquidity_by_tokens': {
      return await parseRemoveStableLiquidity(params);
    }
    case 'unstake': {
      return await parseUnstake(params);
    }
    case 'sell_with_price_callback': {
      return await parseUSNSell(params);
    }
    case 'buy_with_price_callback': {
      return await parseUSNBuy(params);
    }
    case 'call': {
      return await parseCall(tokenId);
    }
    default: {
      return await parseDefault();
    }
  }
};

const parseSwap = async (params: any) => {
  try {
    params = JSON.parse(params);
  } catch (error) {
    params = {};
  }
  const actionStart = params.actions[0];
  const actionEnd = params.actions[params.actions.length - 1];
  const in_token = await ftGetTokenMetadata(actionStart.token_in);
  const out_token = await ftGetTokenMetadata(actionEnd.token_out);
  const poolIdArr: (number | string)[] = [];
  let amountIn = '0';
  let amountOut = '0';
  if (
    !actionStart.min_amount_out ||
    new BigNumber(actionStart.min_amount_out).isEqualTo('0')
  ) {
    // smart swap
    amountIn = actionStart.amount_in;
    amountOut = actionEnd.min_amount_out;
  } else {
    // normal swap (base,parallel)
    params.actions.forEach((action: any) => {
      const { amount_in, min_amount_out, pool_id } = action;
      amountIn = new BigNumber(amount_in || '0').plus(amountIn).toFixed();
      amountOut = new BigNumber(min_amount_out || '0')
        .plus(amountOut)
        .toFixed();
    });
  }
  params.actions.forEach((action: any) => {
    const { pool_id } = action;
    poolIdArr.push(pool_id);
  });

  return {
    Action: 'Swap',
    'Pool Id': poolIdArr.join(','),
    'Amount In': toReadableNumber(in_token.decimals, amountIn),
    'Min Amount Out': toReadableNumber(out_token.decimals, amountOut),
    'Token In': in_token.symbol,
    'Token Out': out_token.symbol,
  };
};

const parseWithdraw = async (params: any) => {
  try {
    params = JSON.parse(params);
  } catch (error) {
    params = {};
  }
  const token = await ftGetTokenMetadata(params.token_id);

  return {
    Action: 'Withdraw',
    Amount: toReadableNumber(token.decimals, params.amount),
    Token: token.symbol,
    'Token Address': token.id,
  };
};

const parseRegisterTokens = (params: any) => {
  try {
    params = JSON.parse(params);
  } catch (error) {
    params = {};
  }
  return {
    Action: 'Register Tokens',
    'Token Ids': params.token_ids.join(','),
  };
};

const parseAddLiquidity = async (params: any) => {
  try {
    params = JSON.parse(params);
  } catch (error) {
    params = {};
  }
  const pool = await getPoolDetails(params.pool_id);
  const tokens = await Promise.all<TokenMetadata>(
    pool.tokenIds.map((id) => ftGetTokenMetadata(id))
  );

  return {
    Action: 'Add Liquidity',
    'Pool Id': params.pool_id,
    'Amount One': toReadableNumber(tokens[0].decimals, params.amounts[0]),
    'Amount Two': toReadableNumber(tokens[1].decimals, params.amounts[1]),
  };
};

const parseRemoveLiquidity = async (params: any) => {
  try {
    params = JSON.parse(params);
  } catch (error) {
    params = {};
  }
  const pool = await getPoolDetails(params.pool_id);
  const tokens = await Promise.all<TokenMetadata>(
    pool.tokenIds.map((id) => ftGetTokenMetadata(id))
  );
  const result = {
    Action: 'Remove Liquidity',
    'Pool Id': params.pool_id,
    'Amount One': toReadableNumber(tokens[0].decimals, params.min_amounts[0]),
    'Amount Two': toReadableNumber(tokens[1].decimals, params.min_amounts[1]),
  };
  if (new Set(STABLE_POOL_IDS || []).has(pool.id?.toString())) {
    if (tokens[2]) {
      result['Amount Three'] = toReadableNumber(
        tokens[2].decimals,
        params.min_amounts[2]
      );
    }
    result['Shares'] = toReadableNumber(
      LP_STABLE_TOKEN_DECIMALS,
      params.shares
    );
  } else {
    result['Shares'] = toReadableNumber(LP_TOKEN_DECIMALS, params.shares);
  }
  return result;
};

const parseAddSimplePool = async (params: any) => {
  try {
    params = JSON.parse(params);
  } catch (error) {
    params = {};
  }
  return {
    Action: 'Add Pool',
    Fee: params.fee,
    'Token One': params.tokens[0],
    'Token Two': params.tokens[1],
  };
};

const parseStorageDeposit = async () => {
  return {
    Action: 'Storage Deposit',
  };
};
const parseMtfTransferCall = async (params: any) => {
  try {
    params = JSON.parse(params);
  } catch (error) {
    params = {};
  }
  const { amount, receiver_id, token_id } = params;
  const poolId = token_id.split(':')[1];
  if (new Set(STABLE_POOL_IDS || []).has(poolId?.toString())) {
  }
  return {
    Action: 'Stake',
    Amount: new Set(STABLE_POOL_IDS || []).has(poolId?.toString())
      ? toReadableNumber(LP_STABLE_TOKEN_DECIMALS, amount)
      : toReadableNumber(24, amount),
    'Receiver Id': receiver_id,
    'Token Id': token_id,
  };
};
const parseWithdrawSeed = async (params: any) => {
  try {
    params = JSON.parse(params);
  } catch (error) {
    params = {};
  }
  const { seed_id, amount } = params;
  const poolId = seed_id.split('@')[1];
  return {
    Action: 'Unstake',
    Amount: new Set(STABLE_POOL_IDS || []).has(poolId?.toString())
      ? toReadableNumber(LP_STABLE_TOKEN_DECIMALS, amount)
      : toReadableNumber(24, amount),
    'Seed Id': seed_id,
  };
};
const parseClaimRewardByFarm = async (params: any) => {
  try {
    params = JSON.parse(params);
  } catch (error) {
    params = {};
  }
  const { farm_id } = params;
  return {
    Action: 'Claim Reward By Farm',
    'Farm Id': farm_id,
  };
};
const parseClaimRewardBySeed = async (params: any) => {
  try {
    params = JSON.parse(params);
  } catch (error) {
    params = {};
  }
  const { seed_id } = params;
  return {
    Action: 'Claim Reward By Seed',
    'Seed Id': seed_id,
  };
};
const parseWithdrawReward = async (params: any) => {
  try {
    params = JSON.parse(params);
  } catch (error) {
    params = {};
  }
  const { token_id, amount, unregister } = params;
  const token = await ftGetTokenMetadata(token_id);
  return {
    Action: 'Withdraw Reward',
    Amount: toReadableNumber(token.decimals, amount),
    Unregister: unregister,
    'Token Id': token_id,
  };
};
const parseNearDeposit = async () => {
  return {
    Action: 'Near Deposit',
  };
};
const parseFtTransferCall = async (params: any, tokenId: string) => {
  try {
    params = JSON.parse(params);
  } catch (error) {
    params = {};
  }
  const { receiver_id, amount, msg } = params;
  let Action;
  let Amount;
  if (receiver_id == config.XREF_TOKEN_ID) {
    Action = 'xREF Stake';
    Amount = toReadableNumber(XREF_TOKEN_DECIMALS, amount);
    return {
      Action,
      Amount,
      'Receiver Id': receiver_id,
    };
  } else if (msg && receiver_id !== 'aurora') {
    Action = 'Instant swap';
    let actions = [];
    try {
      actions = JSON.parse(msg.replace(/\\"/g, '"')).actions || [];
    } catch (error) {
      return {
        Action,
      };
    }
    let amountOut = '0';
    let poolIdArr: (string | number)[] = [];
    const in_token = await ftGetTokenMetadata(actions[0].token_in);
    const out_token = await ftGetTokenMetadata(
      actions[actions.length - 1].token_out
    );
    actions.forEach((action: any) => {
      const { min_amount_out, pool_id } = action;
      poolIdArr.push(pool_id);
      amountOut = new BigNumber(min_amount_out || '0')
        .plus(amountOut)
        .toFixed();
    });
    return {
      Action,
      'Pool Id': poolIdArr.join(','),
      'Amount In': (Amount = toReadableNumber(in_token.decimals, amount)),
      'Min Amount Out': toReadableNumber(out_token.decimals, amountOut),
      'Token In': in_token.symbol,
      'Token Out': out_token.symbol,
      'Receiver Id': receiver_id,
    };
  } else {
    Action = 'Deposit';
    const token = await ftGetTokenMetadata(tokenId);
    Amount = toReadableNumber(token.decimals, amount);
    return {
      Action,
      Amount,
      'Receiver Id': receiver_id,
    };
  }
};
const parseNearWithdraw = async (params: any) => {
  try {
    params = JSON.parse(params);
  } catch (error) {
    params = {};
  }
  const { amount } = params;
  return {
    Action: 'Near Withdraw',
    Amount: toReadableNumber(24, amount),
  };
};
const parseAddStableLiquidity = async (params: any) => {
  try {
    params = JSON.parse(params);
  } catch (error) {
    params = {};
  }
  const { amounts, min_shares, pool_id } = params;
  const pool = await getPoolDetails(params.pool_id);
  const tokens = await Promise.all<TokenMetadata>(
    pool.tokenIds.map((id) => ftGetTokenMetadata(id))
  );
  const tempToken = {};
  tokens.forEach((token, index) => {
    tempToken[token.symbol] = toReadableNumber(token.decimals, amounts[index]);
  });
  return {
    Action: 'Add Stable Liquidity',
    'Pool id': pool_id,
    ...tempToken,
    'Min shares': toReadableNumber(LP_STABLE_TOKEN_DECIMALS, min_shares),
  };
};
const parseRemoveStableLiquidity = async (params: any) => {
  try {
    params = JSON.parse(params);
  } catch (error) {
    params = {};
  }
  const { amounts, max_burn_shares, pool_id } = params;
  const pool = await getPoolDetails(params.pool_id);
  const tokens = await Promise.all<TokenMetadata>(
    pool.tokenIds.map((id) => ftGetTokenMetadata(id))
  );
  const tempToken = {};
  tokens.forEach((token, index) => {
    tempToken[token.symbol] = toReadableNumber(token.decimals, amounts[index]);
  });
  return {
    Action: 'Remove Stable Liquidity',
    'Pool id': pool_id,
    ...tempToken,
    'Max burn shares': toReadableNumber(
      LP_STABLE_TOKEN_DECIMALS,
      max_burn_shares
    ),
  };
};
const parseUnstake = async (params: any) => {
  try {
    params = JSON.parse(params);
  } catch (error) {
    params = {};
  }
  const { amount } = params;
  return {
    Action: 'xREF Unstake',
    Amount: toReadableNumber(XREF_TOKEN_DECIMALS, amount),
  };
};
const parseUSNBuy = async (params: any) => {
  try {
    params = JSON.parse(params);
  } catch (error) {
    params = {};
  }
  const { near } = params;
  return {
    Action: 'Buy USN',
    Amount: toReadableNumber(24, near),
  };
};
const parseUSNSell = async (params: any) => {
  try {
    params = JSON.parse(params);
  } catch (error) {
    params = {};
  }
  const { tokens } = params;
  return {
    Action: 'Sell USN',
    Amount: toReadableNumber(18, tokens),
  };
};
const parseCall = async (tokenId: string) => {
  if (tokenId == 'aurora') {
    return {
      Action: 'Aurora Call',
    };
  } else {
    return {
      Action: 'Call',
    };
  }
};

const parseDefault = async () => {
  return {
    Action: 'Not Found',
  };
};
