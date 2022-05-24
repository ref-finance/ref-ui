import { Near, keyStores, utils, WalletConnection } from 'near-api-js';
import { functionCall } from 'near-api-js/lib/transaction';
import BN from 'bn.js';
import getConfig, { getExtraStablePoolConfig } from './config';
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

export const STABLE_POOL_USN_ID = config.STABLE_POOL_USN_ID;

export const STABLE_TOKEN_USN_IDS = config.STABLE_TOKEN_USN_IDS;

export const isStableToken = (id: string) => {
  return (
    STABLE_TOKEN_IDS.includes(id) ||
    STABLE_TOKEN_USN_IDS.includes(id) ||
    BTCIDS.includes(id) ||
    CUSDIDS.includes(id)
  );
};

export const {
  BTCIDS,
  CUSDIDS,
  BTC_STABLE_POOL_ID,
  CUSD_STABLE_POOL_ID,
  BTC_STABLE_POOL_INDEX,
  CUSD_STABLE_POOL_INDEX,
} = getExtraStablePoolConfig();

export const extraStableTokenIds = BTCIDS.concat(CUSDIDS).filter((_) => !!_);

export const AllStableTokenIds = new Array(
  ...new Set(
    STABLE_TOKEN_USN_IDS.concat(STABLE_TOKEN_IDS).concat(extraStableTokenIds)
  )
);

export const ALL_STABLE_POOL_IDS = [
  STABLE_POOL_ID,
  STABLE_POOL_USN_ID,
  BTC_STABLE_POOL_ID,
  CUSD_STABLE_POOL_ID,
]
  .filter((_) => _)
  .map((id) => id.toString());

export const BLACKLIST_POOL_IDS = config.BLACKLIST_POOL_IDS;

export const filterBlackListPools = (pool: any & { id: any }) =>
  !BLACKLIST_POOL_IDS.includes(pool.id.toString());

export const STABLE_TOKEN_INDEX = config.STABLE_TOKEN_INDEX;

export const STABLE_TOKEN_USN_INDEX = config.STABLE_TOKEN_USN_INDEX;

export const BTC_POOL_INDEX = getConfig().BTC_IDS_INDEX;

export const getStableTokenIndex = (stable_pool_id: string | number) => {
  const id = stable_pool_id.toString();
  switch (id) {
    case STABLE_POOL_ID.toString():
      return STABLE_TOKEN_INDEX;
    case STABLE_POOL_USN_ID.toString():
      return STABLE_TOKEN_USN_INDEX;
    case BTC_STABLE_POOL_ID:
      return BTC_STABLE_POOL_INDEX;
    case CUSD_STABLE_POOL_ID:
      return CUSD_STABLE_POOL_INDEX;
  }
};

export const isStablePool = (id: string | number) => {
  return ALL_STABLE_POOL_IDS.map((id) => id.toString()).includes(id.toString());
};

export const BTC_POOL_ID = config.BTC_POOL_ID;

export const REF_FARM_CONTRACT_ID = config.REF_FARM_CONTRACT_ID;

export const REF_AIRDRAOP_CONTRACT_ID = config.REF_AIRDROP_CONTRACT_ID;

export const REF_TOKEN_ID = config.REF_TOKEN_ID;
const XREF_TOKEN_ID = getConfig().XREF_TOKEN_ID;

export const LP_STORAGE_AMOUNT = '0.01';

export const ONE_YOCTO_NEAR = '0.000000000000000000000001';

export const keyStore = new keyStores.BrowserLocalStorageKeyStore();
//@ts-ignore
keyStore?.reKey = () => {};

export const near = new Near({
  keyStore,
  headers: {},
  ...config,
});
export const wallet = new SpecialWallet(near, REF_FARM_CONTRACT_ID);

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
