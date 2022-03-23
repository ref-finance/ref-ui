import { Near, keyStores, utils } from 'near-api-js';
import { functionCall } from 'near-api-js/lib/transaction';
import BN from 'bn.js';
import getConfig from './config';
import SpecialWallet from './SpecialWallet';
import { getCurrentWallet, senderWallet } from '../utils/sender-wallet';
import {
  SENDER_WALLET_SIGNEDIN_STATE_KEY,
  WALLET_TYPE,
} from '../utils/sender-wallet';

const config = getConfig();

export const REF_FI_CONTRACT_ID = config.REF_FI_CONTRACT_ID;

export const REF_ADBOARD_CONTRACT_ID = config.REF_ADBOARD_CONTRACT_ID;

export const POOL_TOKEN_REFRESH_INTERVAL = config.POOL_TOKEN_REFRESH_INTERVAL;

export const STABLE_TOKEN_IDS = config.STABLE_TOKEN_IDS;

export const STABLE_POOL_ID = config.STABLE_POOL_ID;

export const STABLE_TOKEN_INDEX = config.STABLE_TOKEN_INDEX;

export const REF_FARM_CONTRACT_ID = config.REF_FARM_CONTRACT_ID;

export const REF_AIRDRAOP_CONTRACT_ID = config.REF_AIRDROP_CONTRACT_ID;

export const REF_TOKEN_ID = config.REF_TOKEN_ID;
const XREF_TOKEN_ID = getConfig().XREF_TOKEN_ID;

export const POOLS_BLACK_LIST = config.POOLS_BLACK_LIST;

export const filterBlackListPools = (pool: any & { id: any }) =>
  //@ts-ignore
  !POOLS_BLACK_LIST.includes(pool.id);

export const LP_STORAGE_AMOUNT = '0.01';

export const ONE_YOCTO_NEAR = '0.000000000000000000000001';

export const near = new Near({
  keyStore: new keyStores.BrowserLocalStorageKeyStore(),
  headers: {},
  ...config,
});
export const wallet = new SpecialWallet(near, config.REF_FI_CONTRACT_ID);

export const getGas = (gas: string) =>
  gas ? new BN(gas) : new BN('100000000000000');
export const getAmount = (amount: string) =>
  amount ? new BN(utils.format.parseNearAmount(amount)) : new BN('0');

export interface RefFiViewFunctionOptions {
  methodName: string;
  args?: object;
}

export interface RefFiFunctionCallOptions extends RefFiViewFunctionOptions {
  gas?: string;
  amount?: string;
}

export const refFiFunctionCall = ({
  methodName,
  args,
  gas,
  amount,
}: RefFiFunctionCallOptions) => {
  return wallet
    .account()
    .functionCall(
      REF_FI_CONTRACT_ID,
      methodName,
      args,
      getGas(gas),
      getAmount(amount)
    );
};

export const refFiViewFunction = ({
  methodName,
  args,
}: RefFiViewFunctionOptions) => {
  return wallet.account().viewFunction(REF_FI_CONTRACT_ID, methodName, args);
};

export const refFiManyFunctionCalls = (
  functionCalls: RefFiFunctionCallOptions[]
) => {
  const actions = functionCalls.map((fc) =>
    functionCall(fc.methodName, fc.args, getGas(fc.gas), getAmount(fc.amount))
  );
  const { wallet, wallet_type } = getCurrentWallet();

  return wallet_type === WALLET_TYPE.SENDER_WALLET
    ? wallet.sendTransactionWithActions(REF_FI_CONTRACT_ID, functionCalls)
    : wallet.account().sendTransactionWithActions(REF_FI_CONTRACT_ID, actions);
};

export interface Transaction {
  receiverId: string;
  functionCalls: RefFiFunctionCallOptions[];
}

export const executeMultipleTransactions = async (
  transactions: Transaction[],
  callbackUrl?: string
) => {
  const { wallet, wallet_type } = getCurrentWallet();

  const currentTransactions =
    wallet_type === WALLET_TYPE.SENDER_WALLET
      ? transactions
      : await Promise.all(
          transactions.map((t, i) => {
            return wallet.createTransaction({
              receiverId: t.receiverId,
              nonceOffset: i + 1,
              actions: t.functionCalls.map((fc) =>
                functionCall(
                  fc.methodName,
                  fc.args,
                  getGas(fc.gas),
                  getAmount(fc.amount)
                )
              ),
            });
          })
        );

  return wallet.requestSignTransactions(currentTransactions, callbackUrl);
};

export const refFarmFunctionCall = ({
  methodName,
  args,
  gas,
  amount,
}: RefFiFunctionCallOptions) => {
  const { wallet, wallet_type } = getCurrentWallet();

  return wallet
    .account()
    .functionCall(
      REF_FARM_CONTRACT_ID,
      methodName,
      args,
      getGas(gas),
      getAmount(amount)
    );
};

export const refFarmViewFunction = ({
  methodName,
  args,
}: RefFiViewFunctionOptions) => {
  return wallet.account().viewFunction(REF_FARM_CONTRACT_ID, methodName, args);
};

export const refFarmManyFunctionCalls = (
  functionCalls: RefFiFunctionCallOptions[]
) => {
  const actions = functionCalls.map((fc) =>
    functionCall(fc.methodName, fc.args, getGas(fc.gas), getAmount(fc.amount))
  );
  const { wallet, wallet_type } = getCurrentWallet();

  return wallet_type === WALLET_TYPE.SENDER_WALLET
    ? wallet.sendTransactionWithActions(REF_FARM_CONTRACT_ID, functionCalls)
    : wallet
        .account()
        .sendTransactionWithActions(REF_FARM_CONTRACT_ID, actions);
};

export const executeFarmMultipleTransactions = async (
  transactions: Transaction[],
  callbackUrl?: string
) => {
  const { wallet, wallet_type } = getCurrentWallet();

  const currentTransactions =
    wallet_type === WALLET_TYPE.SENDER_WALLET
      ? transactions
      : await Promise.all(
          transactions.map((t, i) => {
            return wallet.createTransaction({
              receiverId: t.receiverId,
              nonceOffset: i + 1,
              actions: t.functionCalls.map((fc) =>
                functionCall(
                  fc.methodName,
                  fc.args,
                  getGas(fc.gas),
                  getAmount(fc.amount)
                )
              ),
            });
          })
        );

  return wallet.requestSignTransactions(currentTransactions, callbackUrl);
};

export interface RefContractViewFunctionOptions
  extends RefFiViewFunctionOptions {
  gas?: string;
  amount?: string;
  contarctId?: string;
}

export const refContractViewFunction = ({
  methodName,
  args,
}: RefContractViewFunctionOptions) => {
  return wallet.account().viewFunction(XREF_TOKEN_ID, methodName, args);
};
