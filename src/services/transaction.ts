import { ftGetTokenMetadata, TokenMetadata } from '~services/ft-contract';
import { toReadableNumber } from '~utils/numbers';
import { getPoolDetails } from '~services/pool';
import { useIntl } from 'react-intl';

export const parseAction = async (
  methodName: string,
  params: any,
  tokenId?: string
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
    default: {
      return await parseDefault();
    }
  }
};

const parseSwap = async (params: any) => {
  const in_token = await ftGetTokenMetadata(params.actions[0].token_in);
  const out_token = await ftGetTokenMetadata(params.actions[0].token_out);

  return {
    Action: 'Swap',
    'Pool Id': params.actions[0].pool_id,
    'Amount In': toReadableNumber(
      in_token.decimals,
      params.actions[0].amount_in
    ),
    'Min Amount Out': toReadableNumber(
      out_token.decimals,
      params.actions[0].min_amount_out
    ),
    'Token In': in_token.symbol,
    'Token Out': out_token.symbol,
  };
};

const parseWithdraw = async (params: any) => {
  const token = await ftGetTokenMetadata(params.token_id);

  return {
    Action: 'Withdraw',
    Amount: toReadableNumber(token.decimals, params.amount),
    Token: token.symbol,
    'Token Address': token.id,
  };
};

const parseRegisterTokens = (params: any) => {
  return {
    Action: 'Register Tokens',
    'Token Ids': params.token_ids.join(','),
  };
};

const parseAddLiquidity = async (params: any) => {
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
  const pool = await getPoolDetails(params.pool_id);
  const tokens = await Promise.all<TokenMetadata>(
    pool.tokenIds.map((id) => ftGetTokenMetadata(id))
  );

  return {
    Action: 'Remove Liquidity',
    'Pool Id': params.pool_id,
    'Amount One': toReadableNumber(tokens[0].decimals, params.min_amounts[0]),
    'Amount Two': toReadableNumber(tokens[1].decimals, params.min_amounts[1]),
    Shares: toReadableNumber(24, params.shares),
  };
};

const parseAddSimplePool = async (params: any) => {
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
  const { amount, receiver_id, token_id } = params;
  return {
    Action: 'Stake',
    Amount: toReadableNumber(24, amount),
    'Receiver Id': receiver_id,
    'Token Id': token_id,
  };
};
const parseWithdrawSeed = async (params: any) => {
  const { seed_id, amount } = params;
  return {
    Action: 'Unstake',
    Amount: toReadableNumber(24, amount),
    'Seed Id': seed_id,
  };
};
const parseClaimRewardByFarm = async (params: any) => {
  const { farm_id } = params;
  return {
    Action: 'Claim reward by farm',
    'Farm Id': farm_id,
  };
};
const parseClaimRewardBySeed = async (params: any) => {
  const { seed_id } = params;
  return {
    Action: 'Claim reward by seed',
    'Seed Id': seed_id,
  };
};
const parseWithdrawReward = async (params: any) => {
  const { token_id, amount, unregister } = params;
  const token = await ftGetTokenMetadata(token_id);
  return {
    Action: 'Withdraw reward',
    Amount: toReadableNumber(token.decimals, amount),
    Unregister: unregister,
    'Token Id': token_id,
  };
};
const parseNearDeposit = async () => {
  return {
    Action: 'Near deposit',
  };
};
const parseFtTransferCall = async (params: any, tokenId: string) => {
  const { receiver_id, amount, msg } = params;
  let Action;
  let Amount;
  if (msg) {
    Action = 'Instant swap';
    const actions = JSON.parse(msg).actions[0];
    const { token_in } = actions;
    const token = await ftGetTokenMetadata(token_in);
    Amount = toReadableNumber(token.decimals, amount);
  } else {
    Action = 'Deposit';
    const token = await ftGetTokenMetadata(tokenId);
    Amount = toReadableNumber(token.decimals, amount);
  }
  return {
    Action,
    Amount,
    'Receiver Id': receiver_id,
  };
};
const parseNearWithdraw = async (params: any) => {
  const { amount } = params;
  return {
    Action: 'Near withdraw',
    Amount: toReadableNumber(24, amount),
  };
};

const parseDefault = async () => {
  return {
    Action: 'Not Found',
  };
};
