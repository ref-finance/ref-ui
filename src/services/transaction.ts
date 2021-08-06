import { ftGetTokenMetadata, TokenMetadata } from '~services/ft-contract';
import { toReadableNumber } from '~utils/numbers';
import { getPoolDetails } from '~services/pool';

export const parseAction = async (methodName: string, params: any) => {
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
    'Amount Out': toReadableNumber(
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

const parseDefault = async () => {
  return {
    Action: 'Not Found',
  };
};
