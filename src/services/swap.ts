import BN from 'bn.js';
import Big from 'big.js';
// pulled in big.js to be able to use large floating point numbers as well as large integers.
// the floating point precision is necessary for the lagrange multiplier solution for parallel swap.
import {
  toNonDivisibleNumber,
  toPrecision,
  toReadableNumber,
  percentLess
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
import { ftGetStorageBalance, TokenMetadata } from './ft-contract';
import { getPoolsByTokens, Pool } from './pool';
import {
  checkTokenNeedsStorageDeposit,
  getTokenBalance,
  getWhitelistedTokens,
  round,
} from './token';
import { JsonRpcProvider } from 'near-api-js/lib/providers';
import {
  needDepositStorage,
  ONE_MORE_DEPOSIT_AMOUNT,
  storageDepositAction,
  storageDepositForTokenAction,
  STORAGE_TO_REGISTER_WITH_MFT,
} from './creators/storage';
import { registerTokenAction } from './creators/token';
import {
  NEW_ACCOUNT_STORAGE_COST,
  WRAP_NEAR_CONTRACT_ID,
  wnearMetadata,
} from '~services/wrap-near';
import { utils } from 'near-api-js';
import { BigNumber } from 'bignumber.js';

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

// Added in calculation here to determine the optimal spread of total input token amount amongst relevant pools.
// This is the main parallel swap algorithm function.
  let poolAllocations = await calculateOptimalOutput(pools, parsedAmountIn, tokenIn.id, tokenOut.id);
  // Now, filter only those pools that were allocated some non-zero amount of input token.
  let parallelPools = pools.filter(({ partialAmountIn }) => partialAmountIn > 0 )
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
        // console.log('within estimates, amountIn is... ',amountIn)
        let allocation = Big(pool.partialAmountIn).div(Big(10).pow(tokenIn.decimals)).toString()
		  // console.log('pool', pool);
        const amount_with_fee = Number(allocation) * (FEE_DIVISOR - pool.fee);
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


    return {
		estimates
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

interface InstantSwapOption extends SwapOptions {
  useNearBalance: boolean;
}

export const swap = async ({
  useNearBalance,
  swapsToDo,
  tokenIn,
  tokenOut,
  tokenInAmount,
  slippageTolerance,
}: InstantSwapOption) => {
  if (swapsToDo) {
    if (useNearBalance) {
      await instantSwap({
        swapsToDo,
        tokenIn,
        tokenOut,
        tokenInAmount,
        slippageTolerance,
      });
    } else {
      await depositSwap({
        swapsToDo,
        tokenIn,
        tokenOut,
        tokenInAmount,
        slippageTolerance,
      });
    }
  }
};

export const instantSwap = async ({
  swapsToDo,
  tokenIn,
  tokenOut,
  tokenInAmount,
  slippageTolerance,
  }: SwapOptions) => {
	const swapActions = swapsToDo.map((s2d) => {
		// let tokenOutAmount = s2d.estimate;
    let dx_float = s2d.pool.partialAmountIn.toNumber();
    let fpool = formatPoolNew(s2d.pool, tokenIn.id, tokenOut.id);
    let dy_float = calculate_dy_float(dx_float,fpool, tokenIn.id, tokenOut.id);
    let tokenOutAmount = dy_float.div(Big(10).pow(tokenOut.decimals)).toString();
    s2d.estimate = tokenOutAmount;
	let minTokenOutAmount = tokenOutAmount ? percentLess(slippageTolerance, tokenOutAmount): null;
    console.log(s2d.pool.partialAmountIn)
    console.log('token out amount estimate: ',tokenOutAmount)
    let allocation = s2d.pool.partialAmountIn.div(Big(10).pow(tokenIn.decimals)).toString();
    console.log(allocation);
    console.log('type of allocation: ', typeof(allocation), allocation);
    console.log('type of tokenInAmount: ', typeof(tokenInAmount), tokenInAmount);
		return {
			pool_id: s2d.pool.id, 
			token_in: tokenIn.id, 
			token_out: tokenOut.id, 
			amount_in: round(tokenIn.decimals, toNonDivisibleNumber(tokenIn.decimals, allocation)), 
			min_amount_out: round(tokenOut.decimals, toNonDivisibleNumber(tokenOut.decimals, minTokenOutAmount))
		}
	});

  const transactions: Transaction[] = [];
  const tokenInActions: RefFiFunctionCallOptions[] = [];
  const tokenOutActions: RefFiFunctionCallOptions[] = [];

  if (wallet.isSignedIn()) {
    const tokenOutRegistered = await ftGetStorageBalance(
      tokenOut.id,
      wallet.getAccountId()
    ).catch(() => {
      throw new Error(`${tokenOut.id} doesn't exist.`);
    });

    if (!tokenOutRegistered || tokenOutRegistered.total === '0') {
      tokenOutActions.push({
        methodName: 'storage_deposit',
        args: {
          registration_only: true,
          account_id: wallet.getAccountId(),
        },
        gas: '30000000000000',
        amount: STORAGE_TO_REGISTER_WITH_MFT,
      });

      transactions.push({
        receiverId: tokenOut.id,
        functionCalls: tokenOutActions,
      });
    }

    tokenInActions.push({
      methodName: 'ft_transfer_call',
      args: {
        receiver_id: REF_FI_CONTRACT_ID,
        amount: toNonDivisibleNumber(tokenIn.decimals, tokenInAmount),
        msg: JSON.stringify({
          force: 0,
          actions: swapActions,
        }),
      },
      gas: '150000000000000',
      amount: ONE_YOCTO_NEAR,
    });

    transactions.push({
      receiverId: tokenIn.id,
      functionCalls: tokenInActions,
    });

    return executeMultipleTransactions(transactions);
  }
};

export const depositSwap = async ({
  swapsToDo,
  tokenIn,
  tokenOut,
  tokenInAmount,
  slippageTolerance,
}) => {
	// console.log('Deposit Swap...', tokenInAmount);
	// console.log('swapsToDo', swapsToDo);
	
	const swapActions = swapsToDo.map((s2d) => {
		// let tokenOutAmount = s2d.estimate;
    let dx_float = s2d.pool.partialAmountIn.toNumber();
    let fpool = formatPoolNew(s2d.pool, tokenIn.id, tokenOut.id);
    let dy_float = calculate_dy_float(dx_float,fpool, tokenIn.id, tokenOut.id);
    let tokenOutAmount = dy_float.div(Big(10).pow(tokenOut.decimals)).toString();
    s2d.estimate = tokenOutAmount;
	let minTokenOutAmount = tokenOutAmount ? percentLess(slippageTolerance, tokenOutAmount): null;
    console.log(s2d.pool.partialAmountIn)
    console.log('token out amount estimate: ',tokenOutAmount)
    let allocation = s2d.pool.partialAmountIn.div(Big(10).pow(tokenIn.decimals)).toString();
    console.log(allocation);
    console.log('type of allocation: ', typeof(allocation), allocation);
    console.log('type of tokenInAmount: ', typeof(tokenInAmount), tokenInAmount);
		return {
			pool_id: s2d.pool.id, 
			token_in: tokenIn.id, 
			token_out: tokenOut.id, 
			amount_in: round(tokenIn.decimals, toNonDivisibleNumber(tokenIn.decimals, allocation)), 
			min_amount_out: round(tokenOut.decimals, toNonDivisibleNumber(tokenOut.decimals, minTokenOutAmount))
		}
	});


  const actions: RefFiFunctionCallOptions[] = [
    {
      methodName: 'swap',
      args: { actions: swapActions },
      amount: ONE_YOCTO_NEAR,
    },
  ];

  const whitelist = await getWhitelistedTokens();
  if (!whitelist.includes(tokenOut.id)) {
    actions.unshift(registerTokenAction(tokenOut.id));
  }

<<<<<<< HEAD
  const needsStorageDeposit = await checkTokenNeedsStorageDeposit(tokenOut.id);
  if (needsStorageDeposit) {
    actions.unshift(storageDepositForTokenAction());
=======
  const neededStorage = await checkTokenNeedsStorageDeposit();
  if (neededStorage) {
    actions.unshift(storageDepositAction({ amount: neededStorage }));
>>>>>>> main
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

/** formatPoolNew
 * This function appends to the existing standard Pool struct and adds attributes that simplify the parallel swap algorithms.
 * Adds attributes "x" (for input token reserves in pool), "y" (for output token reserves in pool), and "gamma_bps" (for 1- fee in bps)
 * Our convention for our algorithm has been to use "x" as the input token and "y" as the output token.
 * @param pool    AMM structure containing reserves of inputToken and outputToken
 * @param inputToken the name of the inputToken being traded in.
 * @param outputToken the name of the outputToken being traded out.
 * @returns newFormatPool
 */
function formatPoolNew(pool, inputToken, outputToken) {
  let p = pool;
  let x = p.supplies[inputToken];
  let y = p.supplies[outputToken];
  p['gamma_bps'] = new Big(10000).minus(p.fee);
  p['x'] = x;
  p['y'] = y;
  return p;
}


/** solveForMuFloat
 * This function takes the set of token pools, the total input of inputToken, and the names of inputToken and outputToken and
 * solves for the Lagrange Multiplier "mu". Note that mu must be allowed to be aritrary precision floating point number. Mu will
 * be used in subsequent function calls to determine the best allocations of intputToken to be made per pool.
 * For more detailed math on how this function was derived, please see the white paper:
 * https://github.com/giddyphysicist/ParallelSwapForRefFinance/blob/main/ParallelSwapWhitePaper.pdf
 * @param pools   list of pools that contain inputToken and outputToken
 * @param totalDeltaX  total allocation (among all pools) being input of inputToken
 * @param inputToken   the name of the inputToken being traded in.
 * @param outputToken   the name of the outputToken being traded out.
 * @returns mu   the lagrange multiplier value calculated for a set of pools and inputToken amount.
 */
function solveForMuFloat(pools, totalDeltaX, inputToken, outputToken) {
  if (pools.length > 0){
      let numerator = new Big(totalDeltaX);
      let denominator = new Big(0);
      // console.log(numerator);
      // console.log(denominator)

      for (var i=0; i < pools.length; i++) {
          let p = formatPoolNew(pools[i],inputToken,outputToken);
          let numAdd = new Big(p.x).times(10000).div(p.gamma_bps);
          // console.log(numAdd.toFixed());
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


/** calculate_dx_float
 * Once mu has been calculated for a set of pools and total input amount, the next step is
 * determining the total allocation per pool. This function evaluates the amount of input Token to be 
 * allocated to the given pool. Note, in our original algorithmic convention, the 'x' variable was for the input token,
 * and the 'y' variable was for the output token. Here, the value dx is the part of the full amount of input token X. 
 * Again, the detailed formulae for these operations can be found in the white paper referenced above.
 * @param mu   the lagrange multiplier value calculated for a set of pools and inputToken amount.
 * @param pool   AMM structure containing reserves of inputToken and outputToken
 * @param inputToken the name of the inputToken being traded in.
 * @param outputToken  the name of the outputToken being traded out.
 * @returns dxFloat   the allocation amount determined for the given pool
 */
function calculate_dx_float(mu, pool,inputToken, outputToken) {
  let p = formatPoolNew(pool, inputToken, outputToken);
  let radical = new Big(p.x).times(p.y).div(p.gamma_bps);
  let dxFloat = new Big(mu).times(100).times(radical.sqrt()).minus(new Big(p.x).times(10000).div(p.gamma_bps));
  return dxFloat
};


/** calculate_dy_float
 * Once you have an allocation amount for a given pool, you can use the AMM constant-product formula to determine
 * the expected output amount of output Token. 
 * Note, here, as earlier, our algorithmic convention uses "y" as the output token, and so "dy" is the fraction of 
 * the total output of output Token, assuming there could be dy contributions from other parallel pools as well.
 * @param dx_float  input allocation amount of inputToken for the given pool
 * @param pool   a structure representing the reserves and fees for a given pool.
 * @param inputToken  the name of the inputToken being traded in.
 * @param outputToken  the name of the outputToken being traded out.
 * @returns dyFloat  the expected trade out amount out of outputToken
 */
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




 /** calculateOptimalOutput
  * This is the main function, which calculates optimal values of inputToken to swap into each pool.
  * @param pools  list of relevant AMM pools containing inputToken and outputToken
  * @param inputAmount   the numeric total amount of inputToken to be traded into the group of swap pools.
  * @param inputToken   the name of the inputToken being traded in. 
  * @param outputToken  the name of the outputToken being traded out.
  * @returns normalizedDxArray an array containing the amount allocations of inputToken per pool in the list of pools.
  */ 
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
  pools[i]['partialAmountIn'] = BigNumber(ndx.toString());
}
return normalizedDxArray
};

/** reducePools
 * This function is used to implement part of the non-linear slack variables in the lagrange - multiplier 
 * solution for parallel swap. Part of what comes out of the math is that sometimes, the optimal allocation for a pool
 * can be negative, which makes no physical sense. When this occurs, that particular pool needs to be flagged and the 
 * lagrange constraint applied to force the allocation to be zero. 
 * This function takes an already-solved set of pools, input allocation per pool, the total input amount, and the 
 * inputToken name and outputToken name, and determines which, if any, allocations need to be set to zero.
 * However, when this occurs, and a pool is essentially ignored from the list, then the calculation for mu must be re-done. 
 * So the calculateOptimalOutput function is then called on the reduced set of pools, and if no negative allocation values remain, 
 * then the allocations on the reduced set is determined, and values of zero are put in for the 'failed' pools. 
 * @param pools  list of pools that contain inputToken and outputToken
 * @param dxArray  list of input allocation per pool
 * @param inputAmount   total amount of inputToken to be traded among the pools
 * @param inputToken    the name of the inputToken
 * @param outputToken   the name of the outputToken
 * @returns newFullDxVec  the new full list of input allocations the same length as dxArray, containing zeros for failed pools. 
 */
function reducePools(pools, dxArray, inputAmount, inputToken, outputToken) {
let goodIndices = [];
for (var i=0;i<dxArray.length;i++) {
  let dx = dxArray[i];
  if (dx>=0) {
    goodIndices.push(i)
  }
}
  if (goodIndices.length < 1) {
  // console.log("ERROR OCCURRED -- ALL DX VALUES WERE NEGATIVE")
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

