export const parseAction = (methodName: string, params: any) => {
  switch (methodName) {
    case 'swap': {
      return parseSwap(params);
    }
    case 'withdraw': {
      return parseWithdraw(params);
    }
    case 'register_tokens': {
      return parseRegisterTokens(params);
    }
    case 'add_liquidity': {
      return parseAddLiquidity(params);
    }
    case 'remove_liquidity': {
      return parseRemoveLiquidity(params);
    }
    case 'add_simple_pool': {
      return parseAddSimplePool(params);
    }
  }
};

const parseSwap = (params: any) => {
  return {
    pool_id: params.actions[0].pool_id,
    amount_in: params.actions[0].amount_in,
    amount_out: params.actions[0].min_amount_out,
    token_in_id: params.actions[0].token_in,
    token_out_id: params.actions[0].token_out,
  }
};

const parseWithdraw = (params: any) => {
  return {
    amount: params.amount,
    token_id: params.token,
  }
};

const parseRegisterTokens = (params: any) => {
  return {
    token_ids: params.token_ids
  }
};

const parseAddLiquidity = (params: any) => {
  return {
    pool_id: params.pool_id,
    amount1: params.amounts[0],
    amount2: params.amounts[1],
  }
};

const parseRemoveLiquidity = (params: any) => {
  return {
    pool_id: params.pool_id,
    amount1: params.min_amounts[0],
    amount2: params.min_amounts[1],
    shares: params.shares,
  }
};

const parseAddSimplePool = (params: any) => {
  return {
    fee: params.fee,
    token1: params.tokens[0],
    token2: params.tokens[1],
  }
};
