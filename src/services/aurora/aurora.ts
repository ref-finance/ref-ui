import {
  AccountID,
  Address,
  CallArgs,
  Engine,
  FunctionCallArgsV2,
  parseHexString,
} from '@aurora-is-near/engine';
import Big from 'big.js';
import { toBufferBE } from 'bigint-buffer';
import BigNumber from 'bignumber.js';
import { WalletConnection } from 'near-api-js';
import { useContext, useEffect, useState } from 'react';
import AbiCoder from 'web3-eth-abi';

import { getURLInfo } from '../../components/layout/transactionTipPopUp';
import { useWalletSelector } from '../../context/WalletSelectorContext';
import { WRAP_NEAR_CONTRACT_ID } from '../../services/wrap-near';
import {
  percentLess,
  scientificNotationToString,
  toReadableNumber,
} from '../../utils/numbers';
import { toNonDivisibleNumber } from '../../utils/numbers';
import {
  getCurrentWallet,
  WalletContext,
} from '../../utils/wallets-integration';
import getConfig from '../config';
import { STORAGE_TO_REGISTER_WITH_MFT } from '../creators/storage';
import { ftGetTokenMetadata, TokenMetadata } from '../ft-contract';
import { ftGetStorageBalance } from '../ft-contract';
import { keyStore, near, RefFiFunctionCallOptions, Transaction } from '../near';
import { executeMultipleTransactions, ONE_YOCTO_NEAR, wallet } from '../near';
import { Pool } from '../pool';
import { EstimateSwapView } from '../swap';
import { list_user_assets } from '../swapV3';
import { nearWithdrawTransaction } from '../wrap-near';
import { Erc20Abi } from './abi/erc20';
import { UniswapPairAbi } from './abi/IUniswapV2Pair';
import { UniswapRouterAbi } from './abi/IUniswapV2Router02';
import { defaultTokenList, getAuroraConfig } from './config';

const trisolaris = getAuroraConfig().trisolarisAddress;

const SECOND_FROM_NOW = 60 * 5;

export const Zero64 = '0'.repeat(64);
export const SHARE_DECIMAL = 18;
export const PAIR_FEE = 3;
export const oneETH = new Big(10).pow(18);
export const ETH_DECIMAL = 18;
export const TGas = '1000000000000';
// export const AuroraCallGas =

export const depositGas = '70000000000000';

export const AuroraCallGas = '150000000000000';

class AuroraWalletConnection extends WalletConnection {
  async _completeSignInWithAccessKey() {
    const currentUrl = new URL(window.location.href);
    const publicKey = currentUrl.searchParams.get('public_key') || '';
    const allKeys = (currentUrl.searchParams.get('all_keys') || '').split(',');
    const accountId = currentUrl.searchParams.get('account_id') || '';
    // TODO: Handle errors during login
    if (accountId) {
      this._authData = {
        accountId,
        allKeys,
      };
      window.localStorage.setItem(
        this._authDataKey,
        JSON.stringify(this._authData)
      );
      if (publicKey) {
        await this._moveKeyFromTempToPermanent(accountId, publicKey);
      }
    }
    // currentUrl.searchParams.delete('public_key');
    // currentUrl.searchParams.delete('all_keys');
    // currentUrl.searchParams.delete('account_id');
    // currentUrl.searchParams.delete('meta');
    // currentUrl.searchParams.delete('transactionHashes');
    // window.history.replaceState({}, document.title, currentUrl.toString());
  }
}

const getAurora = () => {
  const aurora_walletConnection = new AuroraWalletConnection(near, 'aurora');

  //@ts-ignore
  return new Engine(
    aurora_walletConnection,
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

  return AbiCoder.encodeFunctionCall(abiItem, params);
};

export const decodeOutput = (abi: any[], methodName: string, buffer: any) => {
  const abiItem = abi.find((a) => a.name === methodName);
  if (!abiItem) {
    return null;
  }
  // console.log(
  //   'xx',
  //   abiItem.outputs,
  //   AbiCoder.decodeParameters(abiItem.outputs, `0x${buffer.toString('hex')}`)
  // );
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

export async function auroraCall(toAddress: any, input: any, value: any = '0') {
  return getAurora().call(toAddress, input, value);
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
  pairAdd,
}: {
  tokenA: string;
  tokenB: string;
  shares: string;
  auroraAddrA: string;
  auroraAddrB: string;
  id: number;
  decodedRes: any;
  pairAdd: string;
}): Pool & { Dex: string } {
  const Afirst =
    Number(auroraAddrA.toString()) < Number(auroraAddrB.toString());

  const token1Supply = decodedRes.reserve0;

  const token2Supply = decodedRes.reserve1;

  return {
    Dex: 'tri',
    id,
    fee: 30,
    shareSupply: shares + '0'.repeat(6),
    tvl: undefined,
    token0_ref_price: undefined,
    tokenIds: [tokenA, tokenB],
    supplies: {
      [tokenA]: Afirst ? token1Supply : token2Supply,
      [tokenB]: Afirst ? token2Supply : token1Supply,
    },
    pairAdd,
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

  const auroraAddrA =
    tokenA.id === 'aurora'
      ? getAuroraConfig().WETH
      : await getErc20Addr(tokenA.id);
  const auroraAddrB =
    tokenB.id === 'aurora'
      ? getAuroraConfig().WETH
      : await getErc20Addr(tokenB.id);

  const shares: any = (await getTotalSupply(pairAdd, address))?.[0];

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
    pairAdd,
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
            amount: toNonDivisibleNumber(decimal, readableAmount),
            memo: '',
            msg:
              getCurrentWallet()?.wallet?.getAccountId() +
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
  middle,
}: {
  from: string;
  to: string;
  readableAmountIn: string;
  readableAmountOut: string;
  decimalIn: number;
  decimalOut: number;
  address: string;
  middle?: string;
}) {
  const fromErc20 = await getErc20Addr(from);
  const toErc20 = await getErc20Addr(to);

  const middleErc20Id = middle
    ? middle === 'aurora'
      ? getAuroraConfig().WETH
      : (await getErc20Addr(middle)).id
    : '';

  const path = !!middleErc20Id
    ? [fromErc20.id, middleErc20Id, toErc20.id]
    : [fromErc20.id, toErc20.id];

  const input = buildInput(UniswapRouterAbi, 'swapExactTokensForTokens', [
    toNonDivisibleNumber(decimalIn, readableAmountIn), // need to check decimals in real case
    toNonDivisibleNumber(decimalOut, readableAmountOut), // need to check decimals in real case
    path,
    address,
    (Math.floor(new Date().getTime() / 1000) + SECOND_FROM_NOW).toString(), // 60s from now
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
  middle,
}: {
  to: string;
  readableAmountIn: string;
  readableAmountOut: string;
  decimalOut: number;
  address: string;
  middle?: string;
}) {
  const toErc20 = await getErc20Addr(to);

  const middleErc20Id = middle
    ? middle === 'aurora'
      ? getAuroraConfig().WETH
      : (await getErc20Addr(middle)).id
    : '';

  const path = !!middleErc20Id
    ? [getAuroraConfig().WETH, middleErc20Id, toErc20.id]
    : [getAuroraConfig().WETH, toErc20.id];

  const input = buildInput(UniswapRouterAbi, 'swapExactETHForTokens', [
    toNonDivisibleNumber(decimalOut, readableAmountOut),
    path,
    address,
    (Math.floor(new Date().getTime() / 1000) + SECOND_FROM_NOW).toString(), // 60s from now
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
  middle,
}: {
  from: string;
  readableAmountIn: string;
  readableAmountOut: string;
  decimalIn: number;
  address: string;
  middle?: string;
}) {
  const fromErc20 = await getErc20Addr(from);

  const middleErc20Id = middle
    ? middle === 'aurora'
      ? getAuroraConfig().WETH
      : (await getErc20Addr(middle)).id
    : '';

  const path = !!middleErc20Id
    ? [fromErc20.id, middleErc20Id, getAuroraConfig().WETH]
    : [fromErc20.id, getAuroraConfig().WETH];

  const input = buildInput(UniswapRouterAbi, 'swapExactTokensForETH', [
    toNonDivisibleNumber(decimalIn, readableAmountIn),
    toNonDivisibleNumber(ETH_DECIMAL, readableAmountOut),
    path,
    address,
    (Math.floor(new Date().getTime() / 1000) + SECOND_FROM_NOW).toString(), // 60s from now
  ]);

  const callAddress = toAddress(trisolaris);

  return auroraCallToAction(callAddress, input);
}

export async function swap({
  from,
  to,
  middle,
  readableAmountIn,
  readableAmountOut,
  decimalIn,
  decimalOut,
  address,
}: {
  from: string;
  to: string;
  middle?: string;
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
      middle,
    });
  } else if (to === 'aurora') {
    return swapExactTokensforETH({
      from,
      readableAmountIn,
      readableAmountOut,
      decimalIn,
      address,
      middle,
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
      middle,
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
    return Big(out[0] as any);
  } catch (e) {
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

  const parsedAllowance = toReadableNumber(
    decimal,
    scientificNotationToString(allowance.toString())
  );

  if (new Big(parsedAllowance).lt(new Big(readableAmountIn))) {
    return approveERC20(
      tokenAddresss,
      new Big(readableAmountIn).minus(parsedAllowance).toFixed(0, 3),
      decimal
    );
  }
};

// aurora call
export const withdrawAuroaCall = async (
  tokenAddress: string,
  amount: string
) => {
  if (tokenAddress === getAuroraConfig().WETH) {
    const callAddress = toAddress(getAuroraConfig().ethBridgeAddress);
    const input = `0x00${Buffer.from(
      getCurrentWallet()?.wallet?.getAccountId(),
      'utf-8'
    ).toString('hex')}`;
    const value = new Big(amount);

    await auroraCall(callAddress, input, value);
  } else {
    const input = buildInput(Erc20Abi, 'withdrawToNear', [
      `0x${Buffer.from(
        getCurrentWallet()?.wallet?.getAccountId(),
        'utf-8'
      ).toString('hex')}`,
      amount, // need to check decimals in real case
    ]);
    await auroraCall(toAddress(tokenAddress), input);
  }
};

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
      getCurrentWallet()?.wallet?.getAccountId(),
      'utf-8'
    ).toString('hex')}`;

    const value = new Big(oneETH).mul(amount).round(0, 0).toFixed(0);

    return auroraCallToAction(callAddress, input, value);
  } else {
    const input = buildInput(Erc20Abi, 'withdrawToNear', [
      `0x${Buffer.from(
        getCurrentWallet()?.wallet?.getAccountId(),
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

    return Big(out[0] as any);
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
  const { globalState } = useContext(WalletContext);

  const isSignedIn = globalState?.isSignedIn;

  const tokens = useAuroraTokens();

  useEffect(() => {
    if (!tokens?.tokenAddresses || !isSignedIn) return;

    const requestAddress = tokens.tokenAddresses.concat([
      getAuroraConfig().WETH,
    ]);

    Promise.all(
      requestAddress.map((add: string) =>
        add === getAuroraConfig().WETH
          ? fetchBalance(address)
          : fetchErc20Balance(address, add)
      )
    ).then((res) => {
      setTokenBalances(
        res.reduce((pre, cur, i) => {
          if (Number(cur) > 0)
            return {
              ...pre,
              [requestAddress[i]]: scientificNotationToString(cur.toString()),
            };
          else return pre;
        }, {})
      );
    });
  }, [tokens, isSignedIn, address]);

  return tokenBalances;
};

export const useAuroraBalancesNearMapping = (address: string) => {
  const auroraMapping = useAuroraBalances(address);

  const [nearMapping, setNearMapping] = useState(null);

  const { accountId } = useWalletSelector();

  const isSignedIn = !!accountId;

  useEffect(() => {
    if (!auroraMapping || !isSignedIn) return;
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
  }, [auroraMapping, isSignedIn]);

  return nearMapping;
};

export const useDCLAccountBalance = (isSignedIn: boolean) => {
  const [assets, setAssets] = useState<any>();

  useEffect(() => {
    list_user_assets().then(setAssets);
  }, [isSignedIn]);

  return assets;
};

export const useTriTokenIdsOnRef = (stopOn?: boolean) => {
  const auroraTokens = defaultTokenList.tokens;
  const allSupportPairs = getAuroraConfig().Pairs;
  const symbolToAddress = auroraTokens.reduce((pre, cur, i) => {
    return {
      ...pre,
      [cur.symbol]: cur.address,
    };
  }, {});

  const idsOnPair = Object.keys(allSupportPairs)
    .map((pairName: string) => {
      const names = pairName.split('-');
      return names.map((n) => {
        if (n === 'ETH') return getAuroraConfig().WETH;
        else return symbolToAddress[n];
      });
    })
    .flat();

  const [triTokenIds, setTriTokenIds] = useState(null);

  useEffect(() => {
    if (stopOn) return;
    getBatchTokenNearAcounts(idsOnPair).then(setTriTokenIds);
  }, [stopOn]);

  return !!stopOn ? [] : triTokenIds?.filter((id: string) => id);
};

export const getTriTokenIdsOnRef = async () => {
  const auroraTokens = defaultTokenList.tokens;
  const allSupportPairs = getAuroraConfig().Pairs;
  const symbolToAddress = auroraTokens.reduce((pre, cur, i) => {
    return {
      ...pre,
      [cur.symbol]: cur.address,
    };
  }, {});

  const idsOnPair = Object.keys(allSupportPairs)
    .map((pairName: string) => {
      const names = pairName.split('-');
      return names.map((n) => {
        if (n === 'ETH') return getAuroraConfig().WETH;
        else return symbolToAddress[n];
      });
    })
    .flat();

  const ids = await getBatchTokenNearAcounts(idsOnPair);

  return ids?.filter((id: string) => !!id) || [];
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

export const getAllTriPools = async (pair?: [string, string]) => {
  const allSupportPairs = getAuroraConfig().Pairs;
  const auroraTokens = defaultTokenList.tokens;
  const address = auroraAddr(getCurrentWallet()?.wallet?.getAccountId());
  const symbolToAddress = auroraTokens.reduce((pre, cur, i) => {
    return {
      ...pre,
      [cur.symbol]: cur.address,
    };
  }, {});
  const pairAddresses = Object.keys(allSupportPairs)
    .map((pairName: string) => {
      const names = pairName.split('-');
      return {
        ids: names.map((n) => {
          if (n === 'ETH') return getAuroraConfig().WETH;
          else return symbolToAddress[n];
        }),
        pairName,
        pairAdd: allSupportPairs[pairName],
        names,
      };
    })
    .filter((p) => {
      const showPair = pair.map((p) => {
        return p;
      });

      return (
        !showPair ||
        (p.names.includes(showPair?.[0]) && p.names.includes(showPair?.[1]))
      );
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

export const hasTriPools = (pair?: [string, string]) => {
  const allSupportPairs = getAuroraConfig().Pairs;
  const auroraTokens = defaultTokenList.tokens;
  const address = auroraAddr(getCurrentWallet()?.wallet?.getAccountId());
  const symbolToAddress = auroraTokens.reduce((pre, cur, i) => {
    return {
      ...pre,
      [cur.symbol]: cur.address,
    };
  }, {});
  const pairAddresses = Object.keys(allSupportPairs)
    .map((pairName: string) => {
      const names = pairName.split('-');
      return {
        ids: names.map((n) => {
          if (n === 'ETH') return getAuroraConfig().WETH;
          else return symbolToAddress[n];
        }),
        pairName,
        pairAdd: allSupportPairs[pairName],
        names,
      };
    })
    .filter((p) => {
      const showPair = pair.map((p) => {
        return p;
      });

      return (
        !showPair ||
        (p.names.includes(showPair?.[0]) && p.names.includes(showPair?.[1]))
      );
    });

  return pairAddresses?.length > 0;
};

// not deposit to aurora
export const auroraSwapTransactions = async ({
  tokenIn_id,
  tokenOut_id,
  swapTodos,
  readableAmountIn, // for all deposit and allowance
  readableAmountOut,
  decimalIn,
  decimalOut,
  slippageTolerance,
  swapType,
}: {
  tokenIn_id: string;
  tokenOut_id: string;
  swapTodos: EstimateSwapView[];
  readableAmountIn: string;
  readableAmountOut?: string;
  decimalIn: number;
  decimalOut: number;
  slippageTolerance: number;
  swapType?: 'parallel' | 'smartV1';
}) => {
  try {
    const transactions: Transaction[] = [];
    if (swapTodos.length === 0) return transactions;

    const address = auroraAddr(getCurrentWallet()?.wallet?.getAccountId());

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
      transactions.push({
        receiverId: 'aurora',
        functionCalls: [approveAction],
      });
    }

    let swapActions: any[] = [];

    if (swapType === 'parallel') {
      swapActions = await Promise.all(
        swapTodos.map((todo) => {
          return swap({
            from: tokenIn_id,
            to: tokenOut_id,
            decimalIn,
            decimalOut,
            readableAmountIn: toReadableNumber(decimalIn, todo.partialAmountIn),
            readableAmountOut: percentLess(slippageTolerance, todo.estimate),
            address,
          });
        })
      );
    } else if (swapType === 'smartV1') {
      swapActions = [
        await swap({
          from: tokenIn_id,
          to: tokenOut_id,
          decimalIn,
          decimalOut,
          readableAmountIn,
          readableAmountOut,
          address,
          middle: swapTodos.length > 1 ? swapTodos[0].tokens[1].id : '',
        }),
      ];
    }

    transactions.push({
      receiverId: 'aurora',
      functionCalls: swapActions,
    });

    // one route case
    const totalMinAmountOut =
      swapType === 'parallel'
        ? swapTodos.length === 1
          ? percentLess(slippageTolerance, swapTodos[0].estimate)
          : scientificNotationToString(
              BigNumber.sum(
                ...swapTodos.map((todo) =>
                  percentLess(slippageTolerance, todo.estimate)
                )
              ).toString()
            )
        : readableAmountOut;

    const withdrawAction = await withdrawFromAurora({
      token_id: tokenOut_id,
      amount: totalMinAmountOut,
      decimal: decimalOut,
    });

    transactions.push({
      receiverId: 'aurora',
      functionCalls: [withdrawAction],
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

  const transactions: Transaction[] = [];

  const registerToken = async (tokenId: string) => {
    const tokenRegistered = await ftGetStorageBalance(tokenId).catch(() => {
      throw new Error(`${tokenId} doesn't exist.`);
    });
    const tokenOutActions: RefFiFunctionCallOptions[] = [];

    if (tokenRegistered === null) {
      tokenOutActions.push({
        methodName: 'storage_deposit',
        args: {
          registration_only: true,
          account_id: getCurrentWallet()?.wallet?.getAccountId(),
        },
        gas: '30000000000000',
        amount: STORAGE_TO_REGISTER_WITH_MFT,
      });

      transactions.push({
        receiverId: tokenId,
        functionCalls: tokenOutActions,
      });
    }
  };

  await Promise.all(tokenIdList.map((id) => registerToken(id)));

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

  actions.forEach((action) =>
    transactions.push({
      receiverId: 'aurora',
      functionCalls: [action],
    })
  );

  if (!!tokenMap[WRAP_NEAR_CONTRACT_ID]) {
    transactions.push(
      nearWithdrawTransaction(tokenMap[WRAP_NEAR_CONTRACT_ID].amount)
    );
  }

  return executeMultipleTransactions(transactions);
};

export const batchCallWithdraw = async (
  auroraIds: string[],
  amounts: string[]
) => {
  if (auroraIds.length === 0) return;

  for (let i = 0; i < auroraIds.length; i++) {
    const id = auroraIds[i];
    const amount = amounts[i];

    await withdrawAuroaCall(id, amount);
  }
  return;
};

export const withdrawBalanceAfterTransaction = async (
  auroraAddresses: any,
  amounts: any
) => {
  const { txHash, errorCode } = getURLInfo();

  if (window.location.pathname !== '/acount' && txHash && !errorCode) {
    try {
      await batchCallWithdraw(auroraAddresses, amounts);
      return true;
    } catch (error) {
      // not succeed
      return false;
    }
  } else return true;
};
