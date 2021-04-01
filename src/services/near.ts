import { Near, keyStores, utils } from 'near-api-js';
import BN from 'bn.js';
import getConfig from './config';
import SpecialWallet from './SpecialWallet';
import { functionCall } from 'near-api-js/lib/transaction';

export const REF_FI_CONTRACT_ID =
  process.env.REF_FI_CONTRACT_ID || 'dev-1617199123305-1287489';

export const ONE_YOCTO_NEAR = '0.000000000000000000000001';

export const near = new Near({
  keyStore: new keyStores.BrowserLocalStorageKeyStore(),
  ...getConfig(process.env.NODE_ENV || 'testnet'),
});
export const wallet = new SpecialWallet(near, 'ref-fi');

const getGas = (gas: string) => (gas ? new BN(gas) : new BN('30000000000000'));
const getAmount = (amount: string) =>
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
