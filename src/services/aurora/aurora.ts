import {
  Address,
  FunctionCallArgsV1,
  FunctionCallArgsV2,
  parseHexString,
  Engine,
  AccountID,
  CallArgs,
} from '@aurora-is-near/engine';

import { toBufferBE } from 'bigint-buffer';

import { Erc20Abi } from './abi/erc20';

import { getCurrentWallet } from '../../utils/sender-wallet';

import { UniswapRouterAbi } from './abi/IUniswapV2Router02';

import { UniswapPairAbi } from './abi/IUniswapV2Pair';

import AbiCoder from 'web3-eth-abi';

import * as nearAPI from 'near-api-js';

import Big from 'big.js';
import { getAuroraConfig, defaultTokenList } from './config';
import {
  near,
  wallet,
  keyStore,
  Transaction,
  RefFiFunctionCallOptions,
} from '../near';
import getConfig from '../config';
import { BN } from 'bn.js';
import { Pool } from '../pool';
import { ftGetTokenMetadata, TokenMetadata } from '../ft-contract';
import { useEffect, useState } from 'react';
import {
  scientificNotationToString,
  toReadableNumber,
  percentLess,
} from '../../utils/numbers';
import { utils } from 'near-api-js';
import { EstimateSwapView } from '../swap';
import BigNumber from 'bignumber.js';
import { toNonDivisibleNumber } from '../../utils/numbers';
import { functionCall } from 'near-api-js/lib/transaction';
import { ONE_YOCTO_NEAR, executeMultipleTransactions } from '../near';

const trisolaris = getAuroraConfig().trisolarisAddress;

export const Zero64 = '0'.repeat(64);
export const SHARE_DECIMAL = 18;
export const PAIR_FEE = 3;
export const oneETH = new Big(10).pow(18);
export const ETH_DECIMAL = 18;
export const TGas = '1000000000000';
// export const AuroraCallGas =

export const depositGas = '70000000000000';

export const AuroraCallGas = '150000000000000';

const getAurora = () => {
  const AuroraWalletConnection = new nearAPI.WalletConnection(near, 'aurora');

  //@ts-ignore
  return new Engine(
    AuroraWalletConnection,
    keyStore,
    wallet.account(),
    getConfig().networkId,
    'aurora'
  );
};

export const toAddress = (address: string | any) => {
  return typeof address === 'string'
    ? Address.parse(address).unwrapOrElse(() => Address.zero())
    : address;
};

// OK
export const auroraAddr = (nearAccount: string) =>
  new AccountID(nearAccount).toAddress().toString();

// OK
export const getErc20Addr = async (token_id: string) => {
  if (token_id === 'aurora') return getAuroraConfig().WETH;

  return (
    await getAurora().getAuroraErc20Address(new AccountID(token_id))
  ).unwrap();
};

export const buildInput = (abi: any[], methodName: string, params: any) => {
  const abiItem = abi.find((a) => a.name === methodName);
  if (!abiItem) {
    return null;
  }

  //@ts-ignore
  return AbiCoder.encodeFunctionCall(abiItem, params);
};

export const decodeOutput = (abi: any[], methodName: string, buffer: any) => {
  const abiItem = abi.find((a) => a.name === methodName);
  if (!abiItem) {
    return null;
  }

  //@ts-ignore
  return AbiCoder.decodeParameters(
    abiItem.outputs,
    `0x${buffer.toString('hex')}`
  );
};

export function prepareInput(args: any) {
  if (typeof args === 'undefined') return Buffer.alloc(0);
  if (typeof args === 'string') return Buffer.from(parseHexString(args));
  return Buffer.from(args);
}

export function prepareAmount(value: any) {
  if (typeof value === 'undefined') return toBufferBE(BigInt(0), 32);
  const number = BigInt(value);
  return toBufferBE(number, 32);
}

export async function auroraCall(toAddress: any, input: any, value: any) {
  if (value) return (await getAurora().call(toAddress, input, value)).unwrap();
  else return (await getAurora().call(toAddress, input)).unwrap();
}

export function auroraCallToAction(contract: any, input: any, value?: string) {
  const inner_args = new FunctionCallArgsV2({
    contract: contract.toBytes(),
    value: prepareAmount(value || '0'),
    input: prepareInput(input),
  });

  const args = new CallArgs({
    functionCallArgsV2: inner_args,
  }).encode();

  const action: RefFiFunctionCallOptions = {
    methodName: 'call',
    args: prepareInput(args),
    gas: AuroraCallGas,
  };

  return action;
}

export function parseAuroraPool({
  tokenA,
  tokenB,
  auroraAddrA,
  auroraAddrB,
  shares,
  id, // from aurora pool id
  decodedRes,
}: {
  tokenA: string;
  tokenB: string;
  shares: string;
  auroraAddrA: string;
  auroraAddrB: string;
  id: number;
  decodedRes: any;
}): Pool & { Dex: string } {
  const Afirst = auroraAddrA > auroraAddrB;

  const token1Id = Afirst ? tokenA : tokenB;
  const token1Supply = Afirst ? decodedRes.reserve0 : decodedRes.reserve1;

  const token2Id = Afirst ? tokenB : tokenA;
  const token2Supply = Afirst ? decodedRes.reserve1 : decodedRes.reserve0;

  return {
    Dex: 'tri',
    id,
    fee: 30,
    shareSupply: shares + '0'.repeat(6),
    tvl: undefined,
    token0_ref_price: undefined,
    tokenIds: [token1Id, token2Id],
    supplies: {
      [token1Id]: token1Supply,
      [token2Id]: token2Supply,
    },
  };
}

// OK
export async function getTotalSupply(pairAdd: string, address: string) {
  const input = buildInput(UniswapPairAbi, 'totalSupply', []);
  const res = (
    await getAurora().view(toAddress(address), toAddress(pairAdd), 0, input)
  ).unwrap();
  return decodeOutput(UniswapPairAbi, 'totalSupply', res);
}

// OK
export async function getAuroraPool(
  address: string,
  tokenA: TokenMetadata,
  tokenB: TokenMetadata,
  pairAdd: string,
  id: number,
  pairName?: string
) {
  const input = buildInput(UniswapPairAbi, 'getReserves', []);

  // no this pair to return null
  const pairId = [tokenA.symbol, tokenB.symbol].join('-');
  const pairIdReverse = [tokenB.symbol, tokenA.symbol].join('-');

  const allPairs = Object.keys(getAuroraConfig().Pairs);

  if (!allPairs.find((p) => p === pairId || p === pairIdReverse)) return null;

  const auroraAddrA =
    tokenA.id === 'aurora'
      ? getAuroraConfig().WETH
      : await getErc20Addr(tokenA.id);
  const auroraAddrB =
    tokenB.id === 'aurora'
      ? getAuroraConfig().WETH
      : await getErc20Addr(tokenB.id);

  const shares = (await getTotalSupply(pairAdd, address))?.[0];

  const res = (
    await getAurora().view(toAddress(address), toAddress(pairAdd), 0, input)
  ).unwrap();

  const decodedRes = decodeOutput(UniswapPairAbi, 'getReserves', res);

  return parseAuroraPool({
    tokenA: tokenA.id,
    tokenB: tokenB.id,
    shares,
    auroraAddrA,
    auroraAddrB,
    id, // TODO: encode tri pool id
    decodedRes,
  });
}

// sign and send transaction on token contract
export async function depositToAuroraTransaction(
  token_id: string,
  readableAmount: string,
  decimal: number,
  address: string
) {
  if (token_id === 'aurora') {
    return {
      receiverId: 'aurora',
      functionCalls: [
        {
          methodName: 'ft_transfer_call',
          args: {
            receiver_id: 'aurora',
            amount: new Big(readableAmount).mul(oneETH).toFixed(0),
            memo: '',
            msg:
              getCurrentWallet().wallet.getAccountId() +
              ':' +
              Zero64 +
              address.substring(2),
          },
          gas: depositGas,
          amount: ONE_YOCTO_NEAR,
        },
      ],
    };

    // return nearAPI.transactions.createTransaction()
  } else {
    return {
      receiverId: token_id,
      functionCalls: [
        {
          methodName: 'ft_transfer_call',
          args: {
            receiver_id: 'aurora',
            amount: toNonDivisibleNumber(decimal, readableAmount),
            memo: '',
            msg: address.substring(2),
          },
          gas: depositGas,
          amount: ONE_YOCTO_NEAR,
        },
      ],
    };
  }
}

// TODO: need to validate before sign and send transaction
export function approveERC20(
  tokenAddresss: string,
  readableAmount: string,
  decimal: number
) {
  const input = buildInput(Erc20Abi, 'increaseAllowance', [
    trisolaris,
    toNonDivisibleNumber(decimal, readableAmount),
  ]);

  return auroraCallToAction(toAddress(tokenAddresss), input);
}

export async function swapExactTokensForTokens({
  from,
  to,
  readableAmountIn,
  readableAmountOut,
  decimalIn,
  decimalOut,
  address,
}: {
  from: string;
  to: string;
  readableAmountIn: string;
  readableAmountOut: string;
  decimalIn: number;
  decimalOut: number;
  address: string;
}) {
  const fromErc20 = await getErc20Addr(from);
  const toErc20 = await getErc20Addr(to);

  const input = buildInput(UniswapRouterAbi, 'swapExactTokensForTokens', [
    toNonDivisibleNumber(decimalIn, readableAmountIn), // need to check decimals in real case
    toNonDivisibleNumber(decimalOut, readableAmountOut), // need to check decimals in real case
    [fromErc20.id, toErc20.id],
    address,
    (Math.floor(new Date().getTime() / 1000) + 60).toString(), // 60s from now
  ]);

  const callAddress = toAddress(trisolaris);

  return auroraCallToAction(callAddress, input);
}

export async function swapExactETHforTokens({
  to,
  readableAmountIn,
  readableAmountOut,
  decimalOut,
  address,
}: {
  to: string;
  readableAmountIn: string;
  readableAmountOut: string;
  decimalOut: number;
  address: string;
}) {
  const toErc20 = await getErc20Addr(to);
  const input = buildInput(UniswapRouterAbi, 'swapExactETHForTokens', [
    toNonDivisibleNumber(decimalOut, readableAmountOut),
    [getAuroraConfig().WETH, toErc20.id],
    address,
    (Math.floor(new Date().getTime() / 1000) + 60).toString(), // 60s from now
  ]);

  const value = toNonDivisibleNumber(ETH_DECIMAL, readableAmountIn);

  const callContract = toAddress(trisolaris);

  return auroraCallToAction(callContract, input, value);

  // transaction or directly call
}

export async function swapExactTokensforETH({
  from,
  readableAmountIn,
  readableAmountOut,
  decimalIn,
  address,
}: {
  from: string;
  readableAmountIn: string;
  readableAmountOut: string;
  decimalIn: number;
  address: string;
}) {
  const fromErc20 = await getErc20Addr(from);

  const input = buildInput(UniswapRouterAbi, 'swapExactTokensForETH', [
    toNonDivisibleNumber(decimalIn, readableAmountIn),
    toNonDivisibleNumber(ETH_DECIMAL, readableAmountOut),
    [fromErc20.id, getAuroraConfig().WETH],
    address,
    (Math.floor(new Date().getTime() / 1000) + 60).toString(), // 60s from now
  ]);

  const callAddress = toAddress(trisolaris);

  return auroraCallToAction(callAddress, input);
}

export async function swap({
  from,
  to,
  readableAmountIn,
  readableAmountOut,
  decimalIn,
  decimalOut,
  address,
}: {
  from: string;
  to: string;
  readableAmountIn: string;
  readableAmountOut: string;
  decimalIn: number;
  decimalOut: number;
  address: string;
}) {
  if (from === 'aurora') {
    return swapExactETHforTokens({
      to,
      readableAmountIn,
      readableAmountOut,
      decimalOut,
      address,
    });
  } else if (to === 'aurora') {
    return swapExactTokensforETH({
      from,
      readableAmountIn,
      readableAmountOut,
      decimalIn,
      address,
    });
  } else {
    return swapExactTokensForTokens({
      from,
      to,
      readableAmountIn,
      readableAmountOut,
      decimalIn,
      decimalOut,
      address,
    });
  }
}

export const fetchAllowance = async (address: string, tokenAddress: string) => {
  try {
    const input = buildInput(Erc20Abi, 'allowance', [
      address,
      getAuroraConfig().trisolarisAddress.toString(),
    ]);
    const res = (
      await getAurora().view(
        toAddress(address),
        toAddress(tokenAddress),
        0,
        input
      )
    ).unwrap();
    const out = decodeOutput(Erc20Abi, 'allowance', res);
    return Big(out[0]);
  } catch (e) {
    console.log(e);
    return new Big(0);
  }
};

export const checkAllowanceAndApprove = async (
  address: string,
  tokenAddresss: string,
  readableAmountIn: string,
  decimal: number
) => {
  if (tokenAddresss === getAuroraConfig().WETH) return null;

  const allowance = await fetchAllowance(address, tokenAddresss);

  if (allowance.lt(new Big(readableAmountIn))) {
    return approveERC20(
      tokenAddresss,
      new Big(readableAmountIn).minus(allowance).toFixed(0, 3),
      decimal
    );
  }
};

// aurora call
export async function withdrawFromAurora({
  token_id,
  amount,
  decimal,
}: {
  token_id: string;
  amount: string;
  decimal: number;
}) {
  if (token_id === 'aurora') {
    const callAddress = toAddress(getAuroraConfig().ethBridgeAddress);

    const input = `0x00${Buffer.from(
      getCurrentWallet().wallet.getAccountId(),
      'utf-8'
    ).toString('hex')}`;

    const value = new Big(oneETH).mul(amount).round(0, 0).toFixed(0);

    return auroraCallToAction(callAddress, input, value);
  } else {
    const input = buildInput(Erc20Abi, 'withdrawToNear', [
      `0x${Buffer.from(
        getCurrentWallet().wallet.getAccountId(),
        'utf-8'
      ).toString('hex')}`,
      toNonDivisibleNumber(decimal, amount), // need to check decimals in real case
    ]);
    const erc20Addr = await getErc20Addr(token_id);

    // await getAurora().call(toAddress(erc20Addr), input);

    return auroraCallToAction(erc20Addr, input);
  }
}

export const fetchErc20Balance = async (
  address: string,
  tokenAddress: string
) => {
  try {
    const input = buildInput(Erc20Abi, 'balanceOf', [address]);
    const res = (
      await getAurora().view(
        toAddress(address),
        toAddress(tokenAddress),
        0,
        input
      )
    ).unwrap();

    const out = decodeOutput(Erc20Abi, 'balanceOf', res);

    return Big(out[0]);
  } catch (e) {
    return false;
  }
};

export const useAuroraTokens = () => {
  const [tokens, setTokens] = useState<any>({});

  const tokenList = defaultTokenList;

  useEffect(() => {
    setTokens(
      Object.assign(
        {
          tokenAddresses: tokenList.tokens.map((t) => t.address),
          tokensByAddress: tokenList.tokens.reduce((m, t) => {
            m[t.address] = t;
            return m;
          }, {}),
        },
        tokenList
      )
    );
  }, [tokenList]);

  return tokens;
};

// OK
export const useAuroraBalances = (address: string) => {
  const [tokenBalances, setTokenBalances] = useState(null);

  const tokens = useAuroraTokens();

  useEffect(() => {
    if (!address || !tokens?.tokenAddresses) {
      setTokenBalances(null);
      return;
    }

    const requestAddress = tokens.tokenAddresses.concat([
      getAuroraConfig().WETH,
    ]);

    setTokenBalances(
      requestAddress.reduce((obj: any, tokenAddress: string) => {
        obj[tokenAddress] = null;
        return obj;
      }, {})
    );

    Promise.all(
      requestAddress.map((add: string) =>
        add === getAuroraConfig().WETH
          ? fetchBalance(address)
          : fetchErc20Balance(address, add)
      )
    ).then((res) => {
      setTokenBalances(
        res.reduce((pre, cur, i) => {
          if (cur)
            return {
              ...pre,
              [requestAddress[i]]: scientificNotationToString(cur.toString()),
            };
          else return pre;
        }, {})
      );
    });
  }, [address, tokens]);

  return tokenBalances;
};

export const useAuroraBalancesNearMapping = (address: string) => {
  const auroraMapping = useAuroraBalances(address);

  const [nearMapping, setNearMapping] = useState(null);

  useEffect(() => {
    if (!auroraMapping) return;
    const auroraAddresses = Object.keys(auroraMapping);

    getBatchTokenNearAcounts(auroraAddresses)
      .then((nearAccounts) => {
        return nearAccounts.reduce((pre, cur, i) => {
          return {
            ...pre,
            [cur]: Object.values(auroraMapping)[i],
          };
        }, {});
      })
      .then(setNearMapping);
  }, [auroraMapping]);

  return nearMapping;
};

export const useTriTokenIdsOnRef = () => {
  const tokenIds = defaultTokenList.tokens.map((tk) => tk.address);

  const [triTokenIds, setTriTokenIds] = useState(null);

  useEffect(() => {
    getBatchTokenNearAcounts(tokenIds).then(setTriTokenIds);
  }, []);

  return triTokenIds?.filter((id: string) => id);
};

// fetch eth balance
export const fetchBalance = async (address: string) => {
  return scientificNotationToString(
    Big((await getAurora().getBalance(toAddress(address))).unwrap()).toString()
  );
};

// combine transactions to sign once

export const getTokenNearAccount = async (auroraAddress: string) => {
  try {
    return (
      await getAurora().getNEP141Account(toAddress(auroraAddress))
    ).unwrap();
  } catch (error) {}
};

export const getBatchTokenNearAcounts = async (ids: string[]) => {
  return await Promise.all(
    ids.map((id) =>
      id === getAuroraConfig().WETH
        ? 'aurora'
        : getTokenNearAccount(id).then((res) => res?.id)
    )
  );
};

export const getAllTriPools = async () => {
  const allSupportPairs = getAuroraConfig().Pairs;
  const auroraTokens = defaultTokenList.tokens;
  const address = auroraAddr(getCurrentWallet().wallet.getAccountId());
  const symbolToAddress = auroraTokens.reduce((pre, cur, i) => {
    return {
      ...pre,
      [cur.symbol]: cur.address,
    };
  }, {});
  const pairAddresses = Object.keys(allSupportPairs).map((pairName: string) => {
    const names = pairName.split('-');
    return {
      ids: names.map((n) => {
        if (n === 'ETH') return getAuroraConfig().WETH;
        else return symbolToAddress[n];
      }),
      pairName,
      pairAdd: allSupportPairs[pairName],
    };
  });

  const allPools = await Promise.all(
    pairAddresses.map(async (pairInfo, i) => {
      const nep141s = await getBatchTokenNearAcounts(pairInfo.ids);
      if (nep141s.some((nep) => !nep)) {
        return null;
      }
      const tokenMetas = await Promise.all(
        nep141s.map((id: string) => ftGetTokenMetadata(id))
      );

      return getAuroraPool(
        address,
        tokenMetas[0],
        tokenMetas[1],
        pairInfo.pairAdd,
        -1 * (i + 1)
      );
    })
  );
  return allPools.filter((p) => p);
};

// not deposit to aurora
export const auroraSwapTransactions = async ({
  tokenIn_id,
  tokenOut_id,
  swapTodos,
  readableAmountIn, // for all deposit and allowance
  decimalIn,
  decimalOut,
  slippageTolerance,
  swapType,
}: {
  tokenIn_id: string;
  tokenOut_id: string;
  swapTodos: EstimateSwapView[];
  readableAmountIn: string;
  decimalIn: number;
  decimalOut: number;
  slippageTolerance: number;
  swapType?: 'parallel' | 'smartV1';
}) => {
  try {
    const transactions: Transaction[] = [];
    if (swapTodos.length === 0) return transactions;

    const actions = [];

    const address = auroraAddr(getCurrentWallet().wallet.getAccountId());

    const tokenInAddress = await getErc20Addr(tokenIn_id);

    // deposit to aurora, one route case
    const depositTransaction = await depositToAuroraTransaction(
      tokenIn_id,
      readableAmountIn,
      decimalIn,
      address
    );

    transactions.push(depositTransaction);

    const approveAction = await checkAllowanceAndApprove(
      address,
      tokenInAddress,
      readableAmountIn,
      decimalIn
    );

    if (approveAction) {
      actions.push(approveAction);
    }

    let swapActions = [];

    if (swapType === 'parallel') {
      swapActions = await Promise.all(
        swapTodos.map((todo) => {
          return swap({
            from: tokenIn_id,
            to: tokenOut_id,
            decimalIn,
            decimalOut,
            readableAmountIn: toReadableNumber(
              decimalIn,
              todo.pool.partialAmountIn
            ),
            readableAmountOut: percentLess(decimalOut, todo.estimate),
            address,
          });
        })
      );

      swapActions.forEach((a) => actions.push(a));
    } else if (swapType === 'smartV1') {
      swapActions = [
        await swap({
          from: tokenIn_id,
          to: tokenOut_id,
          decimalIn,
          decimalOut,
          readableAmountIn: toReadableNumber(
            decimalIn,
            swapTodos[0].pool.partialAmountIn
          ),
          readableAmountOut: percentLess(
            decimalOut,
            swapTodos[swapTodos.length - 1].estimate
          ),
          address,
        }),
      ];
    }

    // one route case
    const totalMinAmountOut = scientificNotationToString(
      BigNumber.sum(
        ...swapTodos.map((todo) =>
          percentLess(slippageTolerance, todo.estimate)
        )
      ).toString()
    );

    const withdrawAction = await withdrawFromAurora({
      token_id: tokenOut_id,
      amount: totalMinAmountOut,
      decimal: decimalOut,
    });

    actions.push(withdrawAction);

    transactions.push({
      receiverId: 'aurora',
      functionCalls: actions,
    });

    return transactions;
  } catch (error) {
    throw error;
  }
};

// TODO: error on sender
export const batchWithdrawFromAurora = async (
  // tokens: TokenMetadata[],
  // readableAmounts: []
  tokenMap: any
) => {
  const tokenIdList = Object.keys(tokenMap);

  const tokens = await Promise.all(
    tokenIdList.map((id) => ftGetTokenMetadata(id))
  );

  const actions = await Promise.all(
    tokens.map((tk, i) =>
      withdrawFromAurora({
        token_id: tk.id,
        amount: tokenMap[tk.id].amount,
        decimal: tk.decimals,
      })
    )
  );

  return executeMultipleTransactions([
    {
      receiverId: 'aurora',
      functionCalls: actions,
    },
  ]);
};
