import { Near, keyStores, utils } from 'near-api-js';
import { functionCall } from 'near-api-js/lib/transaction';
import BN from 'bn.js';
import getConfig from './config';
import SpecialWallet from './SpecialWallet';

const config = getConfig();
export const REF_FI_CONTRACT_ID = config.REF_FI_CONTRACT_ID;

export const REF_ADBOARD_CONTRACT_ID = config.REF_ADBOARD_CONTRACT_ID;

export const REF_FARM_CONTRACT_ID = config.REF_FARM_CONTRACT_ID;

export const REF_AIRDRAOP_CONTRACT_ID = config.REF_AIRDROP_CONTRACT_ID;

export const REF_TOKEN_ID = config.REF_TOKEN_ID;

export const LP_STORAGE_AMOUNT = '0.00144';

export const ONE_YOCTO_NEAR = '0.000000000000000000000001';

export const near = new Near({
  keyStore: new keyStores.BrowserLocalStorageKeyStore(),
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

  return wallet
    .account()
    .sendTransactionWithActions(REF_FI_CONTRACT_ID, actions);
};

export interface Transaction {
  receiverId: string;
  functionCalls: RefFiFunctionCallOptions[];
}

export const executeMultipleTransactions = async (
  transactions: Transaction[],
  callbackUrl?: string
) => {
  const nearTransactions = await Promise.all(
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

  return wallet.requestSignTransactions(nearTransactions, callbackUrl);
};

export const refFarmFunctionCall = ({
  methodName,
  args,
  gas,
  amount,
}: RefFiFunctionCallOptions) => {
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

  return wallet
    .account()
    .sendTransactionWithActions(REF_FARM_CONTRACT_ID, actions);
};

export const executeFarmMultipleTransactions = async (
  transactions: Transaction[],
  callbackUrl?: string
) => {
  const nearTransactions = await Promise.all(
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

  return wallet.requestSignTransactions(nearTransactions, callbackUrl);
};
