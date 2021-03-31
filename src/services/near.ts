import { Near, WalletConnection, keyStores, utils } from 'near-api-js';
import BN from 'bn.js';
import getConfig from './config';

export const REF_FI_CONTRACT_ID =
  process.env.REF_FI_CONTRACT_ID || 'dev-1617199123305-1287489';

export const near = new Near({
  keyStore: new keyStores.BrowserLocalStorageKeyStore(),
  ...getConfig(process.env.NODE_ENV || 'testnet'),
});
export const wallet = new WalletConnection(near, 'ref-fi');

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
      gas ? new BN(gas) : undefined,
      amount ? new BN(utils.format.parseNearAmount(amount)) : undefined
    );
};

export const refFiViewFunction = ({
  methodName,
  args,
}: RefFiViewFunctionOptions) => {
  return wallet.account().viewFunction(REF_FI_CONTRACT_ID, methodName, args);
};
