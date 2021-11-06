import BN from 'bn.js';
import Big from 'big.js';
import {
  toNonDivisibleNumber,
  toPrecision,
  toReadableNumber,
} from '../utils/numbers';
import {
  executeMultipleTransactions,
  near,
  ONE_YOCTO_NEAR,
  REF_FI_CONTRACT_ID,
  RefFiFunctionCallOptions,
  refFiManyFunctionCalls,
  Transaction,
  wallet,
} from './near';
import { TokenMetadata } from './ft-contract';
import { getPoolsByTokens, Pool } from './pool';
import {
  checkTokenNeedsStorageDeposit,
  getTokenBalance,
  getWhitelistedTokens,
  round,
} from './token';
import { JsonRpcProvider } from 'near-api-js/lib/providers';
import {
  storageDepositAction,
  storageDepositForTokenAction,
} from './creators/storage';
import { registerTokenAction } from './creators/token';
import {
  NEW_ACCOUNT_STORAGE_COST,
  WRAP_NEAR_CONTRACT_ID,
  wnearMetadata,
} from '~services/wrap-near';
import { utils } from 'near-api-js';
import { BigNumber } from 'bignumber.js';

import { calculateOptimalOutput, formatPoolNew } from './parallelSwapLogic.js';


Big.DP = 40;
Big.strict = false;
const FEE_DIVISOR = 10000;


interface EstimateSwapOptions {
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  amountIn: string;
  intl?: any;
}

export interface EstimateSwapView {
  estimate: string;
  pool: Pool;
  intl?: any;
}
export const estimateSwap = async ({
  tokenIn,
  tokenOut,
  amountIn,
  intl,
}: EstimateSwapOptions): Promise<EstimateSwapView[]> => {
  const parsedAmountIn = toNonDivisibleNumber(tokenIn.decimals, amountIn);
  if (!parsedAmountIn)
    throw new Error(
      `${amountIn} ${intl.formatMessage({ id: 'is_not_a_valid_swap_amount' })}`
    );

  const pools = await getPoolsByTokens({
    tokenInId: tokenIn.id,
    tokenOutId: tokenOut.id,
    amountIn: parsedAmountIn,
  });


  console.log('POOLS FOUND ARE...',pools);
  let poolAllocations = await calculateOptimalOutput(pools, parsedAmountIn, tokenIn.id, tokenOut.id);
  console.log('pool Allocations are: ', pools, poolAllocations);
  let parallelPools = pools.filter(({ partialAmountIn }) => partialAmountIn > 0 )
  console.log('parallelPools',parallelPools);
  if (parallelPools.length < 1) {
    throw new Error(
      `${intl.formatMessage({ id: 'no_pool_available_to_make_a_swap_from' })} ${
        tokenIn.symbol
      } -> ${tokenOut.symbol} ${intl.formatMessage({
        id: 'for_the_amount',
      })} ${amountIn} ${intl.formatMessage({
        id: 'no_pool_eng_for_chinese',
      })}`
    );
  }

  try {
    const estimates = await Promise.all(
      parallelPools.map((pool) => {
        const amount_with_fee = Number(amountIn) * (FEE_DIVISOR - pool.fee);
        const in_balance = toReadableNumber(
          tokenIn.decimals,
          pool.supplies[tokenIn.id]
        );
        const out_balance = toReadableNumber(
          tokenOut.decimals,
          pool.supplies[tokenOut.id]
        );
        const estimate = new BigNumber(
          (
            (amount_with_fee * Number(out_balance)) /
            (FEE_DIVISOR * Number(in_balance) + amount_with_fee)
          ).toString()
        ).toFixed();

        return Promise.resolve(estimate)
          .then((estimate) => ({
            estimate,
            status: 'success',
            pool,
          }))
          .catch(() => ({ status: 'error', estimate: '0', pool }));
      })
    );

// let estimates = [
    // {estimate: '99.69257342076861', 
    // pool: {id: 2, 
	      // gamma_bps: 20,
	      // tokenIds: ['wrap.testnet', 'rft.tokenfactory.testnet'], 
		  // supplies: {'rft.tokenfactory.testnet': "3122645575005",
		            // 'wrap.testnet': "311603047091212996993322730"}, 
		  // fee: 20, 
		  // x: "311603047091212996993322730",
		  // y: "3122645575005",
		  // shareSupply: '1394082189476357871691236927', …}
    // status: "success"},
    // {estimate: '99.69257342076861', 
    // pool: {id: 299, 
	      // gamma_bps: 20,
	      // tokenIds: ['wrap.testnet', 'rft.tokenfactory.testnet'], 
		  // supplies: {'rft.tokenfactory.testnet': "3122645575005",
		            // 'wrap.testnet': "311603047091212996993322730"}, 
		  // fee: 20, 
		  // x: "311603047091212996993322730",
		  // y: "3122645575005",
		  // shareSupply: '1394082189476357871691236927', …}
    // status: "success"},
// ];
      console.log('estimates are ...',estimates)

    // const { estimate, pool } = estimates
      // .filter(({ status }) => status === 'success')
      // .sort((a, b) => (Number(b.estimate) > Number(a.estimate) ? 1 : -1))[0];


    return {
		estimates
      // estimate: estimate,
      // pool,
    };
  } catch (err) {
    throw new Error(
      `${intl.formatMessage({ id: 'no_pool_available_to_make_a_swap_from' })} ${
        tokenIn.symbol
      } -> ${tokenOut.symbol} ${intl.formatMessage({
        id: 'for_the_amount',
      })} ${amountIn} ${intl.formatMessage({
        id: 'no_pool_eng_for_chinese',
      })}`
    );
  }
};

interface SwapOptions extends EstimateSwapOptions {
  pool: Pool;
  minAmountOut: string;
}



export const swap = async ({
  pool,
  tokenIn,
  tokenOut,
  amountIn,
  minAmountOut,
}: SwapOptions) => {
  const maxTokenInAmount = await getTokenBalance(tokenIn?.id);

  if (
    Number(maxTokenInAmount) <
    Number(toNonDivisibleNumber(tokenIn.decimals, amountIn))
  ) {
    await directSwap({
      pool,
      tokenIn,
      tokenOut,
      amountIn,
      minAmountOut,
    });
  } else {
    await depositSwap({
      pool,
      tokenIn,
      tokenOut,
      amountIn,
      minAmountOut,
    });
  }
};

export const directSwap = async ({
  pool,
  tokenIn,
  tokenOut,
  amountIn,
  minAmountOut,
}: SwapOptions) => {
  const swapAction = {
    pool_id: pool.id,
    token_in: tokenIn.id,
    token_out: tokenOut.id,
    min_amount_out: round(
      tokenIn.decimals,
      toNonDivisibleNumber(tokenOut.decimals, minAmountOut)
    ),
  };

  const transactions: Transaction[] = [];
  const neededStorage = await checkTokenNeedsStorageDeposit(tokenIn.id);
  if (neededStorage) {
    transactions.push({
      receiverId: REF_FI_CONTRACT_ID,
      functionCalls: [storageDepositAction({ amount: neededStorage })],
    });
  }

  const actions: RefFiFunctionCallOptions[] = [];

  if (tokenIn.symbol === wnearMetadata.symbol) {
    actions.push({
      methodName: 'near_deposit',
      args: {},
      amount: amountIn,
    });
  } else {
    actions.push({
      methodName: 'storage_deposit',
      args: {},
      gas: '100000000000000',
      amount: NEW_ACCOUNT_STORAGE_COST,
    });
  }

  actions.push({
    methodName: 'ft_transfer_call',
    args: {
      receiver_id: REF_FI_CONTRACT_ID,
      amount: toNonDivisibleNumber(tokenIn.decimals, amountIn),
      msg: JSON.stringify({
        force: 0,
        actions: [swapAction],
      }),
    },
    gas: '100000000000000',
    amount: ONE_YOCTO_NEAR,
  });

  transactions.push({
    receiverId: tokenIn.id,
    functionCalls: actions,
  });

  if (tokenOut.symbol === wnearMetadata.symbol) {
    transactions.push({
      receiverId: WRAP_NEAR_CONTRACT_ID,
      functionCalls: [
        {
          methodName: 'near_withdraw',
          args: { amount: utils.format.parseNearAmount(minAmountOut) },
          amount: ONE_YOCTO_NEAR,
        },
      ],
    });
  }

  const whitelist = await getWhitelistedTokens();
  if (!whitelist.includes(tokenOut.id)) {
    transactions.unshift({
      receiverId: REF_FI_CONTRACT_ID,
      functionCalls: [registerTokenAction(tokenOut.id)],
    });
  }

  return executeMultipleTransactions(transactions);
};

export const depositSwap = async ({
  pool,
  tokenIn,
  tokenOut,
  amountIn,
  minAmountOut,
}: SwapOptions) => {
  const swapAction = {
    pool_id: pool.id,
    token_in: tokenIn.id,
    token_out: tokenOut.id,
    amount_in: round(
      tokenIn.decimals,
      toNonDivisibleNumber(tokenIn.decimals, amountIn)
    ),
    min_amount_out: round(
      tokenIn.decimals,
      toNonDivisibleNumber(tokenOut.decimals, minAmountOut)
    ),
  };

  const actions: RefFiFunctionCallOptions[] = [
    {
      methodName: 'swap',
      args: { actions: [swapAction] },
      amount: ONE_YOCTO_NEAR,
    },
  ];

  const whitelist = await getWhitelistedTokens();
  if (!whitelist.includes(tokenOut.id)) {
    actions.unshift(registerTokenAction(tokenOut.id));
  }

  const needsStorageDeposit = await checkTokenNeedsStorageDeposit(tokenOut.id);
  if (needsStorageDeposit) {
    actions.unshift(storageDepositForTokenAction());
  }

  return refFiManyFunctionCalls(actions);
};

export const checkTransaction = (txHash: string) => {
  return (near.connection.provider as JsonRpcProvider).sendJsonRpc(
    'EXPERIMENTAL_tx_status',
    [txHash, wallet.getAccountId()]
  );
};


///////////////////////////////
// Parallel Swap Logic Below //
///////////////////////////////

function formatPoolNew(pool, inputToken, outputToken) {
  let p = pool;
  let x = p.supplies[inputToken]
  let y = p.supplies[outputToken]
  p['gamma_bps'] = new Big(10000).minus(p.fee);
  p['x'] = x;
  p['y'] = y;
  return p;
}


function calculate_dx_float(mu, pool,inputToken, outputToken) {
  let p = formatPoolNew(pool, inputToken, outputToken);
  let radical = new Big(p.x).times(p.y).div(p.gamma_bps);
  let dxFloat = new Big(mu).times(100).times(radical.sqrt()).minus(new Big(p.x).times(10000).div(p.gamma_bps));
  return dxFloat
};


  
function calculate_dy_float(dx_float,pool, inputToken, outputToken) {
  if (dx_float <= 0) {
  return new Big(0);
  } 
  let p = formatPoolNew(pool, inputToken, outputToken);
  let dx = new Big(dx_float);
  let denom = new Big(10000).times(p.x).plus(new Big(p.gamma_bps).times(dx));
  let numerator = new Big(p.y).times(dx).times(p.gamma_bps);
  let dyFloat = numerator.div(denom).round();
  return dyFloat;
};


function solveForMuFloat(pools, totalDeltaX, inputToken, outputToken) {
  if (pools.length > 0){
      let numerator = new Big(totalDeltaX);
      let denominator = new Big(0);
      console.log(numerator);
      console.log(denominator)

      for (var i=0; i < pools.length; i++) {
          let p = formatPoolNew(pools[i],inputToken,outputToken);
          let numAdd = new Big(p.x).times(10000).div(p.gamma_bps);
          console.log(numAdd.toFixed());
          numerator = numerator.plus(numAdd);
          let denomAdd = new Big(p.x).times(p.y).div(p.gamma_bps).sqrt().times(100);
          denominator = denominator.plus(denomAdd);
      }

      const mu = new Big(numerator).div(denominator);
  return mu;	
  }
  else {
      console.log('ERROR - could not find pools that satisfy token pair')
      const mu = NaN;
  return mu;	
  }
};


  
function calculateOptimalOutput(pools, inputAmount, inputToken, outputToken) {
// This runs the main optimization algorithm using the input
// console.log('input amount is... ',inputAmount)
//let mu = solveForMu(pools, inputAmount);
let mu = solveForMuFloat(pools, inputAmount, inputToken, outputToken);
// console.log('mu is ... ', mu)
let dxArray = new Array();
let negativeDxValsFlag = false;
for (var i=0; i<pools.length; i++) {
  let pool = formatPoolNew(pools[i],inputToken, outputToken);
  let dx = calculate_dx_float(mu,pool,inputToken,outputToken);
  if (dx<0) {
    // console.log('found a negative dx value!')
    negativeDxValsFlag = true;
  }
      let dxInt = new Big(dx).round()
  dxArray.push(dxInt);
}
if (negativeDxValsFlag) {
    dxArray = reducePools(pools, dxArray,inputAmount, inputToken, outputToken);
}
let dxArraySum = new Big(0);
for (var i=0; i<dxArray.length; i++) {
  dxArraySum = dxArraySum.plus(dxArray[i]);
}
let normalizedDxArray = [];
for (var i=0; i<dxArray.length; i++) {
  let ndx = new Big(dxArray[i]).times(inputAmount).div(dxArraySum).round()
  normalizedDxArray.push(BigInt(ndx.toFixed()));
  pools[i]['partialAmountIn'] = BigInt(ndx.toFixed());
}
return normalizedDxArray
};


function reducePools(pools, dxArray, inputAmount, inputToken, outputToken) {
let goodIndices = [];
for (var i=0;i<dxArray.length;i++) {
  let dx = dxArray[i];
  if (dx>=0) {
    goodIndices.push(i)
  }
}
  if (goodIndices.length < 1) {
  console.log("ERROR OCCURRED -- ALL DX VALUES WERE NEGATIVE")
  return dxArray;
  }
let newPools = [];
for (var j=0; j<dxArray.length; j++) {
  if (goodIndices.includes(j)) {
    newPools.push(pools[j])
  }
}
let newDxVec = calculateOptimalOutput(newPools,inputAmount,inputToken,outputToken);
let goodInd2newdx = {};
for (var k=0;k<newDxVec.length;k++) {
  goodInd2newdx[goodIndices[k]] = newDxVec[k]
}
let newFullDxVec = [];
for (var ii=0; ii<pools.length; ii++) {
  if (goodIndices.includes(ii)) {
    newFullDxVec.push(goodInd2newdx[ii]);
  } else {
    newFullDxVec.push(0);
  }
}
return newFullDxVec;
};

//////////////////////////
// MAIN FUNCTION -- RETURNS ARRAYs OF OPTIMAL INPUTS, 
//                                    EXPECTED OUTPUTS, AND 
//                                    POOL ID ARRAYS
//////////////////////////

function calculateParallelSwapInputsOutputsPerPool(pools,inputAmount, inputToken, outputToken) {
  let ndxArray = calculateOptimalOutput(pools, inputAmount, inputToken, outputToken)
  let dyArray = [];
  for (var i=0; i<pools.length; i++) {
      let dyNow = new Big(calculate_dy_float(ndxArray[i],pools[i], inputToken, outputToken));
      dyArray.push(dyNow)
  }
  let poolIdArray = pools.map((item) => item.id);

  return ndxArray, dyArray, poolIdArray