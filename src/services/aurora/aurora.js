import {
  Address,
  FunctionCallArgsV1,
  parseHexString,
  Engine,
} from '@aurora-is-near/engine';

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

const trisolaris = getAuroraConfig().trisolarisAddress;

export const Zero64 = '0'.repeat(64);

export const SHARE_DECIMAL = 18;
export const PAIR_FEE = 3;
export const ETH_DECIMAL = 18;
export const TGas = Big(10).pow(12);

const walletConnection = new nearAPI.walletConnection(
  near.connection,
  'aurora'
);

// take effect
export const aurora = new Engine(
  walletConnection,
  keyStore,
  near.account,
  getConfig().networkId,
  'aurora'
);

export const toAddress = (address) => {
  return typeof address === 'string'
    ? Address.parse(address).unwrapOrElse(() => Address.zero())
    : address;
};

export const getErc20Addr = async (token_id) => {
  return (await aurora.getAuroraErc20Address(new AccountID(token_id))).unwrap();
};

export const buildInput = (abi, methodName, params) => {
  const abiItem = abi.find((a) => a.name === methodName);
  if (!abiItem) {
    return null;
  }

  return AbiCoder.encodeFunctionCall(abiItem, params);
};

export const decodeOutput = (abi, methodName, buffer) => {
  const abiItem = abi.find((a) => a.name === methodName);
  if (!abiItem) {
    return null;
  }
  return AbiCoder.decodeParameters(
    abiItem.outputs,
    `0x${buffer.toString('hex')}`
  );
};

export function prepareInput(args) {
  if (typeof args === 'undefined') return Buffer.alloc(0);
  if (typeof args === 'string') return Buffer.from(parseHexString(args));
  return Buffer.from(args);
}

export async function auroraCall(toAddress, input, value) {
  if (value) return (await aurora.call(toAddress, input, value)).unwrap();
  else return (await aurora.call(toAddress, input)).unwrap();
}

export function auroraCallToTransaction(contract, input) {
  let args = new FunctionCallArgsV1(
    contract.toBytes(),
    prepareInput(input)
  ).encode();

  const action = nearAPI.transactions.functionCall(
    'call',
    args,
    TGas.mul(150).toFixed(0),
    1
  );

  return {
    receiverId: 'aurora',
    functionCalls: [action],
  };
}

// get pair information
export async function getTotalSupply(pairAdd, address) {
  const input = buildInput(UniswapPairAbi, 'totalSupply', []);
  const res = (
    await aurora.view(toAddress(address), toAddress(pairAdd), 0, input)
  ).unwrap();
  return decodeOutput(UniswapPairAbi, 'totalSupply', res);
}

export async function getReserves(address, tokenA, tokenB, pairAdd) {
  const input = buildInput(UniswapPairAbi, 'getReserves', []);

  // const Erc20A = await getErc20Addr(tokenA);
  // const Erc20B = await getErc20Addr(tokenB);

  const shares = await getTotalSupply(pairAdd, address);

  const res = (
    await aurora.view(toAddress(address), toAddress(pairAdd), 0, input)
  ).unwrap();

  const decodedRes = decodeOutput(UniswapPairAbi, 'getReserves', res);

  return decodedRes;
}
// TODO: parse pair infor mation

// sign and send transaction
export function depositToAuroraTransaction(
  token_id,
  readableAmount,
  decimal,
  address
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
              account.accountId +
              ':' +
              Zero64 + // fee
              address.substring(2),
          },
          TGas.mul(70).toFixed(0),
          1
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
          TGas.mul(70).toFixed(0),
          1
        ),
      ],
    };
  }
}

//need to validate before sign and send transaction
export async function approveERC20(token_id, readableAmount, decimal) {
  const input = buildInput(Erc20Abi, 'increaseAllowance', [
    trisolaris,
    Big(decimal).mul(readableAmount).round(0, 0).toFixed(0),
  ]);

  const erc20Addr = await getErc20Addr(token_id);

  return auroraCallToTransaction(toAddress(erc20Addr, input));
}

export function swapExactTokensForTokens({
  from,
  to,
  readabelAmountIn,
  readableAmountOut,
  decimalIn,
  decimalOut,
  address,
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

  const toAddress = toAddress(trisolaris);
}

export async function swapExactETHforTokens({
  to,
  readableAmountIn,
  readableAmountOut,
  decimalOut,
  address,
}) {
  const toErc20 = await getErc20Addr(to);
  const input = buildInput(UniswapRouterAbi, 'swapExactETHForTokens', [
    Big(decimalOut).mul(readableAmountOut).round(0, 0).toFixed(0),
    [getAuroraConfig().WETH, toErc20.id],
    address,
    (Math.floor(new Date().getTime() / 1000) + 60).toString(), // 60s from now
  ]);

  const value = Big(ETH_DECIMAL).mul(readableAmountIn).toFixed(0);

  const toAddress = toAddress(trisolaris);

  // transaction or directly call
}

export const swapExactTokensforETH = async ({
  from,
  readabelAmountIn,
  readableAmountOut,
  decimalIn,
  decimalOut,
  address,
}) => {
  const fromErc20 = await getErc20Addr(from);

  const input = buildInput(UniswapRouterAbi, 'swapExactTokensForETH', [
    Big(decimalIn).mul(readabelAmountIn).round(0, 0).toFixed(0),
    Big(decimalOut).mul(readableAmountOut).round(0, 0).toFixed(0),
    [fromErc20.id, getAuroraConfig().WETH],
    address,
    (Math.floor(new Date().getTime() / 1000) + 60).toString(), // 60s from now
  ]);

  const toAddress = toAddress(trisolaris);

  // const res = (await aurora.call(toAddress(trisolaris), input)).unwrap();
};

// combine transactions to sign once
