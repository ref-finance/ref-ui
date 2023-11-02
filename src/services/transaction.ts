import { ftGetTokenMetadata, TokenMetadata } from '../services/ft-contract';
import { toPrecision, toReadableNumber } from '../utils/numbers';
import { getPoolDetails } from '../services/pool';
import { useIntl } from 'react-intl';
import getConfig from '../services/config';
import {
  LP_TOKEN_DECIMALS,
  LP_STABLE_TOKEN_DECIMALS,
} from '../services/m-token';
import { XREF_TOKEN_DECIMALS } from '../services/xref';
import { get_pool, list_history_orders } from '../services/swapV3';
import {
  getPriceByPoint,
  displayNumberToAppropriateDecimals,
  TOKEN_LIST_FOR_RATE,
} from '../services/commonV3';
import BigNumber from 'bignumber.js';
import _ from 'lodash';
const config = getConfig();
const STABLE_POOL_IDS = config.STABLE_POOL_IDS;
import { WRAP_NEAR_CONTRACT_ID } from '../services/wrap-near';
import { getAssets } from './burrow';
import moment from 'moment';
import { IAsset } from './burrow-interfaces';

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
      return await parseWithdraw(params, tokenId);
    }
    case 'register_tokens': {
      return parseRegisterTokens(params);
    }
    case 'add_liquidity': {
      return await parseAddLiquidity(params, tokenId);
    }
    case 'remove_liquidity': {
      return await parseRemoveLiquidity(params, tokenId);
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
      return await parseWithdrawReward(params, tokenId);
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
    case 'force_unlock': {
      return await forceUnlock(params);
    }
    case 'unlock_and_withdraw_seed': {
      return await unlockAndWithdrawSeed(params);
    }
    case 'lock_free_seed': {
      return await lockFreeSeed(params);
    }
    case 'create_proposal': {
      return await createProposal(params);
    }
    case 'extend_whitelisted_accounts': {
      return await extendWhitelistedAccounts(params);
    }
    case 'claim_reward': {
      return await claimReward(params);
    }
    case 'action_proposal': {
      return await actionProposal(params);
    }
    case 'remove_proposal': {
      return await removeProposal(params);
    }
    case 'action_cancel': {
      return await actionCancel(params);
    }
    case 'withdraw_lpt': {
      return await withdrawLpt(params);
    }
    case 'create_pool': {
      return await createPool(params);
    }
    case 'cancel_order': {
      return await cancelOrder(params);
    }
    case 'withdraw_asset': {
      return await withdrawAsset(params);
    }
    case 'append_liquidity': {
      return await parseAppendLiquidity(params, tokenId);
    }
    case 'burn_v_liquidity': {
      return await burnLiquidity(params);
    }
    case 'mint_v_liquidity': {
      return await mintLiquidity(params);
    }
    case 'user_request_withdraw': {
      return await userRequestWithdraw(params);
    }
    case 'user_deposit_native_token': {
      return await userDepositNativeToken(params);
    }
    case 'execute': {
      return await adjust(params);
    }
    case 'oracle_call': {
      return await oracleCall(params);
    }
    case 'account_farm_claim_all': {
      return await borrow_claim_all(params);
    }
    case 'user_request_settlement': {
      return await parse_user_request_settlement(params);
    }
    case 'batch_add_liquidity': {
      return await parse_batch_add_liquidity(params, tokenId);
    }
    case 'batch_remove_liquidity': {
      return await parse_batch_remove_liquidity(params, tokenId);
    }
    case 'batch_update_liquidity': {
      return await parse_batch_update_liquidity(params, tokenId);
    }
    case 'batch_mint_v_liquidity': {
      return await parse_batch_mint_v_liquidity(params, tokenId);
    }
    case 'batch_burn_v_liquidity': {
      return await parse_batch_burn_v_liquidity(params, tokenId);
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

const parseWithdraw = async (params: any, tokenId: string) => {
  try {
    params = JSON.parse(params);
  } catch (error) {
    params = {};
  }
  const field: any = {};
  const { token_id, amount } = params;
  if (token_id) {
    const token = await ftGetTokenMetadata(token_id);
    field.Amount = toReadableNumber(token.decimals, amount);
    field.Token = token.symbol;
    field['Token Address'] = token.id;
  } else {
    // present is sell usn
    const token = await ftGetTokenMetadata(tokenId);
    field.Amount = toReadableNumber(token.decimals, amount);
    if (tokenId == config.USN_ID) {
      field.Action = 'Sell USN';
    }
  }
  return {
    Action: 'Withdraw',
    ...field,
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

const parseAddLiquidity = async (params: any, tokenId: string) => {
  try {
    params = JSON.parse(params);
  } catch (error) {
    params = {};
  }
  if (tokenId == config.REF_UNI_V3_SWAP_CONTRACT_ID) {
    const {
      pool_id,
      left_point,
      right_point,
      amount_x,
      amount_y,
      min_amount_x,
      min_amount_y,
    } = params;
    const poolDetail = await get_pool(pool_id);
    const { token_x, token_y } = poolDetail;
    const tokens = await Promise.all<TokenMetadata>(
      [token_x, token_y].map((id) => ftGetTokenMetadata(id))
    );
    const token_x_decimals = tokens[0].decimals;
    const token_y_decimals = tokens[1].decimals;
    const decimalRate =
      Math.pow(10, token_x_decimals) / Math.pow(10, token_y_decimals);
    let left_price = getPriceByPoint(left_point, decimalRate);
    let right_price = getPriceByPoint(right_point, decimalRate);
    if (new BigNumber('0.00000001').isGreaterThan(left_price)) {
      left_price = '<0.00000001';
    } else {
      left_price = toPrecision(left_price.toString(), 8);
    }
    if (new BigNumber('0.00000001').isGreaterThan(right_price)) {
      right_price = '<0.00000001';
    } else {
      right_price = toPrecision(right_price.toString(), 8);
    }
    return {
      Action: 'Add Liquidity',
      'Pool Id': pool_id,
      'Min Price': left_price,
      'Max Price': right_price,
      'Amount One': toReadableNumber(token_x_decimals, amount_x),
      'Amount Two': toReadableNumber(token_y_decimals, amount_y),
    };
  } else {
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
  }
};
const parseAppendLiquidity = async (params: any, tokenId: string) => {
  try {
    params = JSON.parse(params);
  } catch (error) {
    params = {};
  }
  const { lpt_id, amount_x, amount_y } = params;
  const [token_x, token_y] = lpt_id.split('|');
  const tokens = await Promise.all<TokenMetadata>(
    [token_x, token_y].map((id) => ftGetTokenMetadata(id))
  );
  const token_x_decimals = tokens[0].decimals;
  const token_y_decimals = tokens[1].decimals;

  return {
    Action: 'Append Liquidity',
    'LPT Id': lpt_id,
    'Amount One': toReadableNumber(token_x_decimals, amount_x),
    'Amount Two': toReadableNumber(token_y_decimals, amount_y),
  };
};

const parseRemoveLiquidity = async (params: any, tokenId: string) => {
  try {
    params = JSON.parse(params);
  } catch (error) {
    params = {};
  }
  if (tokenId == config.REF_UNI_V3_SWAP_CONTRACT_ID) {
    const { lpt_id, amount, min_amount_x, min_amount_y } = params;
    const [token_x, token_y] = lpt_id.split('#')[0].split('|');
    const tokens = await Promise.all<TokenMetadata>(
      [token_x, token_y].map((id) => ftGetTokenMetadata(id))
    );
    const tokenX: TokenMetadata = tokens[0];
    const tokenY: TokenMetadata = tokens[1];
    const min_decimals = _.min([tokenX.decimals, tokenY.decimals]);
    if (amount == 0) {
      return {
        Action: 'Claim Fees',
        'LPT Id': lpt_id,
      };
    } else {
      return {
        Action: 'Remove Liquidity',
        'LPT Id': lpt_id,
        Amount: amount,
        'Amount One': toReadableNumber(tokenX.decimals, min_amount_x),
        'Amount Two': toReadableNumber(tokenY.decimals, min_amount_y),
      };
    }
  } else {
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
  }
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
  const { amount, receiver_id, token_id, msg } = params;
  const poolId = token_id.split(':')[1];
  let extraData = {};
  if (msg) {
    const extraMsg = JSON.parse(msg.replace(/\\"/g, '"'));
    if (extraMsg != 'Free') {
      const { Lock, Append } = extraMsg;
      if (Lock) {
        const duration_sec = Lock.duration_sec;
        extraData['Month'] = duration_sec / 2592000 + 'M';
      }
      if (Append) {
        const duration_sec = Append.append_duration_sec;
        if (duration_sec == 1) {
          extraData['Second'] = duration_sec;
        } else {
          extraData['Month'] = duration_sec / 2592000 + 'M';
        }
      }
    }
  }
  return {
    Action: extraData['Month'] || extraData['Second'] ? 'Lock LPt' : 'Stake',
    Amount: new Set(STABLE_POOL_IDS || []).has(poolId?.toString())
      ? toReadableNumber(LP_STABLE_TOKEN_DECIMALS, amount)
      : toReadableNumber(24, amount),
    'Receiver ID': receiver_id,
    'Token Id': token_id,
    ...extraData,
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
const parseWithdrawReward = async (params: any, tokenId: string) => {
  try {
    params = JSON.parse(params);
  } catch (error) {
    params = {};
  }
  const { token_id, amount, unregister } = params;
  const token = await ftGetTokenMetadata(token_id);
  const extraData = {};
  if (amount) {
    extraData['Amount'] = toReadableNumber(token.decimals, amount);
    extraData['Unregister'] = unregister;
  }
  return {
    Action:
      tokenId == config.REF_VE_CONTRACT_ID
        ? 'Withdraw Bonus'
        : 'Withdraw Reward',
    'Token Id': token_id,
    ...extraData,
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
      'Receiver ID': receiver_id,
    };
  } else if (receiver_id && receiver_id == config.REF_VE_CONTRACT_ID) {
    Action = 'Deposit Bonus';
    const token = await ftGetTokenMetadata(tokenId);
    Amount = toReadableNumber(token.decimals, amount);
    const rewardObj = JSON.parse(msg.replace(/\\"/g, '"')).Reward;
    const { incentive_key, proposal_id } = rewardObj;
    return {
      Action,
      Amount,
      'Receiver ID': receiver_id,
      'Incentive Key': incentive_key,
      'Proposal ID': proposal_id,
    };
  } else if (receiver_id == config.REF_FARM_BOOST_CONTRACT_ID) {
    Action = 'Stake';
    const token = await ftGetTokenMetadata(tokenId);
    Amount = toReadableNumber(token.decimals, amount);
    return {
      Action,
      Amount,
      'Receiver ID': receiver_id,
      msg: (msg && msg.replace(/\\"/g, '"')) || '',
    };
  } else if (msg && receiver_id == config.REF_UNI_V3_SWAP_CONTRACT_ID) {
    const msgObj = JSON.parse(msg.replace(/\\"/g, '"'));
    const token = await ftGetTokenMetadata(tokenId);
    if (msgObj == 'Deposit') {
      Amount = toReadableNumber(token.decimals, amount);
      return {
        Action: 'Deposit',
        Amount,
        'Receiver ID': receiver_id,
      };
    } else if (msgObj.LimitOrderWithSwap) {
      const { LimitOrderWithSwap } = msgObj;
      const { pool_id, buy_token, point } = LimitOrderWithSwap || {};
      Amount = toReadableNumber(token.decimals, amount);
      const buyToken = await ftGetTokenMetadata(buy_token);
      const sellToken = await ftGetTokenMetadata(tokenId);
      const [token_x_id, token_y_id] = pool_id.split('|');
      const tokenX = await ftGetTokenMetadata(token_x_id);
      const tokenY = await ftGetTokenMetadata(token_y_id);
      const decimalRate =
        Math.pow(10, tokenX.decimals) / Math.pow(10, tokenY.decimals);
      let price: any = getPriceByPoint(point, decimalRate);
      if (token_x_id != tokenId) {
        price = 1 / price;
      }
      let buyTokenAmount: any = new BigNumber(price).multipliedBy(Amount);
      if (new BigNumber('0.00000001').isGreaterThan(buyTokenAmount)) {
        buyTokenAmount = '<0.00000001';
      } else {
        buyTokenAmount = toPrecision(buyTokenAmount.toString(), 8);
      }
      return {
        Action: 'Make An Order',
        'Sell Token': sellToken.symbol,
        'Sell Amount': Amount,
        'Buy Token': buyToken.symbol,
        'Buy Amount': buyTokenAmount,
        'Receiver ID': receiver_id,
        'Pool Id': pool_id,
      };
    } else if (msgObj.Swap) {
      const { Swap } = msgObj;
      const { pool_ids, output_token, min_output_amount } = Swap || {};
      Amount = toReadableNumber(token.decimals, amount);
      const [token_x, token_y] = pool_ids[0].split('|');
      const token_out = await ftGetTokenMetadata(output_token);
      return {
        Action: 'Swap',
        'Token In': token.symbol,
        'Amount In': Amount,
        'Token Out': token_out.symbol,
        'Min Amount Out': toReadableNumber(
          token_out.decimals,
          min_output_amount
        ),
        'Receiver ID': receiver_id,
      };
    } else {
      return {
        Action: 'Swap',
        'Receiver ID': receiver_id,
      };
    }
  } else if (receiver_id == config.BURROW_CONTRACT_ID) {
    let Action;
    const token = await ftGetTokenMetadata(tokenId);
    let IncreaseCollateralAmount = '';
    let RepayAmount = '';
    if (msg) {
      const assets: IAsset[] = await getAssets();
      const asset = assets.find((asset: IAsset) => asset.token_id == tokenId);
      const contract_decimals = asset.config.extra_decimals + token.decimals;
      const msgObj = JSON.parse(msg.replace(/\\"/g, '"'));
      const actions = msgObj?.Execute?.actions;
      if (actions?.[0]?.IncreaseCollateral) {
        Action = 'Supply';
        const max_amount = actions[0]['IncreaseCollateral']['max_amount'];
        IncreaseCollateralAmount = toReadableNumber(
          contract_decimals,
          max_amount
        );
      } else if (actions?.[0]?.['Repay']) {
        const max_amount = actions[0]['Repay']['max_amount'];
        RepayAmount = max_amount
          ? toReadableNumber(contract_decimals, max_amount)
          : '';
        Action = 'Repay';
      }
    } else {
      Action = 'Supply';
    }
    Amount = toReadableNumber(token.decimals, amount);
    return {
      Action,
      Amount,
      'Receiver ID': receiver_id,
      ...(IncreaseCollateralAmount
        ? { 'IncreaseCollateral Amount': IncreaseCollateralAmount }
        : {}),
      ...(RepayAmount ? { 'Repay Amount': RepayAmount } : {}),
    };
  } else if (msg && receiver_id !== 'aurora') {
    Action = 'Instant swap';
    let actions = [];
    try {
      actions = JSON.parse(msg.replace(/\\"/g, '"')).actions || [];
      let amountOut = '0';
      let poolIdArr: (string | number)[] = [];
      const l = actions[0];
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
        'Receiver ID': receiver_id,
      };
    } catch (error) {
      return {
        Action,
      };
    }
  } else {
    Action = receiver_id == config.USN_ID ? 'Buy USN' : 'Deposit';
    const token = await ftGetTokenMetadata(tokenId);
    Amount = toReadableNumber(token.decimals, amount);
    return {
      Action,
      Amount,
      'Receiver ID': receiver_id,
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
  let DECIMALS = 24;
  if (new Set(STABLE_POOL_IDS || []).has(pool.id?.toString())) {
    DECIMALS = LP_STABLE_TOKEN_DECIMALS;
  }
  return {
    Action: 'Add Stable Liquidity',
    'Pool id': pool_id,
    ...tempToken,
    'Min shares': toReadableNumber(DECIMALS, min_shares),
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
  let DECIMALS = 24;
  if (new Set(STABLE_POOL_IDS || []).has(pool.id?.toString())) {
    DECIMALS = LP_STABLE_TOKEN_DECIMALS;
  }
  return {
    Action: 'Remove Stable Liquidity',
    'Pool id': pool_id,
    ...tempToken,
    'Max burn shares': toReadableNumber(DECIMALS, max_burn_shares),
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
const forceUnlock = async (params: any) => {
  try {
    params = JSON.parse(params);
  } catch (error) {
    params = {};
  }
  const { seed_id, unlock_amount } = params;
  const poolId = (seed_id || '').split('@')[1];
  return {
    Action: 'Unlock',
    seedId: seed_id,
    Amount: new Set(STABLE_POOL_IDS || []).has(poolId?.toString())
      ? toReadableNumber(LP_STABLE_TOKEN_DECIMALS, unlock_amount)
      : toReadableNumber(24, unlock_amount),
  };
};
const unlockAndWithdrawSeed = async (params: any) => {
  try {
    params = JSON.parse(params);
  } catch (error) {
    params = {};
  }
  const { seed_id, unlock_amount, withdraw_amount } = params;
  const poolId = (seed_id || '').split('@')[1];
  const extraData = {};
  if (Number(withdraw_amount) > 0) {
    extraData['Amount'] =
      new Set(STABLE_POOL_IDS || []).has(poolId?.toString()) ||
      seed_id == config.REF_VE_CONTRACT_ID
        ? toReadableNumber(LP_STABLE_TOKEN_DECIMALS, withdraw_amount)
        : toReadableNumber(24, withdraw_amount);
  }
  if (Number(unlock_amount) > 0) {
    extraData['Amount'] = new Set(STABLE_POOL_IDS || []).has(poolId?.toString())
      ? toReadableNumber(LP_STABLE_TOKEN_DECIMALS, unlock_amount)
      : toReadableNumber(24, unlock_amount);
  }
  return {
    Action: Number(unlock_amount) > 0 ? 'Unlock' : 'Unstake',
    'Seed Id': seed_id,
    ...extraData,
  };
};
const lockFreeSeed = async (params: any) => {
  try {
    params = JSON.parse(params);
  } catch (error) {
    params = {};
  }
  const { amount, seed_id, duration_sec } = params;
  const poolId = (seed_id || '').split('@')[1];
  const month = duration_sec / 2592000;
  return {
    Action: 'Lock Free Seed',
    seedId: seed_id,
    Amount: new Set(STABLE_POOL_IDS || []).has(poolId?.toString())
      ? toReadableNumber(LP_STABLE_TOKEN_DECIMALS, amount)
      : toReadableNumber(24, amount),
    Month: month + 'M',
  };
};
const createProposal = async (params: any) => {
  try {
    params = JSON.parse(params);
  } catch (error) {
    params = {};
  }
  const { description, duration_sec, start_at, kind } = params;
  const displayField: any = {};
  if (duration_sec) {
    displayField.Duration =
      toPrecision((duration_sec / (60 * 60)).toString(), 3) + 'h';
  }
  if (start_at) {
    displayField['Start time'] = moment
      .unix(start_at)
      .format('YYYY-MM-DD HH:mm:ss');
  }
  if (kind == 'Common') {
    displayField.Type = 'Common';
    if (description) {
      const { title, link } = JSON.parse(description.replace(/\\"/g, '"'));
      displayField.Title = title;
      displayField.Link = link;
    }
  }
  if (kind && kind['FarmingReward']) {
    displayField.Description = description;
    displayField.Type = 'FarmingReward';
    const { FarmingReward } = kind;
    if (FarmingReward) {
      const { total_reward, farm_list } = FarmingReward;
      displayField['Total Reward'] = total_reward;
      displayField['Farm List'] = farm_list.join(',');
    }
  }
  if (kind && kind['Poll']) {
    displayField.Type = 'Poll';
    if (description) {
      const { title, link } = JSON.parse(description.replace(/\\"/g, '"'));
      displayField.Title = title;
      displayField.Link = link;
    }
    const { Poll } = kind;
    if (Poll) {
      displayField.Options = Poll.options.join(',');
    }
  }
  return {
    Action: 'Create Proposal',
    ...displayField,
  };
};
const extendWhitelistedAccounts = async (params: any) => {
  try {
    params = JSON.parse(params);
  } catch (error) {
    params = {};
  }
  const { accounts } = params;
  return {
    Action: 'Extend Whitelisted Accounts',
    Accounts: accounts?.join(',') || '',
  };
};
const claimReward = async (params: any) => {
  try {
    params = JSON.parse(params);
  } catch (error) {
    params = {};
  }
  const { proposal_id } = params;
  return {
    Action: 'Claim Bonus',
    'Proposal ID': proposal_id,
  };
};
const actionProposal = async (params: any) => {
  try {
    params = JSON.parse(params);
  } catch (error) {
    params = {};
  }
  const { proposal_id, action } = params;
  const field: any = {};
  const farmId = action?.VoteFarm?.farm_id?.toString() || '';
  const pollId = action?.VotePoll?.poll_id?.toString() || '';

  if (farmId) {
    field['Farm ID'] = farmId;
  }
  if (pollId) {
    field['Poll ID'] = pollId;
  }
  if (action == 'VoteApprove' || action == 'VoteReject') {
    field['Vote'] = action;
  }
  return {
    Action: 'Action Proposal',
    'Proposal ID': proposal_id,
    ...field,
  };
};
const removeProposal = async (params: any) => {
  try {
    params = JSON.parse(params);
  } catch (error) {
    params = {};
  }
  const { proposal_id } = params;
  return {
    Action: 'Remove Proposal',
    'Proposal ID': proposal_id,
  };
};
const actionCancel = async (params: any) => {
  try {
    params = JSON.parse(params);
  } catch (error) {
    params = {};
  }
  const { proposal_id } = params;
  return {
    Action: 'Action Cancel',
    'Proposal ID': proposal_id,
  };
};
const withdrawLpt = async (params: any) => {
  try {
    params = JSON.parse(params);
  } catch (error) {
    params = {};
  }
  const { amount } = params;
  return {
    Action: 'Unlock LPt',
    Amount: toReadableNumber(24, amount),
  };
};
const createPool = async (params: any) => {
  try {
    params = JSON.parse(params);
  } catch (error) {
    params = {};
  }
  const { token_a, token_b, fee, init_point } = params;
  const tokenA: TokenMetadata = await ftGetTokenMetadata(token_a);
  const tokenB: TokenMetadata = await ftGetTokenMetadata(token_b);
  const decimalRate =
    Math.pow(10, tokenA.decimals) / Math.pow(10, tokenB.decimals);
  let init_price = getPriceByPoint(init_point, decimalRate);
  if (new BigNumber('0.00000001').isGreaterThan(init_price)) {
    init_price = '<0.00000001';
  } else {
    init_price = toPrecision(init_price.toString(), 8);
  }
  return {
    Action: 'Create Pool',
    TokenA: tokenA.symbol,
    TokenB: tokenB.symbol,
    Fee: fee / 10000 + '%',
    'Init Price': `1 ${tokenA.symbol}=${init_price} ${tokenB.symbol}`,
  };
};
const cancelOrder = async (params: any) => {
  try {
    params = JSON.parse(params);
  } catch (error) {
    params = {};
  }
  const { order_id, amount } = params;
  // const [token_x, token_y] = order_id.split('#')[0].split('|');
  // const tokens = await Promise.all<TokenMetadata>(
  //   [token_x, token_y].map((id) => ftGetTokenMetadata(id))
  // );
  // const tokenX: TokenMetadata = tokens[0];
  // const tokenY: TokenMetadata = tokens[1];
  // const orderDetail = await list_history_orders();
  // const min_decimals = _.min([tokenX.decimals, tokenY.decimals]);
  if (+amount == 0) {
    return {
      Action: 'Claim Order',
      'Order Id': order_id,
    };
  } else {
    return {
      Action: 'Cancel Order',
      'Order Id': order_id,
      // Amount: toReadableNumber(min_decimals, amount),
    };
  }
};
const withdrawAsset = async (params: any) => {
  try {
    params = JSON.parse(params);
  } catch (error) {
    params = {};
  }
  const { token_id, amount } = params;
  const token = await ftGetTokenMetadata(token_id);
  return {
    Action: 'Withdraw Asset',
    Token: token.symbol,
    Amount: toReadableNumber(token.decimals, amount),
  };
};
const burnLiquidity = async (params: any) => {
  try {
    params = JSON.parse(params);
  } catch (error) {
    params = {};
  }
  const { lpt_id } = params;
  return {
    Action: 'Burn Liquidity',
    'LPT ID': lpt_id,
  };
};
const mintLiquidity = async (params: any) => {
  try {
    params = JSON.parse(params);
  } catch (error) {
    params = {};
  }
  const { lpt_id, dcl_farming_type } = params;
  const { left_point, right_point } = dcl_farming_type.FixRange;
  const [token_x, token_y, fee] = lpt_id.split('|');
  const tokenX = await ftGetTokenMetadata(token_x);
  const tokenY = await ftGetTokenMetadata(token_y);
  const decimalRate =
    Math.pow(10, tokenX.decimals) / Math.pow(10, tokenY.decimals);
  let left_price = getPriceByPoint(+left_point, decimalRate);
  let right_price = getPriceByPoint(+right_point, decimalRate);
  let pair = `${tokenY.symbol}/${tokenX.symbol}`;
  if (TOKEN_LIST_FOR_RATE.indexOf(tokenX.symbol) > -1) {
    pair = `${tokenX.symbol}/${tokenY.symbol}`;
    const temp_left_price = left_price;
    left_price = new BigNumber(1).dividedBy(right_price).toFixed();
    right_price = new BigNumber(1).dividedBy(temp_left_price).toFixed();
  }
  return {
    Action: 'Mint Liquidity',
    'LPT ID': lpt_id,
    Pair: pair,
    'Min Price': displayNumberToAppropriateDecimals(left_price),
    'Max Price': displayNumberToAppropriateDecimals(right_price),
  };
};
const userRequestWithdraw = async (params: any) => {
  try {
    params = JSON.parse(params);
  } catch (error) {
    params = {};
  }
  const { token, amount } = params;
  let token_meta;
  if (token == 'near') {
    token_meta = await ftGetTokenMetadata(WRAP_NEAR_CONTRACT_ID);
  } else {
    token_meta = await ftGetTokenMetadata(token);
  }
  return {
    Action: 'Withdraw',
    Token: token_meta.symbol,
    Amount: toReadableNumber(token_meta.decimals, amount),
  };
};
const userDepositNativeToken = async (params: any) => {
  return {
    Action: 'Deposit',
  };
};
const adjust = async (params: any) => {
  try {
    params = JSON.parse(params);
    const { token_id, max_amount } =
      params?.actions[0]?.['IncreaseCollateral'] || {};
    const token_meta = await ftGetTokenMetadata(token_id);
    const assets: IAsset[] = await getAssets();
    const asset = assets.find((asset: IAsset) => asset.token_id == token_id);
    const contract_decimals = asset.config.extra_decimals + token_meta.decimals;
    const Max_Amount = max_amount
      ? toReadableNumber(contract_decimals, max_amount)
      : '';
    return {
      Action: 'Adjust',
      Token: token_meta.symbol,
      ...(Max_Amount ? { 'IncreaseCollateral Amount': Max_Amount } : {}),
    };
  } catch (error) {
    return {
      Action: 'Adjust',
    };
  }
};
const oracleCall = async (params: any) => {
  try {
    params = JSON.parse(params) || {};
    const { receiver_id, msg } = params;
    const msgObj = JSON.parse(msg.replace(/\\"/g, '"'));
    const actions = msgObj.Execute.actions;
    let DecreaseCollateralAmount;
    let token_meta;
    let Action;
    let WithdrawAmount;
    let BorrowAmount;
    let RepayAmount;
    if (actions[0]?.['DecreaseCollateral']) {
      const { token_id, max_amount, amount } = actions[0]['DecreaseCollateral'];
      token_meta = await ftGetTokenMetadata(token_id);
      const assets: IAsset[] = await getAssets();
      const asset = assets.find((asset: IAsset) => asset.token_id == token_id);
      const contract_decimals =
        asset.config.extra_decimals + token_meta.decimals;
      DecreaseCollateralAmount =
        max_amount || amount
          ? toReadableNumber(contract_decimals, max_amount || amount)
          : '';
      Action = 'Adjust';
    }
    if (actions[0]?.['Withdraw'] || actions[1]?.['Withdraw']) {
      const { token_id, max_amount } =
        actions[0]['Withdraw'] || actions[1]['Withdraw'];
      token_meta = await ftGetTokenMetadata(token_id);
      const assets: IAsset[] = await getAssets();
      const asset = assets.find((asset: IAsset) => asset.token_id == token_id);
      const contract_decimals =
        asset.config.extra_decimals + token_meta.decimals;
      WithdrawAmount = max_amount
        ? toReadableNumber(contract_decimals, max_amount)
        : '';
      Action = 'Withdraw';
    }
    if (actions[0]?.['Borrow']) {
      const { token_id, amount } = actions[0]['Borrow'];
      const { max_amount } = actions[1]['Withdraw'];
      token_meta = await ftGetTokenMetadata(token_id);
      const assets: IAsset[] = await getAssets();
      const asset = assets.find((asset: IAsset) => asset.token_id == token_id);
      const contract_decimals =
        asset.config.extra_decimals + token_meta.decimals;
      BorrowAmount = toReadableNumber(contract_decimals, amount);
      WithdrawAmount = toReadableNumber(contract_decimals, max_amount);
      Action = 'Borrow';
    }
    if (actions[0]?.['Repay'] || actions[1]?.['Repay']) {
      const { token_id, amount } = actions[0]['Repay'] || actions[1]['Repay'];
      token_meta = await ftGetTokenMetadata(token_id);
      const assets: IAsset[] = await getAssets();
      const asset = assets.find((asset: IAsset) => asset.token_id == token_id);
      const contract_decimals =
        asset.config.extra_decimals + token_meta.decimals;
      RepayAmount = amount ? toReadableNumber(contract_decimals, amount) : '';
      if (actions[0]['DecreaseCollateral']) {
        const { amount } = actions[0]['DecreaseCollateral'];
        DecreaseCollateralAmount = amount
          ? toReadableNumber(contract_decimals, amount)
          : '';
      }
      Action = 'Repay';
    }

    return {
      Action,
      'Receiver ID': receiver_id,
      Token: token_meta.symbol,
      ...(DecreaseCollateralAmount
        ? { 'DecreaseCollateral Amount': DecreaseCollateralAmount }
        : {}),
      ...(BorrowAmount ? { 'Borrow Amount': BorrowAmount } : {}),
      ...(WithdrawAmount ? { 'Withdraw Amount': WithdrawAmount } : {}),
      ...(RepayAmount ? { 'Repay Amount': RepayAmount } : {}),
    };
  } catch (error) {
    return {
      Action: 'Oracle Call',
    };
  }
};

const borrow_claim_all = async (params: any) => {
  try {
    return {
      Action: 'Claim',
    };
  } catch (error) {
    return {
      Action: 'Claim',
    };
  }
};
const parse_user_request_settlement = async (params: any) => {
  try {
    return {
      Action: 'Settle PnL',
    };
  } catch (error) {
    return {
      Action: 'Settle PnL',
    };
  }
};

const parse_batch_add_liquidity = async (params: any, tokenId: string) => {
  try {
    return {
      Action: 'Batch Add Liquidity',
      'Receiver ID': tokenId,
    };
  } catch (error) {
    return {
      Action: 'Batch Add Liquidity',
    };
  }
};
const parse_batch_remove_liquidity = async (params: any, tokenId: string) => {
  try {
    return {
      Action: 'Batch Remove Liquidity',
      'Receiver ID': tokenId,
    };
  } catch (error) {
    return {
      Action: 'Batch Remove Liquidity',
    };
  }
};
const parse_batch_update_liquidity = async (params: any, tokenId: string) => {
  try {
    return {
      Action: 'Batch Update Liquidity',
      'Receiver ID': tokenId,
    };
  } catch (error) {
    return {
      Action: 'Batch Update Liquidity',
    };
  }
};
const parse_batch_mint_v_liquidity = async (params: any, tokenId: string) => {
  try {
    return {
      Action: 'Batch Mint Liquidity',
      'Receiver ID': tokenId,
    };
  } catch (error) {
    return {
      Action: 'Batch Mint Liquidity',
    };
  }
};
const parse_batch_burn_v_liquidity = async (params: any, tokenId: string) => {
  try {
    return {
      Action: 'Batch Burn Liquidity',
      'Receiver ID': tokenId,
    };
  } catch (error) {
    return {
      Action: 'Batch Burn Liquidity',
    };
  }
};

const parseDefault = async () => {
  return {
    Action: 'Not Found',
  };
};
