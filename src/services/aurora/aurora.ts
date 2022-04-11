import {
  Address,
  FunctionCallArgsV1,
  FunctionCallArgsV2,
  parseHexString,
  Engine,
  AccountID,
} from '@aurora-is-near/engine';

import { toBufferBE } from 'bigint-buffer';

import { Erc20Abi } from './abi/erc20';

import { getCurrentWallet } from '../../utils/sender-wallet';

import { UniswapRouterAbi } from './abi/IUniswapV2Router02';

import { UniswapPairAbi } from './abi/IUniswapV2Pair';

import AbiCoder from 'web3-eth-abi';

import * as nearAPI from 'near-api-js';

import Big from 'big.js';
import { getAuroraConfig } from './config';
import { near, keyStore } from '../near';
import getConfig from '../config';
import { BN } from 'bn.js';
import { Pool } from '../pool';

const trisolaris = getAuroraConfig().trisolarisAddress;

export const Zero64 = '0'.repeat(64);
export const SHARE_DECIMAL = 18;
export const PAIR_FEE = 3;
export const ETH_DECIMAL = 18;
export const TGas = Big(10).pow(12);
export const AuroraCallGas = new BN(TGas.mul(150).toFixed(0));

const AuroraWalletConnection = new nearAPI.WalletConnection(near, 'aurora');

//@ts-ignore
export const aurora = new Engine(
  AuroraWalletConnection,
  keyStore,
  near.account,
  getConfig().networkId,
  'aurora'
);

export const toAddress = (address: string | any) => {
  return typeof address === 'string'
    ? Address.parse(address).unwrapOrElse(() => Address.zero())
    : address;
};

export const getErc20Addr = async (token_id: string) => {
  return (await aurora.getAuroraErc20Address(new AccountID(token_id))).unwrap();
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
  if (value) return (await aurora.call(toAddress, input, value)).unwrap();
  else return (await aurora.call(toAddress, input)).unwrap();
}

export function auroraCallToTransaction(
  contract: any,
  input: any,
  value?: string
) {
  let args;

  if (!value)
    args = new FunctionCallArgsV1({
      contract: contract.toBytes(),
      input: prepareInput(input),
    }).encode();
  else
    args = new FunctionCallArgsV2({
      contract: contract.toBytes(),
      value: prepareAmount(value),
      input: prepareInput(input),
    });
  const action = nearAPI.transactions.functionCall(
    'call',
    args,
    AuroraCallGas,
    new BN(1)
  );

  return {
    receiverId: 'aurora',
    functionCalls: [action],
  };
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
}): Pool {
  const Afirst = auroraAddrA > auroraAddrB;

  const token1Id = Afirst ? tokenA : tokenB;
  const token1Supply = Afirst ? decodedRes.reserve0 : decodedRes.reserve1;

  const token2Id = Afirst ? tokenB : tokenA;
  const token2Supply = Afirst ? decodedRes.reserve1 : decodedRes.reserve0;

  return {
    fromAurora: true,
    id,
    fee: 0.3,
    shareSupply: shares,
    tvl: 0,
    token0_ref_price: '0',
    tokenIds: [token1Id, token2Id],
    supplies: {
      [token1Id]: token1Supply,
      [token2Id]: token2Supply,
    },
  };
}

// get pair information from aurora engine
export async function getTotalSupply(pairAdd: string, address: string) {
  const input = buildInput(UniswapPairAbi, 'totalSupply', []);
  const res = (
    await aurora.view(toAddress(address), toAddress(pairAdd), 0, input)
  ).unwrap();
  return decodeOutput(UniswapPairAbi, 'totalSupply', res);
}

export async function getAuroraPool(
  address: string,
  tokenA: string,
  tokenB: string,
  pairAdd: string
) {
  const input = buildInput(UniswapPairAbi, 'getReserves', []);

  const auroraAddrA =
    tokenA === 'aurora' ? getAuroraConfig().WETH : await getErc20Addr(tokenA);
  const auroraAddrB =
    tokenB === 'aurora' ? getAuroraConfig().WETH : await getErc20Addr(tokenB);

  const shares = await getTotalSupply(pairAdd, address);

  const res = (
    await aurora.view(toAddress(address), toAddress(pairAdd), 0, input)
  ).unwrap();

  const decodedRes = decodeOutput(UniswapPairAbi, 'getReserves', res);

  return parseAuroraPool({
    tokenA,
    tokenB,
    shares,
    auroraAddrA,
    auroraAddrB,
    id: 0, // TODO: encode tri pool id
    decodedRes,
  });
}

// sign and send transaction
export function depositToAuroraTransaction(
  token_id: string,
  readableAmount: string,
  decimal: number,
  address: string
) {
  if (token_id === 'aurora') {
    return {
      receiverId: 'aurora',
      functionCalls: [
        nearAPI.transactions.functionCall(
          'ft_transfer_call',
          {
            receiver_id: 'aurora',
            amount: Big(readableAmount).mul(ETH_DECIMAL).toFixed(0),
            memo: null,
            msg:
              getCurrentWallet().wallet.accountId +
              ':' +
              Zero64 + // fee
              address.substring(2),
          },
          new BN(TGas.mul(70).toFixed(0)),
          new BN(1)
        ),
      ],
    };
  } else {
    return {
      receiverId: token_id,
      functionCalls: [
        nearAPI.transactions.functionCall(
          'ft_transfer_call',
          {
            receiver_id: 'aurora',
            amount: Big(readableAmount).mul(decimal).toFixed(0),
            memo: null,
            msg: address.substring(2),
          },
          new BN(TGas.mul(70).toFixed(0)),
          new BN(1)
        ),
      ],
    };
  }
}

//need to validate before sign and send transaction
export async function approveERC20(
  token_id: string,
  readableAmount: string,
  decimal: number
) {
  const input = buildInput(Erc20Abi, 'increaseAllowance', [
    trisolaris,
    Big(decimal).mul(readableAmount).round(0, 0).toFixed(0),
  ]);

  const erc20Addr = await getErc20Addr(token_id);

  return auroraCallToTransaction(toAddress(erc20Addr), input);
}

export async function swapExactTokensForTokens({
  from,
  to,
  readabelAmountIn,
  readableAmountOut,
  decimalIn,
  decimalOut,
  address,
}: {
  from: string;
  to: string;
  readabelAmountIn: string;
  readableAmountOut: string;
  decimalIn: number;
  decimalOut: number;
  address: string;
}) {
  const fromErc20 = await getErc20Addr(from);
  const toErc20 = await getErc20Addr(to);

  const input = buildInput(UniswapRouterAbi, 'swapExactTokensForTokens', [
    Big(decimalIn).mul(readabelAmountIn).round(0, 0).toFixed(0), // need to check decimals in real case
    Big(decimalOut).mul(readableAmountOut).round(0, 0).toFixed(0), // need to check decimals in real case
    [fromErc20.id, toErc20.id],
    address,
    (Math.floor(new Date().getTime() / 1000) + 60).toString(), // 60s from now
  ]);

  const callAddress = toAddress(trisolaris);

  return auroraCallToTransaction(callAddress, input);
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
    Big(decimalOut).mul(readableAmountOut).round(0, 0).toFixed(0),
    [getAuroraConfig().WETH, toErc20.id],
    address,
    (Math.floor(new Date().getTime() / 1000) + 60).toString(), // 60s from now
  ]);

  const value = Big(ETH_DECIMAL).mul(readableAmountIn).toFixed(0);

  const callContract = toAddress(trisolaris);

  return auroraCallToTransaction(callContract, input, value);

  // transaction or directly call
}

export async function swapExactTokensforETH({
  from,
  readabelAmountIn,
  readableAmountOut,
  decimalIn,
  decimalOut,
  address,
}: {
  from: string;
  readabelAmountIn: string;
  readableAmountOut: string;
  decimalIn: number;
  decimalOut: number;
  address: string;
}) {
  const fromErc20 = await getErc20Addr(from);

  const input = buildInput(UniswapRouterAbi, 'swapExactTokensForETH', [
    Big(decimalIn).mul(readabelAmountIn).round(0, 0).toFixed(0),
    Big(decimalOut).mul(readableAmountOut).round(0, 0).toFixed(0),
    [fromErc20.id, getAuroraConfig().WETH],
    address,
    (Math.floor(new Date().getTime() / 1000) + 60).toString(), // 60s from now
  ]);

  const callAddress = toAddress(trisolaris);

  return auroraCallToTransaction(callAddress, input);

  // const res = (await aurora.call(toAddress(trisolaris), input)).unwrap();
}

// aurora call
export async function withdrawFromAurora({
  token_id,
  amount,
  decimal,
}: {
  token_id: string;
  amount: string;
  decimal: string;
}) {
  if (token_id === 'aurora') {
    const callAddress = toAddress(getAuroraConfig().ethBridgeAddress);

    await aurora.call(
      callAddress,
      `0x00${Buffer.from(
        getCurrentWallet().wallet.getAccountId(),
        'utf-8'
      ).toString('hex')}`,
      Big(ETH_DECIMAL).mul(amount).round(0, 0).toFixed(0)
    );
  } else {
    const input = buildInput(Erc20Abi, 'withdrawToNear', [
      `0x${Buffer.from(getCurrentWallet().wallet.accountId, 'utf-8').toString(
        'hex'
      )}`,
      Big(decimal).mul(amount).round(0, 0).toFixed(0), // need to check decimals in real case
    ]);
    const erc20Addr = await getErc20Addr(token_id);

    await aurora.call(toAddress(erc20Addr), input);
  }
}

// combine transactions to sign once
